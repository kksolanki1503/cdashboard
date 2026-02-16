import { SidebarMenu, SidebarMenuItem } from "../ui/sidebar";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
const LogOutButton = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Button
          onClick={() => {
            // Implement your logout logic here
            console.log("Logging out...");
          }}
          className="w-full text-left"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default LogOutButton;
