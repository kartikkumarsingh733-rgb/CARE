import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';
import { getRecentSessionsForDomain } from '@/engine/database';
import { MaterialIcons } from '@expo/vector-icons';

// Reusable Caregiver Button Component
const Button = ({ title, onPress, icon }: { title: string; onPress: () => void; icon?: keyof typeof MaterialIcons.glyphMap }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    {icon && <MaterialIcons name={icon} size={20} color="#FFFFFF" style={{ marginRight: 8 }} />}
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const RECENT_ALERTS = [
  { icon: 'emergency', text: 'Ramesh tapped the SOS button at 3:42 PM', time: '3:42 PM', color: Colors.caregiverAccent },
  { icon: 'medication', text: 'Evening medicine not marked as taken yet', time: '8:00 PM', color: Colors.alertYellow },
];

export default function CaregiverHome() {
  const router = useRouter();
  const patient = useAppStore((state) => state.patient);
  const [gamesPlayedToday, setGamesPlayedToday] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let total = 0;
      const domains = ['memory', 'attention', 'patterns', 'recall'] as const;
      const now = Date.now();
      
      for (const d of domains) {
        const sessions = getRecentSessionsForDomain(d, patient.id, 10);
        total += sessions.filter(s => (now - (s.endTime || s.startTime)) < 86400000).length;
      }
      setGamesPlayedToday(total);
    }, [patient.id])
  );

  const SUMMARY_CARDS = [
    { label: 'Played Today', value: gamesPlayedToday.toString(), sub: 'games', color: Colors.caregiverPrimary, icon: 'sports-esports' },
    { label: 'Schedule Done', value: '3/8', sub: 'tasks', color: Colors.successTeal, icon: 'check-circle' },
    { label: 'Active Alerts', value: '1', sub: 'critical', color: Colors.caregiverAccent, icon: 'warning' },
    { label: 'Last Seen', value: '2h ago', sub: 'online', color: Colors.gold, icon: 'schedule' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Caregiver Dashboard</Text>
            <Text style={styles.subtitle}>{patient.name} · {patient.age} yrs</Text>
          </View>
          <TouchableOpacity
            style={styles.elderBtn}
            onPress={() => router.push('/(elder)' as any)}
          >
            <MaterialIcons name="exit-to-app" size={20} color={Colors.caregiverPrimary} />
            <Text style={styles.elderBtnText}>Elder View</Text>
          </TouchableOpacity>
        </View>

        {/* Summary grid (12 column layout equivalent) */}
        <View style={styles.summaryGrid}>
          {SUMMARY_CARDS.map((c) => (
            <View key={c.label} style={styles.summaryCard}>
              <View style={styles.cardHeader}>
                <MaterialIcons name={c.icon as any} size={24} color={c.color} />
                <Text style={styles.summaryLabel}>{c.label}</Text>
              </View>
              <Text style={[styles.summaryValue, { color: c.color }]}>{c.value}</Text>
              <Text style={styles.summarySub}>{c.sub}</Text>
            </View>
          ))}
        </View>

        {/* Recent alerts */}
        <Text style={styles.sectionLabel}>RECENT ALERTS</Text>
        <View style={styles.alertsCard}>
          {RECENT_ALERTS.map((a, i) => (
            <View key={i} style={[styles.alertRow, i === RECENT_ALERTS.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={[styles.alertIconBg, { backgroundColor: a.color + '20' }]}>
                <MaterialIcons name={a.icon as any} size={24} color={a.color} />
              </View>
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
          <Button title="Add Reminder" icon="alarm-add" onPress={() => {}} />
          <Button title="View Trends" icon="trending-up" onPress={() => router.push('/(caregiver)/trends' as any)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.caregiverSecondary },
  scroll: { paddingBottom: Spacing.xxxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: Colors.caregiverBg,
    ...Shadow.caregiverCard,
    marginBottom: 16,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 24, // Modified from 32px to fit mobile screen nicely while keeping hierarchy
    color: Colors.caregiverText,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 16,
    color: Colors.caregiverTextMuted,
    marginTop: 4,
  },
  elderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.caregiverSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.caregiverBorder,
  },
  elderBtnText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 14,
    color: Colors.caregiverPrimary,
    marginLeft: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12, // 16px - 4px gap compensation
  },
  summaryCard: {
    width: '46%', // Emulate 6-column grid with gap
    backgroundColor: Colors.caregiverCardBg,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: '2%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.caregiverBorder,
    ...Shadow.caregiverCard,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 14,
    color: Colors.caregiverTextMuted,
    marginLeft: 8,
  },
  summaryValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 28,
  },
  summarySub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 12,
    color: Colors.caregiverTextMuted,
    marginTop: 4,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
    color: Colors.caregiverTextMuted,
    letterSpacing: 1,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  alertsCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.caregiverCardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.caregiverBorder,
    ...Shadow.caregiverCard,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.caregiverBorder,
  },
  alertIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertInfo: {
    flex: 1,
    marginLeft: 16,
  },
  alertText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 16,
    color: Colors.caregiverText,
    lineHeight: 22,
  },
  alertTime: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 12,
    color: Colors.caregiverTextMuted,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.caregiverPrimary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    ...Shadow.caregiverCard,
  },
  buttonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});

