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

export default function LoginPage() {
  const [status, setStatus] = useState<{ type: StatusType; message: string } | null>(null);

  const handleSubmit: FormSubmitCallback = useCallback((formData) => {
    const username = String(formData.get("username") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    if (!username || !email || !password) {
      setStatus({ type: "error", message: "Please fill all required fields" });
      return;
    }

    const data = Object.fromEntries(formData);
    console.log("Login Data:", data);
    setStatus({ type: "success", message: "Sign in submitted (check console for payload)" });
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
            Sign in to your account
          </h2>
        </div>
        <Form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          onInvalidSubmit={handleInvalidSubmit}
          onChange={handleFormChange}
        >
          <div className="rounded-md shadow-sm -space-y-px">
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
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Don't have an account?
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
