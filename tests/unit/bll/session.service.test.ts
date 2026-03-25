import { describe, it } from 'vitest';

describe('SessionService', () => {
  describe('createSession', () => {
    it.todo('should create a new session with correct defaults');
    it.todo('should generate a UUID for the session id');
    it.todo('should set startedAt to current ISO timestamp');
    it.todo('should set endedAt to null');
    it.todo('should set turnCount to 0');
    it.todo('should set the specified language (sk or cs)');
    it.todo('should persist the session via repository');
    it.todo('should add an entry to the session index');
  });

  describe('endSession', () => {
    it.todo('should set endedAt to current ISO timestamp');
    it.todo('should persist the updated session');
    it.todo('should throw if session does not exist');
    it.todo('should throw if session is already ended');
  });

  describe('getSession', () => {
    it.todo('should retrieve a session by id');
    it.todo('should return session with all embedded turns');
    it.todo('should throw if session does not exist');
  });

  describe('listSessions', () => {
    it.todo('should return all sessions from the index');
    it.todo('should return an empty array when no sessions exist');
  });
});
