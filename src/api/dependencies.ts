import { getEnvConfig } from '../config/env';
import { getLLMClient } from '../config/llm.config';
import { getTTSClient } from '../config/tts.config';
import { SessionRepository } from '../dal/repositories/session.repository';
import { IndexRepository } from '../dal/repositories/index.repository';
import { PromptService } from '../bll/prompt.service';
import { SessionService } from '../bll/session.service';
import { TurnService } from '../bll/turn.service';
import { LLMOrchestrator } from '../bll/llm.orchestrator';

let sessionService: SessionService | null = null;
let turnService: TurnService | null = null;

export function getSessionService(): SessionService {
  if (!sessionService) {
    const sessionRepo = new SessionRepository();
    const indexRepo = new IndexRepository();
    sessionService = new SessionService(sessionRepo, indexRepo);
  }
  return sessionService;
}

export async function getTurnService(): Promise<TurnService> {
  if (!turnService) {
    const sessionRepo = new SessionRepository();
    const indexRepo = new IndexRepository();
    const llmClient = getLLMClient();
    const ttsClient = await getTTSClient();
    const promptService = new PromptService();
    const { DATA_DIR } = getEnvConfig();

    const orchestrator = new LLMOrchestrator({
      llmClient,
      elevenLabsClient: ttsClient,
      promptService,
      dataDir: DATA_DIR,
    });

    turnService = new TurnService(sessionRepo, indexRepo, orchestrator);
  }
  return turnService;
}
