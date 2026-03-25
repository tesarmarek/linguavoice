import { ITTSClient } from '../clients/tts.interface';
import { ElevenLabsClient } from '../clients/elevenlabs.client';
import { OpenAITTSClient } from '../clients/openai-tts.client';
import { getEnvConfig } from './env';

let cachedClient: ITTSClient | null = null;
let probed = false;

/**
 * Returns the best available TTS client.
 * On first call, probes ElevenLabs. If it fails (quota, auth, network),
 * falls back to OpenAI TTS. Result is cached for the process lifetime.
 */
export async function getTTSClient(): Promise<ITTSClient> {
  if (cachedClient) return cachedClient;

  const env = getEnvConfig();
  const debug = env.DEBUG;

  // Try ElevenLabs first
  if (env.ELEVENLABS_API_KEY) {
    const eleven = new ElevenLabsClient();
    if (debug) console.log('[TTS] Probing ElevenLabs...');

    const ok = await eleven.probe();
    if (ok) {
      if (debug) console.log('[TTS] ElevenLabs OK — using as TTS provider');
      cachedClient = eleven;
      probed = true;
      return cachedClient;
    }
    console.warn('[TTS] ElevenLabs probe failed — falling back to OpenAI TTS');
  }

  // Fallback to OpenAI TTS
  if (env.OPENAI_API_KEY) {
    const openai = new OpenAITTSClient();
    if (debug) console.log('[TTS] Probing OpenAI TTS...');

    const ok = await openai.probe();
    if (ok) {
      if (debug) console.log('[TTS] OpenAI TTS OK — using as TTS provider');
      cachedClient = openai;
      probed = true;
      return cachedClient;
    }
    console.warn('[TTS] OpenAI TTS probe also failed');
  }

  // No TTS available — return a no-op client that logs warnings
  console.warn('[TTS] No TTS provider available — audio will be skipped');
  cachedClient = new NoOpTTSClient();
  probed = true;
  return cachedClient;
}

/** Resets the cached client — useful for testing or when keys change */
export function resetTTSClient(): void {
  cachedClient = null;
  probed = false;
}

class NoOpTTSClient implements ITTSClient {
  async probe(): Promise<boolean> { return false; }
  async synthesize(): Promise<void> {
    console.warn('[TTS] No TTS provider — skipping audio generation');
  }
}
