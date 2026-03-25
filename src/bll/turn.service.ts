import { v4 as uuidv4 } from 'uuid';
import { Turn, TranscriptInput } from '../types/turn.types';
import { Session } from '../types/session.types';
import { ISessionRepository } from '../dal/interfaces/ISessionRepository';
import { IIndexRepository } from '../dal/interfaces/IIndexRepository';
import { LLMOrchestrator, OrchestratorResult } from './llm.orchestrator';

export class TurnService {
  constructor(
    private sessionRepo: ISessionRepository,
    private indexRepo: IIndexRepository,
    private orchestrator: LLMOrchestrator,
  ) {}

  async createTurn(sessionId: string, input: TranscriptInput): Promise<Turn> {
    const session = await this.sessionRepo.getById(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    if (session.endedAt) {
      throw new Error(`Session already ended: ${sessionId}`);
    }

    this.validateInput(input);

    const startTime = Date.now();
    const result: OrchestratorResult = await this.orchestrator.processTurn(input, session.language);
    const durationMs = Date.now() - startTime;

    const turn: Turn = {
      id: uuidv4(),
      sessionId,
      index: session.turnCount,
      createdAt: new Date().toISOString(),
      durationMs,
      input,
      correction: result.correction,
      translation: result.translation,
      story: result.story,
      postmortem: result.postmortem,
      audio: result.audio,
      image: result.image,
      scenarios: result.scenarios,
    };

    session.turns.push(turn);
    session.turnCount += 1;
    await this.sessionRepo.update(session);

    // Update the index entry with new turn count
    await this.indexRepo.update({
      id: session.id,
      startedAt: session.startedAt,
      turnCount: session.turnCount,
      language: session.language,
    });

    return turn;
  }

  private validateInput(input: TranscriptInput): void {
    if (!input.raw || typeof input.raw !== 'string' || input.raw.trim().length === 0) {
      throw new Error('Transcript input text is required');
    }
    if (input.language !== 'sk' && input.language !== 'cs') {
      throw new Error(`Invalid language: ${input.language}. Must be "sk" or "cs"`);
    }
    if (typeof input.confidence !== 'number' || input.confidence < 0 || input.confidence > 1) {
      throw new Error('Confidence must be a number between 0 and 1');
    }
  }
}
