import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import FloatingChatButton from '@/components/FloatingChatButton';
import { FontAwesome5 } from '@expo/vector-icons';
import { audioService } from '@/services/AudioService';
import i18n from '@/services/i18n';
import { useAppStore } from '@/store/appStore';

const HELP_CONTACTS = [
  { name: 'Priya', relationKey: 'contact1_rel', phone: '98765-43210', color: '#2B5336', imageUrl: 'https://i.pravatar.cc/150?img=47' },
  { name: 'Suresh', relationKey: 'contact2_rel', phone: '98700-12345', color: '#3B627A', imageUrl: 'https://i.pravatar.cc/150?img=11' },
  { name: 'Dr. Meera Sharma', relationKey: 'help_doctor', phone: '080-4567-8901', color: '#586C32' },
  { name: 'Rajesh (Caregiver)', relationKey: 'help_caregiver_title', phone: '98765-00000', color: '#893528' },
];

export default function HelpScreen() {
  const language = useAppStore(state => state.patient.preferredLanguage);
  i18n.locale = language || 'en';

  const callContact = (phone: string, name: string) => {
    audioService.playKey('btn_select');
    Alert.alert(
      `Call ${name}?`,
      phone,
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        { text: i18n.t('help_call_now'), onPress: () => Linking.openURL(`tel:${phone.replace(/-/g, '')}`) },
      ]
    );
  };

  const callEmergency = () => {
    audioService.playKey('btn_select');
    Alert.alert(
      'Call Emergency (112)?',
      'This will call emergency services immediately.',
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        { text: i18n.t('help_call_now'), onPress: () => Linking.openURL('tel:112') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.pageHeader, { backgroundColor: '#B02A24' }]}>
        <Text style={styles.pageTitle}>{i18n.t('help_title')}</Text>
        <Text style={styles.pageSubtitle}>
          {i18n.t('help_emergency')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Emergency Button */}
        <View style={styles.emergencyWrapper}>
          <View style={[styles.emergencyShadow, { backgroundColor: '#7A1F1F' }]} />
          <TouchableOpacity 
            style={[styles.emergencyBtn, { backgroundColor: '#B02A24' }]} 
            onPress={callEmergency} 
            activeOpacity={0.8}
            accessible={true}
            accessibilityLabel="Call Emergency 112"
          >
            <View style={styles.emergencyIconWrapper}>
              <FontAwesome5 name="exclamation" size={20} color="#B02A24" />
            </View>
            <Text style={styles.emergencyText}>{i18n.t('help_emergency_call')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.emergencyHint}>
          {i18n.t('help_emergency_hint')}
        </Text>

        <Text style={[styles.sectionLabel, { color: '#9A7249', marginTop: Spacing.xl }]}>{i18n.t('help_call_someone')}</Text>
        
        {/* Contacts */}
        <View style={styles.contactsList}>
          {HELP_CONTACTS.map((contact) => (
            <View key={contact.name} style={styles.contactWrapper}>
              <View style={[styles.contactShadow, { backgroundColor: '#1C1E1B' }]} />
              <View style={styles.contactCard}>
                
                <View style={[styles.contactAvatar, { backgroundColor: contact.color }]}>
                  {contact.imageUrl ? (
                    <Image 
                      source={{ uri: contact.imageUrl }} 
                      style={styles.contactImage} 
                      resizeMode="cover"
                    />
                  ) : (
                    <FontAwesome5 name="user" solid size={24} color="#FFF" />
                  )}
                </View>
                
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactRelation}>{i18n.t(contact.relationKey)}</Text>
                  <Text style={[styles.contactPhone, { color: contact.color }]}>{contact.phone}</Text>
                </View>

                <TouchableOpacity 
                  style={[styles.contactCallBtn, { backgroundColor: contact.color }]} 
                  onPress={() => callContact(contact.phone, contact.name)}
                  activeOpacity={0.85}
                  accessible={true}
                  accessibilityLabel={`Call ${contact.name}`}
                >
                  <FontAwesome5 name="phone-alt" size={20} color="#FFF" />
                </TouchableOpacity>

              </View>
            </View>
          ))}
        </View>

      </ScrollView>
      <FloatingChatButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: Colors.bgCream 
  },
  pageHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1E1B',
    zIndex: 10,
  },
  pageTitle: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xxxl,
    color: Colors.textOnDark,
  },
  pageSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: '#FDF7EB',
    marginTop: 4,
  },
  scroll: { 
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: 120, // space for FAB
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
    marginLeft: 2,
  },
  
  // Emergency Button
  emergencyWrapper: {
    position: 'relative',
    marginTop: Spacing.md,
  },
  emergencyShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
  },
  emergencyBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#1C1E1B',
  },
  emergencyIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emergencyText: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xxl,
    color: '#FFF',
    letterSpacing: 1,
    textAlign: 'center',
  },
  emergencyHint: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },

  // Contacts
  contactsList: {
    gap: Spacing.lg,
  },
  contactWrapper: {
    position: 'relative',
  },
  contactShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCardWarm,
    borderWidth: 1.5,
    borderColor: '#1C1E1B',
    minHeight: 90,
  },
  contactAvatar: {
    width: 80,
    alignSelf: 'stretch', // Fill height of card
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1.5,
    borderColor: '#1C1E1B',
    overflow: 'hidden',
  },
  contactImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contactInfo: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
  },
  contactName: {
    fontFamily: Typography.fontFamily.display,
    fontSize: 22,
    color: Colors.textPrimary,
  },
  contactRelation: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 4,
  },
  contactPhone: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
  },
  contactCallBtn: {
    width: 60,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1.5,
    borderColor: '#1C1E1B',
  },
});

