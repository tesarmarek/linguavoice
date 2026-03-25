import { IImageClient } from '../clients/image.interface';
import { ElevenLabsImageClient } from '../clients/elevenlabs-image.client';
import { TogetherImageClient } from '../clients/together-image.client';
import { OpenAIImageClient } from '../clients/openai-image.client';
import { getEnvConfig } from './env';

let cachedClient: IImageClient | null = null;

/**
 * Image provider fallback chain:
 * 1. ElevenLabs (if ELEVENLABS_IMAGE_ENABLED=true)
 * 2. Together.ai FLUX (default primary — free tier available)
 * 3. OpenAI DALL-E (fallback)
 * 4. NoOp (skip images gracefully)
 *
 * Each provider is probed on first use. Result cached for process lifetime.
 */
export async function getImageClient(): Promise<IImageClient> {
  if (cachedClient) return cachedClient;

  const env = getEnvConfig();
  const debug = env.DEBUG;

  // 1. ElevenLabs (opt-in experimental)
  if (env.ELEVENLABS_IMAGE_ENABLED && env.ELEVENLABS_API_KEY) {
    const eleven = new ElevenLabsImageClient();
    if (debug) console.log(`[Image] Probing ElevenLabs (model: ${env.ELEVENLABS_IMAGE_MODEL})...`);
    const ok = await eleven.probe();
    if (ok) {
      if (debug) console.log('[Image] Using ElevenLabs as image provider');
      cachedClient = eleven;
      return cachedClient;
    }
    console.warn('[Image] ElevenLabs image probe failed — trying Together.ai');
  }

  // 2. Together.ai (default primary)
  if (env.TOGETHER_API_KEY) {
    const together = new TogetherImageClient();
    if (debug) console.log(`[Image] Probing Together.ai (model: ${env.TOGETHER_IMAGE_MODEL})...`);
    const ok = await together.probe();
    if (ok) {
      if (debug) console.log('[Image] Using Together.ai as image provider');
      cachedClient = together;
      return cachedClient;
    }
    console.warn('[Image] Together.ai image probe failed — trying OpenAI');
  }

  // 3. OpenAI DALL-E (fallback)
  if (env.OPENAI_API_KEY) {
    const openai = new OpenAIImageClient();
    if (debug) console.log(`[Image] Probing OpenAI (model: ${env.OPENAI_IMAGE_MODEL})...`);
    const ok = await openai.probe();
    if (ok) {
      if (debug) console.log('[Image] Using OpenAI DALL-E as image provider');
      cachedClient = openai;
      return cachedClient;
    }
    console.warn('[Image] OpenAI image probe also failed');
  }

  // 4. No provider available
  console.warn('[Image] No image provider available — images will be skipped');
  cachedClient = new NoOpImageClient();
  return cachedClient;
}

export function resetImageClient(): void {
  cachedClient = null;
}

class NoOpImageClient implements IImageClient {
  readonly provider = 'none';
  async probe(): Promise<boolean> { return false; }
  async generate(): Promise<string> {
    throw new Error('No image provider available');
  }
}
