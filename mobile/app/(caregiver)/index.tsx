import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAppStore } from '@/store/appStore';
import { getRecentSessionsForDomain } from '@/engine/database';
import { MaterialIcons } from '@expo/vector-icons';

// Caregiver Color Palette (Strictly from user request)
const C_COLORS = {
  primary: '#1E88E5', // Blue
  secondary: '#F5F5F5', // Light Gray background
  accent: '#FF5252', // Red
  textDark: '#212121', // High contrast text
  textMuted: '#616161',
  white: '#FFFFFF',
  border: '#E0E0E0',
};

// 8px/4px scale
const SPACE = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Reusable Components matching Material Design principles
const Button = ({ title, onPress, icon, type = 'primary' }: { title: string; onPress: () => void; icon?: keyof typeof MaterialIcons.glyphMap, type?: 'primary' | 'outline' }) => (
  <TouchableOpacity 
    style={[
      styles.btn, 
      type === 'primary' ? styles.btnPrimary : styles.btnOutline
    ]} 
    onPress={onPress}
    accessible={true}
    accessibilityRole="button"
    accessibilityLabel={title}
  >
    {icon && (
      <MaterialIcons 
        name={icon} 
        size={20} 
        color={type === 'primary' ? C_COLORS.white : C_COLORS.primary} 
        style={{ marginRight: SPACE.sm }} 
      />
    )}
    <Text style={[styles.btnText, type === 'primary' ? styles.btnTextPrimary : styles.btnTextOutline]}>{title}</Text>
  </TouchableOpacity>
);

const Card = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

const RECENT_ALERTS = [
  { id: '1', icon: 'emergency', text: 'Ramesh tapped the SOS button at 3:42 PM', time: '3:42 PM', critical: true },
  { id: '2', icon: 'medication', text: 'Evening medicine not marked as taken yet', time: '8:00 PM', critical: false },
];

export default function CaregiverDashboard() {
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
    { label: 'Played Today', value: gamesPlayedToday.toString(), sub: 'games', icon: 'sports-esports', color: C_COLORS.primary },
    { label: 'Schedule Done', value: '3/8', sub: 'tasks', icon: 'check-circle', color: '#4CAF50' },
    { label: 'Active Alerts', value: '1', sub: 'critical', icon: 'warning', color: C_COLORS.accent },
    { label: 'Last Seen', value: '2h ago', sub: 'online', icon: 'schedule', color: C_COLORS.textMuted },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Header - H1 32px Bold */}
        <View style={styles.header}>
          <View>
            <Text style={styles.h1}>Dashboard</Text>
            <Text style={styles.subtitle}>{patient.name} · {patient.age} yrs</Text>
          </View>
          <Button title="Elder View" icon="exit-to-app" type="outline" onPress={() => router.push('/(elder)' as any)} />
        </View>

        {/* 12-Column Grid Simulation (Using flex with precise gaps) */}
        <View style={styles.gridContainer}>
          {SUMMARY_CARDS.map((c) => (
            <View key={c.label} style={styles.gridItem6}>
              <Card style={styles.statCard}>
                <View style={styles.statHeader}>
                  <MaterialIcons name={c.icon as any} size={24} color={c.color} />
                  <Text style={styles.statLabel}>{c.label}</Text>
                </View>
                <Text style={styles.statValue}>{c.value}</Text>
                <Text style={styles.statSub}>{c.sub}</Text>
              </Card>
            </View>
          ))}
        </View>

        {/* Alerts Section */}
        <Text style={styles.sectionTitle}>RECENT ALERTS</Text>
        <Card style={styles.alertsContainer}>
          {RECENT_ALERTS.map((a, i) => (
            <View key={a.id} style={[styles.alertRow, i === RECENT_ALERTS.length - 1 && styles.noBorder]}>
              <View style={[styles.alertIconBg, a.critical && styles.alertIconBgCritical]}>
                <MaterialIcons name={a.icon as any} size={24} color={a.critical ? C_COLORS.accent : C_COLORS.textDark} />
              </View>
              <View style={styles.alertInfo}>
                <Text style={styles.bodyText}>{a.text}</Text>
                <Text style={styles.captionText}>{a.time}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Quick Actions Section */}
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <View style={styles.gridContainer}>
          <View style={styles.gridItem12}>
            <Button title="Add Reminder" icon="alarm-add" onPress={() => {}} />
          </View>
          <View style={styles.gridItem12}>
            <Button title="View Trends" icon="trending-up" onPress={() => router.push('/(caregiver)/trends' as any)} />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C_COLORS.secondary },
  scroll: { paddingBottom: SPACE.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACE.md,
    backgroundColor: C_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: C_COLORS.border,
    marginBottom: SPACE.md,
  },
  h1: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System',
    fontWeight: 'bold',
    fontSize: 32, // Explicitly requested H1 32px bold
    color: C_COLORS.textDark,
  },
  subtitle: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    fontSize: 16,
    color: C_COLORS.textMuted,
    marginTop: SPACE.xs,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System',
    fontWeight: 'bold',
    fontSize: 14,
    color: C_COLORS.textMuted,
    letterSpacing: 0.5,
    marginHorizontal: SPACE.md,
    marginTop: SPACE.lg,
    marginBottom: SPACE.sm,
  },
  // 12-Column Grid Simulation
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACE.sm, // Outer padding (half of gap)
  },
  gridItem6: {
    width: '50%',
    padding: SPACE.sm, // Inner padding to create 16px gap
  },
  gridItem12: {
    width: '100%',
    padding: SPACE.sm,
  },
  card: {
    backgroundColor: C_COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C_COLORS.border,
    elevation: 2, // Material shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statCard: {
    padding: SPACE.md,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACE.sm,
  },
  statLabel: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    fontSize: 14,
    color: C_COLORS.textMuted,
    marginLeft: SPACE.sm,
  },
  statValue: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System',
    fontWeight: 'bold',
    fontSize: 24,
    color: C_COLORS.textDark,
  },
  statSub: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    fontSize: 12,
    color: C_COLORS.textMuted,
    marginTop: SPACE.xs,
  },
  alertsContainer: {
    marginHorizontal: SPACE.md,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACE.md,
    borderBottomWidth: 1,
    borderBottomColor: C_COLORS.border,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  alertIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C_COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertIconBgCritical: {
    backgroundColor: '#FFEBEE', // Very light red
  },
  alertInfo: {
    flex: 1,
    marginLeft: SPACE.md,
  },
  bodyText: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    fontSize: 16, // Body 16px regular
    color: C_COLORS.textDark,
    lineHeight: 24,
  },
  captionText: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    fontSize: 12,
    color: C_COLORS.textMuted,
    marginTop: SPACE.xs,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: SPACE.md,
  },
  btnPrimary: {
    backgroundColor: C_COLORS.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: C_COLORS.primary,
  },
  btnText: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : 'System',
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnTextPrimary: {
    color: C_COLORS.white,
  },
  btnTextOutline: {
    color: C_COLORS.primary,
  },
});

