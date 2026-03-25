import { NextResponse } from 'next/server';
import { IMAGE_MODELS, DEFAULT_IMAGE_MODEL } from '../../../src/config/image-models';

// GET /api/image-models — list available image generation models
export async function GET() {
  return NextResponse.json({ models: IMAGE_MODELS, default: DEFAULT_IMAGE_MODEL });
}
