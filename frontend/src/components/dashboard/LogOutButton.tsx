import { SidebarMenu, SidebarMenuItem } from "../ui/sidebar";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { useLogout } from "@/hooks/useAuth";

const LogOutButton = () => {
  const logoutMutation = useLogout();

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
        >
          <LogOut className="mr-2 h-4 w-4" />
          {logoutMutation.isPending ? "Logging out..." : "Log Out"}
        </Button>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default LogOutButton;
