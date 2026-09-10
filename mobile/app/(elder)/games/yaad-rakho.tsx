// Yaad Rakho — Memory Game (PRD §5a Domain 1)
// Phase 1: Study items for a few seconds
// Phase 2: Recall — pick the item you saw from 3 choices
// Uses Game Session API to log each answer

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { Domains } from '@/constants/theme';
import {
  createSession,
  logItem,
  finalizeSession,
  generateItemId,
  type GameSession,
} from '@/engine/gameSession';
import i18n from '@/services/i18n';
import { getDifficultyForDomain, evaluateAndUpdateTier } from '@/engine/difficultyEngine';
import { insertGameSession } from '@/engine/database';
import { useAppStore } from '@/store/appStore';
import { generateMemoryRound, type MemoryItem } from '@/engine/gameContent';
import GameResultModal from '@/components/GameResultModal';

type Phase = 'study' | 'recall' | 'result';

export default function YaadRakhoGame() {
  const router = useRouter();
  const language = useAppStore(state => state.patient.preferredLanguage);
  i18n.locale = language || 'en';
  const domain = 'memory';
  const domainData = Domains[domain];
  const currentTier = useAppStore(state => state.domainTiers[domain]);
  const patientId = useAppStore(state => state.patient.id);
  const diffParams = getDifficultyForDomain(currentTier);

  const [gameContent, setGameContent] = useState(() => 
    generateMemoryRound(
      diffParams.itemCount <= 4 ? 3 : 4,
      Math.min(diffParams.itemCount, 9) // cap options at 9
    )
  );
  const { studyItems, recallQuestions } = gameContent;
  const totalRounds = recallQuestions.length;

  const [phase, setPhase] = useState<Phase>('study');
  const [studyCountdown, setStudyCountdown] = useState(5);
  const [roundIndex, setRoundIndex] = useState(0);
  const [session, setSession] = useState<GameSession>(
    createSession('yaad-rakho', domain, diffParams.tier)
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answerTimeLeft, setAnswerTimeLeft] = useState<number | null>(null);
  const answerTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const resetGame = () => {
    const newDiff = getDifficultyForDomain(useAppStore.getState().domainTiers[domain]);
    setGameContent(
      generateMemoryRound(
        newDiff.itemCount <= 4 ? 3 : 4,
        Math.min(newDiff.itemCount, 9)
      )
    );
    setSession(createSession('yaad-rakho', domain, newDiff.tier));
    setRoundIndex(0);
    setPhase('study');
    setStudyCountdown(5);
    setSelected(null);
    setFeedback(null);
    setShowResult(false);
    setAnswerTimeLeft(null);
  };

  // Study phase countdown
  useEffect(() => {
    if (phase !== 'study') return;
    if (studyCountdown === 0) {
      setPhase('recall');
      if (diffParams.timeLimitMs) {
        setAnswerTimeLeft(diffParams.timeLimitMs / 1000);
      }
      return;
    }
    const t = setTimeout(() => setStudyCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, studyCountdown]);

  // Recall phase countdown
  useEffect(() => {
    if (phase === 'recall' && answerTimeLeft !== null) {
      if (answerTimeLeft <= 0) {
        handleAnswer(null); // timeout
        return;
      }
      answerTimerRef.current = setTimeout(() => setAnswerTimeLeft((c) => (c ? c - 1 : null)), 1000);
      return () => {
        if (answerTimerRef.current) clearTimeout(answerTimerRef.current);
      };
    }
  }, [phase, answerTimeLeft, selected]);

  const currentQuestion = recallQuestions[roundIndex];
  const isLastRound = roundIndex === totalRounds - 1;

  const handleAnswer = (itemId: string | null) => {
    if (selected) return;  // prevent double-tap
    if (answerTimerRef.current) clearTimeout(answerTimerRef.current);
    
    const startTime = Date.now();
    const isCorrect = itemId === currentQuestion.target.id;
    const isTimeout = itemId === null;
    
    setSelected(itemId || 'timeout');
    setFeedback(isTimeout ? 'timeout' : (isCorrect ? 'correct' : 'wrong'));

    const updatedSession = logItem(session, {
      itemId: generateItemId(),
      prompt: `Which one did you see? (${i18n.t(currentQuestion.target.i18nKey)})`,
      correctAnswer: currentQuestion.target.id,
      userAnswer: itemId,
      isCorrect: isTimeout ? false : isCorrect,
      responseTimeMs: isTimeout ? diffParams.timeLimitMs : (Date.now() - startTime),
      timedOut: isTimeout,
    });
    setSession(updatedSession);

    // Small delay then advance or show result
    setTimeout(() => {
      if (isLastRound) {
        const finalSession = finalizeSession(updatedSession, currentTier);
        setSession(finalSession);
        
        // Log to database
        insertGameSession(finalSession);
        
        // Evaluate difficulty rules
        const { newTier } = evaluateAndUpdateTier(domain, patientId, currentTier);
        if (newTier !== currentTier) {
          useAppStore.getState().setDomainTier(domain, newTier);
        }
        
        setShowResult(true);
      } else {
        setRoundIndex((i) => i + 1);
        setSelected(null);
        if (diffParams.timeLimitMs) {
          setAnswerTimeLeft(diffParams.timeLimitMs / 1000);
        }
      }
    }, 1200);
  };

  const correctCount = session.items.filter((i) => i.isCorrect).length;

  const getTileStyle = (itemId: string) => {
    if (!selected) return styles.optionTile;
    if (itemId === currentQuestion.target.id) return [styles.optionTile, styles.tileCorrect];
    if (itemId === selected) return [styles.optionTile, styles.tileWrong];
    return [styles.optionTile, styles.tileNeutral];
  };

  // ─── Study Phase ──────────────────────────────────────────────────────────
  if (phase === 'study') {
    return (
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: domainData.color }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← {i18n.t('back')}</Text>
          </TouchableOpacity>
          <Text style={styles.gameName}>{i18n.t(domainData.i18nKey)}</Text>
        </View>

        <View style={styles.studyPhase}>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>
              {i18n.t('memory_inst')}
            </Text>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownText}>{studyCountdown}s</Text>
            </View>
          </View>

          <View style={styles.studyGrid}>
            {studyItems.map((item) => (
              <View key={item.id} style={styles.studyCard}>
                <Text style={styles.studyEmoji}>{item.emoji}</Text>
                <Text style={styles.studyLabel}>{i18n.t(item.i18nKey)}</Text>
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Recall Phase ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: domainData.color }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← {i18n.t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.gameName}>{i18n.t(domainData.i18nKey)}</Text>
        <Text style={styles.progressText}>
          {roundIndex + 1} / {totalRounds}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${((roundIndex) / totalRounds) * 100}%`,
              backgroundColor: domainData.color,
            },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.recallContent}>
        <View style={styles.questionBox}>
          <Text style={styles.questionText}>
            {i18n.t('memory_question')}
          </Text>
        </View>

        {/* Feedback banner */}
        {feedback && (
          <View
            style={[
              styles.feedbackBanner,
              {
                backgroundColor:
                  feedback === 'correct'
                    ? Colors.successTealLight
                    : Colors.alertRedLight,
                borderColor:
                  feedback === 'correct'
                    ? Colors.successTeal
                    : Colors.alertRed,
              },
            ]}
          >
            <Text
              style={[
                styles.feedbackText,
                {
                  color:
                    feedback === 'correct' ? Colors.successTeal : Colors.alertRed,
                },
              ]}
            >
              {feedback === 'correct'
                ? `✓ ${i18n.t('correct')}`
                : feedback === 'timeout'
                ? `⏳ ${i18n.t('timeout')}`
                : `${i18n.t('wrong_answer')} ${currentQuestion.target.emoji} ${i18n.t(currentQuestion.target.i18nKey)}`}
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

        {/* Options */}
        <View style={styles.optionsGrid}>
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={getTileStyle(option.id)}
              onPress={() => handleAnswer(option.id)}
              activeOpacity={0.8}
              disabled={!!selected}
            >
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text style={styles.optionLabel}>{i18n.t(option.i18nKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Result modal */}
      <GameResultModal
        visible={showResult}
        correct={correctCount}
        total={totalRounds}
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
    borderBottomColor: Colors.domainMemoryShadow,
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
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.borderLight,
  },
  progressBarFill: {
    height: 4,
  },
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

  // Study phase
  studyPhase: { flex: 1, padding: Spacing.lg },
  instructionBox: {
    backgroundColor: Colors.goldLight,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadow.card,
  },
  instructionText: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xl,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  instructionHindi: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: Colors.textHindi,
    textAlign: 'center',
    marginTop: 4,
  },
  countdownBox: {
    marginTop: Spacing.md,
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.card,
    shadowOffset: { width: 2, height: 2 },
  },
  countdownText: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.xl,
    color: Colors.textOnDark,
  },
  studyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  studyCard: {
    width: 100,
    backgroundColor: Colors.bgCardWarm,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.cardStrong,
  },
  studyEmoji: { fontSize: 44 },
  studyLabel: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  studyHindi: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textHindi,
    textAlign: 'center',
    marginTop: 2,
  },

  // Recall phase
  recallContent: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
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
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  optionTile: {
    width: '45%',
    backgroundColor: Colors.bgCardWarm,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderLight,
    ...Shadow.cardStrong,
  },
  tileCorrect: {
    backgroundColor: Colors.successTealLight,
    borderColor: Colors.successTeal,
  },
  tileWrong: {
    backgroundColor: Colors.alertRedLight,
    borderColor: Colors.alertRed,
  },
  tileNeutral: {
    opacity: 0.5,
  },
  optionEmoji: { fontSize: 48 },
  optionLabel: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  optionHindi: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textHindi,
    textAlign: 'center',
    marginTop: 2,
  },
});

