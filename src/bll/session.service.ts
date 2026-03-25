import { v4 as uuidv4 } from 'uuid';
import { Session, SessionIndexEntry, Language } from '../types/session.types';
import { ISessionRepository } from '../dal/interfaces/ISessionRepository';
import { IIndexRepository } from '../dal/interfaces/IIndexRepository';

const APP_VERSION = '1.0.0';

export class SessionService {
  constructor(
    private sessionRepo: ISessionRepository,
    private indexRepo: IIndexRepository,
  ) {}

  async createSession(language: Language): Promise<Session> {
    const now = new Date().toISOString();
    const session: Session = {
      id: uuidv4(),
      startedAt: now,
      endedAt: null,
      language,
      turnCount: 0,
      appVersion: APP_VERSION,
      turns: [],
    };

    await this.sessionRepo.create(session);

    const indexEntry: SessionIndexEntry = {
      id: session.id,
      startedAt: session.startedAt,
      turnCount: 0,
      language: session.language,
    };
    await this.indexRepo.add(indexEntry);

    return session;
  }

  async endSession(sessionId: string): Promise<Session> {
    const session = await this.sessionRepo.getById(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.endedAt = new Date().toISOString();
    await this.sessionRepo.update(session);

    return session;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    return this.sessionRepo.getById(sessionId);
  }

  async listSessions(): Promise<SessionIndexEntry[]> {
    return this.indexRepo.getAll();
  }
}
