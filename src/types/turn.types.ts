import { Language } from './session.types';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface TranscriptInput {
  raw: string;
  language: Language;
  confidence: number;
}

export interface GrammarError {
  fragment: string;
  corrected: string;
  rule: string;
  explanation: string;
}

export interface CorrectionResult {
  original: string;
  corrected: string;
  wasCorrect: boolean;
  errors: GrammarError[];
}

export interface TranslationResult {
  source: string;
  english: string;
}

export interface StoryResult {
  paragraph: string;
  theme: string;
}

export interface PostmortemResult {
  grammarRules: string[];
  learningNote: string;
  difficulty: Difficulty;
  suggestedPractice: string;
}

export interface AudioResult {
  translationFile: string;
  storyFile: string;
  voiceId: string;
  generatedAt: string;
}

export interface Turn {
  id: string;
  sessionId: string;
  index: number;
  createdAt: string;
  durationMs: number;
  input: TranscriptInput;
  correction: CorrectionResult;
  translation: TranslationResult;
  story: StoryResult;
  postmortem: PostmortemResult;
  audio: AudioResult;
}
