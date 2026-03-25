import { getEnvConfig } from '../config/env';

export interface IImageClient {
  generate(prompt: string, outputPath: string): Promise<string>;
}

export class OpenAIImageClient implements IImageClient {
  private apiKey: string;

  constructor() {
    const env = getEnvConfig();
    this.apiKey = env.OPENAI_API_KEY;
  }

  async generate(prompt: string, outputPath: string): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const debug = getEnvConfig().DEBUG;

    if (debug) console.log('[ImageClient] Generating image with DALL-E...');

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`DALL-E error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('DALL-E returned no image URL');
    }

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Atomic write
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    const tmpPath = `${outputPath}.tmp`;
    await fs.writeFile(tmpPath, buffer);
    await fs.rename(tmpPath, outputPath);

    if (debug) console.log(`[ImageClient] Image saved: ${outputPath} (${buffer.length} bytes)`);

    return outputPath;
  }
}
