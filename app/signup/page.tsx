"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import Form from "../components/Form";

type FormSubmitCallback = (formData: FormData) => void;

type StatusType = "success" | "warning" | "error";

const STATUS_COLORS: Record<StatusType, string> = {
  success: "#00af54",
  warning: "#fbaf00",
  error: "#d64933",
};

export default function SignUpPage() {
  const [status, setStatus] = useState<{ type: StatusType; message: string } | null>(null);

  const handleSubmit: FormSubmitCallback = useCallback((formData) => {
    const username = String(formData.get("username") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();
    const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

    if (!username || !email || !password || !confirmPassword) {
      setStatus({ type: "error", message: "Please fill all required fields" });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match" });
      return;
    }

    const data = Object.fromEntries(formData);
    console.log("SignUp Data:", data);
    setStatus({ type: "success", message: "Sign up submitted (check console for payload)" });
  }, []);

  const handleInvalidSubmit = useCallback(() => {
    setStatus({ type: "warning", message: "Please fill all required fields" });
  }, []);

  const handleFormChange = useCallback(() => {
    if (status) {
      setStatus(null);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
        </div>
        <Form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          onInvalidSubmit={handleInvalidSubmit}
          onChange={handleFormChange}
        >
          <Form.Input
            name="username"
            label="Username"
            placeholder="Choose a username"
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

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors cursor-pointer"
          >
            Sign Up
          </button>

          {status && (
            <div
              className="text-sm text-center"
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
