import { NavLink } from "../../constants/navigation";
export type { NavLink };

export interface HeaderProps {
  title?: string;
  links?: NavLink[];
  className?: string;
  logoHref?: string;
  activeClassName?: string;
  linkClassName?: string;
  containerClassName?: string;
}
