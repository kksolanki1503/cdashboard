import { useEffect } from "react";
import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { refreshAccessToken } from "@/store/authSlice";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Check if user has access to a specific module
 */
const hasModuleAccess = (
  modules: { module_name: string }[],
  pathname: string,
): boolean => {
  // Get the module name from the pathname
  const pathModule = pathname.replace("/", "").toLowerCase();

  // If it's the root path (dashboard), allow access
  if (!pathModule) {
    return true;
  }

  // Check if user has access to this module
  return modules.some((m) => m.module_name.toLowerCase() === pathModule);
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, isInitialized, accessToken, modules } =
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

  // Check if user has access to the module they're trying to access
  if (!hasModuleAccess(modules, location.pathname)) {
    // Redirect to dashboard if no access to the requested module
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
