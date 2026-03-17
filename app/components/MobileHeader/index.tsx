"use client";

import { ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { DEFAULT_LINKS } from "../../constants/navigation";
import Drawer from "../Drawer";
import HamburgerButton from "../HamburgerButton";
import { NotificationDropdown } from "../Header/NotificationDropdown";
import { HeaderProps } from "../Header/types";
import Logo from "../Logo";
import ThemeToggler from "../ThemeToggler";

import apiService from "@/services/api";
import { RootState } from "@/store";
import { markAsRead, markAllRead } from "@/store/slices/notificationsSlice";

export default function MobileHeader({
  title = "My Website",
  links = DEFAULT_LINKS,
  className = "bg-blue-600 text-white p-4",
  logoHref = "/",
}: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);
  const { items: notifications, unreadCount } = useSelector(
    (state: RootState) => state.notifications,
  );

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

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      <header
        className={`${className.replace("p-4", "py-4")} md:hidden sticky top-0 z-40 shadow-md w-full`}
      >
        <div className="w-full flex justify-between items-center px-4">
          <div className="flex-shrink-0 mr-2">
            <Logo title={title} href={logoHref} />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggler />
            {isAuthenticated && (
              <>
                <Link
                  href="/PurchaseOrders"
                  className="flex items-center p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <ShoppingCart className="w-6 h-6 text-white" />
                </Link>
                <Link
                  href="/Wishlist"
                  className="flex items-center p-2 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                >
                  <div className="relative">
                    <Heart className="w-6 h-6 text-white" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-sm">
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
            <HamburgerButton onClick={openDrawer} />
          </div>
        </div>
      </header>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onOpen={openDrawer}
        title={title}
        logoHref={logoHref}
        links={links}
        className={className}
      />
    </>
  );
}
