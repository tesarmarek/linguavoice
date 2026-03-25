import { describe, it } from 'vitest';

describe('SessionRepository (JSON file)', () => {
  describe('JSON read/write', () => {
    it.todo('should save a session to a JSON file');
    it.todo('should read a session from a JSON file');
    it.todo('should return the full session object with turns');
    it.todo('should handle non-existent session file gracefully');
  });

  describe('concurrent write safety', () => {
    it.todo('should use atomic write (tmp + rename) to prevent corruption');
    it.todo('should not lose data on concurrent writes');
  });

  describe('index update', () => {
    it.todo('should add entry to index.json on session create');
    it.todo('should update turnCount in index.json after adding a turn');
    it.todo('should handle empty index.json');
    it.todo('should create index.json if it does not exist');
  });
});
