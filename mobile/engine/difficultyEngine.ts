// Rules-Based Adaptive Difficulty Engine — Stage 2 ready stub
// PRD §6.4: 5 difficulty tiers per domain
// Stage 1: static difficulty (tier 1 for all). Wire up rules in Stage 2.

import type { DomainKey } from './gameSession';

import { 
  DIFFICULTY_TIERS,
  PROMOTE_AFTER_CORRECT,
  DEMOTE_AFTER_WRONG,
  ACCURACY_THRESHOLD,
  TIME_THRESHOLD_FACTOR,
  DIFFICULTY_PARAMS,
  type DifficultyParams
} from './difficultyConstants';

import { getRecentSessionsForDomain, insertDifficultyLog } from './database';
import { predictTier } from './mlEngine';

export function getDifficultyForDomain(tier: number): DifficultyParams {
  return DIFFICULTY_PARAMS[tier];
}

export function getDifficultyLabel(tier: number): string {
  const params = getDifficultyForDomain(tier);
  return `${params.label} today`;
}

// Stage 2 hook — called after each session to potentially update tier
export function evaluateAndUpdateTier(
  domain: DomainKey,
  patientId: string,
  currentTier: number
): { newTier: number; changeReason: string | null } {
  // Fetch up to max of (PROMOTE, DEMOTE) history
  const historyLimit = Math.max(PROMOTE_AFTER_CORRECT, DEMOTE_AFTER_WRONG);
  const recentSessions = getRecentSessionsForDomain(domain, patientId, historyLimit);

  if (recentSessions.length === 0) {
    return { newTier: currentTier, changeReason: null };
  }

  const latestSession = recentSessions[0];
  const latestAccuracy = latestSession.itemsCount > 0 ? latestSession.correctCount / latestSession.itemsCount : 0;

  // 1. Try ML Prediction First
  const mlPredictedTier = predictTier(latestAccuracy, latestSession.avgResponseMs, currentTier);
  let proposedTier = mlPredictedTier !== null ? mlPredictedTier : currentTier;
  let proposedReason = mlPredictedTier !== null ? `ML model predicted optimal tier ${mlPredictedTier}` : null;

  // Check demotion first (safety layer prioritizes dropping difficulty to prevent frustration)
  if (recentSessions.length >= DEMOTE_AFTER_WRONG && currentTier > 1) {
    const recentForDemote = recentSessions.slice(0, DEMOTE_AFTER_WRONG);
    const allFailed = recentForDemote.every(session => {
      const accuracy = session.itemsCount > 0 ? session.correctCount / session.itemsCount : 0;
      const didTimeout = session.avgResponseMs === 0 && session.correctCount === 0; // rough timeout proxy
      return accuracy < 0.5 || didTimeout;
    });

    if (allFailed) {
      const newTier = currentTier - 1;
      const reason = `Difficulty reduced in ${domain} games - ${DEMOTE_AFTER_WRONG} consecutive sessions below 50% accuracy or timed out. (Safety Override)`;
      insertDifficultyLog(patientId, domain, currentTier, newTier, reason);
      return { newTier, changeReason: reason };
    }
  }

  // Check promotion (Safety Layer)
  if (recentSessions.length >= PROMOTE_AFTER_CORRECT && proposedTier > currentTier) {
    const recentForPromote = recentSessions.slice(0, PROMOTE_AFTER_CORRECT);
    const allSucceeded = recentForPromote.every(session => {
      const accuracy = session.itemsCount > 0 ? session.correctCount / session.itemsCount : 0;
      
      // Check time limit compliance if a time limit exists for the tier the session was played at
      const historicalTierParams = DIFFICULTY_PARAMS[session.difficultyTierBefore];
      const timeBudget = historicalTierParams?.timeLimitMs;
      const timeOK = !timeBudget || session.avgResponseMs <= (timeBudget * TIME_THRESHOLD_FACTOR);

      return accuracy >= ACCURACY_THRESHOLD && timeOK;
    });

    if (allSucceeded) {
      const newTier = proposedTier;
      const reason = proposedReason || `Difficulty increased in ${domain} games - ${PROMOTE_AFTER_CORRECT} consecutive successful sessions.`;
      insertDifficultyLog(patientId, domain, currentTier, newTier, reason);
      return { newTier, changeReason: reason };
    } else {
      // ML wanted to promote, but rules say no (haven't proven consistency yet)
      proposedTier = currentTier;
      proposedReason = null;
    }
  }

  if (proposedTier < currentTier && proposedTier >= 1) {
    const reason = proposedReason || `Difficulty adjusted based on recent performance.`;
    insertDifficultyLog(patientId, domain, currentTier, proposedTier, reason);
    return { newTier: proposedTier, changeReason: reason };
  }

  return { newTier: currentTier, changeReason: null };
}

