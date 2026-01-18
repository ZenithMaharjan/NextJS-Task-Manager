import { SignupRequest, LoginRequest, AuthResponse } from "../types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

/**
 * Auth service for handling authentication API calls
 */
export const authService = {
  /**
   * Sign up a new user
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Signup failed");
    }

    // Store token in localStorage
    if (result.token) {
      localStorage.setItem("authToken", result.token);
    }

    return result;
  },

  /**
   * Log in an existing user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Login failed");
    }

    // Store token in localStorage
    if (result.token) {
      localStorage.setItem("authToken", result.token);
    }

    return result;
  },

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    const token = localStorage.getItem("authToken");

    if (token) {
      await fetch(`${API_BASE_URL}/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Remove token from localStorage
    localStorage.removeItem("authToken");
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<AuthResponse> {
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/v1/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      // Token is invalid or expired, remove it
      localStorage.removeItem("authToken");
      throw new Error(result.error || "Authentication failed");
    }

    return result;
  },

  /**
   * Get the stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem("authToken");
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("authToken");
  },
};
