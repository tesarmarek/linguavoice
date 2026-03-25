import { ILLMClient } from './llm.client.interface';
import { getEnvConfig } from '../config/env';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_VERSION = '2023-06-01';

export class AnthropicClient implements ILLMClient {
  private apiKey: string;

  constructor() {
    const env = getEnvConfig();
    this.apiKey = env.ANTHROPIC_API_KEY;
  }

  async complete(prompt: string, systemPrompt: string): Promise<string> {
    const body = {
      model: ANTHROPIC_MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt },
      ],
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(ANTHROPIC_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': ANTHROPIC_VERSION,
          },
          body: JSON.stringify(body),
        });

        if (response.status === 429 || response.status >= 500) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          lastError = new Error(`Anthropic returned ${response.status}: ${response.statusText}`);
          if (attempt < MAX_RETRIES) {
            await sleep(delay);
            continue;
          }
          throw lastError;
        }

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Anthropic error ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const textBlock = data.content?.find(
          (block: { type: string; text?: string }) => block.type === 'text'
        );

        if (!textBlock?.text) {
          throw new Error('Anthropic returned empty content');
        }

        const content = textBlock.text;

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

    throw lastError ?? new Error('Anthropic request failed after retries');
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
