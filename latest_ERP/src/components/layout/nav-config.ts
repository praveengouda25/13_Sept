import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Users,
  GraduationCap,
  Settings,
  ScrollText,
  Landmark,
  ClipboardList,
  CalendarCheck,
  PlaneTakeoff,
  HeartHandshake,
  Receipt,
  Boxes,
  AlertOctagon,
  UserCog,
  FileBarChart,
  Bell,
  MessageSquareWarning,
  Wrench,
  Ticket,
  Shield,
  Package,
  ChefHat,
} from "lucide-react";
import type { AppRole } from "@/lib/permissions";

export type NavItem = {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  roles: AppRole[];
};

export type NavSection = { heading: string; items: NavItem[] };

const ADMINS: AppRole[] = ["super_admin", "trust_admin", "branch_admin"];
const OPS: AppRole[] = [...ADMINS, "warden"];
const FINANCE: AppRole[] = [...ADMINS, "accountant"];
const SECURITY_MODULES: AppRole[] = [...OPS, "security_guard"]; // Admins + security guard can see visitors/gate pass
const SECURITY_DASHBOARD: AppRole[] = ["security_guard", ...OPS]; // Security dashboard for security guard + admins
const STOCK: AppRole[] = [...OPS, "inventory_manager"];
const KITCHEN: AppRole[] = ["kitchen_staff"];
const KITCHEN_MODULES: AppRole[] = [...KITCHEN, ...OPS]; // Kitchen staff see same as OPS for these modules
const ALL: AppRole[] = [
  ...OPS,
  "teacher",
  "accountant",
  "inventory_manager",
  "student",
  "parent",
  "donor",
];

export const NAV_SECTIONS: NavSection[] = [
  {
    heading: "Overview",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: ALL },
      { label: "Notifications", to: "/notifications", icon: Bell, roles: ALL },
    ],
  },
  {
    heading: "Operations",
    items: [
      { label: "Admissions", to: "/admissions", icon: ClipboardList, roles: OPS },
      {
        label: "Students",
        to: "/students",
        icon: GraduationCap,
        roles: [...OPS, "teacher", "accountant"],
      },
      { label: "Hostels", to: "/hostels", icon: BedDouble, roles: OPS },
      {
        label: "Attendance",
        to: "/attendance",
        icon: CalendarCheck,
        roles: [...OPS, "teacher"],
      },
      {
        label: "Leave",
        to: "/leave",
        icon: PlaneTakeoff,
        roles: [...OPS, "teacher", "kitchen_staff"],
      },
      {
        label: "Issue register",
        to: "/issues",
        icon: AlertOctagon,
        roles: [...OPS, "kitchen_staff"],
      },
      {
        label: "Complaints",
        to: "/complaints",
        icon: MessageSquareWarning,
        roles: [...OPS, "teacher", "kitchen_staff"],
      },
      { label: "Maintenance", to: "/maintenance", icon: Wrench, roles: [...OPS, "kitchen_staff"] },
      { label: "Inventory", to: "/inventory", icon: Package, roles: [...STOCK, "kitchen_staff"] },
      { label: "Visitors", to: "/visitors", icon: Users, roles: SECURITY_MODULES },
      { label: "Gate Pass", to: "/gate-pass", icon: Ticket, roles: SECURITY_MODULES },
      { label: "Security", to: "/security", icon: Shield, roles: SECURITY_DASHBOARD },
      { label: "Medical", to: "/medical", icon: HeartHandshake, roles: [...OPS, "kitchen_staff"] },
      { label: "Kitchen & mess", to: "/mess", icon: ChefHat, roles: [...OPS, "kitchen_staff"] },
      { label: "Assets", to: "/assets", icon: Package, roles: [...STOCK, "kitchen_staff"] },
    ],
  },
  {
    heading: "Finance",
    items: [
      { label: "Financial dashboard", to: "/finance", icon: FileBarChart, roles: FINANCE },

      { label: "Donations", to: "/donations", icon: HeartHandshake, roles: FINANCE },
      { label: "Expenses", to: "/expenses", icon: Receipt, roles: FINANCE },
    ],
  },
  {
    heading: "Administration",
    items: [
      { label: "Staff", to: "/staff", icon: UserCog, roles: ADMINS },
      { label: "Reports", to: "/reports", icon: FileBarChart, roles: [...OPS, "accountant"] },
      { label: "Branches", to: "/branches", icon: Building2, roles: ADMINS },
      { label: "Team & roles", to: "/team", icon: Users, roles: ADMINS },
      {
        label: "Trust & branding",
        to: "/trust",
        icon: Landmark,
        roles: ["super_admin", "trust_admin"],
      },
      { label: "Audit log", to: "/audit", icon: ScrollText, roles: ADMINS },
    ],
  },
  {
    heading: "Account",
    items: [{ label: "Settings", to: "/settings", icon: Settings, roles: ALL }],
  },
];

export function visibleSections(roles: AppRole[]): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.some((r) => roles.includes(r))),
  })).filter((section) => section.items.length > 0);
}
