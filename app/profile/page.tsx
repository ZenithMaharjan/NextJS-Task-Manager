"use client";

import { User as UserIcon, Save, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Form } from "../components";
import apiService from "../services/api";
import { setUser } from "../store/slices/userSlice";

import { useToast } from "@/hooks/useToast";
import { RootState } from "@/store";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/Login");
    }
  }, [isAuthenticated, router]);

  const [isSaving, setIsSaving] = useState(false);

  const defaultData = useMemo(() => {
    if (!currentUser) return undefined;
    const formData = new FormData();
    formData.set("fullName", currentUser.fullName || "");
    formData.set("email", currentUser.email || "");
    formData.set("organization", (currentUser as any).organization || "");
    return formData;
  }, [currentUser]);

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      const fullName = String(formData.get("fullName") ?? "").trim();
      const organization = String(formData.get("organization") ?? "").trim();

      setIsSaving(true);

      try {
        const response = await apiService.patchUser({ fullName, organization } as any);

        if (response.success && response.user) {
          dispatch(setUser({ user: response.user }));
          showToast("Profile updated successfully", "success");
        } else {
          showToast(response.message || "Failed to update profile", "error");
        }
      } catch (err: any) {
        showToast(err.message || "Failed to update profile", "error");
      } finally {
        setIsSaving(false);
      }
    },
    [dispatch, showToast],
  );

  const handleInvalidSubmit = useCallback(() => {
    showToast("Please fill all required fields", "warning");
  }, [showToast]);

  if (!currentUser || !defaultData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 space-y-2">
          <h2 className="text-xl font-bold mb-6 px-4">Profile</h2>
          <Link
            href="/profile"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold transition-all shadow-md cursor-pointer"
          >
            <UserIcon className="w-5 h-5" />
            Edit Profile
          </Link>
          <Link
            href="/profile/change-password"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium transition-all group cursor-pointer"
          >
            <Lock className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
            Change Password
          </Link>
        </div>

        <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
            Basic Information
          </h1>

          <Form
            onSubmit={handleSubmit}
            onInvalidSubmit={handleInvalidSubmit}
            defaultFormData={defaultData}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Input
                name="fullName"
                label="Full Name"
                placeholder="Enter your full name"
                required
              />
              <Form.Input
                name="email"
                label="Email"
                type="email"
                disabled
                className="bg-blue-50/50 dark:bg-blue-900/10 cursor-not-allowed border-blue-100 dark:border-blue-900/30 opacity-70"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Input
                name="organization"
                label="Organization"
                placeholder="Enter your organization"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-100 text-white font-bold transition-all shadow-md active:scale-95 ${
                  isSaving ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
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
