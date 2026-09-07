// Caregiver Alerts tab
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

const ALERTS = [
  { id: '1', icon: 'emergency', title: 'SOS Activated', desc: 'Ramesh tapped I Need Help at 3:42 PM', time: 'Today, 3:42 PM', severity: 'critical', read: false },
  { id: '2', icon: 'medication', title: 'Medicine Missed', desc: 'Evening medicine not marked as taken', time: 'Today, 8:00 PM', severity: 'warning', read: false },
  { id: '3', icon: 'sports-esports', title: 'Game Completed', desc: 'Finished Yaad Rakho — 3/3 correct!', time: 'Today, 11:30 AM', severity: 'info', read: true },
  { id: '4', icon: 'check-circle', title: 'Task Done', desc: 'Marked Afternoon Walk as complete', time: 'Today, 4:15 PM', severity: 'info', read: true },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: Colors.caregiverAccent,
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
      
      {/* Quick Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
          <Text style={[styles.filterText, styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterText}>Unread (2)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterText}>Critical</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {ALERTS.map((alert) => (
          <TouchableOpacity
            key={alert.id}
            style={[
              styles.alertCard,
              { borderLeftColor: SEVERITY_COLORS[alert.severity] },
              !alert.read && styles.unread,
            ]}
          >
            <View style={[styles.alertIconBg, { backgroundColor: SEVERITY_COLORS[alert.severity] + '15' }]}>
              <MaterialIcons name={alert.icon as any} size={24} color={SEVERITY_COLORS[alert.severity]} />
            </View>
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
  safe: { flex: 1, backgroundColor: Colors.caregiverSecondary },
  header: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 16,
    backgroundColor: Colors.caregiverBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.caregiverBorder,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 24,
    color: Colors.caregiverText,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 16,
    color: Colors.caregiverTextMuted,
    marginTop: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.caregiverBg,
    borderWidth: 1,
    borderColor: Colors.caregiverBorder,
  },
  filterChipActive: {
    backgroundColor: Colors.caregiverPrimary + '15',
    borderColor: Colors.caregiverPrimary,
  },
  filterText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 14,
    color: Colors.caregiverTextMuted,
  },
  filterTextActive: {
    color: Colors.caregiverPrimary,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 80, gap: 12 },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.caregiverCardBg,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: Colors.caregiverBorder,
    borderRightColor: Colors.caregiverBorder,
    borderBottomColor: Colors.caregiverBorder,
    padding: 16,
    gap: 16,
    ...Shadow.caregiverCard,
  },
  unread: { backgroundColor: '#FAFAFA' },
  alertIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertInfo: { flex: 1 },
  alertTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 16,
    color: Colors.caregiverText,
  },
  alertDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 14,
    color: Colors.caregiverTextMuted,
    marginTop: 4,
    lineHeight: 20,
  },
  alertTime: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 12,
    color: Colors.caregiverTextMuted,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
    marginTop: 6,
  },
});

