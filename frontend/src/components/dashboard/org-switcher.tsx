"use client";

import * as React from "react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router";
import { useSidebar } from "@/components/ui/sidebar";

export function OrgSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: string;
    url: string;
  }[];
}) {
  const [activeTeam] = React.useState(teams[0]);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link
            to={activeTeam.url}
            className="w-full"
            style={{
              overflow: "hidden",
              padding: isCollapsed ? "0.5rem" : "0.5rem",
            }}
          >
            <img
              src={activeTeam.logo}
              alt={activeTeam.name}
              style={{
                width: isCollapsed ? "92px" : "80%",
                height: "auto",
                objectFit: "contain",
                objectPosition: "left center",
                maxWidth: isCollapsed ? "92px" : "none",
              }}
              className={isCollapsed ? "logo-collapsed" : "logo-expanded"}
            />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
