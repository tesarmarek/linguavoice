import { IImageClient } from './image.interface';
import { getEnvConfig } from '../config/env';

// Fallback models to try when the primary model returns 500
const RETRY_MODELS = [
  'google/flash-image-2.5',
  'black-forest-labs/FLUX.1-schnell',
];

export class TogetherImageClient implements IImageClient {
  readonly provider = 'Together.ai';
  private apiKey: string;
  private model: string;

  constructor() {
    const env = getEnvConfig();
    this.apiKey = env.TOGETHER_API_KEY;
    this.model = env.TOGETHER_IMAGE_MODEL;
  }

  async probe(): Promise<boolean> {
    try {
      // Lightweight probe — generate a tiny image to confirm the key and model work
      const response = await fetch('https://api.together.xyz/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          prompt: 'A pink circle',
          n: 1,
          width: 256,
          height: 256,
          response_format: 'b64_json',
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        console.warn(`[Together Image] Probe failed: ${response.status} ${body.slice(0, 150)}`);
        return false;
      }

      console.log(`[Together Image] Probe OK — model: ${this.model}`);
      return true;
    } catch (err) {
      console.warn('[Together Image] Probe error:', (err as Error).message);
      return false;
    }
  }

  async generate(prompt: string, outputPath: string, modelOverride?: string): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const debug = getEnvConfig().DEBUG;
    const model = modelOverride || this.model;

    // Truncate prompt to 1000 chars — Together.ai has limits
    const truncatedPrompt = prompt.slice(0, 1000);

    // Build model chain: requested model first, then fallbacks
    const modelsToTry = [model, ...RETRY_MODELS.filter(m => m !== model)];

    for (let i = 0; i < modelsToTry.length; i++) {
      const currentModel = modelsToTry[i];
      const isRetry = i > 0;

      if (isRetry) {
        console.warn(`[Together Image] Retrying with fallback model: ${currentModel}`);
      } else if (debug) {
        console.log(`[Together Image] Generating with ${currentModel} (prompt: ${truncatedPrompt.length} chars)...`);
      }

      try {
        const response = await fetch('https://api.together.xyz/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: currentModel,
            prompt: truncatedPrompt,
            n: 1,
            width: 1024,
            height: 1024,
            response_format: 'b64_json',
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.warn(`[Together Image] ${currentModel} failed: ${response.status} ${errorBody.slice(0, 100)}`);
          if (i < modelsToTry.length - 1) {
            await new Promise(r => setTimeout(r, 500));
            continue;
          }
          throw new Error(`Together Image error ${response.status}: ${errorBody.slice(0, 200)}`);
        }

        const data = await response.json();
        const b64 = data.data?.[0]?.b64_json;

        if (!b64) {
          throw new Error('Together Image returned no b64_json data');
        }

        const buffer = Buffer.from(b64, 'base64');

        // Atomic write
        const dir = path.dirname(outputPath);
        await fs.mkdir(dir, { recursive: true });
        const tmpPath = `${outputPath}.tmp`;
        await fs.writeFile(tmpPath, buffer);
        await fs.rename(tmpPath, outputPath);

        if (debug) console.log(`[Together Image] Saved: ${outputPath} (${buffer.length} bytes, model: ${currentModel})`);
        return outputPath;
      } catch (err) {
        const msg = (err as Error).message;
        if (i < modelsToTry.length - 1) {
          console.warn(`[Together Image] ${currentModel} error: ${msg.slice(0, 100)}, trying next model...`);
          await new Promise(r => setTimeout(r, 500));
          continue;
        }
        throw err;
      }
    }

    throw new Error('Together Image failed on all models');
  }
}
