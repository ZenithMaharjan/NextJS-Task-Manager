"use client";

import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Heart, User, LogOut } from "lucide-react";
import Link from "next/link";
import { RootState } from "@/store";
import { setUser, logout } from "@/store/slices/userSlice";

import { HeaderProps } from "../Header/types";
import Logo from "../Logo";
import NavLinks from "../NavLinks";

import { DEFAULT_LINKS } from "../../constants/navigation";

export default function DesktopHeader({
  title = "My Website",
  links = DEFAULT_LINKS,
  className = "bg-blue-600 text-white p-4",
  logoHref = "/",
  activeClassName = "underline font-semibold",
  linkClassName = "hover:underline px-2 transition-all",
  containerClassName = "container mx-auto flex justify-between items-center",
}: HeaderProps) {
  const dispatch = useDispatch();
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);
  const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.user);

  const toggleMockUser = useCallback(() => {
    if (currentUser?.id === "user-1") {
      dispatch(setUser({ id: "user-2", name: "Other User", email: "other@example.com" }));
    } else {
      dispatch(setUser({ id: "user-1", name: "Mock User", email: "mock@example.com" }));
    }
  }, [currentUser?.id, dispatch]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  return (
    <header className={`${className} hidden md:block shadow-md`}>
      <nav className={containerClassName}>
        <Logo title={title} href={logoHref} />
        <div className="flex items-center gap-6">
          <NavLinks links={links} linkClassName={linkClassName} activeClassName={activeClassName} />
          <div className="flex items-center gap-4 pl-4 border-l border-white/20">
            <Link
              href="/wishlist"
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <div className="relative">
                <Heart className="w-6 h-6 shadow-sm" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </div>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMockUser}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/10 shadow-sm group"
                  title="Switch mock user"
                >
                  <User className="w-4 h-4 text-blue-200 group-hover:text-white transition-colors" />
                  <div className="text-left leading-none">
                    <p className="text-[9px] text-blue-100 uppercase font-black opacity-60">Profile</p>
                    <p className="text-sm font-bold truncate max-w-[80px]">{currentUser?.name}</p>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-white transition-all border border-red-500/20 shadow-sm"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
