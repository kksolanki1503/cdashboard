import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useLocation } from "react-router";

interface ModuleContextType {
  moduleName: string;
  setModuleName: (name: string) => void;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export const ModuleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [moduleName, setModuleName] = useState<string>("Dashboard");
  const location = useLocation();

  // Update module name based on route
  useEffect(() => {
    const path = location.pathname;

    if (path === "/") {
      setModuleName("Dashboard");
    } else if (path === "/admin") {
      setModuleName("Admin Panel");
    } else if (path.startsWith("/admin")) {
      // Handle admin sub-routes if needed
      setModuleName("Admin Panel");
    } else {
      // Extract module name from path
      const segments = path.split("/").filter(Boolean);
      if (segments.length > 0) {
        const name = segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
        setModuleName(name);
      }
    }
  }, [location.pathname]);

  return (
    <ModuleContext.Provider value={{ moduleName, setModuleName }}>
      {children}
    </ModuleContext.Provider>
  );
};

export const useModule = (): ModuleContextType => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error("useModule must be used within a ModuleProvider");
  }
  return context;
};

export default ModuleContext;
