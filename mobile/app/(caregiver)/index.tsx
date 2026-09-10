import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';
import { MaterialIcons } from '@expo/vector-icons';

export default function CaregiverHome() {
  const router = useRouter();
  const patient = useAppStore((state) => state.patient);
  const patients = useAppStore((state) => state.patients) || [];
  const alerts = useAppStore((state) => state.alerts) || [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Caregiver Dashboard</Text>
            <Text style={styles.subtitle}>Welcome back</Text>
          </View>
          <TouchableOpacity
            style={styles.elderBtn}
            onPress={() => router.push('/(elder)' as any)}
          >
            <Text style={styles.elderBtnText}>Elder View</Text>
          </TouchableOpacity>
        </View>

        {/* Patient Profiles Section */}
        <Text style={styles.sectionLabel}>ASSIGNED PATIENTS</Text>
        {patients.map((p, index) => (
          <TouchableOpacity 
            key={p.id || index}
            style={[styles.patientCard, { marginBottom: Spacing.md }]} 
            onPress={() => {
              // Set the active patient before navigating (Stage 6 prep)
              useAppStore.getState().setPatient(p);
              router.push('/(caregiver)/patient-profile' as any);
            }}
          >
            <View style={styles.patientAvatar}>
              <Text style={styles.patientInitials}>
                {p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{p.name}</Text>
              <Text style={styles.patientDetails}>{p.age} yrs • {p.preferredLanguage.toUpperCase()}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        ))}

        {/* Alerts & Notifications Center */}
        <Text style={styles.sectionLabel}>ALERTS & NOTIFICATIONS</Text>
        <View style={styles.alertsCard}>
          {alerts.length > 0 ? alerts.map((a, i) => {
            const isCritical = a.critical || a.type === 'emergency';
            const color = isCritical ? Colors.alertRed : Colors.alertYellow;
            const emoji = a.type === 'emergency' ? '🆘' : a.type === 'medication' ? '💊' : '⚠️';
            
            return (
              <TouchableOpacity 
                key={a.id} 
                style={[styles.alertRow, { borderLeftColor: color }]}
                onPress={() => router.push('/(caregiver)/patient-profile' as any)}
              >
                <Text style={styles.alertEmoji}>{emoji}</Text>
                <View style={styles.alertTextContent}>
                  <Text style={styles.alertText}>{a.message}</Text>
                  <Text style={styles.alertTime}>
                    {new Date(a.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {patient.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }) : (
            <View style={styles.emptyAlerts}>
              <Text style={styles.emptyAlertsText}>No recent alerts.</Text>
            </View>
          )}
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
    fontFamily: Typography.fontFamily.display,
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
  sectionLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.2,
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  patientCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.caregiverNavyLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadow.card,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientInitials: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.textOnDark,
  },
  patientInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  patientName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.textOnDark,
  },
  patientDetails: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  alertEmoji: { fontSize: 24, marginRight: Spacing.md },
  alertTextContent: { flex: 1 },
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
    marginTop: 4,
  },
  emptyAlerts: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyAlertsText: {
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.5)',
    fontSize: Typography.size.sm,
  }
});

