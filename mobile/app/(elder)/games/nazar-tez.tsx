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
import { getDifficultyForDomain, evaluateAndUpdateTier } from '@/engine/difficultyEngine';
import { insertGameSession } from '@/engine/database';
import { useAppStore } from '@/store/appStore';
import { generateSearchRound, type AttentionItem } from '@/engine/gameContent';
import i18n from '@/services/i18n';
import GameResultModal from '@/components/GameResultModal';

const ROUNDS_PER_GAME = 5;

export default function NazarTezGame() {
  const router = useRouter();
  const language = useAppStore(state => state.patient.preferredLanguage);
  i18n.locale = language || 'en';
  const domain = 'attention';
  const domainData = Domains[domain];
  const currentTier = useAppStore(state => state.domainTiers[domain]);
  const patientId = useAppStore(state => state.patient.id);
  const diffParams = getDifficultyForDomain(currentTier);

  const [roundIndex, setRoundIndex] = useState(0);
  const [session, setSession] = useState<GameSession>(
    createSession('nazar-tez', domain, diffParams.tier)
  );
  const [currentRound, setCurrentRound] = useState(() => generateSearchRound(diffParams.itemCount));
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const [answerTimeLeft, setAnswerTimeLeft] = useState<number | null>(
    diffParams.timeLimitMs ? diffParams.timeLimitMs / 1000 : null
  );
  const answerTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const resetGame = () => {
    const newDiff = getDifficultyForDomain(useAppStore.getState().domainTiers[domain]);
    setCurrentRound(generateSearchRound(newDiff.itemCount));
    setSession(createSession('nazar-tez', domain, newDiff.tier));
    setRoundIndex(0);
    setSelected(null);
    setFeedback(null);
    setShowResult(false);
    setRoundStartTime(Date.now());
    if (newDiff.timeLimitMs) {
      setAnswerTimeLeft(newDiff.timeLimitMs / 1000);
    } else {
      setAnswerTimeLeft(null);
    }
  };

  useEffect(() => {
    if (answerTimeLeft !== null && !selected) {
      if (answerTimeLeft <= 0) {
        handleAnswer(null); // timeout
        return;
      }
      answerTimerRef.current = setTimeout(() => setAnswerTimeLeft((c) => (c ? c - 1 : null)), 1000);
      return () => {
        if (answerTimerRef.current) clearTimeout(answerTimerRef.current);
      };
    }
  }, [answerTimeLeft, selected]);

  const isLastRound = roundIndex === ROUNDS_PER_GAME - 1;
  const correctCount = session.items.filter((i) => i.isCorrect).length;

  const handleAnswer = (item: AttentionItem | null) => {
    if (selected) return;
    if (answerTimerRef.current) clearTimeout(answerTimerRef.current);

    const isTimeout = item === null;
    const isCorrect = item ? item.id === currentRound.target.id : false;
    
    setSelected(item?.id || 'timeout');
    setFeedback(isTimeout ? 'timeout' : (isCorrect ? 'correct' : 'wrong'));

    const updatedSession = logItem(session, {
      itemId: generateItemId(),
      prompt: `Find: ${i18n.t(currentRound.target.i18nKey)}`,
      correctAnswer: currentRound.target.id,
      userAnswer: item?.id || null,
      isCorrect: isTimeout ? false : isCorrect,
      responseTimeMs: isTimeout ? diffParams.timeLimitMs : (Date.now() - roundStartTime),
      timedOut: isTimeout,
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
        setCurrentRound(generateSearchRound(diffParams.itemCount));
        setSelected(null);
        setFeedback(null);
        setRoundStartTime(Date.now());
        if (diffParams.timeLimitMs) {
          setAnswerTimeLeft(diffParams.timeLimitMs / 1000);
        }
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
          <Text style={styles.backText}>← {i18n.t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.gameName}>{i18n.t(domainData.i18nKey)}</Text>
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
          <Text style={styles.targetLabel}>{i18n.t('attention_find')}</Text>
          <Text style={styles.targetEmoji}>{currentRound.target.emoji}</Text>
          <Text style={styles.targetName}>{i18n.t(currentRound.target.i18nKey)}</Text>
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
                ? `✓ ${i18n.t('correct')}`
                : feedback === 'timeout'
                ? `⏳ ${i18n.t('timeout')}`
                : `${i18n.t('wrong_answer')} ${currentRound.target.emoji} ${i18n.t(currentRound.target.i18nKey)}`}
            </Text>
          </View>
        )}

        {/* Timer Bar */}
        {answerTimeLeft !== null && !selected && (
          <View style={styles.timerBarContainer}>
            <View 
              style={[
                styles.timerBarFill, 
                { width: `${(answerTimeLeft / (diffParams.timeLimitMs! / 1000)) * 100}%` }
              ]} 
            />
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
        domainName={i18n.t(domainData.i18nKey)}
        onPlayAgain={resetGame}
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
    borderBottomColor: Colors.domainAttentionShadow,
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
  timerBarContainer: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: Radius.pill,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
    backgroundColor: Colors.alertRed,
  },
  content: { flex: 1, padding: Spacing.lg },
  targetBox: {
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.bgCardWarm,
    marginBottom: Spacing.md,
    ...Shadow.cardStrong,
  },
  targetLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  targetEmoji: { fontSize: 52 },
  targetName: {
    fontFamily: Typography.fontFamily.display,
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
    borderWidth: 2,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.card,
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
    backgroundColor: Colors.bgCardWarm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.borderLight,
    ...Shadow.cardStrong,
  },
  tileCorrect: { backgroundColor: Colors.successTealLight, borderColor: Colors.successTeal },
  tileWrong: { backgroundColor: Colors.alertRedLight, borderColor: Colors.alertRed },
  tileNeutral: { opacity: 0.45 },
  gridEmoji: { fontSize: 44 },
});

