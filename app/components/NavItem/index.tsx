"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavItemProps {
  href: string;
  label: string;
  onClick?: () => void;
  isMobile?: boolean;
  linkClassName?: string;
  activeClassName?: string;
}

export default function NavItem({
  href,
  label,
  onClick,
  isMobile = false,
  linkClassName = "hover:underline px-2 transition-all",
  activeClassName = "underline font-semibold",
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  if (isMobile) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`py-3 px-4 hover:bg-white/10 rounded-lg transition cursor-pointer ${
          isActive ? "bg-white/20 font-semibold" : ""
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`${linkClassName} ${isActive ? activeClassName : ""} cursor-pointer`}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </Link>
  );
}
