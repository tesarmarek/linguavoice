import { Session } from '../../types/session.types';

export interface ISessionRepository {
  create(session: Session): Promise<void>;
  getById(id: string): Promise<Session | null>;
  update(session: Session): Promise<void>;
  delete(id: string): Promise<void>;
}
