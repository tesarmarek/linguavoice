import { Language } from '../types/session.types';

export interface ScenarioPromptInput {
  storyParagraph: string;
  theme: string;
  language: Language;
}

export interface ScenarioPromptOutput {
  prompt: string;
  systemPrompt: string;
}

export function buildScenarioPrompt(input: ScenarioPromptInput): ScenarioPromptOutput {
  const langName = input.language === 'sk' ? 'Slovak' : 'Czech';

  const systemPrompt = `You are a creative storyteller for children aged 5-10. You spark imagination by giving open-ended story starters. You always respond with valid JSON matching the exact schema provided. Do not include any text outside the JSON object.`;

  const prompt = `Based on this fairy-tale story:

"${input.storyParagraph}"

Theme: ${input.theme}

Generate exactly 2 short scenario prompts (1-2 sentences each) in ${langName} that:
- Continue or branch from this story
- Are open-ended to ignite a child's imagination
- Start the scenario but leave it unfinished so the child wants to continue
- Use simple, fun language appropriate for ages 5-10

Respond with a JSON object matching this exact schema:
{
  "scenarios": [
    "scenario 1 in ${langName}...",
    "scenario 2 in ${langName}..."
  ]
}`;

  return { prompt, systemPrompt };
}
