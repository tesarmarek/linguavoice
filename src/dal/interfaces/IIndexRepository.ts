import { SessionIndexEntry } from '../../types/session.types';

export interface IIndexRepository {
  getAll(): Promise<SessionIndexEntry[]>;
  add(entry: SessionIndexEntry): Promise<void>;
  update(entry: SessionIndexEntry): Promise<void>;
  remove(id: string): Promise<void>;
}
