import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shadow, Typography, Spacing } from '../constants/theme';
import { voiceCommandService } from '../services/VoiceCommandService';
import { audioService } from '../services/AudioService';

export default function FloatingChatButton({ bottomOffset = 24 }: { bottomOffset?: number }) {
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
        router.push('/chat');
      }
    } else {
      router.push('/chat');
    }
    setProcessing(false);
  };

  return (
    <View style={[styles.fabWrapper, { bottom: bottomOffset }]}>
      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: '#2B5336' },
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
          <ActivityIndicator color="#FFF" />
        ) : (
          isRecording ? (
             <MaterialIcons name="mic" size={28} color="#FFF" />
          ) : (
             <MaterialIcons name="chat" size={28} color="#FFF" />
          )
        )}
        {isRecording && <Text style={styles.listenText} importantForAccessibility="no">Speak now...</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fabWrapper: {
    position: 'absolute',
    right: Spacing.xl,
    width: 64,
    height: 64,
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabRecording: {
    width: 150,
    borderRadius: 32,
    backgroundColor: Colors.alertRed,
    flexDirection: 'row',
    gap: 8,
  },
  listenText: {
    fontFamily: Typography.fontFamily.semiBold,
    color: '#FFF',
  }
});
