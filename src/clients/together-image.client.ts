import { IImageClient } from './image.interface';
import { getEnvConfig } from '../config/env';

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

  async generate(prompt: string, outputPath: string): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const debug = getEnvConfig().DEBUG;

    if (debug) console.log(`[Together Image] Generating with ${this.model}...`);

    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        prompt,
        n: 1,
        width: 1024,
        height: 1024,
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
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

    if (debug) console.log(`[Together Image] Saved: ${outputPath} (${buffer.length} bytes)`);

    return outputPath;
  }
}
