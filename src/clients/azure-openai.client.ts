import { ILLMClient } from './llm.client.interface';
import { getEnvConfig } from '../config/env';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export class AzureOpenAIClient implements ILLMClient {
  private endpoint: string;
  private apiKey: string;
  private deployment: string;

  constructor() {
    const env = getEnvConfig();
    this.endpoint = env.AZURE_OPENAI_ENDPOINT;
    this.apiKey = env.AZURE_OPENAI_API_KEY;
    this.deployment = env.AZURE_OPENAI_DEPLOYMENT;
  }

  async complete(prompt: string, systemPrompt: string): Promise<string> {
    const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=2024-02-01`;

    const body = {
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
            'api-key': this.apiKey,
          },
          body: JSON.stringify(body),
        });

        if (response.status === 429 || response.status >= 500) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          lastError = new Error(`Azure OpenAI returned ${response.status}: ${response.statusText}`);
          if (attempt < MAX_RETRIES) {
            await sleep(delay);
            continue;
          }
          throw lastError;
        }

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Azure OpenAI error ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error('Azure OpenAI returned empty content');
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

    throw lastError ?? new Error('Azure OpenAI request failed after retries');
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
