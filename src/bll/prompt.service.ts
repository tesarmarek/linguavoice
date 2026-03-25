import { Language } from '../types/session.types';
import { CorrectionResult } from '../types/turn.types';
import { buildCorrectionPrompt, CorrectionPromptOutput } from '../prompts/correction.prompt';
import { buildTranslationPrompt, TranslationPromptOutput } from '../prompts/translation.prompt';
import { buildStoryPrompt, StoryPromptOutput } from '../prompts/story.prompt';
import { buildPostmortemPrompt, PostmortemPromptOutput } from '../prompts/postmortem.prompt';

export class PromptService {
  buildCorrection(raw: string, language: Language): CorrectionPromptOutput {
    return buildCorrectionPrompt({ raw, language });
  }

  buildTranslation(correctedText: string): TranslationPromptOutput {
    return buildTranslationPrompt({ correctedText });
  }

  buildStory(englishTranslation: string, themeHint: string): StoryPromptOutput {
    return buildStoryPrompt({ englishTranslation, themeHint });
  }

  buildPostmortem(
    language: Language,
    original: string,
    correction: CorrectionResult,
    englishTranslation: string,
  ): PostmortemPromptOutput {
    return buildPostmortemPrompt({ language, original, correction, englishTranslation });
  }
}
