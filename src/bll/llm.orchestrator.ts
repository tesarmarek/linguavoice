import { Language } from '../types/session.types';
import {
  TranscriptInput,
  CorrectionResult,
  TranslationResult,
  StoryResult,
  PostmortemResult,
  AudioResult,
  ImageResult,
  ScenarioResult,
} from '../types/turn.types';
import { ILLMClient } from '../clients/llm.client.interface';
import { ITTSClient } from '../clients/tts.interface';
import { IImageClient } from '../clients/image.interface';
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
  image: ImageResult;
  scenarios: ScenarioResult;
}

export interface OrchestratorDeps {
  llmClient: ILLMClient;
  elevenLabsClient: ITTSClient;
  imageClient: IImageClient;
  promptService: PromptService;
  dataDir: string;
}

export class LLMOrchestrator {
  private llm: ILLMClient;
  private tts: ITTSClient;
  private img: IImageClient;
  private prompts: PromptService;
  private dataDir: string;

  constructor(deps: OrchestratorDeps) {
    this.llm = deps.llmClient;
    this.tts = deps.elevenLabsClient;
    this.img = deps.imageClient;
    this.prompts = deps.promptService;
    this.dataDir = deps.dataDir;
  }

  async processTurn(input: TranscriptInput, language: Language, imageModel?: string): Promise<OrchestratorResult> {
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

    // Step 5: Scenarios (LLM — ignite kids imagination)
    const env = getEnvConfig();
    let scenarios: ScenarioResult = { scenarios: [] };
    if (env.ENABLE_SCENARIOS) {
      debug('Step 5: Scenarios...');
      const scenarioPrompt = this.prompts.buildScenario(story.paragraph, story.theme, language);
      const scenarioRaw = await this.llm.complete(scenarioPrompt.prompt, scenarioPrompt.systemPrompt);
      debug('OpenAI scenario response:', scenarioRaw);
      scenarios = JSON.parse(scenarioRaw);
      debug('Parsed scenarios:', JSON.stringify(scenarios));
    } else {
      debug('Step 5: Scenarios SKIPPED (ENABLE_SCENARIOS=false)');
    }

    // Step 6: Scene extraction for image (LLM call, if image enabled)
    let sceneDescription = '';
    let imagePrompt = '';
    if (env.ENABLE_IMAGE) {
      debug('Step 6a: Extracting visual scene from story...');
      const sceneExtractor = this.prompts.buildSceneExtractor(story.paragraph);
      const sceneRaw = await this.llm.complete(sceneExtractor.prompt, sceneExtractor.systemPrompt);
      debug('Scene extractor response:', sceneRaw);
      const sceneResult = JSON.parse(sceneRaw);
      sceneDescription = sceneResult.sceneDescription ?? '';
      debug('Extracted scene:', sceneDescription);

      const imagePromptResult = this.prompts.buildImage(sceneDescription);
      imagePrompt = imagePromptResult.prompt;
      debug('Final DALL-E prompt (first 300 chars):', imagePrompt.slice(0, 300));
    }

    // Step 7: Audio + Image generation (all in parallel, respecting env flags)
    const assetId = Date.now().toString(36);
    const translationAudioFile = `${assetId}-translation.mp3`;
    const storyAudioFile = `${assetId}-story.mp3`;
    const imageFile = `${assetId}-story.png`;
    const translationAudioPath = `${this.dataDir}/audio/${translationAudioFile}`;
    const storyAudioPath = `${this.dataDir}/audio/${storyAudioFile}`;
    const imagePath = `${this.dataDir}/images/${imageFile}`;

    debug(`Step 7: Generating assets (TTS=${env.ENABLE_TTS}, IMAGE=${env.ENABLE_IMAGE})...`);
    let translationAudioOk = false;
    let storyAudioOk = false;
    let imageOk = false;

    const tasks: Promise<void>[] = [];
    const t0 = Date.now();

    if (env.ENABLE_TTS) {
      tasks.push(
        this.tts.synthesize(translation.english, translationAudioPath)
          .then(() => { translationAudioOk = true; debug(`  Translation audio: OK (${Date.now() - t0}ms)`); }),
        this.tts.synthesize(story.paragraph, storyAudioPath)
          .then(() => { storyAudioOk = true; debug(`  Story audio: OK (${Date.now() - t0}ms)`); }),
      );
    }
    if (env.ENABLE_IMAGE && imagePrompt) {
      debug(`  DALL-E prompt: ${imagePrompt.slice(0, 100)}...`);
      tasks.push(
        this.img.generate(imagePrompt, imagePath, imageModel)
          .then(() => { imageOk = true; debug(`  Story image: OK (${Date.now() - t0}ms, model: ${imageModel || 'default'})`); })
          .catch((err) => { debug(`  Story image error: ${(err as Error).message}`); }),
      );
    }

    if (tasks.length > 0) {
      await Promise.allSettled(tasks);
    }

    if (env.ENABLE_TTS && !translationAudioOk) debug('  Translation audio: FAILED');
    if (env.ENABLE_TTS && !storyAudioOk) debug('  Story audio: FAILED');
    if (env.ENABLE_IMAGE && !imageOk) debug('  Story image: FAILED');

    const audio: AudioResult = {
      translationFile: translationAudioOk ? translationAudioFile : '',
      storyFile: storyAudioOk ? storyAudioFile : '',
      voiceId: 'default',
      generatedAt: new Date().toISOString(),
    };

    const image: ImageResult = {
      file: imageOk ? imageFile : '',
      prompt: sceneDescription || imagePrompt,
      generatedAt: new Date().toISOString(),
    };

    debug('=== TURN COMPLETE ===');
    return { correction, translation, story, postmortem, audio, image, scenarios };
  }
}
