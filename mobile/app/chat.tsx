// SmritiSaathi Chat Screen — Stage 1 stub
// Full AI implementation in Stage 3 (Gemini API + voice).
// Shows a friendly "coming soon" card with the companion mascot.
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

export default function ChatScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <Text style={styles.mascot}>🤗</Text>
        <Text style={styles.title}>SmritiSaathi</Text>
        <Text style={styles.subtitle}>स्मृतिसाथी</Text>
        <Text style={styles.desc}>
          Your friendly AI companion will be available soon.{'\n'}
          Talk in Hindi or English — about your memories, your day, or anything!
        </Text>
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            💡  Coming in Stage 3 — AI voice chat powered by Gemini + Sarvam AI TTS
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgCream },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.chatGreen,
  },
  back: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.textOnDark,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  mascot: { fontSize: 72, marginBottom: Spacing.lg },
  title: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xxxl,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.lg,
    color: Colors.textHindi,
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  desc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  hint: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.goldLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  hintText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.gold,
    textAlign: 'center',
    lineHeight: 20,
  },
});

