export const STORY_IMAGE_STYLE_BASE = `
2D flat vector illustration, children's animated TV show style.
Simple rounded shapes, thick black outlines, pastel colour palette.
Characters are cute cartoon animals with simple dot eyes and round noses.
Main character: a small friendly pink pig named Peppa, wearing a red dress,
standing upright like a person.
White background or simple flat colour sky and grass.
No gradients, no shadows, no photorealism.
Bright, cheerful, age 3-7 audience.
Style similar to classic British children's animation.
`;

export const STORY_IMAGE_HARD_RULES = `
HARD RULES (must follow strictly):
- STRICT 2D FLAT only. NOT 3D. NOT realistic. NOT watercolor. NOT painterly.
- Completely flat 2D shapes with solid fill colors, ZERO shading, ZERO gradients, ZERO 3D effects
- Bold solid black outlines around every shape
- Characters are simple geometric shapes: circles and ovals for heads, rectangle bodies
- Main character: a small pink pig girl with a round head seen from the side (profile view), circular protruding snout/nose, two tiny black dot eyes, bright pink rosy circle cheeks, two small ears on top, wearing a bright red dress, with short arms and legs
- Background: simple flat green hills (just curved shapes), flat light blue sky, simple yellow circle sun
- Other characters: simple cartoon animals (rabbits, sheep, cats) drawn in same flat geometric style
- Colors: bright solid pastels — pink, red, blue, green, yellow, orange. NO complex textures
- ABSOLUTELY NO text, words, letters, or numbers in the image
`;

/**
 * Step 1: Extract a short visual scene description from the story paragraph.
 * Sent to the LLM, not to DALL-E.
 */
export interface SceneExtractorInput {
  storyParagraph: string;
}

export interface SceneExtractorOutput {
  prompt: string;
  systemPrompt: string;
}

export function buildSceneExtractorPrompt(input: SceneExtractorInput): SceneExtractorOutput {
  const systemPrompt = `You are a children's book illustrator's assistant. You read a story and describe exactly what to draw. You MUST keep the specific setting, objects, and action from the story — do NOT generalize or make up a different scene. The main character is always "Peppa the pink pig in a red dress". Replace any human characters with cartoon animals. You always respond with valid JSON only.`;

  const prompt = `Read this story paragraph carefully. Extract ONE specific visual scene that an illustrator should draw.

RULES:
- Keep the EXACT setting from the story (garden, school, forest, kitchen, etc.)
- Keep the EXACT objects mentioned (flowers, watering can, book, cake, etc.)
- Keep the EXACT action happening (watering, reading, dancing, cooking, etc.)
- Replace the main character with "Peppa the pink pig in a red dress"
- Replace any other people with cartoon animals (rabbit, sheep, cat, dog)
- Describe what is visually happening — positions, expressions, surroundings
- Max 30 words, but be SPECIFIC — no vague descriptions

Story: "${input.storyParagraph}"

BAD example: "Peppa enjoys a beautiful day" (too vague, no specific objects)
GOOD example: "Peppa the pink pig waters a glowing blue flower in a small garden with a wooden fence and a smiling snail"

Respond with JSON:
{
  "sceneDescription": "Peppa the pink pig ... (specific scene from the story)"
}`;

  return { prompt, systemPrompt };
}

/**
 * Step 2: Build the final DALL-E prompt from style base + hard rules + extracted scene.
 */
export interface ImagePromptInput {
  sceneDescription: string;
}

export interface ImagePromptOutput {
  prompt: string;
}

export function buildImagePrompt(input: ImagePromptInput): ImagePromptOutput {
  const prompt = `${STORY_IMAGE_STYLE_BASE}
${STORY_IMAGE_HARD_RULES}
Scene: ${input.sceneDescription}
Single scene, square format.`;

  return { prompt };
}
