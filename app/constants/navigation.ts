export interface NavLink {
  href: string;
  label: string;
}

export const DEFAULT_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/example", label: "Example" },
  { href: "/dashboard", label: "Dashboard" },
];
