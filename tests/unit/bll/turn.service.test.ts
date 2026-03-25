import { describe, it } from 'vitest';

describe('TurnService', () => {
  describe('createTurn', () => {
    it.todo('should create a turn with correct index (0-based)');
    it.todo('should generate a UUID for the turn id');
    it.todo('should set sessionId to the parent session');
    it.todo('should increment the session turnCount');
    it.todo('should set createdAt to current ISO timestamp');
    it.todo('should record durationMs from the processing pipeline');
  });

  describe('turn index increment', () => {
    it.todo('should assign index 0 for the first turn');
    it.todo('should assign index 1 for the second turn');
    it.todo('should assign sequential indices for multiple turns');
  });

  describe('validation', () => {
    it.todo('should throw if session does not exist');
    it.todo('should throw if session is already ended');
    it.todo('should throw if input transcript is empty');
    it.todo('should throw if language is not sk or cs');
    it.todo('should validate confidence is between 0 and 1');
  });
});
