// Milan — Patterns / Odd One Out Game (PRD §5a Domain 3)
// "Which picture doesn't belong with the others?"
// Elder taps the odd item; gets gentle explanation when wrong

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
import { getDifficultyForDomain, evaluateAndUpdateTier } from '@/engine/difficultyEngine';
import { insertGameSession } from '@/engine/database';
import { useAppStore } from '@/store/appStore';
import { ODD_ONE_OUT_ROUNDS } from '@/engine/gameContent';
import GameResultModal from '@/components/GameResultModal';

export default function MilanGame() {
  const router = useRouter();
  const domain = 'patterns';
  const domainData = Domains[domain];
  const currentTier = useAppStore(state => state.domainTiers[domain]);
  const patientId = useAppStore(state => state.patient.id);
  const diffParams = getDifficultyForDomain(currentTier);

  const totalRounds = Math.min(ODD_ONE_OUT_ROUNDS.length, 4);
  const rounds = ODD_ONE_OUT_ROUNDS.slice(0, totalRounds);

  const [roundIndex, setRoundIndex] = useState(0);
  const [session, setSession] = useState<GameSession>(
    createSession('milan', domain, diffParams.tier)
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showResult, setShowResult] = useState(false);

  const currentRound = rounds[roundIndex];
  const isLastRound = roundIndex === totalRounds - 1;
  const correctCount = session.items.filter((i) => i.isCorrect).length;

  const handleAnswer = (itemId: string) => {
    if (selected) return;
    const isCorrect = itemId === currentRound.oddItemId;
    setSelected(itemId);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    const updatedSession = logItem(session, {
      itemId: generateItemId(),
      prompt: 'Which one does not belong?',
      correctAnswer: currentRound.oddItemId,
      userAnswer: itemId,
      isCorrect,
      responseTimeMs: 0,
      timedOut: false,
    });
    setSession(updatedSession);

    setTimeout(() => {
      if (isLastRound) {
        const finalSession = finalizeSession(updatedSession, currentTier);
        setSession(finalSession);
        
        insertGameSession(finalSession);
        const { newTier } = evaluateAndUpdateTier(domain, patientId, currentTier);
        if (newTier !== currentTier) {
          useAppStore.getState().setDomainTier(domain, newTier);
        }
        
        setShowResult(true);
      } else {
        setRoundIndex((i) => i + 1);
        setSelected(null);
        setFeedback(null);
      }
    }, 2000);
  };

  const getTileStyle = (itemId: string) => {
    if (!selected) return styles.itemTile;
    if (itemId === currentRound.oddItemId) return [styles.itemTile, styles.tileCorrect];
    if (itemId === selected && !feedback) return [styles.itemTile, styles.tileWrong];
    if (itemId === selected && feedback === 'wrong') return [styles.itemTile, styles.tileWrong];
    return [styles.itemTile, styles.tileNeutral];
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: domainData.color }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.gameName}>Milan</Text>
        <Text style={styles.gameHindi}>मिलान</Text>
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

      <View style={styles.content}>
        {/* Question prompt */}
        <View style={styles.questionBox}>
          <Text style={styles.questionText}>
            Which one does NOT belong?
          </Text>
          <Text style={styles.questionHindi}>
            कौन सी तस्वीर इन सब में अलग है?
          </Text>
        </View>

        {/* Feedback */}
        {feedback && (
          <View
            style={[
              styles.feedbackBanner,
              {
                backgroundColor: feedback === 'correct' ? Colors.successTealLight : Colors.alertYellowLight,
                borderColor: feedback === 'correct' ? Colors.successTeal : Colors.alertYellow,
              },
            ]}
          >
            <Text
              style={[
                styles.feedbackText,
                { color: feedback === 'correct' ? Colors.successTeal : Colors.alertYellow },
              ]}
            >
              {feedback === 'correct'
                ? '✓  Bilkul sahi! Great thinking!'
                : `💡  ${currentRound.explanation}`}
            </Text>
          </View>
        )}

        {/* Items grid — 2x2 */}
        <View style={styles.itemsGrid}>
          {currentRound.items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={getTileStyle(item.id)}
              onPress={() => handleAnswer(item.id)}
              activeOpacity={0.8}
              disabled={!!selected}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <GameResultModal
        visible={showResult}
        correct={correctCount}
        total={totalRounds}
        domainColor={domainData.color}
        domainName="Milan"
        onPlayAgain={() => router.replace('/(elder)/games/milan')}
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.domainPatternsShadow,
    ...Shadow.card,
    elevation: 4,
    zIndex: 10,
  },
  backBtn: { paddingBottom: Spacing.sm },
  backText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: 'rgba(255,255,255,0.85)',
  },
  gameName: {
    fontFamily: Typography.fontFamily.display,
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
  content: { flex: 1, padding: Spacing.lg, justifyContent: 'center' },
  questionBox: {
    backgroundColor: Colors.goldLight,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    ...Shadow.card,
  },
  questionText: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xl,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  questionHindi: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: Colors.textHindi,
    marginTop: 4,
    textAlign: 'center',
  },
  feedbackBanner: {
    borderWidth: 2,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadow.card,
  },
  feedbackText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  itemTile: {
    width: '46%',
    aspectRatio: 1,
    backgroundColor: Colors.bgCardWarm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.borderLight,
    ...Shadow.cardStrong,
  },
  tileCorrect: {
    backgroundColor: Colors.successTealLight,
    borderColor: Colors.successTeal,
    borderWidth: 3,
  },
  tileWrong: {
    backgroundColor: Colors.alertRedLight,
    borderColor: Colors.alertRed,
    borderWidth: 3,
  },
  tileNeutral: { opacity: 0.45 },
  itemEmoji: { fontSize: 52 },
  itemLabel: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
});

