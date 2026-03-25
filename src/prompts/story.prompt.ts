export interface StoryPromptInput {
  englishTranslation: string;
  themeHint: string;
}

export interface StoryPromptOutput {
  prompt: string;
  systemPrompt: string;
}

export function buildStoryPrompt(input: StoryPromptInput): StoryPromptOutput {
  const systemPrompt = `You are a creative storyteller who writes short fairy-tale style paragraphs in English. Your stories are engaging, whimsical, and suitable for language learners. You always respond with valid JSON matching the exact schema provided. Do not include any text outside the JSON object.`;

  const prompt = `Write a short fairy-tale paragraph (max 3 sentences) in English inspired by the following sentence and theme to inspire kids imagination. Provide also CZ & SK translations.. 

Sentence: "${input.englishTranslation}"
Theme hint: "${input.themeHint}"

Respond with a JSON object matching this exact schema:
{
  "paragraph": string,  // the fairy-tale paragraph (3 sentences)
  "theme": string       // the auto-detected theme (e.g. "school", "animals", "adventure")
}`;

  return { prompt, systemPrompt };
}
