import { NextResponse } from 'next/server';
import { toListSessionsResponse } from '../../../src/api/dtos/session.dto';
import { getSessionService } from '../../../src/api/dependencies';

// GET /api/sessions — List all sessions
export async function GET() {
  try {
    const sessionService = getSessionService();
    const sessions = await sessionService.listSessions();

    return NextResponse.json(toListSessionsResponse(sessions));
  } catch (error) {
    console.error('GET /api/sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to list sessions' },
      { status: 500 },
    );
  }
}
