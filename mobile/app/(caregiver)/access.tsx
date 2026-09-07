// Caregiver Access tab — settings, language, PIN, team access
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AccessScreen() {
  const [notifications, setNotifications] = useState(true);
  const [medicineAlerts, setMedicineAlerts] = useState(true);
  const [gameAlerts, setGameAlerts] = useState(false);

  const SettingRow = ({
    icon,
    label,
    sub,
    value,
    onToggle,
    isArrow = false,
  }: {
    icon?: string;
    label: string;
    sub?: string;
    value?: boolean;
    onToggle?: (v: boolean) => void;
    isArrow?: boolean;
  }) => (
    <View style={styles.row}>
      {icon && (
        <View style={styles.iconContainer}>
          <MaterialIcons name={icon as any} size={24} color={Colors.caregiverPrimary} />
        </View>
      )}
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      {onToggle !== undefined && value !== undefined && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: Colors.caregiverBorder, true: Colors.caregiverPrimary + '80' }}
          thumbColor={value ? Colors.caregiverPrimary : Colors.caregiverTextMuted}
        />
      )}
      {isArrow && (
        <MaterialIcons name="chevron-right" size={24} color={Colors.caregiverTextMuted} />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <SettingRow icon="notifications" label="Push Notifications" value={notifications} onToggle={setNotifications} />
          <View style={styles.divider} />
          <SettingRow icon="medication" label="Medicine Alerts" sub="Alert when medicine not taken" value={medicineAlerts} onToggle={setMedicineAlerts} />
          <View style={styles.divider} />
          <SettingRow icon="sports-esports" label="Game Completion Alerts" sub="Alert when a game is finished" value={gameAlerts} onToggle={setGameAlerts} />
        </View>

        {/* Security */}
        <Text style={styles.sectionLabel}>SECURITY</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="lock" size={24} color={Colors.caregiverPrimary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Change Caregiver PIN</Text>
              <Text style={styles.rowSub}>Current: ••••</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.caregiverTextMuted} />
          </TouchableOpacity>
        </View>

        {/* Patient info */}
        <Text style={styles.sectionLabel}>PATIENT PROFILE</Text>
        <View style={styles.card}>
          <SettingRow icon="person" label="Ramesh Kumar" sub="78 yrs · Edit profile in Stage 6" />
          <View style={styles.divider} />
          <SettingRow icon="language" label="Language" sub="English / Hindi (Bilingual)" />
        </View>

        {/* Exit to Elder mode */}
        <TouchableOpacity 
          style={styles.switchModeBtn}
          onPress={() => router.replace('/(elder)')}
        >
          <MaterialIcons name="exit-to-app" size={20} color={Colors.caregiverPrimary} />
          <Text style={styles.switchModeText}>Switch to Elder Mode</Text>
        </TouchableOpacity>
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
  scroll: { paddingHorizontal: 16, paddingBottom: 80 },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 12,
    color: Colors.caregiverTextMuted,
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.caregiverCardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.caregiverBorder,
    overflow: 'hidden',
    ...Shadow.caregiverCard,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.caregiverPrimary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 16,
    color: Colors.caregiverText,
  },
  rowSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 14,
    color: Colors.caregiverTextMuted,
    marginTop: 4,
  },
  divider: { height: 1, backgroundColor: Colors.caregiverBorder, marginLeft: 72 },
  switchModeBtn: {
    marginTop: 32,
    flexDirection: 'row',
    backgroundColor: Colors.caregiverPrimary + '10',
    borderWidth: 1,
    borderColor: Colors.caregiverPrimary + '30',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  switchModeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 16,
    color: Colors.caregiverPrimary,
  },
});

