export {
  type User,
  type CreateUserDTO,
  type UserResponseDTO,
  toUserResponseDTO,
} from "./user.types.js";

export {
  type AuthResponse,
  type RefreshTokenResponse,
  type LogoutResponse,
  type ModulePermissionDTO,
} from "./auth.types.js";

export {
  type Role,
  type CreateRoleDTO,
  type UpdateRoleDTO,
  type RoleResponseDTO,
} from "./role.types.js";

export {
  type Module,
  type CreateModuleDTO,
  type UpdateModuleDTO,
  type ModuleResponseDTO,
  type ModuleWithChildrenDTO,
} from "./module.types.js";

export {
  type PermissionMaster,
  type CreatePermissionMasterDTO,
  type PermissionMasterResponseDTO,
  type Permission,
  type RolePermission,
  type UserPermission,
  type CreateRolePermissionDTO,
  type CreateUserPermissionDTO,
  type UpdateRolePermissionDTO,
  type UpdateUserPermissionDTO,
  type PermissionResponseDTO,
  type UserPermissionsResponseDTO,
  // New simplified types
  type RoleModule,
  type UserModule,
  type CreateRoleModuleDTO,
  type CreateUserModuleDTO,
  type ModuleAccessDTO,
  type UserModulesResponseDTO,
} from "./permission.types.js";
