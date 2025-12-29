"use client";

import { useState } from "react";
import Logo from "../Logo/page";
import HamburgerButton from "../HamburgerButton/page";
import Drawer from "../Drawer/page";
import { HeaderProps } from "../Header/types";

const DEFAULT_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function MobileHeader({
  title = "My Website",
  links = DEFAULT_LINKS,
  className = "bg-blue-600 text-white p-4",
  logoHref = "/",
}: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      <header className={`${className} md:hidden`}>
        <div className="container mx-auto flex justify-between items-center">
          <Logo title={title} href={logoHref} />
          <HamburgerButton onClick={openDrawer} />
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
