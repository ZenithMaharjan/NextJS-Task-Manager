"use client";

import DesktopHeader from "../DesktopHeader";
import MobileHeader from "../MobileHeader";
import { useNotificationsPolling } from "@/hooks/useNotificationsPolling";
import { HeaderProps, NavLink } from "./types";

import { DEFAULT_LINKS } from "../../constants/navigation";

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
  return (
    <>
      <DesktopHeader
        title={title}
        links={links}
        className={className}
        logoHref={logoHref}
        activeClassName={activeClassName}
        linkClassName={linkClassName}
        containerClassName={containerClassName}
      />
      <MobileHeader title={title} links={links} className={className} logoHref={logoHref} />
    </>
  );
}

export type { NavLink, HeaderProps };
