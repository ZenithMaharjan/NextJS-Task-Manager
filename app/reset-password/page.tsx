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

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<{
    type: StatusType;
    message: string;
  } | null>(null);

  const handleSubmit: FormSubmitCallback = useCallback(formData => {
    const email = String(formData.get("email") ?? "").trim();

    const newErrors: Record<string, string> = {};

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setStatus({
        type: "error",
        message: newErrors.email || "Please fix the errors below",
      });
      return;
    }

    const data = Object.fromEntries(formData);
    console.log("Reset Password Data:", data);
    setStatus({
      type: "success",
      message: "Reset request submitted (check console for payload)",
    });
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
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your email and we&apos;ll send you a link to get back into your account.
          </p>
        </div>
        <Form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          onInvalidSubmit={handleInvalidSubmit}
          onChange={handleFormChange}
        >
          <Form.Input
            name="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            required
          />

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Back to Sign in
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer"
          >
            Send Reset Link
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
