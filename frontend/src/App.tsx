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
import { useNavigate } from "react-router";

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

// Not Found page for unmatched routes
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600">Route doesn't exist</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go Home
        </button>
      </div>
    </div>
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
        children: [
          {
            path: "admin",
            element: <AdminPanel />,
          },
        ],
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
  // Catch-all route for 404 - must be last
  {
    path: "*",
    element: <NotFound />,
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
