export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export interface NavigationProps {
  currentPath: string;
  onLogout?: () => void;
}
