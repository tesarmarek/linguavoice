import { NextResponse } from 'next/server';
import { STT_MODELS, DEFAULT_STT_MODEL } from '../../../src/config/stt-models';

// GET /api/stt-models — list available STT models
export async function GET() {
  return NextResponse.json({ models: STT_MODELS, default: DEFAULT_STT_MODEL });
}
