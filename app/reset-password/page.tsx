"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { Form } from "../components";
import { AuthCard } from "../components/Auth/AuthCard";
import { StatusType } from "../constants/auth";
import { validateEmail } from "../utils/validation";

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<{ type: StatusType; message: string } | null>(null);

  const handleSubmit = useCallback((formData: FormData) => {
    const email = String(formData.get("email") ?? "").trim();
    const emailError = validateEmail(email);

    if (emailError) {
      setStatus({ type: "error", message: emailError });
      return;
    }

    setStatus({ type: "success", message: "Reset request submitted successfully!" });
  }, []);

  const handleInvalidSubmit = useCallback(() => {
    setStatus({ type: "warning", message: "Please fill all required fields" });
  }, []);

  const handleFormChange = useCallback(() => {
    if (status) setStatus(null);
  }, [status]);

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to get back into your account."
      status={status}
    >
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
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Back to Sign in
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer shadow-md active:scale-95"
        >
          Send Reset Link
        </button>
      </Form>
    </AuthCard>
  );
}
