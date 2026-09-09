import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { aiService } from '@/services/AIService';
import { voiceCommandService } from '@/services/VoiceCommandService';
import { audioService } from '@/services/AudioService';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Namaste! I am SmritiSaathi. How are you feeling today?", sender: 'ai' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    aiService.startChat();
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: text.trim(), sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    const replyText = await aiService.sendMessage(userMessage.text);
    
    const aiMessage: Message = { id: (Date.now() + 1).toString(), text: replyText, sender: 'ai' };
    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleMicPressIn = async () => {
    setIsRecording(true);
    await audioService.playKey('voice_listening');
    await voiceCommandService.startRecording();
  };

  const handleMicPressOut = async () => {
    setIsRecording(false);
    setIsTyping(true);
    const transcript = await voiceCommandService.stopRecordingAndTranscribe();
    if (transcript) {
      const userMessage: Message = { id: Date.now().toString(), text: transcript, sender: 'user' };
      setMessages(prev => [...prev, userMessage]);
      
      const replyText = await aiService.sendMessage(transcript);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: replyText, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    }
    setIsTyping(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {!isUser && <Text style={styles.mascotIcon}>🤗</Text>}
        <View style={[styles.messageContent, isUser ? styles.userContent : styles.aiContent]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color={Colors.textOnDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SmritiSaathi Chat</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isTyping && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.typingText}>SmritiSaathi is typing...</Text>
          </View>
        )}

        <View style={styles.inputArea}>
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micRecording]}
            onPressIn={handleMicPressIn}
            onPressOut={handleMicPressOut}
          >
            <MaterialIcons name="mic" size={28} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={isRecording ? "Listening..." : "Type a message..."}
              placeholderTextColor={Colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={200}
              editable={!isRecording}
            />
          </View>

          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSend(inputText)}
            disabled={!inputText.trim()}
          >
            <MaterialIcons name="send" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgCream },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.chatGreen,
    paddingTop: Platform.OS === 'android' ? Spacing.xl : Spacing.md,
  },
  backButton: { padding: Spacing.xs },
  headerTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xl,
    color: Colors.textOnDark,
  },
  listContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '90%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  aiBubble: {
    alignSelf: 'flex-start',
  },
  mascotIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  messageContent: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    maxWidth: '85%',
  },
  userContent: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: Radius.sm,
  },
  aiContent: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    lineHeight: 22,
  },
  userText: {
    color: '#FFF',
  },
  aiText: {
    color: Colors.textPrimary,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginLeft: Spacing.md,
  },
  typingText: {
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  micRecording: {
    backgroundColor: Colors.alertRed,
    transform: [{ scale: 1.1 }],
  },
  inputWrapper: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: Colors.bgCream,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  input: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.chatGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
});
