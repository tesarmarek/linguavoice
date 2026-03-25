import { Language } from '../types/session.types';

export interface CorrectionPromptInput {
  raw: string;
  language: Language;
}

export interface CorrectionPromptOutput {
  prompt: string;
  systemPrompt: string;
}

export function buildCorrectionPrompt(input: CorrectionPromptInput): CorrectionPromptOutput {
  const langName = input.language === 'sk' ? 'Slovak' : 'Czech';

  const systemPrompt = `You are a ${langName} grammar expert. You analyze ${langName} text and identify grammar errors. You always respond with valid JSON matching the exact schema provided. Do not include any text outside the JSON object.`;

  const prompt = `Analyze the following ${langName} sentence for grammar errors.

Input text: "${input.raw}"

Respond with a JSON object matching this exact schema:
{
  "original": string,       // the original input text
  "corrected": string,      // the corrected version of the text
  "wasCorrect": boolean,    // true if no errors were found
  "errors": [               // empty array if wasCorrect is true
    {
      "fragment": string,   // the original wrong fragment
      "corrected": string,  // the corrected fragment
      "rule": string,       // grammar rule name
      "explanation": string // explanation in ${langName} for the learner
    }
  ]
}`;

  return { prompt, systemPrompt };
}
