import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Save, Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import adminService, {
  type User,
  type Module,
  type Permission,
} from "@/services/admin.service";

interface UserModuleAccess {
  module_id: number;
  module_name: string;
  has_access: boolean;
  source: "role" | "user" | "combined";
}

interface UserPermissions {
  role: { id: number; name: string } | null;
  modules: UserModuleAccess[];
}

const UserPermissionManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [permissionChanges, setPermissionChanges] = useState<
    Record<number, boolean>
  >({});
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: adminService.getAllUsers,
  });

  // Fetch modules
  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ["adminModules"],
    queryFn: adminService.getAllModules,
  });

  // Fetch user permissions when user is selected
  const { data: userPermissionsData, isLoading: permissionsLoading } = useQuery(
    {
      queryKey: ["userPermissions", selectedUserId],
      queryFn: () => adminService.getUserPermissions(parseInt(selectedUserId)),
      enabled: !!selectedUserId,
    },
  );

  // Reset state when user changes
  useEffect(() => {
    if (selectedUserId) {
      setInitialLoaded(false);
      setPermissionChanges({});
    }
  }, [selectedUserId]);

  // Initialize permissionChanges when permissions data is loaded
  useEffect(() => {
    if (
      userPermissionsData?.success &&
      userPermissionsData.data &&
      !initialLoaded
    ) {
      // API returns 'modules' not 'permissions'
      const permissions = userPermissionsData.data.modules || [];
      const initialChanges: Record<number, boolean> = {};

      permissions.forEach((perm: Permission) => {
        if (perm.has_access) {
          initialChanges[perm.module_id] = true;
        }
      });

      setPermissionChanges(initialChanges);
      setInitialLoaded(true);
    }
  }, [userPermissionsData, initialLoaded]);

  const users = usersData?.success ? usersData.data : [];
  const modules = modulesData?.success ? modulesData.data : [];

  // API returns { role, modules } but we use permissions in the component
  const userPermissionsDataVal = userPermissionsData?.success
    ? userPermissionsData.data
    : { role: null, modules: [] as Permission[] };

  // Map permissions to modules for compatibility - API returns 'modules' not 'permissions'
  const userPermissions: UserPermissions = {
    role: userPermissionsDataVal.role,
    modules: (userPermissionsDataVal.modules || []).map((m: any) => ({
      module_id: m.module_id,
      module_name: m.module_name,
      has_access: m.has_access,
      source: m.source,
    })),
  };

  // Create a map of all permissions (role + direct)
  const allPermissionIds = new Set(
    userPermissions.modules.filter((m) => m.has_access).map((m) => m.module_id),
  );

  // Get the source for each module
  const getModuleSource = (
    moduleId: number,
  ): "role" | "user" | "combined" | null => {
    const perm = userPermissions.modules.find((m) => m.module_id === moduleId);
    return perm ? perm.source : null;
  };

  const handlePermissionChange = (moduleId: number, checked: boolean) => {
    setPermissionChanges((prev) => ({
      ...prev,
      [moduleId]: checked,
    }));
  };

  const getPermissionValue = (moduleId: number): boolean => {
    if (permissionChanges[moduleId] !== undefined) {
      return permissionChanges[moduleId];
    }
    return allPermissionIds.has(moduleId);
  };

  const hasChanges = (): boolean => {
    // Check if any permission was removed
    for (const moduleId of allPermissionIds) {
      const currentValue = getPermissionValue(moduleId);
      if (!currentValue) return true;
    }
    // Check if any new permission was added
    for (const [moduleIdStr, newValue] of Object.entries(permissionChanges)) {
      const moduleId = parseInt(moduleIdStr);
      if (!allPermissionIds.has(moduleId) && newValue) return true;
    }
    return Object.keys(permissionChanges).length > 0;
  };

  const handleSaveAll = async () => {
    // Get all modules
    for (const module of modules) {
      const currentHasAccess = allPermissionIds.has(module.id);
      const newValue = getPermissionValue(module.id);

      if (currentHasAccess !== newValue) {
        if (newValue) {
          // Grant permission
          await adminService.setUserPermission({
            user_id: parseInt(selectedUserId),
            module_id: module.id,
          });
        } else {
          // Remove permission
          await adminService.removeUserPermission(
            parseInt(selectedUserId),
            module.id,
          );
        }
      }
    }

    queryClient.invalidateQueries({
      queryKey: ["userPermissions", selectedUserId],
    });
    setPermissionChanges({});
    toast.success("User permissions saved successfully");
  };

  const handleReset = () => {
    // Reset to original permissions
    const initialChanges: Record<number, boolean> = {};
    userPermissions.modules
      .filter((m) => m.has_access)
      .forEach((m) => {
        initialChanges[m.module_id] = true;
      });
    setPermissionChanges(initialChanges);
  };

  if (usersLoading || modulesLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Manage User Permissions</CardTitle>
          <CardDescription>
            Select a user to view and edit their module permissions (including
            role-based access)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">
              Select User
            </label>
            <Select
              value={selectedUserId}
              onValueChange={(value: string) => {
                setSelectedUserId(value);
                setPermissionChanges({});
                setInitialLoaded(false);
              }}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User Role Info */}
      {selectedUserId && userPermissions.role && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              Current Role:{" "}
              <span className="text-blue-600 capitalize">
                {userPermissions.role.name}
              </span>
            </CardTitle>
            <CardDescription>
              This user automatically has access to all modules assigned to
              their role
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Module Permissions - All checked by default */}
      {selectedUserId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Module Permissions</CardTitle>
                <CardDescription>
                  All permissions the user has (from role and direct assignment)
                  are checked
                </CardDescription>
              </div>
              {hasChanges() && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleReset} size="sm">
                    Reset
                  </Button>
                  <Button onClick={handleSaveAll} size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedUserId ? (
              <div className="text-center py-8 text-muted-foreground">
                Please select a user to manage their module permissions
              </div>
            ) : permissionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Module</TableHead>
                      <TableHead className="text-center">Access</TableHead>
                      <TableHead className="text-center w-[100px]">
                        Granted
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No modules found
                        </TableCell>
                      </TableRow>
                    ) : (
                      modules.map((module) => {
                        const hasAccess = getPermissionValue(module.id);
                        const source = getModuleSource(module.id);

                        return (
                          <TableRow key={module.id}>
                            <TableCell className="font-medium">
                              <div>
                                <p className="capitalize">{module.name}</p>
                                {module.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {module.description}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {hasAccess ? (
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                  <Check className="mr-1 h-3 w-3" />
                                  Has Access
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  No Access
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={hasAccess}
                                onCheckedChange={(checked) =>
                                  handlePermissionChange(
                                    module.id,
                                    checked as boolean,
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      {selectedUserId && userPermissions.modules.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-800">
              Current Access Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-green-800">
                  Total Modules Accessible:{" "}
                </span>
                <span className="text-green-700">
                  {userPermissions.modules.filter((m) => m.has_access).length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {userPermissions.modules
                  .filter((m) => m.has_access)
                  .map((m) => (
                    <span
                      key={m.module_id}
                      className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs"
                    >
                      {m.module_name}
                      {m.source === "user" && " (direct)"}
                      {m.source === "role" && " (role)"}
                    </span>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserPermissionManagement;
