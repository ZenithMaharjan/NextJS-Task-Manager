"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { X, Heart } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

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
  const pathname = usePathname();
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);

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
                    }}
                  >
                    <ListItemText primary={link.label} />
                  </ListItemButton>
                </Link>
              </ListItem>
            );
          })}

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
        </List>
      </Box>
    ),
    [boxBgColor, title, logoHref, links, handleLinkClick, checkActive, onClose, wishlistCount],
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
