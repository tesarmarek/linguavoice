import { Language } from '../types/session.types';
import {
  TranscriptInput,
  CorrectionResult,
  TranslationResult,
  StoryResult,
  PostmortemResult,
  AudioResult,
} from '../types/turn.types';
import { ILLMClient } from '../clients/llm.client.interface';
import { ITTSClient } from '../clients/tts.interface';
import { PromptService } from './prompt.service';
import { getEnvConfig } from '../config/env';

function debug(...args: unknown[]) {
  if (getEnvConfig().DEBUG) {
    console.log('[LLMOrchestrator]', ...args);
  }
}

export interface OrchestratorResult {
  correction: CorrectionResult;
  translation: TranslationResult;
  story: StoryResult;
  postmortem: PostmortemResult;
  audio: AudioResult;
}

export interface OrchestratorDeps {
  llmClient: ILLMClient;
  elevenLabsClient: ITTSClient;
  promptService: PromptService;
  dataDir: string;
}

export class LLMOrchestrator {
  private llm: ILLMClient;
  private tts: ITTSClient;
  private prompts: PromptService;
  private dataDir: string;

  constructor(deps: OrchestratorDeps) {
    this.llm = deps.llmClient;
    this.tts = deps.elevenLabsClient;
    this.prompts = deps.promptService;
    this.dataDir = deps.dataDir;
  }

  async processTurn(input: TranscriptInput, language: Language): Promise<OrchestratorResult> {
    debug('=== NEW TURN ===');
    debug('User said:', JSON.stringify(input));

    // Step 1: Grammar correction
    debug('Step 1: Correction...');
    const correctionPrompt = this.prompts.buildCorrection(input.raw, language);
    const correctionRaw = await this.llm.complete(correctionPrompt.prompt, correctionPrompt.systemPrompt);
    debug('OpenAI correction response:', correctionRaw);
    const correction: CorrectionResult = JSON.parse(correctionRaw);
    debug('Parsed correction:', JSON.stringify(correction));

    // Step 2: Translation
    debug('Step 2: Translation...');
    const translationPrompt = this.prompts.buildTranslation(correction.corrected);
    const translationRaw = await this.llm.complete(translationPrompt.prompt, translationPrompt.systemPrompt);
    debug('OpenAI translation response:', translationRaw);
    const translation: TranslationResult = JSON.parse(translationRaw);
    debug('Parsed translation:', JSON.stringify(translation));

    // Step 3: Story generation
    debug('Step 3: Story...');
    const storyPrompt = this.prompts.buildStory(translation.english, 'fairy-tale');
    const storyRaw = await this.llm.complete(storyPrompt.prompt, storyPrompt.systemPrompt);
    debug('OpenAI story response:', storyRaw);
    const story: StoryResult = JSON.parse(storyRaw);
    debug('Parsed story:', JSON.stringify(story));

    // Step 4: Postmortem analysis
    debug('Step 4: Postmortem...');
    const postmortemPrompt = this.prompts.buildPostmortem(
      language,
      input.raw,
      correction,
      translation.english,
    );
    const postmortemRaw = await this.llm.complete(postmortemPrompt.prompt, postmortemPrompt.systemPrompt);
    debug('OpenAI postmortem response:', postmortemRaw);
    const postmortem: PostmortemResult = JSON.parse(postmortemRaw);
    debug('Parsed postmortem:', JSON.stringify(postmortem));

    // Step 5: Audio generation — await both so files exist before response
    const audioId = Date.now().toString(36);
    const translationAudioFile = `${audioId}-translation.mp3`;
    const storyAudioFile = `${audioId}-story.mp3`;
    const translationAudioPath = `${this.dataDir}/audio/${translationAudioFile}`;
    const storyAudioPath = `${this.dataDir}/audio/${storyAudioFile}`;

    debug('Step 5: Generating audio (translation + story in parallel)...');
    let translationAudioOk = false;
    let storyAudioOk = false;

    try {
      const t0 = Date.now();
      await Promise.all([
        this.tts.synthesize(translation.english, translationAudioPath)
          .then(() => {
            translationAudioOk = true;
            debug(`  Translation audio created: ${translationAudioFile} (${Date.now() - t0}ms)`);
          }),
        this.tts.synthesize(story.paragraph, storyAudioPath)
          .then(() => {
            storyAudioOk = true;
            debug(`  Story audio created: ${storyAudioFile} (${Date.now() - t0}ms)`);
          }),
      ]);
      debug('Audio generation complete');
    } catch (err) {
      console.warn('[LLMOrchestrator] Audio generation error (partial ok):', (err as Error).message);
      debug(`  Translation audio: ${translationAudioOk ? 'OK' : 'FAILED'}`);
      debug(`  Story audio: ${storyAudioOk ? 'OK' : 'FAILED'}`);
    }

    const audio: AudioResult = {
      translationFile: translationAudioOk ? translationAudioFile : '',
      storyFile: storyAudioOk ? storyAudioFile : '',
      voiceId: 'default',
      generatedAt: new Date().toISOString(),
    };

    debug('=== TURN COMPLETE ===');
    return { correction, translation, story, postmortem, audio };
  }
}
