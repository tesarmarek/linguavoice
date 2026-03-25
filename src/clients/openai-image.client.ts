import { IImageClient } from './image.interface';
import { getEnvConfig } from '../config/env';

export class OpenAIImageClient implements IImageClient {
  readonly provider = 'OpenAI DALL-E';
  private apiKey: string;
  private model: string;
  private quality: string;

  constructor() {
    const env = getEnvConfig();
    this.apiKey = env.OPENAI_API_KEY;
    this.model = env.OPENAI_IMAGE_MODEL;
    this.quality = env.OPENAI_IMAGE_QUALITY;
  }

  async probe(): Promise<boolean> {
    try {
      // Verify the API key works by listing models — cheap, no image generation
      const response = await fetch('https://api.openai.com/v1/models/dall-e-3', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const body = await response.text();
        console.warn(`[OpenAI Image] Probe failed: ${response.status} ${body.slice(0, 100)}`);
        return false;
      }

      console.log(`[OpenAI Image] Probe OK — model: ${this.model}, quality: ${this.quality}`);
      return true;
    } catch (err) {
      console.warn('[OpenAI Image] Probe error:', (err as Error).message);
      return false;
    }
  }

  async generate(prompt: string, outputPath: string): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const debug = getEnvConfig().DEBUG;

    if (debug) console.log(`[OpenAI Image] Generating with ${this.model} (${this.quality})...`);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        prompt,
        n: 1,
        size: '1024x1024',
        quality: this.quality,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI Image error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();

    let buffer: Buffer;
    if (data.data?.[0]?.b64_json) {
      buffer = Buffer.from(data.data[0].b64_json, 'base64');
    } else if (data.data?.[0]?.url) {
      const imgRes = await fetch(data.data[0].url);
      if (!imgRes.ok) throw new Error(`Failed to download OpenAI image: ${imgRes.status}`);
      buffer = Buffer.from(await imgRes.arrayBuffer());
    } else {
      throw new Error('OpenAI Image returned no image data');
    }

    // Atomic write
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    const tmpPath = `${outputPath}.tmp`;
    await fs.writeFile(tmpPath, buffer);
    await fs.rename(tmpPath, outputPath);

    if (debug) console.log(`[OpenAI Image] Saved: ${outputPath} (${buffer.length} bytes)`);

    return outputPath;
  }
}
