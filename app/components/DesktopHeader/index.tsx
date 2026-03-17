"use client";

import { Heart, User, LogOut, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import { DEFAULT_LINKS } from "../../constants/navigation";
import { NotificationDropdown } from "../Header/NotificationDropdown";
import { HeaderProps } from "../Header/types";
import Logo from "../Logo";
import NavLinks from "../NavLinks";
import ThemeToggler from "../ThemeToggler";

import { useToast } from "@/hooks/useToast";
import apiService from "@/services/api";
import { RootState } from "@/store";
import { markAsRead, markAllRead } from "@/store/slices/notificationsSlice";
import { logout } from "@/store/slices/userSlice";
import { clearWishlist } from "@/store/slices/wishlistSlice";

export default function DesktopHeader({
  title = "My Website",
  links = DEFAULT_LINKS,
  className = "bg-blue-600 text-white p-4",
  logoHref = "/",
  activeClassName = "underline font-semibold",
  linkClassName = "hover:underline px-1 transition-all text-sm",
  containerClassName = "container mx-auto flex justify-between items-center",
}: HeaderProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);
  const { items: notifications, unreadCount } = useSelector(
    (state: RootState) => state.notifications,
  );
  const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.user);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    dispatch(clearWishlist());
    showToast("Successfully logged out", "success");
    router.replace("/Login");
  }, [dispatch, showToast, router]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      dispatch(markAsRead(id));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      dispatch(markAllRead());
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  return (
    <header className={`${className} hidden md:block shadow-md`}>
      <nav className={`${containerClassName} md:gap-2 lg:gap-6`}>
        <div className="shrink-0 min-w-fit">
          <Logo title={title} href={logoHref} />
        </div>
        <div className="flex items-center md:gap-1 lg:gap-4 min-w-0 flex-1 justify-end">
          <div className="hidden md:flex md:ml-1 lg:ml-6">
            <NavLinks
              links={links}
              linkClassName={linkClassName}
              activeClassName={activeClassName}
            />
          </div>
          <div className="flex items-center gap-4 pl-3 border-l border-white/20 shrink-0">
            <ThemeToggler />
            {isAuthenticated && (
              <>
                <Link
                  href="/PurchaseOrders"
                  className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <ShoppingCart className="w-6 h-6" />
                </Link>

                <Link
                  href="/Wishlist"
                  className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="relative">
                    <Heart className="w-6 h-6" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-sm">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                </Link>

                <NotificationDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                />
              </>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer group"
                >
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 shadow-sm group-hover:bg-white/20 transition-all">
                    <User className="w-4 h-4 text-white" />
                    <div className="hidden lg:block text-left leading-none">
                      <p className="text-sm font-bold truncate max-w-[80px]">
                        {(currentUser?.fullName || currentUser?.name || "").split(" ")[0]}
                      </p>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-white transition-all border border-red-500/20 shadow-sm cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/Login"
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
