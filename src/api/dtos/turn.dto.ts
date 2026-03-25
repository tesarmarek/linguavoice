import { Language } from '../../types/session.types';
import { Turn } from '../../types/turn.types';

// --- Request DTOs ---

export interface CreateTurnRequestDTO {
  raw: string;
  language: Language;
  confidence: number;
  imageModel?: string;
}

// --- Response DTOs ---

export interface CreateTurnResponseDTO {
  id: string;
  index: number;
  createdAt: string;
  durationMs: number;
  input: {
    raw: string;
    language: string;
    confidence: number;
  };
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
  image: {
    file: string;
    prompt: string;
    generatedAt: string;
  };
  scenarios: {
    scenarios: string[];
  };
}

// --- Mappers ---

export function toCreateTurnResponse(turn: Turn): CreateTurnResponseDTO {
  return {
    id: turn.id,
    index: turn.index,
    createdAt: turn.createdAt,
    durationMs: turn.durationMs,
    input: turn.input,
    correction: turn.correction,
    translation: turn.translation,
    story: turn.story,
    postmortem: turn.postmortem,
    audio: turn.audio,
    image: turn.image,
    scenarios: turn.scenarios,
  };
}
