export interface AuthUser {
  id: number;
  username: string;
  email: string;
  blocked: boolean;
}

export interface LoginResponse {
  jwt: string;
  user: AuthUser;
}

export interface StrapiErrorBody {
  error?: {
    message?: string;
    status?: number;
  };
}
