import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, LogOut, ChevronsUpDown } from "lucide-react";
import type { ReactNode } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useRealtimeSync } from "@/hooks/use-realtime";
import { visibleSections } from "./nav-config";
import { ROLE_LABELS, primaryRole } from "@/lib/permissions";
import { brandingFromTrust, initialsOf, PLATFORM } from "@/lib/branding";

function AppSidebar() {
  const { session, roles } = useSession();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const branding = brandingFromTrust(session.trusts[0] ?? null);
  const sections = visibleSections(roles);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary font-mono text-xs font-bold text-sidebar-primary-foreground">
            {initialsOf(branding.displayName)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                {branding.displayName}
              </p>
              <p className="truncate text-[11px] text-sidebar-foreground/60">{PLATFORM.name}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.heading}>
            <SidebarGroupLabel>{section.heading}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.to || pathname.startsWith(`${item.to}/`)}
                      tooltip={item.label}
                    >
                      <Link to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && (
          <p className="px-2 pb-1 text-[11px] text-sidebar-foreground/50">
            Powered by {PLATFORM.vendor}
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

function BranchSwitcher() {
  const { session, branchId, setBranchId } = useSession();
  if (session.branches.length === 0) return null;

  return (
    <Select
      value={branchId ?? "all"}
      onValueChange={(value) => setBranchId(value === "all" ? null : value)}
    >
      <SelectTrigger className="h-8 w-[200px] text-xs">
        <SelectValue placeholder="Select branch" />
      </SelectTrigger>
      <SelectContent>
        {session.branches.length > 1 && <SelectItem value="all">All branches</SelectItem>}
        {session.branches.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function UserMenu() {
  const { session, roles } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = primaryRole(roles);
  const name = session.profile?.full_name || session.email || "Account";
  const publicSiteUrl =
    (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.trim() || "/";

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-sm hover:bg-muted">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
          {initialsOf(name)}
        </span>
        <span className="hidden max-w-[140px] truncate sm:inline">{name}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="truncate text-sm">{name}</div>
          <div className="truncate text-xs font-normal text-muted-foreground">{session.email}</div>
          {role && (
            <Badge variant="secondary" className="mt-2 text-[10px]">
              {ROLE_LABELS[role]}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={publicSiteUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" /> Back to Main Website
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/erp/dashboard">
            <ExternalLink className="mr-2 h-4 w-4" /> SVRST ERP
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  useRealtimeSync();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur">
            <SidebarTrigger />
            <BranchSwitcher />
            <div className="ml-auto">
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8">
            <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
