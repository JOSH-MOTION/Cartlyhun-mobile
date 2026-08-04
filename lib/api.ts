import { auth } from '@/lib/firebase';

/**
 * Client for the Cartly Hub marketplace API.
 *
 * Orders, wallets, withdrawals and marketplace settings are written only by
 * the server — firestore.rules makes those collections read-only to any
 * client. So the app must not write them directly; it calls the same
 * endpoints the web app uses and gets identical commission, stock and
 * notification behaviour for free.
 *
 * Auth is the caller's Firebase ID token, which the server verifies through
 * Google's Identity Toolkit.
 */

const BASE_URL = (
  process.env.EXPO_PUBLIC_SITE_URL || 'https://cartlyhubgh.com'
).replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
};

export const apiFetch = async <T = any>(path: string, options: Options = {}): Promise<T> => {
  const { method = 'GET', body, signal } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  try {
    const token = await auth.currentUser?.getIdToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {
    // Signed-out callers still reach public endpoints.
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('No connection. Check your network and try again.', 0);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      payload?.error || 'Something went wrong. Please try again.',
      response.status,
      payload?.code,
    );
  }

  return payload as T;
};

export const API_BASE_URL = BASE_URL;
