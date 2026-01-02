import { env } from '../config/env.js';
import { fetch, FormData, File as UndiciFile } from 'undici';
import { logger } from '../logging/logger.js';

export interface HttpResponse<T> {
  status: number;
  data: T;
}

function normalizeAccessToken(token: string): string {
  // Accept either raw tokens or strings like "Bearer xxx"
  return token.replace(/^Bearer\s+/i, '');
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function postJson<T>(
  path: string,
  body: unknown,
  accessToken: string,
): Promise<HttpResponse<T>> {
  const token = normalizeAccessToken(accessToken);
  const url = `${env.BMP_API_BASE_URL}${path}`;
  const maxAttempts = env.RETRY_MAX_ATTEMPTS;
  const timeout = env.REQUEST_TIMEOUT_MS;

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt += 1;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = (await res.json().catch(() => ({}))) as T;
      if (!res.ok) {
        const isRetryable = res.status >= 500 || res.status === 429 || res.status === 408;
        logger.warn({ status: res.status, data }, 'HTTP error from ADA BMP');
        if (isRetryable && attempt < maxAttempts) {
          const backoff = Math.min(1000 * 2 ** (attempt - 1), 5000);
          await delay(backoff);
          continue;
        }
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
      }
      return { status: res.status, data };
    } catch (err: unknown) {
      const error = err as Error;
      const isAbort = /aborted/i.test(error.message);
      const isNetwork = !isAbort && (error as any).name === 'FetchError';
      const retryable = isAbort || isNetwork;
      logger.warn({ attempt, err: error.message }, 'HTTP request failed');
      if (retryable && attempt < maxAttempts) {
        const backoff = Math.min(1000 * 2 ** (attempt - 1), 5000);
        await delay(backoff);
        continue;
      }
      throw error;
    }
  }
}

export async function postFormData<T>(
  path: string,
  build: (form: FormData) => void,
  accessToken: string,
): Promise<HttpResponse<T>> {
  const token = normalizeAccessToken(accessToken);
  const url = `${env.BMP_API_BASE_URL}${path}`;
  const maxAttempts = env.RETRY_MAX_ATTEMPTS;
  const timeout = env.REQUEST_TIMEOUT_MS;

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempt += 1;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const form = new FormData();
      build(form);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type; undici sets correct multipart boundary
        },
        body: form as any,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = (await res.json().catch(() => ({}))) as T;
      if (!res.ok) {
        const isRetryable = res.status >= 500 || res.status === 429 || res.status === 408;
        logger.warn({ status: res.status, data }, 'HTTP error from ADA BMP (multipart)');
        if (isRetryable && attempt < maxAttempts) {
          const backoff = Math.min(1000 * 2 ** (attempt - 1), 5000);
          await delay(backoff);
          continue;
        }
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
      }
      return { status: res.status, data };
    } catch (err: unknown) {
      const error = err as Error;
      const isAbort = /aborted/i.test(error.message);
      const isNetwork = !isAbort && (error as any).name === 'FetchError';
      const retryable = isAbort || isNetwork;
      logger.warn({ attempt, err: error.message }, 'HTTP multipart request failed');
      if (retryable && attempt < maxAttempts) {
        const backoff = Math.min(1000 * 2 ** (attempt - 1), 5000);
        await delay(backoff);
        continue;
      }
      throw error;
    }
  }
}
