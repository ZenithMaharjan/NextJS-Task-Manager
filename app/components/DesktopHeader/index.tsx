import { useSelector } from "react-redux";
import { Heart } from "lucide-react";
import Link from "next/link";
import { RootState } from "@/store";

import { HeaderProps } from "../Header/types";
import Logo from "../Logo";
import NavLinks from "../NavLinks";

import { DEFAULT_LINKS } from "../../constants/navigation";

export default function DesktopHeader({
  title = "My Website",
  links = DEFAULT_LINKS,
  className = "bg-blue-600 text-white p-4",
  logoHref = "/",
  activeClassName = "underline font-semibold",
  linkClassName = "hover:underline px-2 transition-all",
  containerClassName = "container mx-auto flex justify-between items-center",
}: HeaderProps) {
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);

  return (
    <header className={`${className} hidden md:block`}>
      <nav className={containerClassName}>
        <Logo title={title} href={logoHref} />
        <div className="flex items-center gap-6">
          <NavLinks links={links} linkClassName={linkClassName} activeClassName={activeClassName} />
          <Link
            href="/wishlist"
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </div>
          </Link>
        </div>
      </nav>
    </header>
  );
}
