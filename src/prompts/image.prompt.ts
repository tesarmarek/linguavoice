export const STORY_IMAGE_STYLE_BASE = `
2D flat vector illustration, children's animated TV show style.
Simple rounded shapes, thick black outlines, pastel colour palette.
Characters are cute cartoon animals with simple dot eyes and round noses.
Main character: a small friendly pink pig named Peppa, wearing a red dress,
standing upright like a person.
No gradients, no shadows, no photorealism.
Bright, cheerful, age 3-7 audience.
Style similar to classic British children's animation.
ABSOLUTELY NO text, words, letters, or numbers in the image.
`;

/**
 * Step 1: Extract a short visual scene description from the story paragraph.
 * Sent to the LLM, not to the image model.
 */
export interface SceneExtractorInput {
  storyParagraph: string;
}

export interface SceneExtractorOutput {
  prompt: string;
  systemPrompt: string;
}

export function buildSceneExtractorPrompt(input: SceneExtractorInput): SceneExtractorOutput {
  const systemPrompt = `You are a children's book illustrator's assistant. You read a story and describe exactly what to draw. You MUST keep the specific setting, objects, characters, and action from the story — do NOT generalize or make up a different scene. The main character is always "Peppa the pink pig in a red dress". Replace any human characters with cartoon animals. You always respond with valid JSON only.`;

  const prompt = `Read this story paragraph carefully. Extract ONE specific visual scene that an illustrator should draw.

RULES:
- Keep the EXACT setting from the story (garden, school, forest, kitchen, etc.)
- Keep ALL specific characters mentioned (owl, gnome, cat, rabbit, etc.)
- Keep the EXACT objects mentioned (flowers, watering can, book, cake, etc.)
- Keep the EXACT action happening (watering, reading, dancing, cooking, talking, etc.)
- The main character is "Peppa the pink pig in a red dress"
- Include the background/environment from the story (NOT default green hills)
- Describe what EACH character is doing and where they are positioned
- Be SPECIFIC and VISUAL — an illustrator must be able to draw this exactly
- 30-50 words

Story: "${input.storyParagraph}"

BAD example: "Peppa enjoys a beautiful day" (too vague, missing characters and objects)
GOOD example: "Peppa the pink pig in a red dress sits on a log in a dark forest, talking to a wise owl wearing glasses perched on a tree branch, with glowing mushrooms and fireflies around them"

Respond with JSON:
{
  "sceneDescription": "Peppa the pink pig ... (specific scene with all characters and setting from the story)"
}`;

  return { prompt, systemPrompt };
}

/**
 * Step 2: Build the final image prompt.
 * Scene goes FIRST (most important), style after.
 */
export interface ImagePromptInput {
  sceneDescription: string;
}

export interface ImagePromptOutput {
  prompt: string;
}

export function buildImagePrompt(input: ImagePromptInput): ImagePromptOutput {
  // Scene first — image models weight earlier tokens more heavily
  const prompt = `Scene: ${input.sceneDescription}

${STORY_IMAGE_STYLE_BASE}
Single scene, square format.`;

  return { prompt };
}
