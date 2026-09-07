import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadow, Typography } from '../constants/theme';
import { voiceCommandService } from '../services/VoiceCommandService';
import { audioService } from '../services/AudioService';

export default function FloatingChatButton() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handlePressIn = async () => {
    setIsRecording(true);
    await audioService.playKey('voice_listening');
    await voiceCommandService.startRecording();
  };

  const handlePressOut = async () => {
    setIsRecording(false);
    setProcessing(true);
    const transcript = await voiceCommandService.stopRecordingAndTranscribe();
    if (transcript) {
      console.log('Voice transcript:', transcript);
      const handled = voiceCommandService.handleNavigationCommand(transcript, router);
      if (!handled) {
        // Fallback to chat screen if it wasn't a navigation command
        router.push('/chat');
      }
    } else {
      router.push('/chat');
    }
    setProcessing(false);
  };

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        isRecording && styles.fabRecording
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.85}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={isRecording ? "Listening to your voice command" : "Hold to speak a voice command"}
    >
      {processing ? (
        <ActivityIndicator color={Colors.chatGreen} />
      ) : (
        <Text style={styles.fabEmoji} importantForAccessibility="no">{isRecording ? '🎙️' : '🤗'}</Text>
      )}
      {isRecording && <Text style={styles.listenText} importantForAccessibility="no">Speak now...</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 80,  // above tab bar
    right: 16,
    width: 56,
    height: 56,
    backgroundColor: Colors.chatGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.borderLight,
    ...Shadow.cardStrong,
  },
  fabRecording: {
    width: 150,
    backgroundColor: Colors.alertRed,
    flexDirection: 'row',
    gap: 8,
  },
  fabEmoji: { fontSize: 26 },
  listenText: {
    fontFamily: Typography.fontFamily.semiBold,
    color: '#FFF',
  }
});
