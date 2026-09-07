import * as brain from 'brain.js';
import { getRecentSessionsForDomain } from './database';
import { DIFFICULTY_TIERS, DIFFICULTY_PARAMS } from './difficultyConstants';
import { insertGameSession } from './database';
import type { GameSession, DomainKey } from './gameSession';

// A lightweight feed-forward Neural Network
let trainedNet: brain.NeuralNetwork<any, any> | null = null;

export function trainModel(patientId: string, domain: DomainKey) {
  const sessions = getRecentSessionsForDomain(domain, patientId, 100);
  
  if (sessions.length < 5) {
    console.log(`[ML Engine] Not enough data to train for ${domain}. Need 5, got ${sessions.length}`);
    return false;
  }

  const trainingData = sessions.map(session => {
    const accuracy = session.itemsCount > 0 ? session.correctCount / session.itemsCount : 0;
    const tierParams = DIFFICULTY_PARAMS[session.difficultyTierBefore];
    const timeBudget = tierParams?.timeLimitMs || 30000; // default 30s
    const timeRatio = Math.min(session.avgResponseMs / timeBudget, 1.5);
    
    // Heuristic label for the "optimal" next tier to supervise the training
    let idealTier = session.difficultyTierBefore;
    if (accuracy >= 0.75 && timeRatio <= 0.8) {
      idealTier = Math.min(idealTier + 1, DIFFICULTY_TIERS);
    } else if (accuracy < 0.5 || session.avgResponseMs === 0) {
      idealTier = Math.max(idealTier - 1, 1);
    }
    
    return {
      input: {
        accuracy,
        timeRatio: timeRatio / 1.5, // normalize to 0-1
        currentTier: session.difficultyTierBefore / DIFFICULTY_TIERS
      },
      output: {
        optimalTier: idealTier / DIFFICULTY_TIERS
      }
    };
  });

  const net = new brain.NeuralNetwork({ hiddenLayers: [4] });
  net.train(trainingData, { 
    iterations: 2000, 
    errorThresh: 0.01,
    log: (details) => console.log(`[ML Engine] Training ${domain}: ${details}`),
    logPeriod: 500
  });
  
  trainedNet = net;
  console.log(`[ML Engine] Successfully trained model for ${domain} with ${sessions.length} sessions.`);
  return true;
}

export function predictTier(accuracy: number, avgResponseMs: number, currentTier: number): number | null {
  if (!trainedNet) return null;
  
  const tierParams = DIFFICULTY_PARAMS[currentTier];
  const timeBudget = tierParams?.timeLimitMs || 30000;
  let timeRatio = avgResponseMs / timeBudget;
  timeRatio = Math.min(timeRatio, 1.5) / 1.5; // normalize

  const result = trainedNet.run({ 
    accuracy, 
    timeRatio, 
    currentTier: currentTier / DIFFICULTY_TIERS 
  }) as { optimalTier: number };
  
  let predicted = Math.round(result.optimalTier * DIFFICULTY_TIERS);
  predicted = Math.max(1, Math.min(DIFFICULTY_TIERS, predicted));
  
  return predicted;
}

export function generateSyntheticData(patientId: string, domain: DomainKey) {
  console.log(`[ML Engine] Seeding 20 synthetic sessions for ${domain}...`);
  const now = Date.now();
  
  for (let i = 0; i < 20; i++) {
    // Generate realistic variance
    const tier = Math.floor(Math.random() * 5) + 1;
    const isGood = Math.random() > 0.4; // 60% chance they do well
    
    const accuracy = isGood ? (0.75 + Math.random() * 0.25) : (0.2 + Math.random() * 0.3);
    const timeBudget = DIFFICULTY_PARAMS[tier]?.timeLimitMs || 30000;
    const avgResponseMs = isGood ? timeBudget * (0.4 + Math.random() * 0.3) : timeBudget * (0.9 + Math.random() * 0.4);
    
    const itemsCount = 5;
    const correctCount = Math.round(accuracy * itemsCount);
    
    const session: GameSession = {
      sessionId: `synthetic_${domain}_${i}_${Date.now()}_${Math.random()}`,
      patientId: patientId,
      gameType: 'synthetic_game',
      domain: domain,
      difficultyTierBefore: tier,
      difficultyTierAfter: tier,
      abandoned: false,
      deviceOnline: false,
      timeOfDay: 'morning',
      startTime: now - (20 - i) * 86400000,
      endTime: now - (20 - i) * 86400000 + 60000,
      items: Array(itemsCount).fill(null).map((_, idx) => ({
        itemId: `item_${idx}`,
        prompt: 'synthetic',
        correctAnswer: 'a',
        userAnswer: idx < correctCount ? 'a' : 'b',
        isCorrect: idx < correctCount,
        responseTimeMs: avgResponseMs,
        timedOut: false,
        hintsUsed: 0,
        retries: 0
      }))
    };
    
    insertGameSession(session);
  }
}

export function initMLEngine(patientId: string) {
  console.log('[ML Engine] Initializing...');
  const domains: DomainKey[] = ['memory', 'attention', 'patterns', 'recall'];
  
  for (const domain of domains) {
    const existing = getRecentSessionsForDomain(domain, patientId, 1);
    if (existing.length === 0) {
      generateSyntheticData(patientId, domain);
    }
    trainModel(patientId, domain);
  }
  console.log('[ML Engine] Initialization complete.');
}
