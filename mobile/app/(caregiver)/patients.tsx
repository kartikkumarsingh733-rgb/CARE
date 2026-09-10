// Caregiver Patients tab
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppStore } from '@/store/appStore';
import { useRouter } from 'expo-router';

export default function PatientsScreen() {
  const patients = useAppStore((state) => state.patients) || [];
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Patients</Text>
          <Text style={styles.subtitle}>Managed by you</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/(caregiver)/access' as any)}>
          <MaterialIcons name="settings" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.caregiverTextMuted} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search patient records..."
          placeholderTextColor={Colors.caregiverTextMuted}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Patient cards */}
        {patients.map((patient, index) => (
          <TouchableOpacity 
            key={patient.id || index}
            style={styles.patientCard} 
            onPress={() => router.push('/(caregiver)/patient-profile' as any)}
          >
            <View style={styles.avatarBox}>
              <MaterialIcons name="person" size={32} color={Colors.caregiverPrimary} />
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientMeta}>{patient.age} yrs · {patient.preferredLanguage.toUpperCase()} · Active today</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, { backgroundColor: Colors.successTeal + '20' }]}>
                  <Text style={[styles.statusText, { color: Colors.successTeal }]}>Active</Text>
                </View>
                <Text style={styles.lastSeen}>Last seen 2h ago</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.caregiverTextMuted} />
          </TouchableOpacity>
        ))}

        {/* Add Patient Button */}
        <TouchableOpacity style={styles.addPatient}>
          <MaterialIcons name="person-add" size={24} color={Colors.caregiverTextMuted} />
          <Text style={styles.addText}>Add Another Patient</Text>
          <Text style={styles.addSub}>(Coming in Stage 6 — multi-patient support)</Text>
        </TouchableOpacity>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.caregiverBg,
    borderWidth: 1,
    borderColor: Colors.caregiverBorder,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44, // Minimum touch target
    fontFamily: Typography.fontFamily.regular,
    fontSize: 16,
    color: Colors.caregiverText,
  },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 80, gap: 12 },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.caregiverCardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.caregiverBorder,
    padding: 16,
    gap: 16,
    ...Shadow.caregiverCard,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.caregiverSecondary,
    borderWidth: 1,
    borderColor: Colors.caregiverBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientInfo: { flex: 1 },
  patientName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 16,
    color: Colors.caregiverText,
  },
  patientMeta: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 14,
    color: Colors.caregiverTextMuted,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  statusBadge: {
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 12,
  },
  lastSeen: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 12,
    color: Colors.caregiverTextMuted,
  },
  addPatient: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.caregiverBorder,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  addText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 16,
    color: Colors.caregiverTextMuted,
    marginTop: 8,
  },
  addSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 12,
    color: Colors.caregiverTextMuted,
    marginTop: 4,
  },
});

