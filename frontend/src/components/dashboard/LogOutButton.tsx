import { SidebarMenu, SidebarMenuItem } from "../ui/sidebar";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { useLogout } from "@/hooks/useAuth";
import { useSidebar } from "@/components/ui/sidebar";

const LogOutButton = () => {
  const logoutMutation = useLogout();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full text-left"
          title={
            isCollapsed
              ? logoutMutation.isPending
                ? "Logging out..."
                : "Log Out"
              : undefined
          }
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && (
            <span className="ml-2">
              {logoutMutation.isPending ? "Logging out..." : "Log Out"}
            </span>
          )}
        </Button>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default LogOutButton;
