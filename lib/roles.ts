import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  Search,
  Users,
  Handshake,
  CheckSquare,
  ShieldCheck,
  Folder,
  CreditCard,
  Wrench,
  FlaskConical,
  Settings,
  FileText,
  CircleUser,
  UserCog,
} from "lucide-react";
import { ENTITY_LABELS } from "@/lib/labels";

export type Role = "admin" | "recruiter" | "athlete";

export const ROLES: Role[] = ["admin", "recruiter", "athlete"];

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin View",
  recruiter: `${ENTITY_LABELS.recruiter.singular} View`,
  athlete: `${ENTITY_LABELS.athlete.singular} View`,
};

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { label: ENTITY_LABELS.athlete.plural, href: "/athletes", icon: Users },
    { label: ENTITY_LABELS.prospect.plural, href: "/prospects", icon: Search },
    { label: ENTITY_LABELS.nilDeal.plural, href: "/nil-deals", icon: Handshake },
    { label: ENTITY_LABELS.recruiter.plural, href: "/recruiters", icon: UserCog },
    { label: "Tasks", href: "/tasks", icon: CheckSquare },
    { label: "Compliance", href: "/compliance", icon: ShieldCheck },
    { label: "Documents", href: "/documents", icon: Folder },
    { label: ENTITY_LABELS.payment.plural, href: "/payments", icon: CreditCard },
    { label: "Operator", href: "/operator", icon: Wrench },
    { label: "Settings", href: "/settings", icon: Settings },
    {
      label: "System QA",
      href: "/system-qa",
      icon: FlaskConical,
      badge: "ADMIN",
    },
  ],
  recruiter: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { label: ENTITY_LABELS.prospect.plural, href: "/prospects", icon: Search },
    { label: ENTITY_LABELS.athlete.plural, href: "/athletes", icon: Users },
    { label: "Tasks", href: "/tasks", icon: CheckSquare },
    { label: "Notes / Activity", href: "/notes", icon: FileText },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  athlete: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { label: "My Deals", href: "/my-deals", icon: Handshake },
    { label: "My Tasks", href: "/my-tasks", icon: CheckSquare },
    { label: "My Documents", href: "/my-documents", icon: Folder },
    { label: "My Compliance", href: "/my-compliance", icon: ShieldCheck },
    { label: "My Profile", href: "/my-profile", icon: CircleUser },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
};

export interface RoleUser {
  name: string;
  initials: string;
  subtitle: string;
}

export const ROLE_USER: Record<Role, RoleUser> = {
  admin: { name: "Tundra Admin", initials: "TA", subtitle: "Admin" },
  recruiter: {
    name: "Marcus Webb",
    initials: "MW",
    subtitle: ENTITY_LABELS.recruiter.singular,
  },
  athlete: {
    name: "Caleb Fontaine",
    initials: "CF",
    subtitle: ENTITY_LABELS.athlete.singular,
  },
};
