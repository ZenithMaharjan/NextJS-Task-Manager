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
import { validateEmail, validateUsername, validatePassword } from "../utils/validation";

import { useToast } from "@/hooks/useToast";

export default function SignUpPage() {
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
      const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

      const newErrors: Record<string, string> = {
        username: validateUsername(username) || "",
        email: validateEmail(email) || "",
        password: validatePassword(password) || "",
      };

      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      Object.keys(newErrors).forEach(key => {
        if (!newErrors[key]) delete newErrors[key];
      });

      if (Object.keys(newErrors).length > 0) {
        setError(newErrors);
        showToast("Please fix the validation errors", "error");
        setStatus({ type: "error", message: "Please fix the errors above" });
        return;
      }

      setStatus({ type: "success", message: "Creating account..." });

      try {
        const response = await apiService.signup({ username, email, password });

        if (response.user) {
          dispatch(setUser({ user: response.user, token: response.token }));
        }

        showToast("Account created successfully! Redirecting...", "success");
        router.push("/Inventory");
      } catch (err: any) {
        showToast(err.message || "Failed to create account", "error");
        setStatus({ type: "error", message: err.message || "Failed to create account" });
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
    <AuthCard title="Create your account" status={status}>
      <Form
        className="mt-8 space-y-6"
        onSubmit={handleSubmit}
        onInvalidSubmit={handleInvalidSubmit}
        onChange={handleFormChange}
        error={error}
      >
        <div className="space-y-4">
          <Form.Input name="username" label="Username" placeholder="Choose a username" required />
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
            placeholder="Create a password"
            required
          />
          <Form.Input
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            required
          />
        </div>

        <div className="flex items-center justify-end">
          <div className="text-sm">
            <Link
              href="/Login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all cursor-pointer shadow-md active:scale-95"
        >
          Sign Up
        </button>
      </Form>
    </AuthCard>
  );
}
