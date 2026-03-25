import { Language, Session, SessionIndexEntry } from '../../types/session.types';

// --- Request DTOs ---

export interface CreateSessionRequestDTO {
  language: Language;
}

// --- Response DTOs ---

export interface CreateSessionResponseDTO {
  id: string;
  startedAt: string;
  language: Language;
}

export interface GetSessionResponseDTO {
  id: string;
  startedAt: string;
  endedAt: string | null;
  language: Language;
  turnCount: number;
  turns: Array<{
    id: string;
    index: number;
    createdAt: string;
    durationMs: number;
    input: { raw: string; language: Language; confidence: number };
    correction: {
      original: string;
      corrected: string;
      wasCorrect: boolean;
      errors: Array<{ fragment: string; corrected: string; rule: string; explanation: string }>;
    };
    translation: { source: string; english: string };
    story: { paragraph: string; theme: string };
    postmortem: {
      grammarRules: string[];
      learningNote: string;
      difficulty: string;
      suggestedPractice: string;
    };
    audio: {
      translationFile: string;
      storyFile: string;
      voiceId: string;
      generatedAt: string;
    };
  }>;
}

export interface ListSessionsResponseDTO {
  sessions: SessionIndexEntry[];
}

// --- Mappers ---

export function toCreateSessionResponse(session: Session): CreateSessionResponseDTO {
  return {
    id: session.id,
    startedAt: session.startedAt,
    language: session.language,
  };
}

export function toGetSessionResponse(session: Session): GetSessionResponseDTO {
  return {
    id: session.id,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    language: session.language,
    turnCount: session.turnCount,
    turns: session.turns.map((t) => ({
      id: t.id,
      index: t.index,
      createdAt: t.createdAt,
      durationMs: t.durationMs,
      input: t.input,
      correction: t.correction,
      translation: t.translation,
      story: t.story,
      postmortem: t.postmortem,
      audio: t.audio,
    })),
  };
}

export function toListSessionsResponse(entries: SessionIndexEntry[]): ListSessionsResponseDTO {
  return { sessions: entries };
}
