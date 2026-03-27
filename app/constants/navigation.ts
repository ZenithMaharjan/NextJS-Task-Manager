export interface NavLink {
  href: string;
  label: string;
}

export const DEFAULT_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/Inventory", label: "Inventory" },
  { href: "/Dashboard", label: "Dashboard" },
];

export const ADMIN_LINKS: NavLink[] = [{ href: "/admin/job-card", label: "Admin" }];
