"use client";

import * as React from "react";
import {
  HomeIcon,
  Shield,
  BarChart3,
  Megaphone,
  Link2,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { NavMain } from "@/components/dashboard/nav-main";

import { OrgSwitcher } from "@/components/dashboard/org-switcher";
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
  reports: BarChart3,
  campaign: Megaphone,
  "campaign-links": Link2,
  "campaign-upload-csv": Upload,
  admin: Shield,
};

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: Logo,
      url: "/",
    },
  ],
};

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: {
    title: string;
    url: string;
  }[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const modules = useAppSelector((state) => state.auth.modules);
  const user = useAppSelector((state) => state.auth.user);

  // Convert modules to navigation items with grouping by parent_id
  const navItems: NavItem[] = React.useMemo(() => {
    // Separate root modules (parent_id === null) and child modules
    const rootModules = modules.filter((m) => m.parent_id === null);
    const childModules = modules.filter((m) => m.parent_id !== null);

    const items: NavItem[] = rootModules.map((module) => {
      const moduleName = module.module_name.toLowerCase();
      const icon = moduleIconMap[moduleName] || HomeIcon;
      const url = moduleName === "dashboard" ? "/" : `/${moduleName}`;

      // Find child modules
      const children = childModules
        .filter((child) => child.parent_id === module.module_id)
        .map((child) => {
          const childName = child.module_name.toLowerCase();
          const childIcon = moduleIconMap[childName] || HomeIcon;
          // Child URL should be parent_route/child_route
          const childUrl = `/${moduleName}/${childName}`;
          return {
            title: child.module_name,
            url: childUrl,
            icon: childIcon,
          };
        });

      return {
        title: module.module_name,
        url,
        icon,
        ...(children.length > 0 && { items: children }),
      };
    });

    // Add Admin panel for users with admin role or admin module access
    const hasAdminAccess = modules.some(
      (m) => m.module_name.toLowerCase() === "admin",
    );

    // Check if user has admin role
    const isAdmin = user && (user as { role?: string }).role === "admin";

    if (hasAdminAccess || isAdmin) {
      // Check if admin is not already in the list
      if (!items.some((item) => item.title.toLowerCase() === "admin")) {
        items.push({
          title: "Admin",
          url: "/admin",
          icon: Shield,
        });
      }
    }

    return items;
  }, [modules, user]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrgSwitcher teams={data.teams} />
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
