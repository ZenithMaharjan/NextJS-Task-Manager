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
import { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setUser, logout } from "../../store/slices/userSlice";
import { clearWishlist, setWishlist } from "../../store/slices/wishlistSlice";

import { NavLink } from "../Header/types";
import Logo from "../Logo";

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
  const dispatch = useDispatch();
  const pathname = usePathname();
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);
  const { currentUser, isAuthenticated } = useSelector((state: RootState) => state.user);


  const handleLogout = useCallback(() => {
    dispatch(logout());
    dispatch(clearWishlist());
    onClose();
  }, [dispatch, onClose]);

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
            }}
            aria-label="Close menu"
          >
            <X size={24} />
          </IconButton>
        </Box>

        <List sx={{ padding: "16px" }}>
          {links.map((link) => {
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
                  href="/wishlist"
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
                  href="/notifications"
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
                    }}
                  >
                    <div className="relative">
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {unreadCount}
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
                  }}
                >
                  <User size={20} className="text-blue-300" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-blue-200 uppercase font-bold opacity-70">
                      Profile
                    </span>
                    <span className="text-sm font-semibold">{currentUser?.name}</span>
                  </div>
                </Box>
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
                href="/login"
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
      onClose,
      wishlistCount,
      isAuthenticated,
      currentUser,
      handleLogout,
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
