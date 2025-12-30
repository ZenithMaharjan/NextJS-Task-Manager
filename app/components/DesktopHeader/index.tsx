"use client";

import Logo from "../Logo";
import NavLinks from "../NavLinks";
import { HeaderProps } from "../Header/types";

const DEFAULT_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function DesktopHeader({
  title = "My Website",
  links = DEFAULT_LINKS,
  className = "bg-blue-600 text-white p-4",
  logoHref = "/",
  activeClassName = "underline font-semibold",
  linkClassName = "hover:underline px-2 transition-all",
  containerClassName = "container mx-auto flex justify-between items-center",
}: HeaderProps) {
  return (
    <header className={`${className} hidden md:block`}>
      <nav className={containerClassName}>
        <Logo title={title} href={logoHref} />
        <NavLinks
          links={links}
          linkClassName={linkClassName}
          activeClassName={activeClassName}
        />
      </nav>
    </header>
  );
}
