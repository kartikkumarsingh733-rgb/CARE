// Mera Din — Daily Recall / Sequence Ordering Game (PRD §5a Domain 4)
// "Put the morning routine in the right order"
// Elder drags / taps items into the right sequence
// Stage 1: tap-to-add sequence (simple, no drag-n-drop library needed)

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadow,
  Domains,
} from '@/constants/theme';
import {
  createSession,
  logItem,
  finalizeSession,
  generateItemId,
  type GameSession,
} from '@/engine/gameSession';
import { getDifficultyForDomain } from '@/engine/difficultyEngine';
import { ROUTINE_ROUNDS, type RoutineItem } from '@/engine/gameContent';
import GameResultModal from '@/components/GameResultModal';

export default function MeraDinGame() {
  const router = useRouter();
  const domain = 'recall';
  const domainData = Domains[domain];
  const diffParams = getDifficultyForDomain(domain);

  const totalRounds = Math.min(ROUTINE_ROUNDS.length, 3);
  const rounds = ROUTINE_ROUNDS.slice(0, totalRounds);

  const [roundIndex, setRoundIndex] = useState(0);
  const [session, setSession] = useState<GameSession>(
    createSession('mera-din', domain, diffParams.tier)
  );
  const [sequence, setSequence] = useState<RoutineItem[]>([]);   // user's built sequence
  const [remaining, setRemaining] = useState<RoutineItem[]>(
    [...rounds[0].items].sort(() => Math.random() - 0.5)         // shuffled source items
  );
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);

  const correctCount = session.items.filter((i) => i.isCorrect).length;
  const currentRound = rounds[roundIndex];
  const isLastRound = roundIndex === totalRounds - 1;

  const addToSequence = (item: RoutineItem) => {
    if (checked) return;
    setSequence((prev) => [...prev, item]);
    setRemaining((prev) => prev.filter((r) => r.id !== item.id));
  };

  const removeFromSequence = (item: RoutineItem, index: number) => {
    if (checked) return;
    setSequence((prev) => prev.filter((_, i) => i !== index));
    setRemaining((prev) => [...prev, item]);
  };

  const checkAnswer = () => {
    const correct = sequence.every(
      (item, i) => item.order === i + 1
    ) && sequence.length === currentRound.items.length;
    setIsCorrect(correct);
    setChecked(true);

    const updatedSession = logItem(session, {
      itemId: generateItemId(),
      prompt: currentRound.instruction,
      correctAnswer: currentRound.items.map((r) => r.id).join(','),
      userAnswer: sequence.map((r) => r.id).join(','),
      isCorrect: correct,
      responseTimeMs: 0,
      timedOut: false,
    });
    setSession(updatedSession);

    setTimeout(() => {
      if (isLastRound) {
        setSession(finalizeSession(updatedSession, diffParams.tier));
        setShowResult(true);
      } else {
        const nextRound = rounds[roundIndex + 1];
        setRoundIndex((i) => i + 1);
        setSequence([]);
        setRemaining([...nextRound.items].sort(() => Math.random() - 0.5));
        setChecked(false);
        setIsCorrect(null);
      }
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: domainData.color }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.gameName}>Mera Din</Text>
        <Text style={styles.gameHindi}>मेरा दिन</Text>
        <Text style={styles.progressText}>
          {roundIndex + 1} / {totalRounds}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${(roundIndex / totalRounds) * 100}%`, backgroundColor: domainData.color },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Instruction */}
        <View style={styles.instructionBox}>
          <Text style={styles.roundTitle}>{currentRound.title}</Text>
          <Text style={styles.instructionText}>{currentRound.instruction}</Text>
        </View>

        {/* Feedback */}
        {checked && isCorrect !== null && (
          <View
            style={[
              styles.feedbackBanner,
              {
                backgroundColor: isCorrect ? Colors.successTealLight : Colors.alertYellowLight,
                borderColor: isCorrect ? Colors.successTeal : Colors.alertYellow,
              },
            ]}
          >
            <Text
              style={[
                styles.feedbackText,
                { color: isCorrect ? Colors.successTeal : Colors.alertYellow },
              ]}
            >
              {isCorrect
                ? '✓  Sahi order! Bahut badhiya! शाबाश!'
                : `💡  The correct order is: ${currentRound.items
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((r) => r.emoji)
                    .join(' → ')}`}
            </Text>
          </View>
        )}

        {/* Sequence builder — user's chosen order */}
        <Text style={styles.sectionLabel}>YOUR ORDER (Tap to remove)</Text>
        <View style={styles.sequenceRow}>
          {sequence.map((item, index) => (
            <TouchableOpacity
              key={`${item.id}-${index}`}
              style={[
                styles.seqItem,
                checked && isCorrect !== null
                  ? item.order === index + 1
                    ? styles.seqCorrect
                    : styles.seqWrong
                  : null,
              ]}
              onPress={() => removeFromSequence(item, index)}
              disabled={checked}
            >
              <Text style={styles.seqNumber}>{index + 1}</Text>
              <Text style={styles.seqEmoji}>{item.emoji}</Text>
              <Text style={styles.seqLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}

          {/* Empty slots */}
          {Array.from({
            length: currentRound.items.length - sequence.length,
          }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.emptySlot}>
              <Text style={styles.emptySlotText}>{sequence.length + i + 1}</Text>
            </View>
          ))}
        </View>

        {/* Available items */}
        <Text style={styles.sectionLabel}>AVAILABLE (Tap to add)</Text>
        <View style={styles.itemsRow}>
          {remaining.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.sourceTile}
              onPress={() => addToSequence(item)}
              disabled={checked}
            >
              <Text style={styles.sourceTileEmoji}>{item.emoji}</Text>
              <Text style={styles.sourceTileLabel}>{item.label}</Text>
              <Text style={styles.sourceTileHindi}>{item.hindiLabel}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Check button */}
        {!checked && sequence.length === currentRound.items.length && (
          <TouchableOpacity
            style={[styles.checkBtn, { backgroundColor: domainData.color }]}
            onPress={checkAnswer}
          >
            <Text style={styles.checkBtnText}>✓  Check My Answer</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <GameResultModal
        visible={showResult}
        correct={correctCount}
        total={totalRounds}
        domainColor={domainData.color}
        domainName="Mera Din"
        onPlayAgain={() => router.replace('/(elder)/games/mera-din')}
        onBack={() => router.push('/(elder)/play')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgCream },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  backBtn: { paddingBottom: Spacing.sm },
  backText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: 'rgba(255,255,255,0.85)',
  },
  gameName: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.size.xxl,
    color: Colors.textOnDark,
  },
  gameHindi: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: 'rgba(255,255,255,0.8)',
  },
  progressText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: 'rgba(255,255,255,0.85)',
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
  },
  progressBarBg: { height: 4, backgroundColor: Colors.borderLight },
  progressBarFill: { height: 4 },
  content: { padding: Spacing.lg, paddingBottom: 60 },
  instructionBox: {
    backgroundColor: Colors.goldLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  roundTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  instructionText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  feedbackBanner: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  feedbackText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  sequenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  seqItem: {
    width: 80,
    minHeight: 90,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    ...Shadow.card,
  },
  seqCorrect: {
    backgroundColor: Colors.successTealLight,
    borderColor: Colors.successTeal,
  },
  seqWrong: {
    backgroundColor: Colors.alertRedLight,
    borderColor: Colors.alertRed,
  },
  seqNumber: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.size.xxl,
    color: Colors.gold,
    position: 'absolute',
    top: 4,
    left: 8,
  },
  seqEmoji: { fontSize: 32, marginTop: 10 },
  seqLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 2,
  },
  emptySlot: {
    width: 80,
    minHeight: 90,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.borderMedium,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xxl,
    color: Colors.disabled,
  },
  itemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sourceTile: {
    width: 80,
    minHeight: 90,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    ...Shadow.card,
  },
  sourceTileEmoji: { fontSize: 32 },
  sourceTileLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xs,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 2,
  },
  sourceTileHindi: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 9,
    color: Colors.textHindi,
    textAlign: 'center',
  },
  checkBtn: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  checkBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.textOnDark,
  },
});

