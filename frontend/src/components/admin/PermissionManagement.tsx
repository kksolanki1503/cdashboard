import React, { useState, useMemo } from "react";
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
import adminService, {
  type Role,
  type Module,
  type SetRolePermissionDTO,
} from "@/services/admin.service";

const PermissionManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [permissionChanges, setPermissionChanges] = useState<
    Record<string, Partial<SetRolePermissionDTO>>
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
  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    refetch: refetchPermissions,
  } = useQuery({
    queryKey: ["rolePermissions", selectedRoleId],
    queryFn: () => adminService.getRolePermissions(parseInt(selectedRoleId)),
    enabled: !!selectedRoleId,
  });

  // Set role permission mutation
  const setPermissionMutation = useMutation({
    mutationFn: adminService.setRolePermission,
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

  // Save all changes mutation
  const saveAllMutation = useMutation({
    mutationFn: async () => {
      const promises = Object.entries(permissionChanges).map(
        ([moduleId, changes]) => {
          const moduleIdNum = parseInt(moduleId);
          const existingPerm = permissions?.find(
            (p) => p.module_id === moduleIdNum,
          );
          return adminService.setRolePermission({
            role_id: parseInt(selectedRoleId),
            module_id: moduleIdNum,
            can_read: changes.can_read ?? existingPerm?.can_read ?? false,
            can_write: changes.can_write ?? existingPerm?.can_write ?? false,
            can_delete: changes.can_delete ?? existingPerm?.can_delete ?? false,
            can_update: changes.can_update ?? existingPerm?.can_update ?? false,
          });
        },
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rolePermissions", selectedRoleId],
      });
      setPermissionChanges({});
      toast.success("All permissions saved successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save permissions: ${error.message}`);
    },
  });

  const roles = rolesData?.success ? rolesData.data : [];
  const modules = modulesData?.success ? modulesData.data : [];
  const permissions = permissionsData?.success ? permissionsData.data : [];

  const handlePermissionChange = (
    moduleId: number,
    permissionType: "can_read" | "can_write" | "can_delete" | "can_update",
    value: boolean,
  ) => {
    setPermissionChanges((prev) => {
      const existing = prev[moduleId.toString()] || {};
      return {
        ...prev,
        [moduleId.toString()]: {
          ...existing,
          [permissionType]: value,
        },
      };
    });
  };

  const getPermissionValue = (
    moduleId: number,
    permissionType: "can_read" | "can_write" | "can_delete" | "can_update",
  ): boolean => {
    // Check if there's a pending change
    if (
      permissionChanges[moduleId.toString()]?.[permissionType] !== undefined
    ) {
      return permissionChanges[moduleId.toString()][permissionType] as boolean;
    }
    // Return the current value from the server
    const perm = permissions.find((p) => p.module_id === moduleId);
    return perm ? perm[permissionType] : false;
  };

  const hasChanges = Object.keys(permissionChanges).length > 0;

  const handleSaveAll = () => {
    if (!hasChanges) return;
    saveAllMutation.mutate();
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
            <CardTitle>Permission Management</CardTitle>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <>
                  <Button variant="outline" onClick={handleReset} size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  <Button
                    onClick={handleSaveAll}
                    size="sm"
                    disabled={saveAllMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saveAllMutation.isPending ? "Saving..." : "Save Changes"}
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

          {/* Permissions Table */}
          {!selectedRoleId ? (
            <div className="text-center py-8 text-muted-foreground">
              Please select a role to view and edit permissions
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
                    <TableHead className="w-[200px]">Module</TableHead>
                    <TableHead className="text-center">Read</TableHead>
                    <TableHead className="text-center">Write</TableHead>
                    <TableHead className="text-center">Update</TableHead>
                    <TableHead className="text-center">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No modules found
                      </TableCell>
                    </TableRow>
                  ) : (
                    modules.map((module) => (
                      <TableRow key={module.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{module.name}</p>
                            {module.description && (
                              <p className="text-xs text-muted-foreground">
                                {module.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={getPermissionValue(module.id, "can_read")}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                module.id,
                                "can_read",
                                checked as boolean,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={getPermissionValue(module.id, "can_write")}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                module.id,
                                "can_write",
                                checked as boolean,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={getPermissionValue(
                              module.id,
                              "can_update",
                            )}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                module.id,
                                "can_update",
                                checked as boolean,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={getPermissionValue(
                              module.id,
                              "can_delete",
                            )}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                module.id,
                                "can_delete",
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

      {/* Permission Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Permission Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-medium">Read</p>
              <p className="text-muted-foreground">Can view the module</p>
            </div>
            <div>
              <p className="font-medium">Write</p>
              <p className="text-muted-foreground">Can create new records</p>
            </div>
            <div>
              <p className="font-medium">Update</p>
              <p className="text-muted-foreground">
                Can modify existing records
              </p>
            </div>
            <div>
              <p className="font-medium">Delete</p>
              <p className="text-muted-foreground">Can remove records</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionManagement;
