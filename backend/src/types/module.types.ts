export interface Module {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateModuleDTO {
  name: string;
  description?: string;
  parent_id?: number | null;
  active?: boolean;
}

export interface UpdateModuleDTO {
  name?: string;
  description?: string;
  parent_id?: number | null;
  active?: boolean;
}

export interface ModuleResponseDTO {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ModuleWithChildrenDTO extends ModuleResponseDTO {
  children: ModuleWithChildrenDTO[];
}
