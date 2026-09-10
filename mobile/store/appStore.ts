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
  time: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  done: boolean;
  notificationId?: string; // To track local notifications
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: 'caregiver' | 'elder';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
}

export interface Appointment {
  id: string;
  title: string;
  doctorName: string;
  date: string;
  time: string;
  location: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface HealthHistory {
  allergies: string[];
  conditions: string[];
  bloodType: string;
}

export interface Alert {
  id: string;
  type: 'emergency' | 'medication' | 'system';
  message: string;
  timestamp: number;
  read: boolean;
  critical: boolean;
}

interface AppState {
  mode: AppMode;
  themePreference: 'light' | 'dark';
  patient: PatientProfile;
  patients: PatientProfile[];
  domainTiers: Record<DomainKey, number>;
  reminders: Reminder[];
  tasks: Task[];
  appointments: Appointment[];
  medications: Medication[];
  emergencyContacts: EmergencyContact[];
  healthHistory: HealthHistory;
  alerts: Alert[];
  lastUpdated: number; // For Firebase sync
  syncStatus: 'synced' | 'syncing' | 'offline';
  // Actions
  setMode: (mode: AppMode) => void;
  setThemePreference: (theme: 'light' | 'dark') => void;
  setPatient: (patient: Partial<PatientProfile>) => void;
  setDomainTier: (domain: DomainKey, tier: number) => void;
  addReminder: (reminder: Omit<Reminder, 'id' | 'done'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  toggleReminderDone: (id: string) => void;
  removeReminder: (id: string) => void;

  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  addAppointment: (appt: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;

  addMedication: (med: Omit<Medication, 'id'>) => void;
  removeMedication: (id: string) => void;

  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  removeEmergencyContact: (id: string) => void;

  updateHealthHistory: (updates: Partial<HealthHistory>) => void;

  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
  markAlertRead: (id: string) => void;

  // Sync Actions
  mergeRemoteState: (remoteState: Partial<AppState>) => void;
  setSyncStatus: (status: 'synced' | 'syncing' | 'offline') => void;
}

const DEFAULT_PATIENT: PatientProfile = {
  id: 'local-patient-001',
  name: 'Ramesh Kumar',
  age: 78,
  preferredLanguage: 'en',
  themePack: 'default',
};

const DEFAULT_PATIENTS: PatientProfile[] = [
  DEFAULT_PATIENT,
  {
    id: 'local-patient-002',
    name: 'Sushila Devi',
    age: 82,
    preferredLanguage: 'hi',
    themePack: 'default',
  },
  {
    id: 'local-patient-003',
    name: 'Anil Desai',
    age: 74,
    preferredLanguage: 'en',
    themePack: 'default',
  }
];

// Start with some default reminders for demo purposes matching Figma
const DEFAULT_REMINDERS: Reminder[] = [
  { id: '1', time: '8:00 AM', title: 'Morning Medicine', subtitle: '2 tablets with water', icon: 'medication', color: '#B3A38F', done: true },
  { id: '2', time: '9:00 AM', title: 'Breakfast', subtitle: 'Idli and sambar', icon: 'restaurant', color: '#B3A38F', done: true },
  { id: '3', time: '11:00 AM', title: 'Drink Water', subtitle: 'A full glass of water', icon: 'local-drink', color: '#B3A38F', done: true },
  { id: '4', time: '1:00 PM', title: 'Afternoon Medicine', subtitle: '2 tablets with water', icon: 'local-cafe', color: '#C4822A', done: false },
  { id: '5', time: '1:30 PM', title: 'Lunch', subtitle: 'Dal, rice and sabzi', icon: 'restaurant', color: '#366184', done: false },
  { id: '6', time: '4:00 PM', title: 'Evening Walk', subtitle: '15 minutes in the garden', icon: 'directions-walk', color: '#366184', done: false },
  { id: '7', time: '5:00 PM', title: 'Priya Visits', subtitle: 'Daughter is coming', icon: 'people', color: '#586C32', done: false },
];

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Buy groceries', description: 'Milk, bread, fruits', assignee: 'caregiver', status: 'pending', dueDate: new Date().toISOString() },
  { id: '2', title: 'Call Doctor', description: 'Schedule monthly checkup', assignee: 'caregiver', status: 'completed', dueDate: new Date(Date.now() - 86400000).toISOString() }
];

const DEFAULT_ALERTS: Alert[] = [
  { id: '1', type: 'emergency', message: 'SOS Activated: Ramesh tapped I Need Help', timestamp: Date.now() - 3600000, read: false, critical: true },
  { id: '2', type: 'medication', message: 'Evening medicine not marked as taken', timestamp: Date.now() - 7200000, read: false, critical: false },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      mode: 'elder',
      themePreference: 'light',
      patient: DEFAULT_PATIENT,
      patients: DEFAULT_PATIENTS,
      domainTiers: {
        memory: 2,
        attention: 2,
        patterns: 2,
        recall: 2,
        emotional: 1,
      },
      reminders: DEFAULT_REMINDERS,
      tasks: DEFAULT_TASKS,
      appointments: [],
      medications: [{ id: '1', name: 'Aspirin', dosage: '100mg', frequency: 'Daily' }],
      emergencyContacts: [{ id: '1', name: 'Priya (Daughter)', relation: 'Daughter', phone: '+91 9876543210' }],
      healthHistory: { allergies: ['Penicillin'], conditions: ['Mild Cognitive Impairment', 'Hypertension'], bloodType: 'O+' },
      alerts: DEFAULT_ALERTS,
      lastUpdated: Date.now(),
      syncStatus: 'offline',

      setMode: (mode) => set({ mode, lastUpdated: Date.now() }),
      setThemePreference: (themePreference) => set({ themePreference, lastUpdated: Date.now() }),
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
      updateReminder: (id, updates) =>
        set((state) => ({
          reminders: (state.reminders || []).map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
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

      addTask: (task) => set((state) => ({ tasks: [...state.tasks, { ...task, id: Math.random().toString() }], lastUpdated: Date.now() })),
      updateTask: (id, updates) => set((state) => ({ tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t), lastUpdated: Date.now() })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter(t => t.id !== id), lastUpdated: Date.now() })),

      addAppointment: (appt) => set((state) => ({ appointments: [...state.appointments, { ...appt, id: Math.random().toString() }], lastUpdated: Date.now() })),
      updateAppointment: (id, updates) => set((state) => ({ appointments: state.appointments.map(a => a.id === id ? { ...a, ...updates } : a), lastUpdated: Date.now() })),
      deleteAppointment: (id) => set((state) => ({ appointments: state.appointments.filter(a => a.id !== id), lastUpdated: Date.now() })),

      addMedication: (med) => set((state) => ({ medications: [...state.medications, { ...med, id: Math.random().toString() }], lastUpdated: Date.now() })),
      removeMedication: (id) => set((state) => ({ medications: state.medications.filter(m => m.id !== id), lastUpdated: Date.now() })),

      addEmergencyContact: (contact) => set((state) => ({ emergencyContacts: [...state.emergencyContacts, { ...contact, id: Math.random().toString() }], lastUpdated: Date.now() })),
      removeEmergencyContact: (id) => set((state) => ({ emergencyContacts: state.emergencyContacts.filter(c => c.id !== id), lastUpdated: Date.now() })),

      updateHealthHistory: (updates) => set((state) => ({ healthHistory: { ...state.healthHistory, ...updates }, lastUpdated: Date.now() })),

      addAlert: (alert) => set((state) => ({ alerts: [{ ...alert, id: Math.random().toString(), timestamp: Date.now(), read: false }, ...state.alerts], lastUpdated: Date.now() })),
      markAlertRead: (id) => set((state) => ({ alerts: state.alerts.map(a => a.id === id ? { ...a, read: true } : a), lastUpdated: Date.now() })),

      mergeRemoteState: (remoteState) =>
        set((state) => ({
          ...state,
          ...remoteState,
        })),
      setSyncStatus: (syncStatus) => set({ syncStatus }),
    }),
    {
      name: 'cognicare-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3, // Bump version
    }
  )
);
