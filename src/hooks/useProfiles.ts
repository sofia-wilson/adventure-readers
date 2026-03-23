import { useState, useCallback, useEffect } from 'react';
import type { ThemeId } from '../data/themes';

export interface ChildProfile {
  id: string;
  name: string;
  pin: string;
  theme: ThemeId;
  createdAt: number;
}

const STORAGE_KEY = 'space-reader-profiles';

function loadProfiles(): ChildProfile[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      // Ensure all profiles have a theme (backward compat)
      return (JSON.parse(data) as ChildProfile[]).map(p => ({
        ...p,
        theme: p.theme || 'space',
      }));
    }
  } catch { /* */ }
  return [];
}

function saveProfiles(profiles: ChildProfile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

/** Migrate old single-user data to a default profile */
function migrateIfNeeded(): ChildProfile[] {
  const existing = loadProfiles();
  if (existing.length > 0) return existing;

  const hasOldProgress = localStorage.getItem('space-reader-progress');
  const hasOldPrizes = localStorage.getItem('space-reader-prizes');

  if (!hasOldProgress && !hasOldPrizes) return [];

  // Create default profile and move data
  const defaultProfile: ChildProfile = {
    id: 'default',
    name: 'Reader',
    pin: '0000',
    theme: 'space',
    createdAt: Date.now(),
  };

  if (hasOldProgress) {
    localStorage.setItem('space-reader-progress-default', hasOldProgress);
    localStorage.removeItem('space-reader-progress');
  }
  if (hasOldPrizes) {
    localStorage.setItem('space-reader-prizes-default', hasOldPrizes);
    localStorage.removeItem('space-reader-prizes');
  }
  localStorage.removeItem('space-reader-pin');

  const profiles = [defaultProfile];
  saveProfiles(profiles);
  return profiles;
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<ChildProfile[]>(() => migrateIfNeeded());

  // Sync from localStorage on mount (in case migration happened elsewhere)
  useEffect(() => {
    const loaded = loadProfiles();
    if (loaded.length > 0) setProfiles(loaded);
  }, []);

  const addProfile = useCallback((name: string, pin: string, theme: ThemeId = 'space'): ChildProfile => {
    const profile: ChildProfile = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      pin,
      theme,
      createdAt: Date.now(),
    };
    setProfiles(prev => {
      const next = [...prev, profile];
      saveProfiles(next);
      return next;
    });
    return profile;
  }, []);

  const removeProfile = useCallback((id: string) => {
    // Clean up per-child data
    localStorage.removeItem(`space-reader-progress-${id}`);
    localStorage.removeItem(`space-reader-prizes-${id}`);

    setProfiles(prev => {
      const next = prev.filter(p => p.id !== id);
      saveProfiles(next);
      return next;
    });
  }, []);

  const updateProfile = useCallback((id: string, updates: Partial<Pick<ChildProfile, 'name' | 'pin'>>) => {
    setProfiles(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      saveProfiles(next);
      return next;
    });
  }, []);

  const verifyPin = useCallback((id: string, pin: string): boolean => {
    const profile = profiles.find(p => p.id === id);
    return profile?.pin === pin;
  }, [profiles]);

  const getProfile = useCallback((id: string) => {
    return profiles.find(p => p.id === id);
  }, [profiles]);

  return { profiles, addProfile, removeProfile, updateProfile, verifyPin, getProfile };
}
