// Caregiver Access tab — settings, language, PIN, team access
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

export default function AccessScreen() {
  const [notifications, setNotifications] = useState(true);
  const [medicineAlerts, setMedicineAlerts] = useState(true);
  const [gameAlerts, setGameAlerts] = useState(false);

  const SettingRow = ({
    label,
    sub,
    value,
    onToggle,
  }: {
    label: string;
    sub?: string;
    value?: boolean;
    onToggle?: (v: boolean) => void;
  }) => (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      {onToggle !== undefined && value !== undefined && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.successTeal }}
          thumbColor={Colors.textOnDark}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Notifications */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <SettingRow label="Push Notifications" value={notifications} onToggle={setNotifications} />
          <View style={styles.divider} />
          <SettingRow label="Medicine Alerts" sub="Alert when medicine not taken" value={medicineAlerts} onToggle={setMedicineAlerts} />
          <View style={styles.divider} />
          <SettingRow label="Game Completion Alerts" sub="Alert when a game is finished" value={gameAlerts} onToggle={setGameAlerts} />
        </View>

        {/* Security */}
        <Text style={styles.sectionLabel}>SECURITY</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Change Caregiver PIN</Text>
              <Text style={styles.rowSub}>Current: ••••</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Patient info */}
        <Text style={styles.sectionLabel}>PATIENT PROFILE</Text>
        <View style={styles.card}>
          <SettingRow label="Ramesh Kumar" sub="78 yrs · Edit profile in Stage 6" />
          <View style={styles.divider} />
          <SettingRow label="Language" sub="English / Hindi (Bilingual)" />
        </View>

        {/* Exit to Elder mode */}
        <TouchableOpacity style={styles.switchModeBtn}>
          <Text style={styles.switchModeText}>↩  Switch to Elder Mode</Text>
        </TouchableOpacity>
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
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xxl,
    color: Colors.textOnDark,
  },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 80 },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.2,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.caregiverNavyLight,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.textOnDark,
  },
  rowSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: Spacing.lg },
  arrow: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: 'rgba(255,255,255,0.3)',
  },
  switchModeBtn: {
    marginTop: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  switchModeText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: 'rgba(255,255,255,0.5)',
  },
});

