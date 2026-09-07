// Caregiver Alerts tab
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const ALERTS = [
  { id: '1', emoji: '🆘', title: 'SOS Activated', desc: 'Ramesh tapped I Need Help at 3:42 PM', time: 'Today, 3:42 PM', severity: 'critical', read: false },
  { id: '2', emoji: '💊', title: 'Medicine Missed', desc: 'Evening medicine not marked as taken', time: 'Today, 8:00 PM', severity: 'warning', read: false },
  { id: '3', emoji: '🧩', title: 'Game Completed', desc: 'Finished Yaad Rakho — 3/3 correct!', time: 'Today, 11:30 AM', severity: 'info', read: true },
  { id: '4', emoji: '📅', title: 'Task Done', desc: 'Marked Afternoon Walk as complete', time: 'Today, 4:15 PM', severity: 'info', read: true },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: Colors.alertRed,
  warning: Colors.alertYellow,
  info: Colors.successTeal,
};

export default function AlertsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
        <Text style={styles.subtitle}>2 unread notifications</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {ALERTS.map((alert) => (
          <TouchableOpacity
            key={alert.id}
            style={[
              styles.alertCard,
              { borderLeftColor: SEVERITY_COLORS[alert.severity] },
              !alert.read && styles.unread,
            ]}
          >
            <Text style={styles.alertEmoji}>{alert.emoji}</Text>
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertDesc}>{alert.desc}</Text>
              <Text style={styles.alertTime}>{alert.time}</Text>
            </View>
            {!alert.read && <View style={[styles.dot, { backgroundColor: SEVERITY_COLORS[alert.severity] }]} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.caregiverNavy },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.size.xxl,
    color: Colors.textOnDark,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 80, gap: Spacing.sm },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.caregiverNavyLight,
    borderRadius: Radius.md,
    borderLeftWidth: 4,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  unread: { backgroundColor: 'rgba(30,45,74,0.9)' },
  alertEmoji: { fontSize: 28 },
  alertInfo: { flex: 1 },
  alertTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
    color: Colors.textOnDark,
  },
  alertDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
    lineHeight: 18,
  },
  alertTime: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
});

