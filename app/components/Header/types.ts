export interface NavLink {
  href: string;
  label: string;
}

export interface HeaderProps {
  title?: string;
  links?: NavLink[];
  className?: string;
  logoHref?: string;
  activeClassName?: string;
  linkClassName?: string;
  containerClassName?: string;
}
