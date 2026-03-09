"use client";

import { User as UserIcon, Lock, Save, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useState, useMemo, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

import { Form } from "../../components";
import { FormRef } from "../../components/Form";
import apiService from "../../services/api";

import { useToast } from "@/hooks/useToast";
import { RootState } from "@/store";

const getPasswordStrength = (password: string) => {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
  if (/\d/.test(password)) strength += 25;
  if (/[^a-zA-Z\d]/.test(password)) strength += 25;
  return strength;
};

const PasswordStrengthMeter = ({ strength }: { strength: number }) => {
  const label = useMemo(() => {
    if (strength <= 25) return "Weak";
    if (strength <= 50) return "Fair";
    if (strength <= 75) return "Good";
    return "Strong";
  }, [strength]);

  const colorClass = useMemo(() => {
    if (strength <= 25) return "bg-red-500";
    if (strength <= 50) return "bg-orange-500";
    if (strength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  }, [strength]);

  const textColorClass = useMemo(() => {
    if (strength <= 25) return "text-red-500";
    if (strength <= 75) return "text-yellow-600";
    return "text-green-600";
  }, [strength]);

  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between items-center text-xs font-medium">
        <span className="text-gray-500 dark:text-gray-400">Password Strength:</span>
        <span className={textColorClass}>{label}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${strength}%` }}
        />
      </div>
    </div>
  );
};

export default function ChangePasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const formRef = useRef<FormRef>(null);

  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/Login");
    }
  }, [isAuthenticated, router]);

  const [isSaving, setIsSaving] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newPasswordValue, setNewPasswordValue] = useState("");

  const passwordStrength = useMemo(() => getPasswordStrength(newPasswordValue), [newPasswordValue]);

  const toggleCurrentPassword = useCallback(() => setShowCurrentPassword(prev => !prev), []);
  const toggleNewPassword = useCallback(() => setShowNewPassword(prev => !prev), []);
  const toggleConfirmPassword = useCallback(() => setShowConfirmPassword(prev => !prev), []);

  const validate = useCallback(
    (currentPassword: string, newPassword: string, confirmPassword: string) => {
      if (!currentPassword || !newPassword || !confirmPassword) {
        showToast("All fields are required", "warning");
        return false;
      }
      if (newPassword.length < 6) {
        showToast("New password must be at least 6 characters", "error");
        return false;
      }
      if (newPassword !== confirmPassword) {
        showToast("New passwords do not match", "error");
        return false;
      }
      if (currentPassword === newPassword) {
        showToast("New password must be different from current password", "warning");
        return false;
      }
      return true;
    },
    [showToast],
  );

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      const currentPassword = String(formData.get("currentPassword") ?? "");
      const newPassword = String(formData.get("newPassword") ?? "");
      const confirmPassword = String(formData.get("confirmPassword") ?? "");

      if (!validate(currentPassword, newPassword, confirmPassword)) {
        return;
      }

      setIsSaving(true);

      try {
        const response = await apiService.changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        });

        if (response.success) {
          showToast("Password changed successfully", "success");
          formRef.current?.reset();
          setNewPasswordValue("");
        } else {
          showToast(response.message || "Failed to change password", "error");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to change password";
        showToast(message, "error");
      } finally {
        setIsSaving(false);
      }
    },
    [showToast, validate],
  );

  const handleInvalidSubmit = useCallback(() => {
    showToast("Please fill all required fields correctly", "warning");
  }, [showToast]);

  const handleNewPasswordChange = useCallback((payload: unknown) => {
    let value = "";
    if (payload && typeof payload === "object" && "target" in payload) {
      value = (payload as React.ChangeEvent<HTMLInputElement>).target.value;
    } else {
      value = String(payload ?? "");
    }
    setNewPasswordValue(value);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 space-y-2">
          <h2 className="text-xl font-bold mb-6 px-4">Profile</h2>
          <Link
            href="/profile"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium transition-all group cursor-pointer"
          >
            <UserIcon className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
            Edit Profile
          </Link>
          <Link
            href="/profile/change-password"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold transition-all shadow-md cursor-pointer"
          >
            <Lock className="w-5 h-5" />
            Change Password
          </Link>
        </div>

        <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Change Password</h1>

          <Form
            ref={formRef}
            onSubmit={handleSubmit}
            onInvalidSubmit={handleInvalidSubmit}
            className="space-y-6"
          >
            <div className="space-y-6 max-w-2xl">
              <div className="relative">
                <Form.Input
                  name="currentPassword"
                  label="Current Password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  required
                  autoFocus
                  autoComplete="current-password"
                  aria-label="Current Password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={toggleCurrentPassword}
                  className="absolute right-2 bottom-0 h-[42px] flex items-center p-1.5 text-gray-400 hover:text-blue-600 transition-colors outline-none cursor-pointer"
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div>
                <div className="relative">
                  <Form.Input
                    name="newPassword"
                    label="New Password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password (min. 6 chars)"
                    required
                    autoComplete="new-password"
                    aria-label="New Password"
                    onChange={handleNewPasswordChange}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={toggleNewPassword}
                    className="absolute right-2 bottom-0 h-[42px] flex items-center p-1.5 text-gray-400 hover:text-blue-600 transition-colors outline-none cursor-pointer"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {newPasswordValue && <PasswordStrengthMeter strength={passwordStrength} />}
              </div>

              <div className="relative">
                <Form.Input
                  name="confirmPassword"
                  label="Confirm New Password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  required
                  autoComplete="new-password"
                  aria-label="Confirm New Password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPassword}
                  className="absolute right-2 bottom-0 h-[42px] flex items-center p-1.5 text-gray-400 hover:text-blue-600 transition-colors outline-none cursor-pointer"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold transition-all shadow-md active:scale-95 ${
                  isSaving ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Changing...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
