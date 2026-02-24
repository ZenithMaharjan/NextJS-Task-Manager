export interface NavLink {
  href: string;
  label: string;
}

export const DEFAULT_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/Inventory", label: "Inventory" },
  { href: "/Example", label: "Example" },
  { href: "/Dashboard", label: "Dashboard" },
];
