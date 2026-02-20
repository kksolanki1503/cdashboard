import React, { useState } from "react";
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
import { Save, UserPlus, UserMinus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import adminService, { type User, type Module } from "@/services/admin.service";

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
  const [extraModuleChanges, setExtraModuleChanges] = useState<
    Record<number, boolean>
  >({});

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

  // Set user module permission mutation
  const setUserModuleMutation = useMutation({
    mutationFn: async ({
      moduleId,
      grant,
    }: {
      moduleId: number;
      grant: boolean;
    }) => {
      if (grant) {
        return adminService.setUserPermission({
          user_id: parseInt(selectedUserId),
          module_id: moduleId,
        });
      }
      // For removing, we need a different approach - the API doesn't have delete yet
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userPermissions", selectedUserId],
      });
      toast.success("User permission updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update permission: ${error.message}`);
    },
  });

  const users = usersData?.success ? usersData.data : [];
  const modules = modulesData?.success ? modulesData.data : [];
  // @ts-ignore - API returns permissions but our type uses modules
  const userPermissionsDataVal = userPermissionsData?.success
    ? userPermissionsData.data
    : { role: null, permissions: [] };

  // Map permissions to modules for compatibility
  const userPermissions: UserPermissions = {
    role: userPermissionsDataVal.role,
    modules: userPermissionsDataVal.permissions || [],
  };

  // Get modules that the user's role gives them access to
  const roleModuleIds = new Set(
    userPermissions.modules
      .filter((m) => m.source === "role" || m.source === "combined")
      .map((m) => m.module_id),
  );

  // Get extra modules (directly granted to user)
  const extraModuleIds = new Set(
    userPermissions.modules
      .filter((m) => m.source === "user" || m.source === "combined")
      .map((m) => m.module_id),
  );

  const handleExtraModuleChange = (moduleId: number, grant: boolean) => {
    setExtraModuleChanges((prev) => ({
      ...prev,
      [moduleId]: grant,
    }));
  };

  const getExtraModuleValue = (moduleId: number): boolean => {
    if (extraModuleChanges[moduleId] !== undefined) {
      return extraModuleChanges[moduleId];
    }
    return extraModuleIds.has(moduleId);
  };

  const hasChanges = Object.keys(extraModuleChanges).length > 0;

  const handleSaveAll = async () => {
    for (const [moduleIdStr, grant] of Object.entries(extraModuleChanges)) {
      const moduleId = parseInt(moduleIdStr);
      const currentValue = extraModuleIds.has(moduleId);

      if (currentValue !== grant) {
        await adminService.setUserPermission({
          user_id: parseInt(selectedUserId),
          module_id: moduleId,
        });
      }
    }

    queryClient.invalidateQueries({
      queryKey: ["userPermissions", selectedUserId],
    });
    setExtraModuleChanges({});
    toast.success("User permissions saved successfully");
  };

  const handleReset = () => {
    setExtraModuleChanges({});
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
          <CardTitle>Manage User Module Permissions</CardTitle>
          <CardDescription>
            Grant or revoke additional module access for users beyond their role
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
                setExtraModuleChanges({});
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
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {modules
                .filter((m) => roleModuleIds.has(m.id))
                .map((module) => (
                  <span
                    key={module.id}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {module.name}
                  </span>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extra Module Permissions */}
      {selectedUserId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Additional Module Access</CardTitle>
                <CardDescription>
                  Grant extra modules to this user beyond their role
                </CardDescription>
              </div>
              {hasChanges && (
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
                Please select a user to manage their extra module permissions
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
                      <TableHead className="text-center">Role Access</TableHead>
                      <TableHead className="text-center">
                        Extra Access
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
                        const hasRoleAccess = roleModuleIds.has(module.id);
                        const hasExtraAccess = getExtraModuleValue(module.id);

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
                              {hasRoleAccess ? (
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  Via Role
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  No Access
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {hasRoleAccess ? (
                                <span className="text-muted-foreground text-xs">
                                  (Already has access)
                                </span>
                              ) : (
                                <Checkbox
                                  checked={hasExtraAccess}
                                  onCheckedChange={(checked) =>
                                    handleExtraModuleChange(
                                      module.id,
                                      checked as boolean,
                                    )
                                  }
                                />
                              )}
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
                      {m.source !== "role" &&
                        m.source !== "combined" &&
                        " (extra)"}
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
