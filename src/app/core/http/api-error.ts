import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetails } from '../models/api';

export interface ApiError {
  status: number;
  code: string;
  detail: string;
  fieldErrors: Record<string, string[]>;
  traceId: string | null;
}

const NETWORK: ApiError = {
  status: 0,
  code: 'network',
  detail: '',
  fieldErrors: {},
  traceId: null,
};

export function toApiError(error: unknown): ApiError {
  if (!(error instanceof HttpErrorResponse)) {
    return NETWORK;
  }

  if (error.status === 0) {
    return NETWORK;
  }

  const body: ProblemDetails = isProblemDetails(error.error) ? error.error : {};

  return {
    status: error.status,
    code: body.code ?? codeFromStatus(error.status),
    detail: body.detail ?? '',
    fieldErrors: body.errors ?? {},
    traceId: body.traceId ?? null,
  };
}

function isProblemDetails(body: unknown): body is ProblemDetails {
  return typeof body === 'object' && body !== null;
}

function codeFromStatus(status: number): string {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status >= 500) return 'internal_error';
  return 'bad_request';
}
