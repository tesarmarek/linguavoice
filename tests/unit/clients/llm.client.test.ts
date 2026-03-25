import { describe, it } from 'vitest';

describe('LLM Clients', () => {
  describe('AzureOpenAIClient', () => {
    it.todo('should implement ILLMClient interface');
    it.todo('should call Azure OpenAI API with correct endpoint');
    it.todo('should send system prompt and user prompt');
    it.todo('should return parsed response string');
    it.todo('should handle API errors gracefully');
    it.todo('should retry on 429 and 500 status codes');
  });

  describe('AnthropicClient', () => {
    it.todo('should implement ILLMClient interface');
    it.todo('should call Anthropic API with correct model');
    it.todo('should send system prompt and user prompt');
    it.todo('should return parsed response string');
    it.todo('should handle API errors gracefully');
    it.todo('should retry on 429 and 500 status codes');
  });

  describe('response parsing', () => {
    it.todo('should parse valid JSON from LLM response');
    it.todo('should handle response with markdown code fences');
    it.todo('should throw on completely invalid response');
  });
});
