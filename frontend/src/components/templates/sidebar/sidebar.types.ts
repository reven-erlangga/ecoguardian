import type { Component } from 'svelte';

export interface SidebarItem {
  href: string;
  label: string;
  iconComponent?: Component<any>;
}

export interface SidebarGroup {
  label?: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  currentPath: string;
}