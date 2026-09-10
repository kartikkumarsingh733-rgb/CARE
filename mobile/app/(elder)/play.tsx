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
import { useAppStore } from '@/store/appStore';
import FloatingChatButton from '@/components/FloatingChatButton';
import i18n from '@/services/i18n';

interface GameCardProps {
  domain: DomainKey;
  gameName: string;
  description: string;
  route: string;
}

function GameCard({ domain, gameName, description, route }: GameCardProps) {
  const router = useRouter();
  const domainData = Domains[domain];
  const tier = useAppStore(state => state.domainTiers[domain]);
  const difficultyLabel = getDifficultyLabel(tier);

  return (
    <View style={[styles.card, { borderColor: domainData.color, shadowColor: domainData.shadow }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: domainData.color }]}>
          <Text style={styles.iconEmoji}>{domainData.icon}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.gameName}>{i18n.t(gameName)}</Text>
          <Text style={styles.gameHindi}>
            {i18n.t(domainData.i18nKey)}
          </Text>
          <Text style={styles.gameDesc}>{i18n.t(description)}</Text>
          <View style={[styles.diffBadge, { borderColor: domainData.color }]}>
            <Text style={[styles.diffText, { color: domainData.color }]}>{difficultyLabel}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.playBtn, { backgroundColor: domainData.color, borderTopColor: domainData.color }]}
        onPress={() => router.push(route as any)}
        activeOpacity={0.85}
      >
        <Text style={styles.playBtnText}>{i18n.t('play_now')}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PlayScreen() {
  const router = useRouter();
  const language = useAppStore(state => state.patient.preferredLanguage);
  i18n.locale = language || 'en';
  
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.pageHeader, { backgroundColor: Colors.domainMemory, shadowColor: Colors.domainMemoryShadow }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.pageTitle}>{i18n.t('play_title')}</Text>
              <Text style={styles.pageSubtitle}>
                {i18n.t('play_desc')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/caregiver-pin')} style={styles.gearBtn} accessible={true} accessibilityLabel="Caregiver Settings">
              <Text style={styles.gearIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
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
            gameName="game_yaad_rakho"
            description="game_yaad_rakho_desc"
            route="/(elder)/games/yaad-rakho"
          />
          <GameCard
            domain="attention"
            gameName="game_nazar_tez"
            description="game_nazar_tez_desc"
            route="/(elder)/games/nazar-tez"
          />
          <GameCard
            domain="patterns"
            gameName="game_milan"
            description="game_milan_desc"
            route="/(elder)/games/milan"
          />
          <GameCard
            domain="recall"
            gameName="game_mera_din"
            description="game_mera_din_desc"
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
    borderBottomWidth: 1,
    borderBottomColor: '#1E3D52', // Memory Shadow
    ...Shadow.card, // Add hard shadow to bottom
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
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  headerRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  gearBtn: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: Radius.circle,
  },
  gearIcon: {
    fontSize: 24,
  },
  nudgeBox: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.successTealLight,
    borderLeftWidth: 6,
    borderLeftColor: Colors.successTeal,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: `${Colors.successTeal}44`,
    padding: Spacing.lg,
    ...Shadow.card,
    shadowColor: '#1A3825',
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
    gap: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.bgCardWarm,
    borderWidth: 1,
    ...Shadow.cardStrong, // 5px hard shadow
  },
  cardHeader: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconBox: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: Radius.sm,
  },
  iconEmoji: { fontSize: 32 },
  cardInfo: { flex: 1 },
  gameName: {
    fontFamily: Typography.fontFamily.display,
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
    marginTop: 6,
    lineHeight: 20,
  },
  diffBadge: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 2, // Slightly rounded for small badges
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.bgCardWarm,
  },
  diffText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.xs,
  },
  playBtn: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  playBtnText: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.lg,
    color: Colors.textOnDark,
    letterSpacing: 0.5,
  },
});

