"use client";

import { useState } from "react";

import { DEFAULT_LINKS } from "../../constants/navigation";
import Drawer from "../Drawer";
import HamburgerButton from "../HamburgerButton";
import { HeaderProps } from "../Header/types";
import Logo from "../Logo";
import ThemeToggler from "../ThemeToggler";

export default function MobileHeader({
  title = "My Website",
  links = DEFAULT_LINKS,
  className = "bg-blue-600 text-white p-4",
  logoHref = "/",
}: HeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      <header className={`${className} md:hidden sticky top-0 z-40 shadow-md`}>
        <div className="container mx-auto flex justify-between items-center px-4 py-2">
          <Logo title={title} href={logoHref} />
          <div className="flex items-center gap-3">
            <ThemeToggler />
            <HamburgerButton onClick={openDrawer} />
          </div>
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
