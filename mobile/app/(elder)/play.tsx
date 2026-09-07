// Play Tab — Games List matching screenshots exactly
// Shows activity nudge, then game cards for all 4 domains
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { Domains, type DomainKey } from '@/constants/theme';
import { getDifficultyLabel } from '@/engine/difficultyEngine';
import FloatingChatButton from '@/components/FloatingChatButton';

interface GameCardProps {
  domain: DomainKey;
  gameName: string;
  hindiName: string;
  description: string;
  route: string;
}

function GameCard({ domain, gameName, hindiName, description, route }: GameCardProps) {
  const router = useRouter();
  const domainData = Domains[domain];
  const difficultyLabel = getDifficultyLabel(domain);

  return (
    <View style={[styles.card, { borderLeftColor: domainData.color }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: domainData.color }]}>
          <Text style={styles.iconEmoji}>{domainData.icon}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.gameName}>{gameName}</Text>
          <Text style={styles.gameHindi}>
            {hindiName} · {domainData.label}
          </Text>
          <Text style={styles.gameDesc}>{description}</Text>
          <View style={styles.diffBadge}>
            <Text style={styles.diffText}>{difficultyLabel}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.playBtn, { backgroundColor: domainData.color }]}
        onPress={() => router.push(route as any)}
        activeOpacity={0.85}
      >
        <Text style={styles.playBtnText}>Play Now</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PlayScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.pageHeader, { backgroundColor: Colors.domainMemory }]}>
          <Text style={styles.pageTitle}>Let's Play</Text>
          <Text style={styles.pageSubtitle}>
            Choose a game below. Take your time.
          </Text>
        </View>

        {/* Activity nudge */}
        <View style={styles.nudgeBox}>
          <Text style={styles.nudgeText}>
            🌟 You played for 10 minutes yesterday. Great work, Rameshji!
          </Text>
        </View>

        {/* Game cards */}
        <View style={styles.cardsList}>
          <GameCard
            domain="memory"
            gameName="Yaad Rakho"
            hindiName="याद रखो"
            description="Look at pictures and try to remember them."
            route="/(elder)/games/yaad-rakho"
          />
          <GameCard
            domain="attention"
            gameName="Nazar Tez"
            hindiName="नज़र तेज़"
            description="Find the picture in the grid before time is up."
            route="/(elder)/games/nazar-tez"
          />
          <GameCard
            domain="patterns"
            gameName="Milan"
            hindiName="मिलान"
            description="Tap the picture that does not belong with the others."
            route="/(elder)/games/milan"
          />
          <GameCard
            domain="recall"
            gameName="Mera Din"
            hindiName="मेरा दिन"
            description="Put your morning routine in the right order."
            route="/(elder)/games/mera-din"
          />
        </View>
      </ScrollView>

      <FloatingChatButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgCream },
  scroll: { paddingBottom: Spacing.xxxl },
  pageHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  pageTitle: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.size.xxxl,
    color: Colors.textOnDark,
  },
  pageSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  nudgeBox: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.successTealLight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.successTeal,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  nudgeText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.chatGreen,
    lineHeight: 22,
  },
  cardsList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderLeftWidth: 4,
    overflow: 'hidden',
    ...Shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: { fontSize: 26 },
  cardInfo: { flex: 1 },
  gameName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
  },
  gameHindi: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textHindi,
    marginTop: 2,
  },
  gameDesc: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  diffBadge: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.gold,
    borderRadius: Radius.pill,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
  },
  diffText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
    color: Colors.gold,
  },
  playBtn: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  playBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.md,
    color: Colors.textOnDark,
    letterSpacing: 0.5,
  },
});

