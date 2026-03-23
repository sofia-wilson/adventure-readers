import { createContext, useContext } from 'react';
import type { ThemeConfig } from '../data/themes';

interface ProfileContextValue {
  childId: string;
  childName: string;
  theme: ThemeConfig;
  switchProfile: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileContext.Provider');
  return ctx;
}

export default ProfileContext;
