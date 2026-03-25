import { NextRequest, NextResponse } from 'next/server';
import { validateCreateSession } from '../../../src/api/validators/session.validator';
import { toCreateSessionResponse } from '../../../src/api/dtos/session.dto';
import { getSessionService } from '../../../src/api/dependencies';

// POST /api/session — Create a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateCreateSession(body);

    if (validation.errors) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const sessionService = getSessionService();
    const session = await sessionService.createSession(validation.data.language);

    return NextResponse.json(toCreateSessionResponse(session), { status: 201 });
  } catch (error) {
    console.error('POST /api/session error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 },
    );
  }
}
