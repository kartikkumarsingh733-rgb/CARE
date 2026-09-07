export const DIFFICULTY_TIERS = 5;

// Thresholds for moving up/down
export const PROMOTE_AFTER_CORRECT = 3;   // 3 consecutive successes → tier up
export const DEMOTE_AFTER_WRONG = 2;       // 2 consecutive failures → tier down
export const ACCURACY_THRESHOLD = 0.75;   // must be above 75% accuracy to promote
export const TIME_THRESHOLD_FACTOR = 0.8; // must respond within 80% of time budget

// Difficulty parameters per tier — exposed via Game Session API
export interface DifficultyParams {
  tier: number;
  label: 'Gentle' | 'Easy' | 'Medium' | 'Challenging' | 'Hard';
  labelHindi: string;
  itemCount: number;         // cards/options on screen
  timeLimitMs: number | null; // null = no timer
  distractorSimilarity: 'low' | 'medium' | 'high';
  sequenceLength: number;
  hintAvailable: boolean;
  hintsPerSession: number;
  stimulusComplexity: 'simple' | 'scene' | 'cluttered';
}

export const DIFFICULTY_PARAMS: Record<number, DifficultyParams> = {
  1: {
    tier: 1,
    label: 'Gentle',
    labelHindi: 'सरल',
    itemCount: 3,
    timeLimitMs: null,
    distractorSimilarity: 'low',
    sequenceLength: 2,
    hintAvailable: true,
    hintsPerSession: 3,
    stimulusComplexity: 'simple',
  },
  2: {
    tier: 2,
    label: 'Easy',
    labelHindi: 'आसान',
    itemCount: 4,
    timeLimitMs: null,
    distractorSimilarity: 'low',
    sequenceLength: 3,
    hintAvailable: true,
    hintsPerSession: 2,
    stimulusComplexity: 'simple',
  },
  3: {
    tier: 3,
    label: 'Medium',
    labelHindi: 'मध्यम',
    itemCount: 6,
    timeLimitMs: 30000,
    distractorSimilarity: 'medium',
    sequenceLength: 4,
    hintAvailable: true,
    hintsPerSession: 1,
    stimulusComplexity: 'simple',
  },
  4: {
    tier: 4,
    label: 'Challenging',
    labelHindi: 'चुनौतीपूर्ण',
    itemCount: 8,
    timeLimitMs: 20000,
    distractorSimilarity: 'high',
    sequenceLength: 5,
    hintAvailable: false,
    hintsPerSession: 0,
    stimulusComplexity: 'scene',
  },
  5: {
    tier: 5,
    label: 'Hard',
    labelHindi: 'कठिन',
    itemCount: 9,
    timeLimitMs: 15000,
    distractorSimilarity: 'high',
    sequenceLength: 6,
    hintAvailable: false,
    hintsPerSession: 0,
    stimulusComplexity: 'cluttered',
  },
};
