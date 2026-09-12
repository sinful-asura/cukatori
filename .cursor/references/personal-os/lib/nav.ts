import {
  LayoutDashboard,
  Target,
  CheckSquare,
  Dumbbell,
  Clapperboard,
  Wallet,
  BookOpen,
  BarChart3,
  Clock3,
  Trophy,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_PRIMARY: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/habits", label: "Habits", icon: CheckSquare },
  { href: "/exercise", label: "Exercise", icon: Dumbbell },
  { href: "/entertainment", label: "Entertainment", icon: Clapperboard },
];

export const NAV_SECONDARY: NavItem[] = [
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/timeline", label: "Timeline", icon: Clock3 },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const NAV_ITEMS: NavItem[] = [...NAV_PRIMARY, ...NAV_SECONDARY];
