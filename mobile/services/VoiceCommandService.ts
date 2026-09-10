import { useAppStore } from '../store/appStore';
import { sarvamService } from './SarvamService';

// NOTE: To test real audio recording with Sarvam AI, use `npx expo run:android` to create a development build.
// Expo Go SDK 57 has limited support for complex av scenarios, which causes 'ExponentAV not found' crashes.

let Audio: any = null;
try {
  // Audio = require('expo-av').Audio;
} catch (e) {
  console.warn("expo-av native module not found. Audio recording will be mocked.");
}

export class VoiceCommandService {
  private recording: any = null; // using any to avoid type errors if Audio is null
  private isRecording = false;

  public async startRecording() {
    if (!Audio) {
      console.log('Voice (Mock): Starting recording..');
      this.isRecording = true;
      return;
    }

    try {
      console.log('Voice: Requesting permissions..');
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        console.warn('Voice: Permission to access microphone was denied');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Voice: Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;
      this.isRecording = true;
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  public async stopRecordingAndTranscribe(): Promise<string | null> {
    if (!this.isRecording) return null;

    if (!Audio) {
      console.log('Voice (Mock): Stopping recording..');
      this.isRecording = false;
      return "This is a mocked transcript. Please build with npx expo run:android to test real Sarvam AI voice recording.";
    }

    if (!this.recording) return null;

    console.log('Voice: Stopping recording..');
    this.isRecording = false;
    
    try {
      await this.recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = this.recording.getURI();
      this.recording = null;

      if (!uri) return null;

      console.log('Voice: Sending audio to Sarvam AI...', uri);
      
      // Use the newly created SarvamService to transcribe the audio!
      const transcript = await sarvamService.speechToText(uri);
      console.log('Voice: Sarvam Transcript:', transcript);
      
      return transcript;
    } catch (error) {
      console.error('Failed to stop recording or transcribe', error);
      return null;
    }
  }

  public handleNavigationCommand(text: string, router: any) {
    const lower = text.toLowerCase();
    
    // Check English and Hindi/Bengali triggers
    if (lower.includes('play') || lower.includes('game') || lower.includes('खेल') || lower.includes('खेला')) {
      router.push('/(elder)/play');
      return true;
    }
    if (lower.includes('day') || lower.includes('routine') || lower.includes('दिन')) {
      router.push('/(elder)/myday');
      return true;
    }
    if (lower.includes('memor') || lower.includes('photo') || lower.includes('याद') || lower.includes('स्मृति')) {
      router.push('/(elder)/memories');
      return true;
    }
    if (lower.includes('help') || lower.includes('sos') || lower.includes('मदद') || lower.includes('সাহায্য')) {
      router.push('/(elder)/help');
      return true;
    }
    return false;
  }
}

export const voiceCommandService = new VoiceCommandService();
