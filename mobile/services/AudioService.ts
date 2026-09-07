import { AudioAssets } from '../assets/audio'; // we will generate this file
import { useAppStore } from '../store/appStore';

// NOTE: expo-av is not fully supported in Expo Go SDK 57 without a development build.
// We mock the audio playback functionality so the app doesn't crash on load.
// To test real audio playback, use `npx expo run:android` to create a development build.

class AudioService {
  private isVoiceEnabled = true;

  constructor() {
    this.initAudio();
  }

  private async initAudio() {
    console.log('Mock: Initializing audio...');
  }

  public setVoiceEnabled(enabled: boolean) {
    this.isVoiceEnabled = enabled;
  }

  public async playKey(key: string) {
    if (!this.isVoiceEnabled) return;

    try {
      const state = useAppStore.getState();
      const lang = state.patient.preferredLanguage || 'en';
      const audioKey = `${lang}_${key}.wav`;

      console.log(`Mock: Playing audio key ${audioKey}`);
    } catch (e) {
      console.error('[AudioService] Error playing mock audio:', e);
    }
  }

  public async stop() {
    console.log('Mock: Stopping audio playback...');
  }
}

export const audioService = new AudioService();
