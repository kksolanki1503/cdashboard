import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import adminService, {
  type Module,
  type ModuleWithChildren,
  type CreateModuleDTO,
  type UpdateModuleDTO,
} from "@/services/admin.service";

// Recursive component to render module tree
const ModuleTreeItem: React.FC<{
  module: ModuleWithChildren;
  level: number;
  onEdit: (module: Module) => void;
  onDelete: (module: Module) => void;
  onAddSubModule: (parentId: number, parentName: string) => void;
}> = ({ module, level, onEdit, onDelete, onAddSubModule }) => {
  const [isExpanded, setIsExpanded] = useState(level < 1);
  const hasChildren = module.children && module.children.length > 0;

  return (
    <>
      <TableRow key={module.id}>
        <TableCell>
          <div
            className="flex items-center"
            style={{ paddingLeft: `${level * 20}px` }}
          >
            {hasChildren ? (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mr-1 p-0.5 hover:bg-muted rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="w-5 inline-block" />
            )}
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 mr-2 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 mr-2 text-blue-500" />
              )
            ) : (
              <span className="w-4 mr-2" />
            )}
            <span className="font-medium">{module.name}</span>
          </div>
        </TableCell>
        <TableCell>{module.description || "-"}</TableCell>
        <TableCell>
          {module.parent_id ? (
            <span className="text-muted-foreground text-sm">Sub-module</span>
          ) : (
            <span className="text-sm">Parent module</span>
          )}
        </TableCell>
        <TableCell>
          {module.active ? (
            <span className="text-green-600 text-sm">Active</span>
          ) : (
            <span className="text-red-600 text-sm">Inactive</span>
          )}
        </TableCell>
        <TableCell>
          {new Date(module.created_at).toLocaleDateString()}
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(module)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAddSubModule(module.id, module.name)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Sub-module
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(module)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
      {hasChildren && isExpanded && (
        <>
          {module.children.map((child) => (
            <ModuleTreeItem
              key={child.id}
              module={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubModule={onAddSubModule}
            />
          ))}
        </>
      )}
    </>
  );
};

const ModuleManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [parentModule, setParentModule] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [formData, setFormData] = useState<CreateModuleDTO>({
    name: "",
    description: "",
    parent_id: null,
  });

  // Fetch modules as tree structure
  const { data: modulesTreeData, isLoading: modulesLoading } = useQuery({
    queryKey: ["adminModulesTree"],
    queryFn: adminService.getModuleTree,
  });

  // Fetch all modules for parent selection dropdown
  const { data: allModulesData } = useQuery({
    queryKey: ["adminModules"],
    queryFn: adminService.getAllModules,
  });

  // Create module mutation
  const createModuleMutation = useMutation({
    mutationFn: adminService.createModule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminModules"] });
      queryClient.invalidateQueries({ queryKey: ["adminModulesTree"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      toast.success("Module created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create module: ${error.message}`);
    },
  });

  // Update module mutation
  const updateModuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateModuleDTO }) =>
      adminService.updateModule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminModules"] });
      queryClient.invalidateQueries({ queryKey: ["adminModulesTree"] });
      toast.success("Module updated successfully");
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update module: ${error.message}`);
    },
  });

  // Delete module mutation
  const deleteModuleMutation = useMutation({
    mutationFn: adminService.deleteModule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminModules"] });
      queryClient.invalidateQueries({ queryKey: ["adminModulesTree"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      toast.success("Module deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedModule(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete module: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      parent_id: null,
    });
    setSelectedModule(null);
    setParentModule(null);
  };

  const handleCreateModule = () => {
    if (!formData.name) {
      toast.error("Module name is required");
      return;
    }
    createModuleMutation.mutate(formData);
  };

  const handleUpdateModule = () => {
    if (!selectedModule) return;
    const updateData: UpdateModuleDTO = {
      name: formData.name,
      description: formData.description,
      parent_id: formData.parent_id,
    };
    updateModuleMutation.mutate({ id: selectedModule.id, data: updateData });
  };

  const handleDeleteModule = () => {
    if (!selectedModule) return;
    deleteModuleMutation.mutate(selectedModule.id);
  };

  const openEditDialog = (module: Module) => {
    setSelectedModule(module);
    setFormData({
      name: module.name,
      description: module.description || "",
      parent_id: module.parent_id,
    });
    setParentModule(null);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (module: Module) => {
    setSelectedModule(module);
    setIsDeleteDialogOpen(true);
  };

  const openAddSubModuleDialog = (parentId: number, parentName: string) => {
    setParentModule({ id: parentId, name: parentName });
    setFormData({
      name: "",
      description: "",
      parent_id: parentId,
    });
    setIsCreateDialogOpen(true);
  };

  const modulesTree = modulesTreeData?.success ? modulesTreeData.data : [];
  const allModules = allModulesData?.success ? allModulesData.data : [];

  // Filter out the current module and its descendants for parent selection in edit mode
  const availableParentModules = selectedModule
    ? allModules.filter((m) => m.id !== selectedModule.id)
    : allModules;

  if (modulesLoading) {
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
            <CardTitle>Module Management</CardTitle>
            <Button
              onClick={() => {
                setParentModule(null);
                resetForm();
                setIsCreateDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Module
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modulesTree.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No modules found
                    </TableCell>
                  </TableRow>
                ) : (
                  modulesTree.map((module) => (
                    <ModuleTreeItem
                      key={module.id}
                      module={module}
                      level={0}
                      onEdit={openEditDialog}
                      onDelete={openDeleteDialog}
                      onAddSubModule={openAddSubModuleDialog}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Module Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {parentModule
                ? `Add Sub-module to "${parentModule.name}"`
                : "Create New Module"}
            </DialogTitle>
            <DialogDescription>
              {parentModule
                ? "Add a new sub-module under this parent module."
                : "Add a new module to the system."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter module name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter module description"
              />
            </div>
            {!parentModule && (
              <div className="space-y-2">
                <Label htmlFor="parent">Parent Module (Optional)</Label>
                <Select
                  value={formData.parent_id?.toString() || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      parent_id: value === "none" ? null : parseInt(value, 10),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No parent (Top-level)</SelectItem>
                    {allModules.map((module) => (
                      <SelectItem key={module.id} value={module.id.toString()}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateModule}
              disabled={createModuleMutation.isPending}
            >
              {createModuleMutation.isPending ? "Creating..." : "Create Module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>Update module information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-parent">Parent Module</Label>
              <Select
                value={formData.parent_id?.toString() || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    parent_id: value === "none" ? null : parseInt(value, 10),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent (Top-level)</SelectItem>
                  {availableParentModules.map((module) => (
                    <SelectItem key={module.id} value={module.id.toString()}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateModule}
              disabled={updateModuleMutation.isPending}
            >
              {updateModuleMutation.isPending ? "Updating..." : "Update Module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Module Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete module "{selectedModule?.name}"?
              This will also delete all permissions associated with this module.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedModule(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteModule}
              disabled={deleteModuleMutation.isPending}
            >
              {deleteModuleMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModuleManagement;
