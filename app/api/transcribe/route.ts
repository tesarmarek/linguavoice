import { NextRequest, NextResponse } from 'next/server';
import { TogetherSTTClient } from '../../../src/clients/together-stt.client';

// POST /api/transcribe — transcribe audio via Together.ai Whisper
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const language = (formData.get('language') as string) || 'auto';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const stt = new TogetherSTTClient();
    const result = await stt.transcribe(buffer, language as 'cs' | 'sk' | 'auto');

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Transcription failed';
    console.error('[Transcribe API] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
