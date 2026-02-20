import { Outlet } from "react-router";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { useAuth } from "@/hooks/useAuth";
import { useModule } from "@/contexts/ModuleContext";

export default function Dashboard() {
  const { user } = useAuth();
  const { moduleName } = useModule();

  // Prepare user data for NavUser component with fallbacks
  const userData = user
    ? {
        name: user.name,
        email: user.email,
        avatar: "", // Avatar can be added later if needed
      }
    : {
        name: "Guest",
        email: "",
        avatar: "",
      };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex border-b p-4 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 justify-between">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-lg font-semibold">{moduleName}</h1>
          </div>
          <div>
            <NavUser user={userData} />
          </div>
        </header>

        {/* Child routes render here */}
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
