export interface NavLink {
  href: string;
  label: string;
}

export const DEFAULT_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/inventory", label: "Inventory" },
  { href: "/example", label: "Example" },
  { href: "/dashboard", label: "Dashboard" },
];
