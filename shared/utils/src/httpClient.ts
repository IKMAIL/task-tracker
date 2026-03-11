import fetch from 'node-fetch';
import { logger } from './logger';

interface AppError extends Error {
  status?: number;
}

const request = async (
  method: string,
  url: string,
  body?: unknown,
  serviceToken?: string
): Promise<unknown> => {
  const start = Date.now();
  logger.debug('http-client: outgoing request', { method, url });

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(serviceToken ? { 'X-Service-Token': serviceToken } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const duration = Date.now() - start;
  const data = await res.json().catch(() => ({})) as Record<string, unknown>;

  if (!res.ok) {
    const errorData = data as { error?: { message?: string } };
    logger.warn('http-client: request failed', { method, url, status: res.status, duration_ms: duration });
    const err: AppError = new Error(errorData.error?.message || `HTTP ${res.status} from ${url}`);
    err.status = res.status;
    throw err;
  }

  logger.debug('http-client: request succeeded', { method, url, status: res.status, duration_ms: duration });
  return data;
};

export const httpClient = {
  get:    (url: string, token?: string)                    => request('GET',    url, undefined, token),
  post:   (url: string, body: unknown, token?: string)     => request('POST',   url, body,      token),
  put:    (url: string, body: unknown, token?: string)     => request('PUT',    url, body,      token),
  delete: (url: string, token?: string)                    => request('DELETE', url, undefined, token),
};
