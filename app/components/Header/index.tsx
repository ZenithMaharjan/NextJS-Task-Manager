"use client";

import React, { useMemo } from "react";
import { useSelector } from "react-redux";

import { ADMIN_LINKS, DEFAULT_LINKS } from "../../constants/navigation";
import DesktopHeader from "../DesktopHeader";
import MobileHeader from "../MobileHeader";
import { HeaderProps, NavLink } from "./types";

import { useNotificationsPolling } from "@/hooks/useNotificationsPolling";
import { RootState } from "@/store";

export default function Header({
  title = "My Website",
  links = DEFAULT_LINKS,
  className = "bg-blue-600 text-white p-4",
  logoHref = "/",
  activeClassName = "underline font-semibold",
  linkClassName = "hover:underline px-2 transition-all",
  containerClassName = "container mx-auto flex justify-between items-center",
}: HeaderProps) {
  useNotificationsPolling();

  const { currentUser } = useSelector((state: RootState) => state.user);

  const allLinks = useMemo(() => {
    if (currentUser?.isAdmin) {
      return [...links, ...ADMIN_LINKS];
    }
    return links;
  }, [links, currentUser]);

  return (
    <>
      <DesktopHeader
        title={title}
        links={allLinks}
        className={className}
        logoHref={logoHref}
        activeClassName={activeClassName}
        linkClassName={linkClassName}
        containerClassName={containerClassName}
      />
      <MobileHeader title={title} links={allLinks} className={className} logoHref={logoHref} />
    </>
  );
}

export type { NavLink, HeaderProps };
