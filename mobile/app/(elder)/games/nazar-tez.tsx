// Nazar Tez — Attention / Visual Search Game (PRD §5a Domain 2)
// "Find the [target] in the grid before the counter fills up"
// Elder taps the correct emoji in a grid of distractors

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
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
import { generateSearchRound, type AttentionItem } from '@/engine/gameContent';
import GameResultModal from '@/components/GameResultModal';

const ROUNDS_PER_GAME = 5;

export default function NazarTezGame() {
  const router = useRouter();
  const domain = 'attention';
  const domainData = Domains[domain];
  const diffParams = getDifficultyForDomain(domain);

  const [roundIndex, setRoundIndex] = useState(0);
  const [session, setSession] = useState<GameSession>(
    createSession('nazar-tez', domain, diffParams.tier)
  );
  const [currentRound, setCurrentRound] = useState(generateSearchRound(6));
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [roundStartTime, setRoundStartTime] = useState(Date.now());

  const isLastRound = roundIndex === ROUNDS_PER_GAME - 1;
  const correctCount = session.items.filter((i) => i.isCorrect).length;

  const handleAnswer = (item: AttentionItem) => {
    if (selected) return;
    const isCorrect = item.id === currentRound.target.id;
    setSelected(item.id);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    const updatedSession = logItem(session, {
      itemId: generateItemId(),
      prompt: `Find: ${currentRound.target.label}`,
      correctAnswer: currentRound.target.id,
      userAnswer: item.id,
      isCorrect,
      responseTimeMs: Date.now() - roundStartTime,
      timedOut: false,
    });
    setSession(updatedSession);

    setTimeout(() => {
      if (isLastRound) {
        setSession(finalizeSession(updatedSession, diffParams.tier));
        setShowResult(true);
      } else {
        setRoundIndex((i) => i + 1);
        setCurrentRound(generateSearchRound(6));
        setSelected(null);
        setFeedback(null);
        setRoundStartTime(Date.now());
      }
    }, 1200);
  };

  const getTileStyle = (itemId: string) => {
    if (!selected) return styles.gridTile;
    if (itemId === currentRound.target.id) return [styles.gridTile, styles.tileCorrect];
    if (itemId === selected) return [styles.gridTile, styles.tileWrong];
    return [styles.gridTile, styles.tileNeutral];
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: domainData.color }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.gameName}>Nazar Tez</Text>
        <Text style={styles.gameHindi}>नज़र तेज़</Text>
        <Text style={styles.progressText}>
          {roundIndex + 1} / {ROUNDS_PER_GAME}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${(roundIndex / ROUNDS_PER_GAME) * 100}%`, backgroundColor: domainData.color },
          ]}
        />
      </View>

      <View style={styles.content}>
        {/* Target prompt */}
        <View style={[styles.targetBox, { borderColor: domainData.color }]}>
          <Text style={styles.targetLabel}>Find this:</Text>
          <Text style={styles.targetEmoji}>{currentRound.target.emoji}</Text>
          <Text style={styles.targetName}>{currentRound.target.label}</Text>
          <Text style={styles.targetHindi}>{currentRound.target.hindiLabel}</Text>
        </View>

        {/* Feedback */}
        {feedback && (
          <View
            style={[
              styles.feedbackBanner,
              {
                backgroundColor: feedback === 'correct' ? Colors.successTealLight : Colors.alertRedLight,
                borderColor: feedback === 'correct' ? Colors.successTeal : Colors.alertRed,
              },
            ]}
          >
            <Text
              style={[
                styles.feedbackText,
                { color: feedback === 'correct' ? Colors.successTeal : Colors.alertRed },
              ]}
            >
              {feedback === 'correct'
                ? '✓  Bilkul sahi! शाबाश!'
                : `The ${currentRound.target.emoji} ${currentRound.target.label} was there!`}
            </Text>
          </View>
        )}

        {/* Emoji grid */}
        <FlatList
          data={currentRound.grid}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          numColumns={3}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={getTileStyle(item.id)}
              onPress={() => handleAnswer(item)}
              activeOpacity={0.75}
              disabled={!!selected}
            >
              <Text style={styles.gridEmoji}>{item.emoji}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <GameResultModal
        visible={showResult}
        correct={correctCount}
        total={ROUNDS_PER_GAME}
        domainColor={domainData.color}
        domainName="Nazar Tez"
        onPlayAgain={() => router.replace('/(elder)/games/nazar-tez')}
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
    marginTop: 2,
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
  content: { flex: 1, padding: Spacing.lg },
  targetBox: {
    borderWidth: 2,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    marginBottom: Spacing.md,
    ...Shadow.card,
  },
  targetLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  targetEmoji: { fontSize: 52 },
  targetName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  targetHindi: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: Colors.textHindi,
    marginTop: 2,
  },
  feedbackBanner: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  feedbackText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    textAlign: 'center',
  },
  grid: { paddingTop: Spacing.md },
  gridRow: { gap: Spacing.md, justifyContent: 'center', marginBottom: Spacing.md },
  gridTile: {
    width: 95,
    height: 95,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.borderLight,
    ...Shadow.card,
  },
  tileCorrect: { backgroundColor: Colors.successTealLight, borderColor: Colors.successTeal },
  tileWrong: { backgroundColor: Colors.alertRedLight, borderColor: Colors.alertRed },
  tileNeutral: { opacity: 0.45 },
  gridEmoji: { fontSize: 44 },
});

