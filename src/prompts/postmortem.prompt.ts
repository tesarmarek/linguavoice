import { Language } from '../types/session.types';
import { CorrectionResult } from '../types/turn.types';

export interface PostmortemPromptInput {
  language: Language;
  original: string;
  correction: CorrectionResult;
  englishTranslation: string;
}

export interface PostmortemPromptOutput {
  prompt: string;
  systemPrompt: string;
}

export function buildPostmortemPrompt(input: PostmortemPromptInput): PostmortemPromptOutput {
  const langName = input.language === 'sk' ? 'Slovak' : 'Czech';

  const systemPrompt = `You are a language learning coach specializing in teaching English to ${langName} speakers. You provide concise, actionable analysis of student attempts. Write the learningNote in ${langName}. You always respond with valid JSON matching the exact schema provided. Do not include any text outside the JSON object.`;

  const prompt = `Analyze this language learning attempt and provide a post-mortem.

Original input (${langName}): "${input.original}"
Was correct: ${input.correction.wasCorrect}
Corrected text: "${input.correction.corrected}"
Errors found: ${JSON.stringify(input.correction.errors)}
English translation: "${input.englishTranslation}"

Respond with a JSON object matching this exact schema:
{
  "grammarRules": string[],      // list of grammar rules exercised
  "learningNote": string,        // a note for the learner in ${langName}
  "difficulty": "easy" | "medium" | "hard",  // assessed difficulty
  "suggestedPractice": string    // a suggested practice sentence or exercise
}`;

  return { prompt, systemPrompt };
}
