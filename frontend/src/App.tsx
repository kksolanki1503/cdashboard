import Dashboard from "./components/dashboard/Dashboard";
import SignInPage from "./components/auth/SignInPage";
import SignUpPage from "./components/auth/SignUpPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import AdminPanel from "./components/admin/AdminPanel";
import { ModuleProvider } from "./contexts/ModuleContext";
import { store } from "./store";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Layout for protected routes (authenticated users)
const ProtectedLayout = () => {
  return (
    <ErrorBoundary>
      <ModuleProvider>
        <ProtectedRoute>
          <Outlet />
        </ProtectedRoute>
      </ModuleProvider>
    </ErrorBoundary>
  );
};

// Layout for public routes (unauthenticated users - signin, signup)
const PublicLayout = () => {
  return (
    <ErrorBoundary>
      <ModuleProvider>
        <PublicRoute>
          <Outlet />
        </PublicRoute>
      </ModuleProvider>
    </ErrorBoundary>
  );
};

const router = createBrowserRouter([
  // Protected routes - requires authentication
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "admin",
        element: <AdminPanel />,
      },
    ],
  },
  // Public routes - requires NOT being authenticated
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/signin",
        element: <SignInPage />,
      },
      {
        path: "/signup",
        element: <SignUpPage />,
      },
    ],
  },
]);

const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <div>
            <RouterProvider router={router} />
          </div>
          <Toaster richColors position="top-right" />
        </ErrorBoundary>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
