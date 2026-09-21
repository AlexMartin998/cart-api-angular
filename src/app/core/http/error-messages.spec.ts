import { HttpErrorResponse } from '@angular/common/http';
import { toApiError } from './api-error';
import { errorMessage, fieldMessages } from './error-messages';

function problem(status: number, body: unknown): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: body });
}

describe('api errors', () => {
  it('decides by code, not by the english text the server sends', () => {
    const error = toApiError(
      problem(409, {
        title: 'Conflict',
        detail: 'Only 45 units of SKU-008 are left.',
        code: 'insufficient_stock',
        traceId: '00-abc',
      }),
    );

    expect(error.code).toBe('insufficient_stock');
    expect(error.traceId).toBe('00-abc');
    expect(errorMessage(error)).toBe('No hay suficientes unidades disponibles.');
  });

  it('keeps the field errors of a validation problem', () => {
    const error = toApiError(
      problem(400, {
        code: 'validation_error',
        errors: { quantity: ['The field Quantity must be between 1 and 100.'] },
      }),
    );

    expect(errorMessage(error)).toBe('Revisa los campos marcados.');
    expect(fieldMessages(error)).toEqual({
      quantity: 'The field Quantity must be between 1 and 100.',
    });
  });

  it('falls back to the status when the body carries no code', () => {
    expect(toApiError(problem(404, null)).code).toBe('not_found');
    expect(toApiError(problem(500, null)).code).toBe('internal_error');
  });

  it('reports a lost connection as a network error', () => {
    const error = toApiError(problem(0, null));

    expect(error.code).toBe('network');
    expect(errorMessage(error)).toContain('No hay conexión');
  });

  it('uses a single fallback for a code it does not know', () => {
    const error = toApiError(problem(409, { code: 'brand_new_code' }));

    expect(errorMessage(error)).toBe('No pudimos completar la operación. Inténtalo de nuevo.');
  });
});
