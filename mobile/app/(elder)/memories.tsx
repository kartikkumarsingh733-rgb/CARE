// Memories Tab — Contacts and Important Information
import { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import FloatingChatButton from '@/components/FloatingChatButton';
import { audioService } from '@/services/AudioService';

// Contact Data
const CONTACTS = [
  {
    id: '1',
    name: 'Priya',
    relation: 'Your Daughter',
    description: 'She lives nearby and visits every evening.',
    imageUrl: 'https://i.pravatar.cc/150?img=47', 
    btnColor: '#2B5336', 
    phone: 'Call Priya',
  },
  {
    id: '2',
    name: 'Suresh',
    relation: 'Your Son',
    description: 'He lives in Pune. He calls you every Sunday morning.',
    imageUrl: 'https://i.pravatar.cc/150?img=11',
    btnColor: '#3B627A',
    phone: 'Call Suresh',
  },
  {
    id: '3',
    name: 'Kavya',
    relation: 'Your Granddaughter',
    description: "Priya's daughter. She is 8 years old and loves drawing.",
    imageUrl: 'https://i.pravatar.cc/150?img=5',
    btnColor: '#586C32',
    phone: 'Call Kavya',
  },
];

export default function MemoriesScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleCall = (name: string) => {
    console.log(`Calling ${name}`);
    audioService.playKey('btn_select');
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.pageHeader, 
          { backgroundColor: Colors.domainMemories },
          { 
            opacity: headerOpacity, 
            transform: [{ translateY: headerTranslateY }] 
          }
        ]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>My Memories</Text>
            <Text style={styles.pageSubtitle}>
              Your family and favourite things
            </Text>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <Text style={[styles.sectionLabel, { color: '#9A7249' }]}>WHO AM I</Text>
        
        {/* Profile Card */}
        <View style={styles.profileWrapper}>
          <View style={[styles.cardShadow, { backgroundColor: '#1C1E1B' }]} />
          <View style={styles.profileCard}>
            
            {/* Top Banner (Photo + Info) */}
            <View style={styles.profileTop}>
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=68' }} style={styles.profileImage} />
              <View style={[styles.profileInfo, { backgroundColor: '#2B5336' }]}>
                <Text style={styles.profileName}>Ramesh Kumar</Text>
                <Text style={styles.profileSubtitle}>Retired School Teacher</Text>
                <View style={styles.profileBadge}>
                  <Text style={styles.profileBadgeText}>78 years old</Text>
                </View>
              </View>
            </View>

            {/* Bottom Grid (Details) */}
            <View style={styles.profileGrid}>
              <View style={styles.gridRow}>
                <View style={styles.gridCol}>
                  <Text style={styles.gridLabel}>BORN</Text>
                  <Text style={styles.gridValue}>12 March 1947</Text>
                </View>
                <View style={styles.gridCol}>
                  <Text style={styles.gridLabel}>BLOOD GROUP</Text>
                  <Text style={styles.gridValue}>B+</Text>
                </View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridCol}>
                  <Text style={styles.gridLabel}>LIVES AT</Text>
                  <Text style={styles.gridValue}>14, Jayanagar,{'\n'}Bangalore</Text>
                </View>
                <View style={styles.gridCol}>
                  <Text style={styles.gridLabel}>NATIVE PLACE</Text>
                  <Text style={styles.gridValue}>Mysuru, Karnataka</Text>
                </View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridCol}>
                  <Text style={styles.gridLabel}>LANGUAGES</Text>
                  <Text style={styles.gridValue}>Kannada, Hindi,{'\n'}English</Text>
                </View>
                <View style={styles.gridCol}>
                  <Text style={styles.gridLabel}>FAVOURITE FOOD</Text>
                  <Text style={styles.gridValue}>Idli & filter coffee</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: '#9A7249', marginTop: Spacing.xl }]}>YOUR FAMILY</Text>

        <View style={styles.list}>
          {CONTACTS.map((contact) => (
            <View key={contact.id} style={styles.cardWrapper}>
              <View style={[styles.cardShadow, { backgroundColor: '#1C1E1B' }]} />
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Image source={{ uri: contact.imageUrl }} style={styles.contactImage} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={[styles.contactRelation, { color: contact.btnColor }]}>{contact.relation}</Text>
                    <Text style={styles.contactDesc}>{contact.description}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.callBtn, { backgroundColor: contact.btnColor }]}
                  onPress={() => handleCall(contact.name)}
                  activeOpacity={0.85}
                  accessible={true}
                  accessibilityLabel={`Call ${contact.name}`}
                >
                  <FontAwesome5 name="phone-alt" size={16} color="#FFF" style={styles.callIcon} />
                  <Text style={styles.callBtnText}>{contact.phone}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Remember This Card */}
          <View style={styles.cardWrapper}>
            <View style={[styles.cardShadow, { backgroundColor: '#1C1E1B' }]} />
            <View style={styles.rememberCard}>
              <View style={[styles.rememberLeftBar, { backgroundColor: '#586C32' }]} />
              <View style={styles.rememberContent}>
                <Text style={styles.rememberTitle}>REMEMBER THIS</Text>
                <Text style={styles.rememberText}>You live at 14, Jayanagar, Bangalore.</Text>
                <Text style={styles.rememberContact}>
                  Priya's phone: <Text style={styles.rememberNumber}>98765-43210</Text>
                </Text>
                <Text style={styles.rememberContact}>
                  Home phone: <Text style={styles.rememberNumber}>080-2234-5678</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1E1B',
    ...Shadow.card,
    elevation: 4,
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
    color: '#A6C4AE',
    marginTop: 2,
  },
  headerRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  scroll: { 
    paddingHorizontal: Spacing.lg,
    paddingTop: 160, // extra gap between header and profile
    paddingBottom: 120, // space for FAB
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
    marginLeft: 2,
  },
  // Profile Card
  profileWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  profileCard: {
    backgroundColor: Colors.bgCardWarm,
    borderWidth: 1.5,
    borderColor: '#1C1E1B',
  },
  profileTop: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderColor: '#1C1E1B',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRightWidth: 1.5,
    borderColor: '#1C1E1B',
  },
  profileInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  profileName: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xl,
    color: '#FFF',
  },
  profileSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: '#A6C4AE',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  profileBadge: {
    backgroundColor: '#C4822A',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#A67C52',
  },
  profileBadgeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.sm,
    color: '#FFF',
  },
  profileGrid: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCol: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  gridLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 10,
    color: '#896E46',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  gridValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
  },
  list: {
    gap: Spacing.xl,
  },
  cardWrapper: {
    position: 'relative',
  },
  cardShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
  },
  card: {
    backgroundColor: Colors.bgCardWarm,
    borderWidth: 1.5,
    borderColor: '#1C1E1B',
  },
  cardTop: {
    flexDirection: 'row',
  },
  contactImage: {
    width: 120,
    height: 120,
    borderRightWidth: 1.5,
    borderColor: '#1C1E1B',
  },
  cardInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  contactName: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xl,
    color: Colors.textPrimary,
  },
  contactRelation: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.sm,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  contactDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: 1.5,
    borderColor: '#1C1E1B',
  },
  callIcon: {
    marginRight: Spacing.sm,
  },
  callBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: '#FFF',
  },
  // Remember This Card
  rememberCard: {
    backgroundColor: Colors.bgCardWarm,
    borderWidth: 1.5,
    borderColor: '#1C1E1B',
    flexDirection: 'row',
  },
  rememberLeftBar: {
    width: 8,
    borderRightWidth: 1.5,
    borderColor: '#1C1E1B',
  },
  rememberContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  rememberTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 12,
    color: '#896E46',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  rememberText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  rememberContact: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  rememberNumber: {
    fontFamily: Typography.fontFamily.bold,
    color: '#2B5336', // Dark green phone numbers
  },
});

