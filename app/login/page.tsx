"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { Form } from "../components";

type FormSubmitCallback = (formData: FormData) => void;

type StatusType = "success" | "warning" | "error";

const STATUS_COLORS: Record<StatusType, string> = {
  success: "#00af54",
  warning: "#fbaf00",
  error: "#d64933",
};

export default function LoginPage() {
  const [status, setStatus] = useState<{
    type: StatusType;
    message: string;
  } | null>(null);
  const [error, setError] = useState<Record<string, string>>({});

  const handleSubmit: FormSubmitCallback = useCallback(formData => {
    const username = String(formData.get("username") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    setError({});

    const newErrors: Record<string, string> = {};

    if (!username) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (/^\d+$/.test(username)) {
      newErrors.username = "Username cannot be only numbers";
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(username)) {
      newErrors.username =
        "Username must start with a letter and contain only letters, numbers, and underscores";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      setStatus({ type: "error", message: "Please fix the errors below" });
      return;
    }

    const data = Object.fromEntries(formData);
// console.log("Login Data:", data);
    setStatus({ type: "success", message: "Sign in submitted successfully!" });

    setTimeout(() => {
      setStatus(null);
    }, 3000);
  }, []);

  const handleInvalidSubmit = useCallback(() => {
    setStatus({ type: "warning", message: "Please fill all required fields" });
  }, []);

  const handleFormChange = useCallback(() => {
    if (status) {
      setStatus(null);
    }
    if (Object.keys(error).length > 0) {
      setError({});
    }
  }, [status, error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>
        <Form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          onInvalidSubmit={handleInvalidSubmit}
          onChange={handleFormChange}
          error={error}
        >
          <div className="space-y-4">
            <Form.Input
              name="username"
              label="Username"
              placeholder="Enter your username"
              required
            />
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
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Don&apos;t have an account?
              </Link>
            </div>
            <div className="text-sm">
              <Link
                href="/reset-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
            >
              Sign in
            </button>
          </div>

          {status && (
            <div
              className="text-sm text-center font-medium"
              aria-live="polite"
              style={{ color: STATUS_COLORS[status.type] }}
            >
              {status.message}
            </div>
          )}
        </Form>
      </div>
    </div>
  );
}
