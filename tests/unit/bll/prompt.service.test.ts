import { describe, it } from 'vitest';

describe('PromptService', () => {
  describe('buildCorrectionPrompt', () => {
    it.todo('should return a prompt string containing the user input');
    it.todo('should include the source language in the prompt');
    it.todo('should request JSON response format');
  });

  describe('buildTranslationPrompt', () => {
    it.todo('should return a prompt containing the corrected text');
    it.todo('should request English translation');
    it.todo('should request JSON response format');
  });

  describe('buildStoryPrompt', () => {
    it.todo('should return a prompt containing the English translation');
    it.todo('should request a fairy-tale style paragraph');
    it.todo('should request JSON response format');
  });

  describe('buildPostmortemPrompt', () => {
    it.todo('should return a prompt with correction and translation results');
    it.todo('should request grammar analysis in source language');
    it.todo('should request JSON response format');
  });

  describe('each prompt type returns correct structure', () => {
    it.todo('should include system prompt for each type');
    it.todo('should include user prompt for each type');
  });
});
