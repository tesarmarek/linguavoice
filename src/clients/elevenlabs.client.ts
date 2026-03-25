import { getEnvConfig } from '../config/env';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

import type { ITTSClient } from './tts.interface';

// Keep legacy alias for backward compat
export type IElevenLabsClient = ITTSClient;

export class ElevenLabsClient implements ITTSClient {
  private apiKey: string;
  private voiceId: string;

  constructor() {
    const env = getEnvConfig();
    this.apiKey = env.ELEVENLABS_API_KEY;
    this.voiceId = env.ELEVENLABS_VOICE_ID;
  }

  async probe(): Promise<boolean> {
    try {
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: 'hi',
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.warn('[ElevenLabs] Probe failed:', res.status, body);
        return false;
      }
      // Discard audio — we just needed to confirm it works
      console.log('[ElevenLabs] Probe OK — TTS synthesis works');
      return true;
    } catch (err) {
      console.warn('[ElevenLabs] Probe error:', (err as Error).message);
      return false;
    }
  }

  async synthesize(text: string, outputPath: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`;

    const body = {
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify(body),
        });

        if (response.status === 429 || response.status >= 500) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          lastError = new Error(`ElevenLabs returned ${response.status}: ${response.statusText}`);
          if (attempt < MAX_RETRIES) {
            await sleep(delay);
            continue;
          }
          throw lastError;
        }

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`ElevenLabs error ${response.status}: ${errorBody}`);
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

    throw lastError ?? new Error('ElevenLabs request failed after retries');
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
