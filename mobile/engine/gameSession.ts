// Game Session API — shared contract for ALL games
// Every game logs through this API so the Adaptive Difficulty Engine
// and analytics work identically across all games (PRD §5a)

export type DomainKey = 'memory' | 'attention' | 'patterns' | 'recall' | 'emotional';

export interface GameItem {
  itemId: string;
  prompt: string;
  correctAnswer: string;
  userAnswer: string | null;
  isCorrect: boolean | null;
  responseTimeMs: number | null;   // ms from item shown to answer tapped
  hintsUsed: number;
  retries: number;
  timedOut: boolean;
}

export interface GameSession {
  sessionId: string;
  patientId: string;
  gameType: string;               // e.g. 'yaad-rakho', 'nazar-tez', 'milan', 'mera-din'
  domain: DomainKey;
  startTime: number;              // Unix ms
  endTime: number | null;
  items: GameItem[];
  difficultyTierBefore: number;   // 1–5
  difficultyTierAfter: number | null;
  abandoned: boolean;             // true if user quit mid-game
  deviceOnline: boolean;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

// ─── Session Builder ──────────────────────────────────────────────────────────
// Each game creates one session at start and calls these methods as play progresses

export function createSession(
  gameType: string,
  domain: DomainKey,
  difficultyTier: number,
  patientId = 'local-patient'
): GameSession {
  const now = Date.now();
  return {
    sessionId: `${gameType}-${now}`,
    patientId,
    gameType,
    domain,
    startTime: now,
    endTime: null,
    items: [],
    difficultyTierBefore: difficultyTier,
    difficultyTierAfter: null,
    abandoned: false,
    deviceOnline: false,  // will be updated by sync engine
    timeOfDay: getTimeOfDay(now),
  };
}

export function logItem(
  session: GameSession,
  item: Omit<GameItem, 'retries' | 'hintsUsed'> & { retries?: number; hintsUsed?: number }
): GameSession {
  return {
    ...session,
    items: [
      ...session.items,
      { retries: 0, hintsUsed: 0, ...item },
    ],
  };
}

export function finalizeSession(
  session: GameSession,
  tierAfter: number,
  abandoned = false
): GameSession {
  return {
    ...session,
    endTime: Date.now(),
    difficultyTierAfter: tierAfter,
    abandoned,
  };
}

// ─── Session Analytics (used by dashboard & difficulty engine) ────────────────

export function getSessionAccuracy(session: GameSession): number {
  const answered = session.items.filter(i => i.isCorrect !== null);
  if (answered.length === 0) return 0;
  const correct = answered.filter(i => i.isCorrect).length;
  return correct / answered.length;
}

export function getAverageResponseTime(session: GameSession): number {
  const timed = session.items.filter(i => i.responseTimeMs !== null);
  if (timed.length === 0) return 0;
  return timed.reduce((sum, i) => sum + (i.responseTimeMs ?? 0), 0) / timed.length;
}

export function getSessionDurationMs(session: GameSession): number {
  if (!session.endTime) return Date.now() - session.startTime;
  return session.endTime - session.startTime;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTimeOfDay(ts: number): GameSession['timeOfDay'] {
  const hour = new Date(ts).getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function generateItemId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
