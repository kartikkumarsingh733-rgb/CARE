import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './FirebaseConfig';
import { useAppStore } from '../store/appStore';

export class SyncService {
  private unsubscribe: (() => void) | null = null;
  private isSyncing = false;
  private patientId: string | null = null;

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
  }

  private handleLocalStoreChange(state: any) {
    if (!db) return;

    if (state.patient.id !== this.patientId) {
      // Patient changed, setup new listener
      this.patientId = state.patient.id;
      this.setupCloudListener(this.patientId);
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
        lastUpdated: state.lastUpdated,
      }, { merge: true });
      console.log('SyncService: Pushed local changes to cloud.');
    } catch (error) {
      console.error('SyncService: Failed to push to cloud:', error);
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
    });
  }
}

export const syncService = new SyncService();
