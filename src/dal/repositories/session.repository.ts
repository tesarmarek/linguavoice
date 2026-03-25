import * as fs from 'fs/promises';
import * as path from 'path';
import { Session } from '../../types/session.types';
import { ISessionRepository } from '../interfaces/ISessionRepository';
import { getEnvConfig } from '../../config/env';

export class SessionRepository implements ISessionRepository {
  private getSessionPath(id: string): string {
    const { DATA_DIR } = getEnvConfig();
    return path.join(DATA_DIR, 'sessions', `${id}.json`);
  }

  private getTmpPath(id: string): string {
    const { DATA_DIR } = getEnvConfig();
    return path.join(DATA_DIR, 'sessions', `${id}.json.tmp`);
  }

  async create(session: Session): Promise<void> {
    const filePath = this.getSessionPath(session.id);
    const tmpPath = this.getTmpPath(session.id);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(tmpPath, JSON.stringify(session, null, 2), 'utf-8');
    await fs.rename(tmpPath, filePath);
  }

  async getById(id: string): Promise<Session | null> {
    const filePath = this.getSessionPath(id);
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as Session;
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw err;
    }
  }

  async update(session: Session): Promise<void> {
    const filePath = this.getSessionPath(session.id);
    const tmpPath = this.getTmpPath(session.id);

    await fs.writeFile(tmpPath, JSON.stringify(session, null, 2), 'utf-8');
    await fs.rename(tmpPath, filePath);
  }

  async delete(id: string): Promise<void> {
    const filePath = this.getSessionPath(id);
    try {
      await fs.unlink(filePath);
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
        return;
      }
      throw err;
    }
  }
}
