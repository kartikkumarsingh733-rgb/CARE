// Help Tab — emergency contact, SmritiSaathi chat access, SOS button (PRD §5g)
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import FloatingChatButton from '@/components/FloatingChatButton';

const HELP_CONTACTS = [
  { name: 'Priya (Daughter)', relation: 'Primary Caregiver', phone: '+91 98765 43210', emoji: '👩' },
  { name: 'Dr. Mehta',        relation: 'Your Doctor',       phone: '+91 11 2345 6789', emoji: '⭐' },
  { name: 'Rahul (Son)',      relation: 'Family',            phone: '+91 91234 56789', emoji: '👨' },
];

const HELP_TOPICS = [
  { emoji: '🧩', question: 'How do I play a game?',         answer: 'Go to the Play tab and choose a game. Just tap "Play Now"!' },
  { emoji: '📅', question: 'How do I see my schedule?',     answer: 'Go to the My Day tab. You will see all your tasks for today.' },
  { emoji: '🖼️', question: 'How do I see my family photos?', answer: 'Go to the Memories tab. You can see all your family memories there.' },
  { emoji: '💊', question: 'Did I take my medicine?',        answer: 'Check the My Day tab. Tap on medicine tasks to mark them done.' },
];

export default function HelpScreen() {
  const callContact = (phone: string, name: string) => {
    Alert.alert(
      `Call ${name}?`,
      phone,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => Linking.openURL(`tel:${phone}`) },
      ]
    );
  };

  const sosAlert = () => {
    Alert.alert(
      '🆘 Sending Alert',
      'Your caregiver Priya will be notified right away.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Help · मदद</Text>
          <Text style={styles.subtitle}>
            You are never alone. We are here to help.
          </Text>
        </View>

        {/* SOS Button */}
        <View style={styles.sosSection}>
          <TouchableOpacity style={styles.sosBtn} onPress={sosAlert} activeOpacity={0.8}>
            <Text style={styles.sosBtnText}>🆘</Text>
            <Text style={styles.sosBtnLabel}>I Need Help Now!</Text>
            <Text style={styles.sosBtnHindi}>मुझे अभी मदद चाहिए!</Text>
          </TouchableOpacity>
          <Text style={styles.sosHint}>
            Tap this button — your caregiver will be notified immediately.
          </Text>
        </View>

        {/* Emergency contacts */}
        <Text style={styles.sectionLabel}>CALL SOMEONE</Text>
        <View style={styles.contactsCard}>
          {HELP_CONTACTS.map((c, i) => (
            <View key={c.name}>
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => callContact(c.phone, c.name)}
                activeOpacity={0.7}
              >
                <Text style={styles.contactEmoji}>{c.emoji}</Text>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text style={styles.contactRelation}>{c.relation}</Text>
                </View>
                <View style={styles.callBadge}>
                  <Text style={styles.callBadgeText}>📞 Call</Text>
                </View>
              </TouchableOpacity>
              {i < HELP_CONTACTS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Common questions */}
        <Text style={styles.sectionLabel}>COMMON QUESTIONS</Text>
        <View style={styles.faqCard}>
          {HELP_TOPICS.map((topic) => (
            <View key={topic.question} style={styles.faqItem}>
              <Text style={styles.faqQ}>
                {topic.emoji}  {topic.question}
              </Text>
              <Text style={styles.faqA}>{topic.answer}</Text>
            </View>
          ))}
        </View>

        {/* SmritiSaathi chat prompt */}
        <View style={styles.companionBox}>
          <Text style={styles.companionEmoji}>🤗</Text>
          <View style={styles.companionText}>
            <Text style={styles.companionTitle}>
              Talk to SmritiSaathi
            </Text>
            <Text style={styles.companionSub}>
              Ask anything — in Hindi or English.
              Tap the chat button at the bottom right.
            </Text>
          </View>
        </View>
      </ScrollView>

      <FloatingChatButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgCream },
  scroll: { paddingBottom: 80 },
  header: {
    backgroundColor: Colors.alertRed,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xxxl,
    color: Colors.textOnDark,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  sosSection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  sosBtn: {
    width: '100%',
    backgroundColor: Colors.alertRed,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    ...Shadow.cardStrong,
  },
  sosBtnText: { fontSize: 40 },
  sosBtnLabel: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xxl,
    color: Colors.textOnDark,
    marginTop: Spacing.sm,
  },
  sosBtnHindi: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  sosHint: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  contactsCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    ...Shadow.card,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  contactEmoji: { fontSize: 28 },
  contactInfo: { flex: 1 },
  contactName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
  },
  contactRelation: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  callBadge: {
    backgroundColor: Colors.successTeal,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  callBadgeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.sm,
    color: Colors.textOnDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.lg,
  },
  faqCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.lg,
    ...Shadow.card,
  },
  faqItem: {},
  faqQ: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
  },
  faqA: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 22,
  },
  companionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.chatGreenLight,
    borderRadius: Radius.lg,
    margin: Spacing.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  companionEmoji: { fontSize: 40 },
  companionText: { flex: 1 },
  companionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.chatGreen,
  },
  companionSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.chatGreen,
    marginTop: 4,
    lineHeight: 20,
  },
});

