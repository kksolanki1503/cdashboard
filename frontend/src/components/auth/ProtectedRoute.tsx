import { useEffect } from "react";
import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { refreshAccessToken } from "@/store/authSlice";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, isInitialized, accessToken } =
    useAppSelector((state) => state.auth);

  // Try to refresh token on mount if not initialized
  useEffect(() => {
    if (!isInitialized && !accessToken) {
      dispatch(refreshAccessToken());
    }
  }, [isInitialized, accessToken, dispatch]);

  // Show loading state while checking authentication
  if (isLoading || !isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to sign in page
  // Save the attempted URL for redirecting after login
  if (!isAuthenticated) {
    return (
      <Navigate to="/signin" state={{ from: location.pathname }} replace />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
