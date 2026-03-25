import { CreateTurnRequestDTO } from '../dtos/turn.dto';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateCreateTurn(body: unknown): { data: CreateTurnRequestDTO; errors: null } | { data: null; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return { data: null, errors: [{ field: 'body', message: 'Request body is required' }] };
  }

  const { raw, language, confidence } = body as Record<string, unknown>;

  if (!raw || typeof raw !== 'string' || (raw as string).trim().length === 0) {
    errors.push({ field: 'raw', message: 'Transcript text is required' });
  }

  if (!language || (language !== 'sk' && language !== 'cs')) {
    errors.push({ field: 'language', message: 'Language must be "sk" or "cs"' });
  }

  if (confidence === undefined || confidence === null || typeof confidence !== 'number' || confidence < 0 || confidence > 1) {
    errors.push({ field: 'confidence', message: 'Confidence must be a number between 0 and 1' });
  }

  if (errors.length > 0) {
    return { data: null, errors };
  }

  return { data: { raw, language, confidence } as CreateTurnRequestDTO, errors: null };
}
