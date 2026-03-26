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
    fullName: string | null;
    dob: Date | null;
    address: string | null;
    isAdmin: boolean;
  };
  token?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string>;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
