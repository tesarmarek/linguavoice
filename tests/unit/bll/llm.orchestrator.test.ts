import { describe, it } from 'vitest';

describe('LLMOrchestrator', () => {
  describe('correct pipeline sequence', () => {
    it.todo('should call correction prompt first');
    it.todo('should call translation prompt with corrected text');
    it.todo('should call story prompt with translated text');
    it.todo('should call postmortem prompt with all results');
    it.todo('should return all four results in a single response');
  });

  describe('error handling', () => {
    it.todo('should throw if correction step fails');
    it.todo('should throw if translation step fails');
    it.todo('should throw if story step fails');
    it.todo('should throw if postmortem step fails');
    it.todo('should include step name in error message');
    it.todo('should handle malformed JSON from LLM gracefully');
  });

  describe('provider swap', () => {
    it.todo('should work with azure-openai provider');
    it.todo('should work with anthropic provider');
    it.todo('should use the same pipeline regardless of provider');
  });
});
