import { CreateSessionRequestDTO } from '../dtos/session.dto';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateCreateSession(body: unknown): { data: CreateSessionRequestDTO; errors: null } | { data: null; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return { data: null, errors: [{ field: 'body', message: 'Request body is required' }] };
  }

  const { language } = body as Record<string, unknown>;

  if (!language || (language !== 'sk' && language !== 'cs')) {
    errors.push({ field: 'language', message: 'Language must be "sk" or "cs"' });
  }

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return { data: { language } as CreateSessionRequestDTO, errors: null };
}
