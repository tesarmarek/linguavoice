import { ILLMClient } from './llm.client.interface';
import { getEnvConfig } from '../config/env';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export class OpenAIClient implements ILLMClient {
  private apiKey: string;

  constructor() {
    const env = getEnvConfig();
    this.apiKey = env.OPENAI_API_KEY;
  }

  async complete(prompt: string, systemPrompt: string): Promise<string> {
    const url = 'https://api.openai.com/v1/chat/completions';

    const body = {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(body),
        });

        if (response.status === 429 || response.status >= 500) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          lastError = new Error(`OpenAI returned ${response.status}: ${response.statusText}`);
          if (attempt < MAX_RETRIES) {
            await sleep(delay);
            continue;
          }
          throw lastError;
        }

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`OpenAI error ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error('OpenAI returned empty content');
        }

        // Validate JSON before returning
        JSON.parse(content);
        return content;
      } catch (error) {
        if (error instanceof Error && isRetryable(error) && attempt < MAX_RETRIES) {
          lastError = error;
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          await sleep(delay);
          continue;
        }
        throw error;
      }
    }

    throw lastError ?? new Error('OpenAI request failed after retries');
  }
}

function isRetryable(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return msg.includes('429') || msg.includes('500') || msg.includes('502')
    || msg.includes('503') || msg.includes('econnreset') || msg.includes('etimedout');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
