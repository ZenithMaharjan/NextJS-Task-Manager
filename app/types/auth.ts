export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
  token?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string>;
}
