import type { StrapiErrorBody } from '@/types/auth';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:1337';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as StrapiErrorBody;
    return body.error?.message ?? response.statusText;
  } catch {
    return response.statusText || 'Erreur réseau';
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string | null },
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const { token: _token, ...fetchOptions } = options ?? {};

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
