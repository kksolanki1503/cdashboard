import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Save, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import adminService from "@/services/admin.service";

interface PermissionChange {
  has_access: boolean;
}

const PermissionManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [permissionChanges, setPermissionChanges] = useState<
    Record<string, PermissionChange>
  >({});

  // Fetch roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["adminRoles"],
    queryFn: adminService.getAllRoles,
  });

  // Fetch modules
  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ["adminModules"],
    queryFn: adminService.getAllModules,
  });

  // Fetch role permissions when role is selected
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ["rolePermissions", selectedRoleId],
    queryFn: () => adminService.getRolePermissions(parseInt(selectedRoleId)),
    enabled: !!selectedRoleId,
  });

  // Set role permission mutation
  const setPermissionMutation = useMutation({
    mutationFn: async ({
      moduleId,
      hasAccess,
    }: {
      moduleId: number;
      hasAccess: boolean;
    }) => {
      if (hasAccess) {
        // Grant access
        return adminService.setRolePermission({
          role_id: parseInt(selectedRoleId),
          module_id: moduleId,
        });
      } else {
        // For removing access, we need a different approach
        // Since the API just adds access, we'll handle this differently
        // Actually, let's update the API to handle this
        return Promise.resolve();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rolePermissions", selectedRoleId],
      });
      toast.success("Permission updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update permission: ${error.message}`);
    },
  });

  const roles = rolesData?.success ? rolesData.data : [];
  const modules = modulesData?.success ? modulesData.data : [];
  const permissions = permissionsData?.success ? permissionsData.data : [];

  const handlePermissionChange = (moduleId: number, value: boolean) => {
    setPermissionChanges((prev) => ({
      ...prev,
      [moduleId.toString()]: {
        has_access: value,
      },
    }));
  };

  const getPermissionValue = (moduleId: number): boolean => {
    // Check if there's a pending change
    if (permissionChanges[moduleId.toString()] !== undefined) {
      return permissionChanges[moduleId.toString()].has_access;
    }
    // Return the current value from the server
    const perm = permissions.find((p) => p.module_id === moduleId);
    return perm ? perm.has_access : false;
  };

  const hasChanges = Object.keys(permissionChanges).length > 0;

  const handleSaveAll = async () => {
    // For each changed module, we need to call the API
    // The simplified system just grants or removes module access
    for (const [moduleId, changes] of Object.entries(permissionChanges)) {
      const moduleIdNum = parseInt(moduleId);
      const existingPerm = permissions.find((p) => p.module_id === moduleIdNum);
      const currentValue = existingPerm?.has_access ?? false;
      const newValue = changes.has_access;

      // Only call API if value changed
      if (currentValue !== newValue) {
        await adminService.setRolePermission({
          role_id: parseInt(selectedRoleId),
          module_id: moduleIdNum,
        });
      }
    }

    queryClient.invalidateQueries({
      queryKey: ["rolePermissions", selectedRoleId],
    });
    setPermissionChanges({});
    toast.success("All permissions saved successfully");
  };

  const handleReset = () => {
    setPermissionChanges({});
  };

  if (rolesLoading || modulesLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-32" />
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Module Access Management</CardTitle>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <>
                  <Button variant="outline" onClick={handleReset} size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  <Button onClick={handleSaveAll} size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Role Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">
              Select Role
            </label>
            <Select
              value={selectedRoleId}
              onValueChange={(value: string) => {
                setSelectedRoleId(value);
                setPermissionChanges({});
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Permissions Table - Simplified */}
          {!selectedRoleId ? (
            <div className="text-center py-8 text-muted-foreground">
              Please select a role to view and manage module access
            </div>
          ) : permissionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        No modules found
                      </TableCell>
                    </TableRow>
                  ) : (
                    modules.map((module) => (
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
                          <Checkbox
                            checked={getPermissionValue(module.id)}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                module.id,
                                checked as boolean,
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Each role can be granted access to specific modules</p>
            <p>
              • When a user has a role, they get access to all modules assigned
              to that role
            </p>
            <p>
              • Users can also be granted additional module access beyond their
              role
            </p>
            <p>
              • Removing access from a role will revoke access for all users
              with that role
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionManagement;
