import {
  Home,
  Plus,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
  isCreate?: boolean;
}

export const navigationItems: NavigationItem[] = [
  { label: "Home", path: "/", icon: Home },
  { label: "Search", path: "/search", icon: Search },
  { label: "Create", path: "/create", icon: Plus, isCreate: true },
  {
    label: "Communities",
    path: "/communities",
    icon: UsersRound,
  },
  { label: "Profile", path: "/profile", icon: UserRound },
];
