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

export interface Reminder {
  id: string;
  time: string; // "8:00 AM" or actual Date/ISO string, will keep it simple for now
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  done: boolean;
  isNext?: boolean;
  notificationId?: string; // To track local notifications
}

interface AppState {
  mode: AppMode;
  patient: PatientProfile;
  domainTiers: Record<DomainKey, number>;
  reminders: Reminder[];
  lastUpdated: number; // For Firebase sync
  // Actions
  setMode: (mode: AppMode) => void;
  setPatient: (patient: Partial<PatientProfile>) => void;
  setDomainTier: (domain: DomainKey, tier: number) => void;
  addReminder: (reminder: Omit<Reminder, 'id' | 'done'>) => void;
  toggleReminderDone: (id: string) => void;
  removeReminder: (id: string) => void;
  // Sync Actions
  mergeRemoteState: (remoteState: Partial<AppState>) => void;
}

const DEFAULT_PATIENT: PatientProfile = {
  id: 'local-patient-001',
  name: 'Ramesh Kumar',
  age: 78,
  preferredLanguage: 'en',
  themePack: 'default',
};

// Start with some default reminders for demo purposes
const DEFAULT_REMINDERS: Reminder[] = [
  { id: '1', time: '8:00 AM', title: 'Morning Medicine', subtitle: '2 tablets with water', emoji: '💊', color: '#1B263B', done: false },
  { id: '2', time: '9:00 AM', title: 'Breakfast', subtitle: 'Idli and sambar', emoji: '🍽️', color: '#E07A5F', done: false },
  { id: '3', time: '11:00 AM', title: 'Drink Water', subtitle: 'A full glass of water', emoji: '💧', color: '#005F73', done: false },
  { id: '4', time: '1:00 PM', title: 'Afternoon Medicine', subtitle: '2 tablets with water', emoji: '💊', color: '#1B263B', done: false },
  { id: '5', time: '1:30 PM', title: 'Lunch', subtitle: 'Dal, rice and sabzi', emoji: '🍛', color: '#E07A5F', done: false },
];

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
      reminders: DEFAULT_REMINDERS,
      lastUpdated: Date.now(),

      setMode: (mode) => set({ mode, lastUpdated: Date.now() }),
      setPatient: (updates) =>
        set((state) => ({ patient: { ...state.patient, ...updates }, lastUpdated: Date.now() })),
      setDomainTier: (domain, tier) =>
        set((state) => ({
          domainTiers: { ...state.domainTiers, [domain]: tier },
          lastUpdated: Date.now()
        })),
      addReminder: (reminder) =>
        set((state) => ({
          reminders: [
            ...(state.reminders || []),
            { ...reminder, id: Math.random().toString(36).substring(7), done: false },
          ],
          lastUpdated: Date.now()
        })),
      toggleReminderDone: (id) =>
        set((state) => ({
          reminders: (state.reminders || []).map((r) =>
            r.id === id ? { ...r, done: !r.done } : r
          ),
          lastUpdated: Date.now()
        })),
      removeReminder: (id) =>
        set((state) => ({
          reminders: (state.reminders || []).filter((r) => r.id !== id),
          lastUpdated: Date.now()
        })),
      mergeRemoteState: (remoteState) =>
        set((state) => ({
          ...state,
          ...remoteState,
        })),
    }),
    {
      name: 'cognicare-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2, // Bump version
    }
  )
);
