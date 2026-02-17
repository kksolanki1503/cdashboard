"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Settings2,
  SquareTerminal,
  HomeIcon,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { NavMain } from "@/components/dashboard/nav-main";

import { TeamSwitcher } from "@/components/dashboard/team-switcher";
import Logo from "@/assets/images/alpha-targeting-logo.png";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import LogOutButton from "./LogOutButton";
import { useAppSelector } from "@/store/hooks";

// Icon mapping for modules
const moduleIconMap: Record<string, LucideIcon> = {
  dashboard: HomeIcon,
  playground: SquareTerminal,
  models: Bot,
  documentation: BookOpen,
  settings: Settings2,
  admin: Shield,
};

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: Logo,
      url: "#",
    },
  ],
};

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const modules = useAppSelector((state) => state.auth.modules);
  const user = useAppSelector((state) => state.auth.user);

  // Convert modules to navigation items
  const navItems: NavItem[] = React.useMemo(() => {
    const items: NavItem[] = modules
      .filter((module) => module.can_read)
      .map((module) => {
        const moduleName = module.module_name.toLowerCase();
        const icon = moduleIconMap[moduleName] || HomeIcon;

        return {
          title: module.module_name,
          url: `/${moduleName}`,
          icon,
          isActive: moduleName === "dashboard",
        };
      });

    // Add Admin panel for users with admin role or admin module access
    const hasAdminAccess = modules.some(
      (m) => m.module_name.toLowerCase() === "admin" && m.can_read,
    );

    // Check if user has admin role (you may need to adjust this based on your role structure)
    const isAdmin = user && (user as { role?: string }).role === "admin";

    if (hasAdminAccess || isAdmin) {
      // Check if admin is not already in the list
      if (!items.some((item) => item.title.toLowerCase() === "admin")) {
        items.push({
          title: "Admin",
          url: "/admin",
          icon: Shield,
          isActive: false,
        });
      }
    }

    return items;
  }, [modules, user]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <LogOutButton />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
