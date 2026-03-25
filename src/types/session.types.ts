import { Turn } from './turn.types';

export type Language = 'sk' | 'cs';

export interface Session {
  id: string;
  startedAt: string;
  endedAt: string | null;
  language: Language;
  turnCount: number;
  appVersion: string;
  turns: Turn[];
}

export interface SessionIndexEntry {
  id: string;
  startedAt: string;
  turnCount: number;
  language: Language;
}

export interface SessionIndex {
  sessions: SessionIndexEntry[];
}
