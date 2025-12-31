"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

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

  const boxBgColor = React.useMemo(() => {
    return className.includes("bg-[")
      ? className.match(/bg-\[([^\]]+)\]/)?.[1] || "#0a2b5c"
      : "#0a2b5c";
  }, [className]);

  const isActiveLink = React.useCallback(
    (href: string): boolean => {
      if (href === "/") return pathname === "/";
      return pathname.startsWith(href);
    },
    [pathname],
  );

  const handleLinkClick = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const drawerContent = React.useMemo(
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
            const active = isActiveLink(link.href);
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
        </List>
      </Box>
    ),
    [boxBgColor, title, logoHref, links, handleLinkClick, isActiveLink, onClose],
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
