import { describe, it } from 'vitest';

describe('Correction Prompt', () => {
  describe('parses malformed JSON', () => {
    it.todo('should handle JSON wrapped in markdown code fences');
    it.todo('should handle JSON with trailing commas');
    it.todo('should throw on completely unparseable response');
  });

  describe('wasCorrect flag', () => {
    it.todo('should set wasCorrect to true when no errors found');
    it.todo('should set wasCorrect to false when errors are present');
    it.todo('should include empty errors array when wasCorrect is true');
    it.todo('should include error details when wasCorrect is false');
  });

  describe('error structure', () => {
    it.todo('should include fragment, corrected, rule, and explanation');
    it.todo('should provide explanation in source language');
  });
});
