// Home Tab — large-icon hub with mascot (PRD §4.1)
// "Play, My Day, Memories, Help/SOS" big buttons + companion mascot + greeting
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';
import FloatingChatButton from '@/components/FloatingChatButton';

export default function HomeScreen() {
  const router = useRouter();
  const patient = useAppStore((s) => s.patient);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const tiles = [
    {
      emoji: '🧩',
      label: 'Play Games',
      hindi: 'खेलें',
      color: Colors.domainMemory,
      onPress: () => router.push('/(elder)/play'),
    },
    {
      emoji: '📅',
      label: 'My Day',
      hindi: 'मेरा दिन',
      color: Colors.domainAttention,
      onPress: () => router.push('/(elder)/myday'),
    },
    {
      emoji: '🖼️',
      label: 'Memories',
      hindi: 'यादें',
      color: Colors.domainPatterns,
      onPress: () => router.push('/(elder)/memories'),
    },
    {
      emoji: '🆘',
      label: 'I Need Help',
      hindi: 'मदद चाहिए',
      color: Colors.alertRed,
      onPress: () => router.push('/(elder)/help'),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{patient.name.split(' ')[0]}ji! 🙏</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Mascot / Companion */}
        <View style={styles.mascotBox}>
          <Text style={styles.mascotEmoji}>🤗</Text>
          <Text style={styles.mascotText}>
            SmritiSaathi is here with you!{'\n'}What would you like to do today?
          </Text>
        </View>

        {/* Big icon tiles */}
        <View style={styles.grid}>
          {tiles.map((tile) => (
            <TouchableOpacity
              key={tile.label}
              style={[styles.tile, { borderTopColor: tile.color }]}
              onPress={tile.onPress}
              activeOpacity={0.8}
            >
              <Text style={styles.tileEmoji}>{tile.emoji}</Text>
              <Text style={styles.tileLabel}>{tile.label}</Text>
              <Text style={styles.tileHindi}>{tile.hindi}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mode switcher hint */}
        <TouchableOpacity
          style={styles.caregiverSwitch}
          onPress={() => router.push('/caregiver-pin')}
        >
          <Text style={styles.caregiverSwitchText}>
            👤 Switch to Caregiver Mode
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <FloatingChatButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgCream },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl },
  header: {
    paddingTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.lg,
    color: Colors.textSecondary,
  },
  name: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.size.xxxl,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  date: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },
  mascotBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.chatGreenLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  mascotEmoji: { fontSize: 40 },
  mascotText: {
    flex: 1,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.chatGreen,
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  tile: {
    width: '47%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderTopWidth: 4,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    ...Shadow.card,
  },
  tileEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  tileLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  tileHindi: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  caregiverSwitch: {
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  caregiverSwitchText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
});

