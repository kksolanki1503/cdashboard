import { Outlet, useLocation } from "react-router";
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
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const { moduleName } = useModule();
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle module name transition animation
  const [displayModuleName, setDisplayModuleName] = useState(moduleName);
  const [isTitleTransitioning, setIsTitleTransitioning] = useState(false);

  // Trigger page transition on route change
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 150);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Handle module name transition
  useEffect(() => {
    if (moduleName !== displayModuleName) {
      setIsTitleTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayModuleName(moduleName);
        setIsTitleTransitioning(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [moduleName, displayModuleName]);

  // Prepare user data for NavUser component with fallbacks
  const userData = user
    ? {
        name: user.name,
        email: user.email,
        avatar: "",
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
        <header className="bg-background sticky top-0 flex border-b p-4 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 justify-between z-999">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h1
              className={`text-lg font-semibold transition-all duration-100 ${
                isTitleTransitioning
                  ? "opacity-0 translate-x-2"
                  : "opacity-100 translate-x-0"
              }`}
            >
              {displayModuleName}
            </h1>
          </div>
          <div>
            <NavUser user={userData} />
          </div>
        </header>

        {/* Child routes render here with transition animation */}
        <div
          className={`transition-all duration-150 ease-in-out ${
            isTransitioning
              ? "opacity-0 translate-y-1"
              : "opacity-100 translate-y-0"
          }`}
        >
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
