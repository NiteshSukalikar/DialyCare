import {
  Activity,
  BarChart3,
  CalendarPlus,
  FileText,
  Home,
  Pill,
  Repeat2,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export const mainRoutes = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/patient-setup", label: "Patient", icon: UserRound },
  { href: "/add-session", label: "Add", icon: CalendarPlus },
  { href: "/history", label: "History", icon: Activity },
  { href: "/dialyzer", label: "Dialyzer", icon: Repeat2 },
  { href: "/medicines", label: "Medicines", icon: Pill },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/backup", label: "Backup", icon: ShieldCheck },
] as const;

export type AppRoute = (typeof mainRoutes)[number];
