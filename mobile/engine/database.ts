import * as SQLite from 'expo-sqlite';
import type { GameSession, DomainKey } from './gameSession';

// Initialize the database connection.
// expo-sqlite v14 uses openDatabaseSync
const db = SQLite.openDatabaseSync('cognicare.db');

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS GameSessions (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      gameType TEXT NOT NULL,
      domain TEXT NOT NULL,
      startTime INTEGER NOT NULL,
      endTime INTEGER,
      itemsCount INTEGER NOT NULL,
      correctCount INTEGER NOT NULL,
      avgResponseMs REAL NOT NULL,
      difficultyTierBefore INTEGER NOT NULL,
      difficultyTierAfter INTEGER,
      abandoned INTEGER NOT NULL,
      timeOfDay TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS DifficultyLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId TEXT NOT NULL,
      domain TEXT NOT NULL,
      oldTier INTEGER NOT NULL,
      newTier INTEGER NOT NULL,
      reason TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );
  `);
}

/**
 * Inserts a finalized GameSession into the local SQLite database.
 */
export function insertGameSession(session: GameSession) {
  const itemsCount = session.items.length;
  const correctCount = session.items.filter(i => i.isCorrect).length;
  const timed = session.items.filter(i => i.responseTimeMs !== null);
  const avgResponseMs = timed.length > 0 
    ? timed.reduce((sum, i) => sum + (i.responseTimeMs ?? 0), 0) / timed.length
    : 0;

  db.runSync(
    `INSERT INTO GameSessions (
      id, patientId, gameType, domain, startTime, endTime, 
      itemsCount, correctCount, avgResponseMs, 
      difficultyTierBefore, difficultyTierAfter, 
      abandoned, timeOfDay, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.sessionId,
      session.patientId,
      session.gameType,
      session.domain,
      session.startTime,
      session.endTime ?? null,
      itemsCount,
      correctCount,
      avgResponseMs,
      session.difficultyTierBefore,
      session.difficultyTierAfter ?? null,
      session.abandoned ? 1 : 0,
      session.timeOfDay,
      Date.now()
    ]
  );
}

export interface StoredSession {
  id: string;
  patientId: string;
  gameType: string;
  domain: DomainKey;
  startTime: number;
  endTime: number | null;
  itemsCount: number;
  correctCount: number;
  avgResponseMs: number;
  difficultyTierBefore: number;
  difficultyTierAfter: number | null;
  abandoned: boolean;
  timeOfDay: string;
  createdAt: number;
}

/**
 * Retrieves the N most recent non-abandoned game sessions for a given domain and patient.
 */
export function getRecentSessionsForDomain(domain: DomainKey, patientId: string, limit: number = 5): StoredSession[] {
  const result = db.getAllSync(
    `SELECT * FROM GameSessions 
     WHERE domain = ? AND patientId = ? AND abandoned = 0 
     ORDER BY startTime DESC 
     LIMIT ?`,
    [domain, patientId, limit]
  ) as any[];

  return result.map(row => ({
    id: row.id,
    patientId: row.patientId,
    gameType: row.gameType,
    domain: row.domain as DomainKey,
    startTime: row.startTime,
    endTime: row.endTime,
    itemsCount: row.itemsCount,
    correctCount: row.correctCount,
    avgResponseMs: row.avgResponseMs,
    difficultyTierBefore: row.difficultyTierBefore,
    difficultyTierAfter: row.difficultyTierAfter,
    abandoned: row.abandoned === 1,
    timeOfDay: row.timeOfDay,
    createdAt: row.createdAt
  }));
}

/**
 * Inserts a natural language reason for why difficulty changed.
 */
export function insertDifficultyLog(
  patientId: string,
  domain: DomainKey,
  oldTier: number,
  newTier: number,
  reason: string
) {
  db.runSync(
    `INSERT INTO DifficultyLogs (patientId, domain, oldTier, newTier, reason, createdAt) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [patientId, domain, oldTier, newTier, reason, Date.now()]
  );
}

// Initialize tables on import
initDatabase();
