import { NextRequest, NextResponse } from 'next/server';
import { validateCreateTurn } from '../../../../../src/api/validators/turn.validator';
import { toCreateTurnResponse } from '../../../../../src/api/dtos/turn.dto';
import { getTurnService } from '../../../../../src/api/dependencies';

// POST /api/session/:id/turn — Create a new turn in session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const validation = validateCreateTurn(body);

    if (validation.errors) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const turnService = await getTurnService();
    const turn = await turnService.createTurn(sessionId, {
      raw: validation.data.raw,
      language: validation.data.language,
      confidence: validation.data.confidence,
    });

    return NextResponse.json(toCreateTurnResponse(turn), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('not found')) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message.includes('already ended')) {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    console.error(`POST /api/session/:id/turn error:`, error);
    return NextResponse.json(
      { error: 'Failed to create turn' },
      { status: 500 },
    );
  }
}
