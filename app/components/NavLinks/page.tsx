"use client";

import { NavLink } from "../Header/types";
import NavItem from "../NavItem/page";

interface NavLinksProps {
  links: NavLink[];
  linkClassName?: string;
  activeClassName?: string;
  onClick?: () => void;
  isMobile?: boolean;
}

export default function NavLinks({
  links,
  linkClassName = "hover:underline px-2 transition-all",
  activeClassName = "underline font-semibold",
  onClick,
  isMobile = false,
}: NavLinksProps) {
  const renderNavItems = () => {
    return links.map((link) => (
      <NavItem
        key={link.href}
        href={link.href}
        label={link.label}
        onClick={onClick}
        isMobile={isMobile}
        linkClassName={linkClassName}
        activeClassName={activeClassName}
      />
    ));
  };

  if (isMobile) {
    return <nav className="flex flex-col p-4">{renderNavItems()}</nav>;
  }

  return <div className="flex gap-10">{renderNavItems()}</div>;
}
