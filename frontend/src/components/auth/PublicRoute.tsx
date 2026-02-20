import { useEffect } from "react";
import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { refreshAccessToken } from "@/store/authSlice";

interface PublicRouteProps {
  children: ReactNode;
}

/**
 * PublicRoute - Redirects authenticated users away from public pages
 * (sign-in, sign-up) to the dashboard
 *
 * Also attempts to refresh token on mount to check if user
 * was authenticated via cookie
 */
const PublicRoute = ({ children }: PublicRouteProps) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, isInitialized, accessToken } =
    useAppSelector((state) => state.auth);

  // Try to refresh token on mount to check if user has valid session
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

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
