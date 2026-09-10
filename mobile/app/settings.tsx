import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';
import i18n from '@/services/i18n';

export default function SettingsScreen() {
  const router = useRouter();
  const { patient, themePreference, setThemePreference, setPatient } = useAppStore();

  i18n.locale = patient.preferredLanguage || 'en';

  const handleLanguageToggle = () => {
    const newLang = patient.preferredLanguage === 'en' ? 'hi' : 'en';
    setPatient({ preferredLanguage: newLang });
  };

  const handleThemeToggle = () => {
    const newTheme = themePreference === 'light' ? 'dark' : 'light';
    setThemePreference(newTheme);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t('settings_title')}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Section */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{patient.name.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{patient.name}</Text>
            <Text style={styles.profileEmail}>patient@example.com</Text>
            <TouchableOpacity style={styles.editProfileBtn}>
              <FontAwesome5 name="pen" size={10} color={Colors.textLink} />
              <Text style={styles.editProfileText}>{i18n.t('edit_profile')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* General Section */}
        <Text style={styles.sectionLabel}>{i18n.t('settings_general')}</Text>
        <View style={styles.cardGroup}>
          
          <TouchableOpacity 
            style={[styles.row, styles.borderBottom]}
            onPress={() => router.push('/caregiver-pin')}
          >
            <View style={styles.rowLeft}>
              <MaterialIcons name="admin-panel-settings" size={22} color={Colors.textSecondary} />
              <Text style={styles.rowText}>{i18n.t('switch_caregiver') || 'Switch to Caregiver Mode'}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.row, styles.borderBottom]}
            onPress={handleLanguageToggle}
          >
            <View style={styles.rowLeft}>
              <MaterialIcons name="language" size={22} color={Colors.textSecondary} />
              <Text style={styles.rowText}>{i18n.t('settings_language')}</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{patient.preferredLanguage === 'hi' ? i18n.t('lang_hi') : i18n.t('lang_en')}</Text>
              <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.row}
            onPress={handleThemeToggle}
          >
            <View style={styles.rowLeft}>
              <MaterialIcons name={themePreference === 'dark' ? 'dark-mode' : 'light-mode'} size={22} color={Colors.textSecondary} />
              <Text style={styles.rowText}>{i18n.t('settings_mode')}</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{themePreference === 'dark' ? i18n.t('mode_dark') : i18n.t('mode_light')}</Text>
              <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>

        </View>

        {/* Support Section */}
        <Text style={styles.sectionLabel}>{i18n.t('settings_support')}</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={[styles.row, styles.borderBottom]}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="help-outline" size={22} color={Colors.textSecondary} />
              <Text style={styles.rowText}>{i18n.t('settings_help')}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="info-outline" size={22} color={Colors.textSecondary} />
              <Text style={styles.rowText}>{i18n.t('settings_about')}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgCream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.xxl,
    // Neobrutalism shadow
    shadowColor: Colors.borderLight,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.chatGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  avatarText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 28,
    color: '#FFF',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  profileEmail: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editProfileText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    color: Colors.textLink,
    marginLeft: 4,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.xxl,
    overflow: 'hidden',
    // Neobrutalism shadow
    shadowColor: Colors.borderLight,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: '#FFFFFF',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
});
