export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:1337';

type ApiFetchOptions = RequestInit & {
  token?: string | null;
};

let logoutInProgress = false;

async function handleUnauthorized() {
  if (logoutInProgress) return;
  logoutInProgress = true;
  try {
    const { useAuthStore } = await import('@/stores/authStore');
    await useAuthStore.getState().logout();
  } finally {
    logoutInProgress = false;
  }
}

/**
 * Fetch authentifié vers l'API. Sur 401, déconnecte l'utilisateur
 * pour que la garde de navigation redirige vers /login.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { token, headers, body, ...rest } = options;
  const { useAuthStore } = await import('@/stores/authStore');
  const authToken = token ?? useAuthStore.getState().token;

  const url = path.startsWith('http') ? path : `${API_URL}${path}`;

  const response = await fetch(url, {
    ...rest,
    body,
    headers: {
      ...(body != null ? { 'Content-Type': 'application/json' } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  if (response.status === 401) {
    if (authToken) {
      await handleUnauthorized();
    }
    throw new Error('Session expirée');
  }

  if (!response.ok) {
    throw new Error(`Erreur API (${response.status})`);
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
