import { IImageClient } from './image.interface';
import { getEnvConfig } from '../config/env';

/**
 * ElevenLabs image generation client.
 * Uses their text-to-image API (beta).
 * Endpoint: POST https://api.elevenlabs.io/v1/text-to-image
 * If the API is not yet available for the account, probe returns false
 * and the factory falls back to OpenAI.
 */
export class ElevenLabsImageClient implements IImageClient {
  readonly provider = 'ElevenLabs';
  private apiKey: string;
  private model: string;

  constructor() {
    const env = getEnvConfig();
    this.apiKey = env.ELEVENLABS_API_KEY;
    this.model = env.ELEVENLABS_IMAGE_MODEL;
  }

  async probe(): Promise<boolean> {
    // ElevenLabs image generation is in beta — try multiple known endpoints
    const endpoints = [
      'https://api.elevenlabs.io/v1/text-to-image',
      'https://api.elevenlabs.io/v1/images/generations',
    ];

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            prompt: 'A pink circle',
            model_id: this.model,
          }),
        });

        if (response.ok) {
          console.log(`[ElevenLabs Image] Probe OK — endpoint: ${url}, model: ${this.model}`);
          // Store the working endpoint
          (this as { _endpoint?: string })._endpoint = url;
          return true;
        }

        // 401/403 = auth issue, 404 = endpoint doesn't exist, keep trying
        const body = await response.text();
        console.warn(`[ElevenLabs Image] ${url} → ${response.status}: ${body.slice(0, 100)}`);
      } catch (err) {
        console.warn(`[ElevenLabs Image] ${url} → error: ${(err as Error).message}`);
      }
    }

    console.warn('[ElevenLabs Image] No working image endpoint found');
    return false;
  }

  async generate(prompt: string, outputPath: string): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const debug = getEnvConfig().DEBUG;
    const url = (this as { _endpoint?: string })._endpoint || 'https://api.elevenlabs.io/v1/text-to-image';

    if (debug) console.log(`[ElevenLabs Image] Generating with ${this.model} via ${url}...`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        prompt,
        model_id: this.model,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`ElevenLabs Image error ${response.status}: ${errorBody}`);
    }

    const contentType = response.headers.get('content-type') || '';
    let buffer: Buffer;

    if (contentType.includes('image/')) {
      // Direct binary image response
      buffer = Buffer.from(await response.arrayBuffer());
    } else {
      // JSON response with base64 or URL
      const data = await response.json();
      if (data.data?.[0]?.b64_json) {
        buffer = Buffer.from(data.data[0].b64_json, 'base64');
      } else if (data.data?.[0]?.url) {
        const imgRes = await fetch(data.data[0].url);
        if (!imgRes.ok) throw new Error(`Failed to download ElevenLabs image: ${imgRes.status}`);
        buffer = Buffer.from(await imgRes.arrayBuffer());
      } else if (data.image) {
        buffer = Buffer.from(data.image, 'base64');
      } else {
        throw new Error('ElevenLabs Image returned no recognizable image data');
      }
    }

    // Atomic write
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    const tmpPath = `${outputPath}.tmp`;
    await fs.writeFile(tmpPath, buffer);
    await fs.rename(tmpPath, outputPath);

    if (debug) console.log(`[ElevenLabs Image] Saved: ${outputPath} (${buffer.length} bytes)`);
    return outputPath;
  }
}
