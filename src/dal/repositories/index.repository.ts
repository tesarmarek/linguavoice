import * as fs from 'fs/promises';
import * as path from 'path';
import { SessionIndexEntry } from '../../types/session.types';
import { IIndexRepository } from '../interfaces/IIndexRepository';
import { getEnvConfig } from '../../config/env';

export class IndexRepository implements IIndexRepository {
  private getIndexPath(): string {
    const { DATA_DIR } = getEnvConfig();
    return path.join(DATA_DIR, 'index.json');
  }

  private getTmpPath(): string {
    const { DATA_DIR } = getEnvConfig();
    return path.join(DATA_DIR, 'index.json.tmp');
  }

  private async readIndex(): Promise<SessionIndexEntry[]> {
    const filePath = this.getIndexPath();
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed.sessions ?? [];
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw err;
    }
  }

  private async writeIndex(entries: SessionIndexEntry[]): Promise<void> {
    const filePath = this.getIndexPath();
    const tmpPath = this.getTmpPath();

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(tmpPath, JSON.stringify({ sessions: entries }, null, 2), 'utf-8');
    await fs.rename(tmpPath, filePath);
  }

  async getAll(): Promise<SessionIndexEntry[]> {
    return this.readIndex();
  }

  async add(entry: SessionIndexEntry): Promise<void> {
    const entries = await this.readIndex();
    entries.push(entry);
    await this.writeIndex(entries);
  }

  async update(entry: SessionIndexEntry): Promise<void> {
    const entries = await this.readIndex();
    const idx = entries.findIndex((e) => e.id === entry.id);
    if (idx === -1) {
      throw new Error(`Session index entry not found: ${entry.id}`);
    }
    entries[idx] = entry;
    await this.writeIndex(entries);
  }

  async remove(id: string): Promise<void> {
    const entries = await this.readIndex();
    const filtered = entries.filter((e) => e.id !== id);
    await this.writeIndex(filtered);
  }
}
