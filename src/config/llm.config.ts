import { getEnvConfig } from './env';
import { AzureOpenAIClient } from '../clients/azure-openai.client';
import { AnthropicClient } from '../clients/anthropic.client';
import { OpenAIClient } from '../clients/openai.client';
import type { ILLMClient } from '../clients/llm.client.interface';

export type LLMProvider = 'azure-openai' | 'anthropic' | 'openai';

// Re-export for convenience — BLL imports from config, not from clients
export type { ILLMClient } from '../clients/llm.client.interface';

export function getLLMClient(): ILLMClient {
  const { LLM_PROVIDER } = getEnvConfig();

  switch (LLM_PROVIDER) {
    case 'azure-openai':
      return new AzureOpenAIClient();
    case 'anthropic':
      return new AnthropicClient();
    case 'openai':
      return new OpenAIClient();
    default:
      throw new Error(`Unknown LLM_PROVIDER: ${LLM_PROVIDER}`);
  }
}
