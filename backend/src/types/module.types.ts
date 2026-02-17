export interface Module {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateModuleDTO {
  name: string;
  description?: string;
  active?: boolean;
}

export interface UpdateModuleDTO {
  name?: string;
  description?: string;
  active?: boolean;
}

export interface ModuleResponseDTO {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
}
