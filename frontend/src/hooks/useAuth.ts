import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setAccessToken,
  setUser,
  setModules,
  clearAuth,
  setLoading,
  setInitialized,
} from "@/store/authSlice";
import type { User, Module } from "@/store/authSlice";

interface SignInData {
  email: string;
  password: string;
}

interface SignUpData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    modules: Module[];
    accessToken: string;
  };
}

// Sign In mutation
export const useSignIn = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (data: SignInData): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>(
        "/api/v1/auth/signin",
        data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      dispatch(setAccessToken(data.data.accessToken));
      dispatch(setUser(data.data.user));
      dispatch(setModules(data.data.modules || []));
      dispatch(setLoading(false));
      dispatch(setInitialized(true));
      toast.success("Signed in successfully!");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      const message = error.response?.data?.message || "Failed to sign in";
      toast.error(message);
    },
  });
};

// Sign Up mutation
export const useSignUp = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (data: SignUpData): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>(
        "/api/v1/auth/signup",
        data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      dispatch(setAccessToken(data.data.accessToken));
      dispatch(setUser(data.data.user));
      dispatch(setModules(data.data.modules || []));
      toast.success("Account created successfully!");
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      const message =
        error.response?.data?.message || "Failed to create account";
      toast.error(message);
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async () => {
      await api.post("/api/v1/auth/logout");
    },
    onSuccess: () => {
      dispatch(clearAuth());
      toast.success("Logged out successfully!");
    },
    onError: () => {
      dispatch(clearAuth());
      toast.success("Logged out successfully!");
    },
  });
};

// Get current user query
export const useCurrentUser = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await api.get("/api/v1/auth/me");
      return response.data;
    },
    enabled: isAuthenticated,
  });
};

// Auth state hook
export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  return auth;
};
