import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export async function getStoredAuth(): Promise<{
  token: string | null;
  userJson: string | null;
}> {
  const [token, userJson] = await Promise.all([
    AsyncStorage.getItem(AUTH_TOKEN_KEY),
    AsyncStorage.getItem(AUTH_USER_KEY),
  ]);
  return { token, userJson };
}

export async function setStoredAuth(token: string, userJson: string): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(AUTH_TOKEN_KEY, token),
    AsyncStorage.setItem(AUTH_USER_KEY, userJson),
  ]);
}

export async function clearStoredAuth(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(AUTH_TOKEN_KEY),
    AsyncStorage.removeItem(AUTH_USER_KEY),
  ]);
}
