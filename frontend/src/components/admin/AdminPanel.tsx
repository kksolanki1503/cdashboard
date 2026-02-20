import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Shield,
  Layers,
  Key,
  LayoutDashboard,
  UserCog,
} from "lucide-react";
import UserManagement from "./UserManagement";
import RoleManagement from "./RoleManagement";
import ModuleManagement from "./ModuleManagement";
import PermissionManagement from "./PermissionManagement";
import UserPermissionManagement from "./UserPermissionManagement";
import DashboardStats from "./DashboardStats";
import { useModule } from "@/contexts/ModuleContext";

const tabNames: Record<string, string> = {
  dashboard: "Admin Dashboard",
  users: "User Management",
  roles: "Role Management",
  modules: "Module Management",
  permissions: "Role Permissions",
  userPermissions: "User Permissions",
};

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const { setModuleName } = useModule();

  // Update module name when tab changes
  useEffect(() => {
    setModuleName(tabNames[activeTab] || "Admin Panel");
  }, [activeTab, setModuleName]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-6 w-full max-w-[900px]">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Roles</span>
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Modules</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">Role Perms</span>
          </TabsTrigger>
          <TabsTrigger
            value="userPermissions"
            className="flex items-center gap-2"
          >
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">User Perms</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <DashboardStats />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <ModuleManagement />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <PermissionManagement />
        </TabsContent>

        <TabsContent value="userPermissions" className="space-y-4">
          <UserPermissionManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
