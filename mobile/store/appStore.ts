// Zustand store for the active patient profile and app-wide mode.
// Stage 1: single local patient, no backend. Stage 6 adds sync.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DomainKey } from '../engine/gameSession';

export type AppMode = 'elder' | 'caregiver';

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  preferredLanguage: string;
  themePack: string;
}

interface AppState {
  mode: AppMode;
  patient: PatientProfile;
  domainTiers: Record<DomainKey, number>;
  // Actions
  setMode: (mode: AppMode) => void;
  setPatient: (patient: Partial<PatientProfile>) => void;
  setDomainTier: (domain: DomainKey, tier: number) => void;
}

const DEFAULT_PATIENT: PatientProfile = {
  id: 'local-patient-001',
  name: 'Ramesh Kumar',
  age: 78,
  preferredLanguage: 'en',
  themePack: 'default',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      mode: 'elder',
      patient: DEFAULT_PATIENT,
      domainTiers: {
        memory: 2,
        attention: 2,
        patterns: 2,
        recall: 2,
        emotional: 1,
      },
      setMode: (mode) => set({ mode }),
      setPatient: (updates) =>
        set((state) => ({ patient: { ...state.patient, ...updates } })),
      setDomainTier: (domain, tier) =>
        set((state) => ({
          domainTiers: { ...state.domainTiers, [domain]: tier },
        })),
    }),
    {
      name: 'cognicare-app-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
