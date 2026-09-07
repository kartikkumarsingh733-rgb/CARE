// GameResultModal — shown at end of every game
// Encouragement-focused design, never shows failure harshly.
// Shows score, praise message, and two actions: Play Again / Back to Games

import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../constants/theme';

interface Props {
  visible: boolean;
  correct: number;
  total: number;
  domainColor: string;
  domainName: string;
  onPlayAgain: () => void;
  onBack: () => void;
}

function getPraiseMessage(accuracy: number): { en: string; hi: string; emoji: string } {
  if (accuracy >= 0.85) return { en: 'Excellent! You remembered so well!', hi: 'बहुत बढ़िया! आपकी याददाश्त कमाल है!', emoji: '🌟' };
  if (accuracy >= 0.6)  return { en: 'Well done! Keep practising!',      hi: 'बहुत अच्छे! अभ्यास जारी रखें!',           emoji: '👏' };
  return                        { en: 'Good try! Every game makes you stronger!', hi: 'बहुत अच्छी कोशिश!', emoji: '💪' };
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
            <Text style={styles.gameLabel}>{domainName} — Done!</Text>
          </View>

          {/* Score */}
          <View style={styles.scoreRow}>
            <View style={[styles.scoreBadge, { borderColor: domainColor }]}>
              <Text style={[styles.scoreNum, { color: domainColor }]}>{correct}</Text>
              <Text style={[styles.scoreOf, { color: domainColor }]}>of {total}</Text>
            </View>
            <Text style={styles.scoreLabel}>correct</Text>
          </View>

          {/* Praise */}
          <Text style={styles.praiseEN}>{praise.en}</Text>
          <Text style={styles.praiseHI}>{praise.hi}</Text>

          {/* Actions */}
          <TouchableOpacity
            style={[styles.playAgainBtn, { backgroundColor: domainColor }]}
            onPress={onPlayAgain}
          >
            <Text style={styles.playAgainText}>🔄  Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>← Back to All Games</Text>
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
    fontFamily: Typography.fontFamily.extraBold,
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
    fontFamily: Typography.fontFamily.extraBold,
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
