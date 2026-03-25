export interface EnvConfig {
  LLM_PROVIDER: 'azure-openai' | 'anthropic' | 'openai';
  AZURE_OPENAI_ENDPOINT: string;
  AZURE_OPENAI_API_KEY: string;
  AZURE_OPENAI_DEPLOYMENT: string;
  ANTHROPIC_API_KEY: string;
  OPENAI_API_KEY: string;
  ELEVENLABS_API_KEY: string;
  ELEVENLABS_VOICE_ID: string;
  DATA_DIR: string;
  DEBUG: boolean;
  ENABLE_TTS: boolean;
  ENABLE_IMAGE: boolean;
  ENABLE_SCENARIOS: boolean;
  ELEVENLABS_IMAGE_ENABLED: boolean;
  ELEVENLABS_IMAGE_MODEL: string;
  TOGETHER_API_KEY: string;
  TOGETHER_IMAGE_MODEL: string;
  OPENAI_IMAGE_MODEL: string;
  OPENAI_IMAGE_QUALITY: string;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

let cached: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (cached) return cached;

  const provider = requireEnv('LLM_PROVIDER');
  if (provider !== 'azure-openai' && provider !== 'anthropic' && provider !== 'openai') {
    throw new Error(`Invalid LLM_PROVIDER: "${provider}". Must be "azure-openai", "anthropic", or "openai".`);
  }

  cached = {
    LLM_PROVIDER: provider,
    AZURE_OPENAI_ENDPOINT: optionalEnv('AZURE_OPENAI_ENDPOINT', ''),
    AZURE_OPENAI_API_KEY: optionalEnv('AZURE_OPENAI_API_KEY', ''),
    AZURE_OPENAI_DEPLOYMENT: optionalEnv('AZURE_OPENAI_DEPLOYMENT', ''),
    ANTHROPIC_API_KEY: optionalEnv('ANTHROPIC_API_KEY', ''),
    OPENAI_API_KEY: optionalEnv('OPENAI_API_KEY', ''),
    ELEVENLABS_API_KEY: optionalEnv('ELEVENLABS_API_KEY', ''),
    ELEVENLABS_VOICE_ID: optionalEnv('ELEVENLABS_VOICE_ID', ''),
    DATA_DIR: optionalEnv('DATA_DIR', './data'),
    DEBUG: optionalEnv('DEBUG', 'false') === 'true',
    ENABLE_TTS: optionalEnv('ENABLE_TTS', 'true') === 'true',
    ENABLE_IMAGE: optionalEnv('ENABLE_IMAGE', 'true') === 'true',
    ENABLE_SCENARIOS: optionalEnv('ENABLE_SCENARIOS', 'true') === 'true',
    ELEVENLABS_IMAGE_ENABLED: optionalEnv('ELEVENLABS_IMAGE_ENABLED', 'false') === 'true',
    ELEVENLABS_IMAGE_MODEL: optionalEnv('ELEVENLABS_IMAGE_MODEL', 'flux-kontext'),
    TOGETHER_API_KEY: optionalEnv('TOGETHER_API_KEY', ''),
    TOGETHER_IMAGE_MODEL: optionalEnv('TOGETHER_IMAGE_MODEL', 'google/flash-image-3.1'),
    OPENAI_IMAGE_MODEL: optionalEnv('OPENAI_IMAGE_MODEL', 'dall-e-3'),
    OPENAI_IMAGE_QUALITY: optionalEnv('OPENAI_IMAGE_QUALITY', 'standard'),
  };

  // Validate that the chosen provider has its required keys
  if (cached.LLM_PROVIDER === 'azure-openai') {
    if (!cached.AZURE_OPENAI_ENDPOINT) throw new Error('AZURE_OPENAI_ENDPOINT is required when LLM_PROVIDER is "azure-openai"');
    if (!cached.AZURE_OPENAI_API_KEY) throw new Error('AZURE_OPENAI_API_KEY is required when LLM_PROVIDER is "azure-openai"');
    if (!cached.AZURE_OPENAI_DEPLOYMENT) throw new Error('AZURE_OPENAI_DEPLOYMENT is required when LLM_PROVIDER is "azure-openai"');
  } else if (cached.LLM_PROVIDER === 'anthropic') {
    if (!cached.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is required when LLM_PROVIDER is "anthropic"');
  } else if (cached.LLM_PROVIDER === 'openai') {
    if (!cached.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required when LLM_PROVIDER is "openai"');
  }

  return cached;
}
