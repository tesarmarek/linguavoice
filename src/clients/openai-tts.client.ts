import { ITTSClient } from './tts.interface';
import { getEnvConfig } from '../config/env';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export class OpenAITTSClient implements ITTSClient {
  private apiKey: string;

  constructor() {
    const env = getEnvConfig();
    this.apiKey = env.OPENAI_API_KEY;
  }

  async probe(): Promise<boolean> {
    try {
      // Small TTS request to verify the key works
      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: 'alloy',
          input: 'test',
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.warn('[OpenAI TTS] Probe failed:', res.status, body);
        return false;
      }
      // Discard the audio — we just needed to know it works
      return true;
    } catch (err) {
      console.warn('[OpenAI TTS] Probe error:', (err as Error).message);
      return false;
    }
  }

  async synthesize(text: string, outputPath: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: 'tts-1',
            voice: 'alloy',
            input: text,
            response_format: 'mp3',
          }),
        });

        if (response.status === 429 || response.status >= 500) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          lastError = new Error(`OpenAI TTS returned ${response.status}: ${response.statusText}`);
          if (attempt < MAX_RETRIES) {
            await sleep(delay);
            continue;
          }
          throw lastError;
        }

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`OpenAI TTS error ${response.status}: ${errorBody}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Atomic write: write to .tmp then rename
        const dir = path.dirname(outputPath);
        await fs.mkdir(dir, { recursive: true });
        const tmpPath = `${outputPath}.tmp`;
        await fs.writeFile(tmpPath, buffer);
        await fs.rename(tmpPath, outputPath);
        return;
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

    throw lastError ?? new Error('OpenAI TTS request failed after retries');
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
