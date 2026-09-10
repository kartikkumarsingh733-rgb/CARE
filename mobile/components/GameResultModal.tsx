// GameResultModal — shown at end of every game
// Encouragement-focused design, never shows failure harshly.
// Shows score, praise message, and two actions: Play Again / Back to Games

import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme';
import i18n from '../services/i18n';

interface Props {
  visible: boolean;
  correct: number;
  total: number;
  domainColor: string;
  domainName: string;
  onPlayAgain: () => void;
  onBack: () => void;
}

function getPraiseMessage(accuracy: number): { key: string; emoji: string } {
  if (accuracy >= 0.85) return { key: 'praise_excellent', emoji: '🌟' };
  if (accuracy >= 0.6)  return { key: 'praise_good', emoji: '👏' };
  return                        { key: 'praise_try', emoji: '💪' };
}

export default function GameResultModal({
  visible,
  correct,
  total,
  domainColor,
  domainName,
  onPlayAgain,
  onBack,
}: Props) {
  const accuracy = total > 0 ? correct / total : 0;
  const praise = getPraiseMessage(accuracy);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Domain colored top strip */}
          <View style={[styles.topStrip, { backgroundColor: domainColor }]}>
            <Text style={styles.trophyEmoji}>{praise.emoji}</Text>
            <Text style={styles.gameLabel}>{domainName} — {i18n.t('done')}</Text>
          </View>

          {/* Score */}
          <View style={styles.scoreRow}>
            <View style={[styles.scoreBadge, { borderColor: domainColor }]}>
              <Text style={[styles.scoreNum, { color: domainColor }]}>{correct}</Text>
              <Text style={[styles.scoreOf, { color: domainColor }]}>/ {total}</Text>
            </View>
            <Text style={styles.scoreLabel}>{i18n.t('correct')}</Text>
          </View>

          {/* Praise */}
          <Text style={styles.praiseEN}>{i18n.t(praise.key)}</Text>

          {/* Actions */}
          <TouchableOpacity
            style={[styles.playAgainBtn, { backgroundColor: domainColor }]}
            onPress={onPlayAgain}
          >
            <Text style={styles.playAgainText}>🔄  {i18n.t('play_again')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>← {i18n.t('back_to_games')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    width: '100%',
    overflow: 'hidden',
    ...Shadow.cardStrong,
  },
  topStrip: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  trophyEmoji: { fontSize: 52 },
  gameLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.textOnDark,
    marginTop: Spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  scoreBadge: {
    borderWidth: 3,
    borderRadius: Radius.circle,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNum: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xxxl,
  },
  scoreOf: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.sm,
    marginTop: -4,
  },
  scoreLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xxl,
    color: Colors.textPrimary,
  },
  praiseEN: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  praiseHI: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.lg,
    color: Colors.textHindi,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: 4,
  },
  playAgainBtn: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  playAgainText: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.lg,
    color: Colors.textOnDark,
  },
  backBtn: {
    margin: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  backText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
  },
});
