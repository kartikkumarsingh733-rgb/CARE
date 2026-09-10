import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppStore } from '@/store/appStore';
import { useRouter } from 'expo-router';

const SEVERITY_COLORS: Record<string, string> = {
  critical: Colors.caregiverAccent,
  warning: Colors.alertYellow,
  info: Colors.successTeal,
  emergency: Colors.caregiverAccent,
  medication: Colors.alertYellow,
  system: Colors.successTeal,
};

export default function AlertsScreen() {
  const alerts = useAppStore((state) => state.alerts) || [];
  const markAlertRead = useAppStore((state) => state.markAlertRead);
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  const unreadCount = alerts.filter(a => !a.read).length;

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'unread') return !a.read;
    if (filter === 'critical') return a.critical;
    return true;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.subtitle}>{unreadCount} unread notifications</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/(caregiver)/access' as any)}>
          <MaterialIcons name="settings" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      {/* Quick Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterChip, filter === 'unread' && styles.filterChipActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>Unread ({unreadCount})</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterChip, filter === 'critical' && styles.filterChipActive]}
          onPress={() => setFilter('critical')}
        >
          <Text style={[styles.filterText, filter === 'critical' && styles.filterTextActive]}>Critical</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filteredAlerts.length === 0 && (
          <Text style={{ textAlign: 'center', color: Colors.caregiverTextMuted, marginTop: 20 }}>No alerts found.</Text>
        )}
        {filteredAlerts.map((alert) => (
          <TouchableOpacity
            key={alert.id}
            onPress={() => {
              if (!alert.read) markAlertRead(alert.id);
            }}
            style={[
              styles.alertCard,
              { borderLeftColor: SEVERITY_COLORS[alert.type] },
              !alert.read && styles.unread,
            ]}
          >
            <View style={[styles.alertIconBg, { backgroundColor: SEVERITY_COLORS[alert.type] + '15' }]}>
              <MaterialIcons name={alert.type === 'emergency' ? 'warning' : 'notifications'} size={24} color={SEVERITY_COLORS[alert.type]} />
            </View>
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>{alert.critical ? 'CRITICAL ALERT' : 'Notification'}</Text>
              <Text style={styles.alertDesc}>{alert.message}</Text>
              <Text style={styles.alertTime}>{new Date(alert.timestamp).toLocaleString()}</Text>
            </View>
            {!alert.read && <View style={[styles.dot, { backgroundColor: SEVERITY_COLORS[alert.type] }]} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.caregiverSecondary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 16,
    backgroundColor: Colors.caregiverBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.caregiverBorder,
  },
  headerLeft: {
    flex: 1,
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
  settingsBtn: {
    backgroundColor: '#B4B4B4',
    padding: 10,
    borderRadius: 24,
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

