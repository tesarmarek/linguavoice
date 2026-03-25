import { NextRequest, NextResponse } from 'next/server';
import { toGetSessionResponse } from '../../../../src/api/dtos/session.dto';
import { getSessionService } from '../../../../src/api/dependencies';

// GET /api/session/:id — Get session by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const sessionService = getSessionService();
    const session = await sessionService.getSession(id);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(toGetSessionResponse(session));
  } catch (error) {
    console.error(`GET /api/session/:id error:`, error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 },
    );
  }
}
