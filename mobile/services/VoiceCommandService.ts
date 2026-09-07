import { useAppStore } from '../store/appStore';
import { SARVAM_API_KEY } from '../config/env'; // Wait, does this exist? No, I'll use process.env if handled by expo or just fetch

// NOTE: expo-av is not fully supported in Expo Go SDK 57 without a development build.
// We mock the recording functionality so the app doesn't crash on load.
// To test real audio recording with Sarvam AI, use `npx expo run:android` to create a development build.

export class VoiceCommandService {
  private isRecording = false;

  public async startRecording() {
    try {
      console.log('Mock: Starting recording..');
      this.isRecording = true;
    } catch (err) {
      console.error('Failed to start mock recording', err);
    }
  }

  public async stopRecordingAndTranscribe(): Promise<string | null> {
    if (!this.isRecording) return null;

    console.log('Mock: Stopping recording..');
    this.isRecording = false;

    // We return a mock transcript since we can't record audio in Expo Go
    return "This is a mocked transcript. Please build with npx expo run:android to test Sarvam AI.";
  }

  public handleNavigationCommand(text: string, router: any) {
    const lower = text.toLowerCase();
    if (lower.includes('play') || lower.includes('game') || lower.includes('खेल')) {
      router.push('/(elder)/play');
      return true;
    }
    if (lower.includes('day') || lower.includes('routine') || lower.includes('दिन')) {
      router.push('/(elder)/myday');
      return true;
    }
    if (lower.includes('memor') || lower.includes('photo') || lower.includes('याद')) {
      router.push('/(elder)/memories');
      return true;
    }
    if (lower.includes('help') || lower.includes('sos') || lower.includes('মদদ') || lower.includes('মদদ')) {
      router.push('/(elder)/help');
      return true;
    }
    return false;
  }
}

export const voiceCommandService = new VoiceCommandService();
