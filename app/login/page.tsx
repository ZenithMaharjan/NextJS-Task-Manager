"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

import { Form } from "../components";
import { AuthCard } from "../components/Auth/AuthCard";
import { StatusType } from "../constants/auth";
import apiService from "../services/api";
import { setUser } from "../store/slices/userSlice";
import { setWishlist } from "../store/slices/wishlistSlice";
import { validateEmail, validateUsername, validatePassword } from "../utils/validation";

import { useToast } from "@/hooks/useToast";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [status, setStatus] = useState<{ type: StatusType; message: string } | null>(null);
  const [error, setError] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      const username = String(formData.get("username") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "").trim();

      const newErrors: Record<string, string> = {
        username: validateUsername(username) || "",
        email: validateEmail(email) || "",
        password: validatePassword(password) || "",
      };

      Object.keys(newErrors).forEach(key => {
        if (!newErrors[key]) delete newErrors[key];
      });

      if (Object.keys(newErrors).length > 0) {
        setError(newErrors);
        showToast("Please fix the validation errors", "error");
        setStatus({ type: "error", message: "Please fix the errors below" });
        return;
      }

      setStatus({ type: "success", message: "Signing in..." });

      try {
        const response = await apiService.login({ email, password });

        if (response.user && response.token) {
          // Save user and token to Redux store (persistence handled by redux-persist)
          dispatch(setUser({ user: response.user, token: response.token }));

          // Fetch user's wishlist
          try {
            const wishlistResponse = await apiService.getWishlist();
            if (wishlistResponse.success) {
              dispatch(setWishlist(wishlistResponse.wishlists));
            }
          } catch (wishlistErr) {
            showToast(
              `Failed to fetch wishlist: ${wishlistErr instanceof Error ? wishlistErr.message : "Unknown error"}`,
              "error",
            );
          }
        }

        showToast("Successfully signed in! Redirecting...", "success");
        router.push("/");
      } catch (err: any) {
        showToast(err.message || "Failed to login", "error");
        setStatus({ type: "error", message: err.message || "Failed to login" });
      }
    },
    [dispatch, router, showToast],
  );

  const handleInvalidSubmit = useCallback(() => {
    showToast("Please fill all required fields", "warning");
    setStatus({ type: "warning", message: "Please fill all required fields" });
  }, [showToast]);

  const handleFormChange = useCallback(() => {
    if (status) setStatus(null);
    if (Object.keys(error).length > 0) setError({});
  }, [status, error]);

  return (
    <AuthCard title="Sign in to your account" status={status}>
      <Form
        className="mt-8 space-y-6"
        onSubmit={handleSubmit}
        onInvalidSubmit={handleInvalidSubmit}
        onChange={handleFormChange}
        error={error}
      >
        <div className="space-y-4">
          <Form.Input name="username" label="Username" placeholder="Enter your username" required />
          <Form.Input
            name="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            required
          />
          <Form.Input
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Don&apos;t have an account?
            </Link>
          </div>
          <div className="text-sm">
            <Link
              href="/reset-password"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer shadow-md active:scale-95"
        >
          Sign in
        </button>
      </Form>
    </AuthCard>
  );
}
