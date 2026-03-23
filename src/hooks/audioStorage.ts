// IndexedDB-backed audio storage — replaces localStorage for recordings
// localStorage has a ~5MB limit; IndexedDB allows hundreds of MB

const DB_NAME = 'adventure-readers-audio';
const STORE_NAME = 'recordings';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveRecording(key: string, dataUrl: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(dataUrl, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getRecording(key: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteRecording(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllRecordingKeys(): Promise<string[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAllKeys();
    request.onsuccess = () => resolve(request.result as string[]);
    request.onerror = () => reject(request.error);
  });
}

// Export all recordings as a JSON file (for transfer between URLs)
export async function exportAllRecordings(): Promise<void> {
  const keys = await getAllRecordingKeys();
  const data: Record<string, string> = {};
  for (const key of keys) {
    const value = await getRecording(key);
    if (value) data[key] = value;
  }
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `adventure-readers-recordings-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import recordings from a JSON file
export async function importRecordings(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result as string) as Record<string, string>;
        let count = 0;
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string' && value.startsWith('data:audio')) {
            await saveRecording(key, value);
            count++;
          }
        }
        resolve(count);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

// Migrate existing localStorage recordings to IndexedDB (one-time)
export async function migrateFromLocalStorage(): Promise<number> {
  const STORAGE_PREFIX = 'space-reader-recording-';
  let migrated = 0;
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      const soundId = key.replace(STORAGE_PREFIX, '');
      const data = localStorage.getItem(key);
      if (data && !data.includes('fake')) {
        await saveRecording(soundId, data);
        migrated++;
      }
      keysToRemove.push(key);
    }
  }

  // Remove from localStorage after successful migration
  keysToRemove.forEach(k => localStorage.removeItem(k));

  return migrated;
}
