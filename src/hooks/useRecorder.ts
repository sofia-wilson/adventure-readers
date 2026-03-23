import { useState, useCallback, useRef, useEffect } from 'react';
import { soundCards } from '../data/soundCards';
import {
  saveRecording as dbSave,
  deleteRecording as dbDelete,
  getRecording as dbGet,
  getAllRecordingKeys,
  migrateFromLocalStorage,
} from './audioStorage';

export interface Recorder {
  isRecording: boolean;
  currentRecordingId: string | null;
  error: string | null;
  startRecording: (soundId: string) => Promise<void>;
  stopRecording: () => void;
  playRecording: (soundId: string) => boolean;
  hasRecording: (soundId: string) => boolean;
  deleteRecording: (soundId: string) => void;
  getRecordedCount: () => number;
  getTotalSoundCount: () => number;
  isSetupComplete: (childId?: string) => boolean;
  startWordRecording: (word: string) => Promise<void>;
  playWordRecording: (word: string) => boolean;
  hasWordRecording: (word: string) => boolean;
}

const ALL_SOUND_IDS = soundCards.map(c => c.id);

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(null);
  // recordingKeys tracks which IDs have recordings (not the data itself)
  const [recordingKeys, setRecordingKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // In-memory cache for immediate playback (IndexedDB is async)
  const memoryCacheRef = useRef<Record<string, string>>({});

  // Load existing recording keys from IndexedDB on mount + migrate localStorage
  useEffect(() => {
    (async () => {
      try {
        // Migrate any existing localStorage recordings first
        await migrateFromLocalStorage();
        // Then load all keys
        const keys = await getAllRecordingKeys();
        // Normalize: if any word: keys have uppercase, re-save as lowercase
        const normalizedKeys: string[] = [];
        for (const key of keys) {
          const data = await dbGet(key);
          if (!data) continue;

          let effectiveKey = key;
          if (key.startsWith('word:') && key !== key.toLowerCase()) {
            // Migrate uppercase key to lowercase
            const lowerKey = key.toLowerCase();
            await dbSave(lowerKey, data);
            await dbDelete(key);
            effectiveKey = lowerKey;
          }
          normalizedKeys.push(effectiveKey);
          memoryCacheRef.current[effectiveKey] = data;
        }
        setRecordingKeys(new Set(normalizedKeys));
      } catch (e) {
        console.warn('Failed to load recordings:', e);
      }
    })();
  }, []);

  const startRecording = useCallback(async (soundId: string): Promise<void> => {
    // Clear any lingering timers from a previous recording
    if (autoStopTimerRef.current) { clearTimeout(autoStopTimerRef.current); autoStopTimerRef.current = null; }
    if (safetyTimerRef.current) { clearTimeout(safetyTimerRef.current); safetyTimerRef.current = null; }
    // Stop any active recording first
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64 = reader.result as string;
              // Always cache in memory for immediate playback
              memoryCacheRef.current[soundId] = base64;
              setRecordingKeys(prev => new Set([...prev, soundId]));
              // Persist to IndexedDB (non-blocking)
              dbSave(soundId, base64).catch(e => {
                console.warn('IndexedDB save failed, using memory cache:', e);
              });
            } catch (e) {
              console.warn('Failed to save recording:', e);
              setError('Storage error — could not save recording.');
            }
            setIsRecording(false);
            setCurrentRecordingId(null);
          };
          reader.onerror = () => {
            console.warn('FileReader error');
            setIsRecording(false);
            setCurrentRecordingId(null);
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          console.warn('Recording onstop error:', e);
          setIsRecording(false);
          setCurrentRecordingId(null);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = () => {
        console.warn('MediaRecorder error');
        setIsRecording(false);
        setCurrentRecordingId(null);
        stream.getTracks().forEach(track => track.stop());
      };

      setError(null);
      setCurrentRecordingId(soundId);
      setIsRecording(true);
      mediaRecorder.start();

      // Auto-stop after 8 seconds
      autoStopTimerRef.current = setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
        autoStopTimerRef.current = null;
      }, 8000);

      // Safety: force-reset if still stuck after 12 seconds
      safetyTimerRef.current = setTimeout(() => {
        setIsRecording(prev => {
          if (prev) {
            console.warn('Safety reset: recording state was stuck');
            setCurrentRecordingId(null);
            return false;
          }
          return prev;
        });
        safetyTimerRef.current = null;
      }, 12000);
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err);
      setError('Microphone not available. Please open this app in your browser (not the preview) and allow microphone access.');
      setIsRecording(false);
      setCurrentRecordingId(null);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (autoStopTimerRef.current) { clearTimeout(autoStopTimerRef.current); autoStopTimerRef.current = null; }
    if (safetyTimerRef.current) { clearTimeout(safetyTimerRef.current); safetyTimerRef.current = null; }
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const playRecording = useCallback((soundId: string) => {
    if (!recordingKeys.has(soundId)) return false;

    const playAudio = (dataUrl: string) => {
      try {
        const audio = new Audio(dataUrl);
        audio.play().catch(err => console.error('Playback failed:', err));
      } catch (err) {
        console.error('Audio creation failed:', err);
      }
    };

    // Check memory cache first (instant), then IndexedDB
    const cached = memoryCacheRef.current[soundId];
    if (cached) {
      playAudio(cached);
    } else {
      dbGet(soundId).then(dataUrl => {
        if (!dataUrl) return;
        memoryCacheRef.current[soundId] = dataUrl; // cache for next time
        playAudio(dataUrl);
      });
    }
    return true;
  }, [recordingKeys]);

  const hasRecording = useCallback((soundId: string): boolean => {
    return recordingKeys.has(soundId);
  }, [recordingKeys]);

  const deleteRecordingFn = useCallback((soundId: string) => {
    dbDelete(soundId);
    setRecordingKeys(prev => {
      const next = new Set(prev);
      next.delete(soundId);
      return next;
    });
  }, []);

  const getRecordedCount = useCallback((): number => {
    return ALL_SOUND_IDS.filter(id => recordingKeys.has(id)).length;
  }, [recordingKeys]);

  const getTotalSoundCount = useCallback((): number => {
    return ALL_SOUND_IDS.length;
  }, []);

  const isSetupComplete = useCallback((childId?: string): boolean => {
    const key = childId ? `celebration-${childId}` : 'celebration-goodjob';
    return recordingKeys.has(key);
  }, [recordingKeys]);

  // Word recordings — uses "word:" prefix, always lowercase for consistency
  const startWordRecording = useCallback(async (word: string): Promise<void> => {
    return startRecording(`word:${word.toLowerCase()}`);
  }, [startRecording]);

  const playWordRecording = useCallback((word: string): boolean => {
    return playRecording(`word:${word.toLowerCase()}`);
  }, [playRecording]);

  const hasWordRecording = useCallback((word: string): boolean => {
    return hasRecording(`word:${word.toLowerCase()}`);
  }, [hasRecording]);

  const result: Recorder = {
    isRecording,
    currentRecordingId,
    error,
    startRecording,
    stopRecording,
    playRecording,
    hasRecording,
    deleteRecording: deleteRecordingFn,
    getRecordedCount,
    getTotalSoundCount,
    isSetupComplete,
    startWordRecording,
    playWordRecording,
    hasWordRecording,
  };
  return result;
}
