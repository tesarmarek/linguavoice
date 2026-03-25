export interface TranslationPromptInput {
  correctedText: string;
}

export interface TranslationPromptOutput {
  prompt: string;
  systemPrompt: string;
}

export function buildTranslationPrompt(input: TranslationPromptInput): TranslationPromptOutput {
  const systemPrompt = `You are an expert translator from Slovak and Czech to English. You produce natural, fluent English translations. You always respond with valid JSON matching the exact schema provided. Do not include any text outside the JSON object.`;

  const prompt = `Translate the following text to English.

Source text: "${input.correctedText}"

Respond with a JSON object matching this exact schema:
{
  "source": string,   // the source text (corrected SK/CS)
  "english": string   // the English translation
}`;

  return { prompt, systemPrompt };
}
