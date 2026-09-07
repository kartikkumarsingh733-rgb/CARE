// Caregiver Patients tab — patient list (Stage 1: single patient stub)
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

export default function PatientsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Patients</Text>
        <Text style={styles.subtitle}>Managed by you</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Single patient card */}
        <TouchableOpacity style={styles.patientCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatar}>👴</Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>Ramesh Kumar</Text>
            <Text style={styles.patientMeta}>78 yrs · Lucknow · Active today</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: Colors.successTealLight }]}>
                <Text style={[styles.statusText, { color: Colors.successTeal }]}>Active</Text>
              </View>
              <Text style={styles.lastSeen}>Last seen 2h ago</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.addPatient}>
          <Text style={styles.addText}>+ Add Another Patient</Text>
          <Text style={styles.addSub}>(Coming in Stage 6 — multi-patient support)</Text>
        </View>
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
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 80 },
  patientCard: {
    flexDirection: 'row',
    backgroundColor: Colors.caregiverNavyLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.card,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { fontSize: 32 },
  patientInfo: { flex: 1 },
  patientName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.textOnDark,
  },
  patientMeta: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  statusBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  statusText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
  },
  lastSeen: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.4)',
  },
  addPatient: {
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  addText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: 'rgba(255,255,255,0.5)',
  },
  addSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 4,
  },
});

