"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { X, Heart, User, LogOut, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";

import { logout } from "../../store/slices/userSlice";
import { clearWishlist } from "../../store/slices/wishlistSlice";
import { NavLink } from "../Header/types";
import Logo from "../Logo";

import { useToast } from "@/hooks/useToast";
import { RootState } from "@/store";
import {
  markAsRead as _markAsRead,
  markAllRead as _markAllRead,
} from "@/store/slices/notificationsSlice";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  title: string;
  logoHref: string;
  links: NavLink[];
  className?: string;
}

export default function Drawer({
  isOpen,
  onClose,
  onOpen,
  title,
  logoHref,
  links,
  className = "bg-[#0a2b5c]",
}: DrawerProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);
  const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.user);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    dispatch(clearWishlist());
    showToast("Successfully logged out", "success");
    onClose();
    router.replace("/Login");
  }, [dispatch, onClose, showToast, router]);

  const checkActive = useCallback(
    (href: string): boolean => {
      if (href === "/") return pathname === "/";
      return pathname.startsWith(href);
    },
    [pathname],
  );

  const boxBgColor = useMemo(() => {
    return className.includes("bg-[")
      ? className.match(/bg-\[([^\]]+)\]/)?.[1] || "#0a2b5c"
      : "#0a2b5c";
  }, [className]);

  const handleLinkClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const drawerContent = useMemo(
    () => (
      <Box
        sx={{
          width: 280,
          height: "100%",
          backgroundColor: boxBgColor,
          color: "white",
          borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
        }}
        role="presentation"
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Logo title={title} href={logoHref} onClick={handleLinkClick} />
          <IconButton
            onClick={onClose}
            sx={{
              color: "white",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
              cursor: "pointer",
            }}
            aria-label="Close menu"
          >
            <X size={24} />
          </IconButton>
        </Box>

        <List sx={{ padding: "16px" }}>
          {links.map(link => {
            const active = checkActive(link.href);
            return (
              <ListItem key={link.href} disablePadding sx={{ marginBottom: "8px" }}>
                <Link
                  href={link.href}
                  onClick={handleLinkClick}
                  style={{ width: "100%", textDecoration: "none" }}
                >
                  <ListItemButton
                    sx={{
                      borderRadius: "8px",
                      color: "white",
                      backgroundColor: active ? "rgba(255, 255, 255, 0.2)" : "transparent",
                      fontWeight: active ? 600 : 400,
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                      cursor: "pointer",
                    }}
                  >
                    <ListItemText primary={link.label} />
                  </ListItemButton>
                </Link>
              </ListItem>
            );
          })}

          {isAuthenticated && (
            <>
              <ListItem disablePadding sx={{ marginBottom: "8px" }}>
                <Link
                  href="/Wishlist"
                  onClick={handleLinkClick}
                  style={{ width: "100%", textDecoration: "none" }}
                >
                  <ListItemButton
                    sx={{
                      borderRadius: "8px",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                      cursor: "pointer",
                    }}
                  >
                    <div className="relative">
                      <Heart size={20} />
                      {wishlistCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {wishlistCount}
                        </span>
                      )}
                    </div>
                    <span>Wishlist</span>
                  </ListItemButton>
                </Link>
              </ListItem>

              <ListItem disablePadding sx={{ marginBottom: "8px" }}>
                <Link
                  href="/Notifications"
                  onClick={handleLinkClick}
                  style={{ width: "100%", textDecoration: "none" }}
                >
                  <ListItemButton
                    sx={{
                      borderRadius: "8px",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                      cursor: "pointer",
                    }}
                  >
                    <div className="relative">
                      <Bell size={20} className="text-gray-300" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] rounded-full h-4 min-w-[16px] flex items-center justify-center font-bold px-1 ring-1 ring-[#0a2b5c]">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>
                    <span>Notifications</span>
                  </ListItemButton>
                </Link>
              </ListItem>
            </>
          )}

          {isAuthenticated ? (
            <>
              <ListItem
                disablePadding
                sx={{
                  marginTop: "16px",
                  pt: "16px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Link
                  href="/profile"
                  onClick={handleLinkClick}
                  style={{ width: "100%", textDecoration: "none" }}
                >
                  <Box
                    sx={{
                      px: "16px",
                      py: "8px",
                      borderRadius: "8px",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                      cursor: "pointer",
                    }}
                  >
                    <User size={20} className="text-white" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">
                        {(currentUser?.fullName || currentUser?.name || "").split(" ")[0]}
                      </span>
                    </div>
                  </Box>
                </Link>
              </ListItem>
              <ListItem disablePadding sx={{ marginTop: "8px" }}>
                <ListItemButton
                  onClick={handleLogout}
                  sx={{
                    borderRadius: "8px",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.2)" },
                    cursor: "pointer",
                  }}
                >
                  <LogOut size={20} className="text-red-400" />
                  <span className="text-sm font-semibold">Logout</span>
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <ListItem
              disablePadding
              sx={{
                marginTop: "16px",
                pt: "16px",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Link
                href="/Login"
                onClick={handleLinkClick}
                style={{ width: "100%", textDecoration: "none" }}
              >
                <ListItemButton
                  sx={{
                    borderRadius: "8px",
                    color: "white",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.15)" },
                    cursor: "pointer",
                  }}
                >
                  <User size={20} />
                  <span className="text-sm font-bold">Sign In</span>
                </ListItemButton>
              </Link>
            </ListItem>
          )}
        </List>
      </Box>
    ),
    [
      boxBgColor,
      title,
      logoHref,
      links,
      handleLinkClick,
      checkActive,
      unreadCount,
      wishlistCount,
      isAuthenticated,
      currentUser,
      handleLogout,
      onClose,
    ],
  );

  return (
    <SwipeableDrawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      onOpen={onOpen}
      sx={{
        display: { xs: "block", md: "none" },
        "& .MuiDrawer-paper": { boxSizing: "border-box" },
      }}
    >
      {drawerContent}
    </SwipeableDrawer>
  );
}
