import api from "@/lib/axios";

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface Module {
  module_id: number;
  module_name: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
  can_update: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
    };
    modules: Module[];
    accessToken: string;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
    };
    modules: Module[];
    accessToken: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

const authService = {
  signIn: async (data: SignInData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/v1/auth/signin", data);
    return response.data;
  },

  signUp: async (data: SignUpData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/v1/auth/signup", data);
    return response.data;
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>(
      "/api/v1/auth/refresh",
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/api/v1/auth/logout");
    localStorage.removeItem("accessToken");
  },

  getCurrentUser: async () => {
    const response = await api.get("/api/v1/auth/me");
    return response.data;
  },
};

export default authService;
