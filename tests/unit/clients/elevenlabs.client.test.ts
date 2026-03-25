import { describe, it } from 'vitest';

describe('ElevenLabsClient', () => {
  describe('text-to-speech', () => {
    it.todo('should call ElevenLabs API with correct voice ID');
    it.todo('should call ElevenLabs API with the provided text');
    it.todo('should return the audio file path on success');
    it.todo('should save audio data to the specified file path');
  });

  describe('429 retry', () => {
    it.todo('should retry on 429 rate limit response');
    it.todo('should respect retry-after header');
    it.todo('should retry up to max attempts');
    it.todo('should throw after exhausting retries');
  });

  describe('500 graceful fail', () => {
    it.todo('should throw a descriptive error on 500 response');
    it.todo('should retry on 500 before failing');
    it.todo('should not retry on 4xx errors other than 429');
  });
});
