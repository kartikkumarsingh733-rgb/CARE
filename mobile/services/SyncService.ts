import { doc, onSnapshot, setDoc, collection, query } from 'firebase/firestore';
import { db } from './FirebaseConfig';
import { useAppStore } from '../store/appStore';
import { getPendingSyncItems, removeSyncItem, upsertGameSession } from '../engine/database';

export class SyncService {
  private unsubscribe: (() => void) | null = null;
  private unsubscribeSessions: (() => void) | null = null;
  private isSyncing = false;
  private patientId: string | null = null;
  private queueInterval: any = null;

  public initialize() {
    if (!db) {
      console.log('SyncService: Firebase not initialized (missing config). Skipping sync.');
      return;
    }

    // When the app store initializes, we start syncing for the current patient
    useAppStore.subscribe((state) => {
      this.handleLocalStoreChange(state);
    });

    // Initial hookup
    const initialState = useAppStore.getState();
    this.handleLocalStoreChange(initialState);

    // Periodically process the Sync Queue every 10 seconds
    if (!this.queueInterval) {
      this.queueInterval = setInterval(() => {
        this.processSyncQueue();
      }, 10000);
    }
  }

  private handleLocalStoreChange(state: any) {
    if (!db) return;

    if (state.patient.id !== this.patientId) {
      // Patient changed, setup new listener
      this.patientId = state.patient.id;
      if (this.patientId) {
        this.setupCloudListener(this.patientId);
      }
    }

    // Push local changes to cloud if local is newer and not currently syncing from cloud
    if (!this.isSyncing && this.patientId) {
      this.pushToCloud(state);
    }
  }

  private async pushToCloud(state: any) {
    if (!db || !this.patientId) return;

    try {
      const docRef = doc(db, 'patients', this.patientId);
      // We push the relevant state to the cloud. We omit mode since it's device specific.
      await setDoc(docRef, {
        patient: state.patient,
        reminders: state.reminders,
        domainTiers: state.domainTiers,
        tasks: state.tasks,
        appointments: state.appointments,
        medications: state.medications,
        emergencyContacts: state.emergencyContacts,
        healthHistory: state.healthHistory,
        alerts: state.alerts,
        lastUpdated: state.lastUpdated,
      }, { merge: true });
      useAppStore.getState().setSyncStatus('synced');
      console.log('SyncService: Pushed local changes to cloud.');
    } catch (error) {
      console.error('SyncService: Failed to push to cloud:', error);
      useAppStore.getState().setSyncStatus('offline');
    }
  }

  public async processSyncQueue() {
    if (!db || !this.patientId) return;

    const items = getPendingSyncItems();
    if (items.length === 0) return;

    useAppStore.getState().setSyncStatus('syncing');

    let allSuccess = true;
    for (const item of items) {
      try {
        const payload = JSON.parse(item.payload);
        if (item.entityType === 'GameSession') {
          const docRef = doc(db, 'patients', this.patientId, 'gameSessions', item.entityId);
          await setDoc(docRef, payload, { merge: true });
        } else if (item.entityType === 'DifficultyLog') {
          const docRef = doc(db, 'patients', this.patientId, 'difficultyLogs', item.entityId);
          await setDoc(docRef, payload, { merge: true });
        }
        
        // Remove from local queue on success
        removeSyncItem(item.id);
      } catch (error) {
        console.error(`SyncService: Failed to sync queue item ${item.id}`, error);
        allSuccess = false;
      }
    }

    if (allSuccess) {
      useAppStore.getState().setSyncStatus('synced');
    } else {
      useAppStore.getState().setSyncStatus('offline');
    }
  }

  private setupCloudListener(patientId: string) {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    const docRef = doc(db, 'patients', patientId);
    console.log(`SyncService: Listening for cloud updates on patients/${patientId}`);

    this.unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const remoteData = snapshot.data();
        const localState = useAppStore.getState();

        // If remote data is newer than local data, we merge it in.
        if (remoteData.lastUpdated && remoteData.lastUpdated > localState.lastUpdated) {
          console.log('SyncService: Pulling newer cloud data into local store.');
          this.isSyncing = true; // Prevent bounce back push
          useAppStore.getState().mergeRemoteState({
            patient: remoteData.patient,
            reminders: remoteData.reminders,
            domainTiers: remoteData.domainTiers,
            tasks: remoteData.tasks || [],
            appointments: remoteData.appointments || [],
            medications: remoteData.medications || [],
            emergencyContacts: remoteData.emergencyContacts || [],
            healthHistory: remoteData.healthHistory || { allergies: [], conditions: [], bloodType: '' },
            alerts: remoteData.alerts || [],
            lastUpdated: remoteData.lastUpdated, // Adhere to remote timestamp
          });
          // Small delay to allow Zustand to settle before allowing pushes again
          setTimeout(() => {
            this.isSyncing = false;
          }, 100);
        }
      }
    }, (error) => {
      console.error('SyncService: Cloud listener error:', error);
      useAppStore.getState().setSyncStatus('offline');
    });

    // Also listen for game sessions to pull into local SQLite (cross-device Caregiver access)
    if (this.unsubscribeSessions) {
      this.unsubscribeSessions();
    }
    const sessionsRef = collection(db, 'patients', patientId, 'gameSessions');
    this.unsubscribeSessions = onSnapshot(sessionsRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const session = change.doc.data() as any;
          upsertGameSession(session);
        }
      });
    }, (error) => {
      console.error('SyncService: GameSessions listener error:', error);
    });
  }
}

export const syncService = new SyncService();
