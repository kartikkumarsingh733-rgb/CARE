const EXPO_PUBLIC_SARVAM_API_KEY = process.env.EXPO_PUBLIC_SARVAM_API_KEY || '';

// Endpoints
const STT_URL = 'https://api.sarvam.ai/speech-to-text';
const TTS_URL = 'https://api.sarvam.ai/text-to-speech';
const TRANSLATE_URL = 'https://api.sarvam.ai/translate';

class SarvamService {
  /**
   * Transcribe an audio file using Sarvam AI
   * @param uri Local file URI from expo-av recording
   */
  async speechToText(uri: string): Promise<string> {
    try {
      const formData = new FormData();
      // In React Native, we can pass a file to FormData by providing an object with uri, name, and type
      formData.append('file', {
        uri,
        name: 'audio.wav',
        type: 'audio/wav',
      } as any);

      // We can also pass 'language_code' if we know it (e.g. 'hi-IN'), or 'model'
      formData.append('model', 'saaras:v3');

      const response = await fetch(STT_URL, {
        method: 'POST',
        headers: {
          'api-subscription-key': EXPO_PUBLIC_SARVAM_API_KEY,
          // Do not set Content-Type, fetch will automatically set it with boundary for FormData
        },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to transcribe audio');
      }

      // API typically returns { transcript: "..." }
      return result.transcript || '';
    } catch (error) {
      console.error('Sarvam STT Error:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech using Sarvam AI
   * @param text The text to synthesize
   * @param targetLanguageCode e.g., 'hi-IN'
   * @returns Base64 encoded audio string
   */
  async textToSpeech(text: string, targetLanguageCode: string = 'hi-IN'): Promise<string> {
    try {
      const response = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'api-subscription-key': EXPO_PUBLIC_SARVAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: [text],
          target_language_code: targetLanguageCode,
          speaker: 'meera', // Or any valid speaker ID
          pitch: 0,
          pace: 1.0,
          loudness: 1.5,
          speech_sample_rate: 16000,
          enable_preprocessing: false,
          model: 'bulbul:v3'
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to synthesize speech');
      }

      // Returns { audios: ["base64_string"] }
      if (result.audios && result.audios.length > 0) {
        return result.audios[0];
      }
      throw new Error('No audio returned');
    } catch (error) {
      console.error('Sarvam TTS Error:', error);
      throw error;
    }
  }

  /**
   * Translate text to target language
   */
  async translate(text: string, sourceLanguageCode: string = 'auto', targetLanguageCode: string = 'hi-IN'): Promise<string> {
    try {
      const response = await fetch(TRANSLATE_URL, {
        method: 'POST',
        headers: {
          'api-subscription-key': EXPO_PUBLIC_SARVAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          source_language_code: sourceLanguageCode,
          target_language_code: targetLanguageCode,
          speaker_gender: 'Female',
          mode: 'formal',
          model: 'sarvam-translate:v1'
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to translate');
      }

      return result.translated_text || '';
    } catch (error) {
      console.error('Sarvam Translate Error:', error);
      throw error;
    }
  }
}

export const sarvamService = new SarvamService();
