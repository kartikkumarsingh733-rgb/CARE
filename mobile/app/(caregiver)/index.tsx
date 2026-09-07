// Caregiver Home — dashboard overview (matches screenshots)
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

const SUMMARY_CARDS = [
  { label: 'Played Today',    value: '2',      sub: 'games',      color: Colors.domainMemory  },
  { label: 'Schedule Done',  value: '3/8',    sub: 'tasks',      color: Colors.successTeal   },
  { label: 'Active Alerts',  value: '1',      sub: 'critical',   color: Colors.alertRed      },
  { label: 'Last Seen',      value: '2h ago', sub: 'online',     color: Colors.gold          },
];

const RECENT_ALERTS = [
  { emoji: '🆘', text: 'Ramesh tapped the SOS button at 3:42 PM',    time: '3:42 PM', color: Colors.alertRed    },
  { emoji: '💊', text: 'Evening medicine not marked as taken yet',    time: '8:00 PM', color: Colors.alertYellow },
];

export default function CaregiverHome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Caregiver Dashboard</Text>
            <Text style={styles.subtitle}>Ramesh Kumar · 78 yrs</Text>
          </View>
          <TouchableOpacity
            style={styles.elderBtn}
            onPress={() => router.push('/(elder)')}
          >
            <Text style={styles.elderBtnText}>Elder View</Text>
          </TouchableOpacity>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryGrid}>
          {SUMMARY_CARDS.map((c) => (
            <View key={c.label} style={[styles.summaryCard, { borderTopColor: c.color }]}>
              <Text style={[styles.summaryValue, { color: c.color }]}>{c.value}</Text>
              <Text style={styles.summarySub}>{c.sub}</Text>
              <Text style={styles.summaryLabel}>{c.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent alerts */}
        <Text style={styles.sectionLabel}>RECENT ALERTS</Text>
        <View style={styles.alertsCard}>
          {RECENT_ALERTS.map((a, i) => (
            <View key={i} style={[styles.alertRow, { borderLeftColor: a.color }]}>
              <Text style={styles.alertEmoji}>{a.emoji}</Text>
              <View style={styles.alertInfo}>
                <Text style={styles.alertText}>{a.text}</Text>
                <Text style={styles.alertTime}>{a.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.actionsRow}>
          {[
            { label: 'Add Reminder', emoji: '📅', onPress: () => {} },
            { label: 'View Sessions', emoji: '📊', onPress: () => {} },
            { label: 'Add Memory', emoji: '🖼️', onPress: () => {} },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              style={styles.actionBtn}
              onPress={a.onPress}
            >
              <Text style={styles.actionEmoji}>{a.emoji}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.caregiverNavy },
  scroll: { paddingBottom: 80 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.caregiverNavy,
  },
  title: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.size.xl,
    color: Colors.textOnDark,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  elderBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  elderBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  summaryCard: {
    width: '47%',
    backgroundColor: Colors.caregiverNavyLight,
    borderRadius: Radius.lg,
    borderTopWidth: 4,
    padding: Spacing.lg,
    ...Shadow.card,
  },
  summaryValue: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.size.xxxl,
  },
  summarySub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 0,
  },
  summaryLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.sm,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.2,
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  alertsCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.caregiverNavyLight,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderLeftWidth: 4,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  alertEmoji: { fontSize: 24 },
  alertInfo: { flex: 1 },
  alertText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textOnDark,
    lineHeight: 20,
  },
  alertTime: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.caregiverNavyLight,
    borderRadius: Radius.lg,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.xs,
  },
  actionEmoji: { fontSize: 26 },
  actionLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
});

