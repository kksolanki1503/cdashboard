import Dashboard from "./components/dashboard/Dashboard";
import SignInPage from "./components/auth/SignInPage";
import SignUpPage from "./components/auth/SignUpPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import AdminPanel from "./components/admin/AdminPanel";
import { ModuleProvider } from "./contexts/ModuleContext";
import { store } from "./store";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { createBrowserRouter, RouterProvider } from "react-router";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <ModuleProvider>
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </ModuleProvider>
      </ErrorBoundary>
    ),
    children: [
      {
        path: "admin",
        element: (
          <ErrorBoundary>
            <ModuleProvider>
              <AdminPanel />
            </ModuleProvider>
          </ErrorBoundary>
        ),
      },
    ],
  },
  {
    path: "/signin",
    element: (
      <ErrorBoundary>
        <ModuleProvider>
          <SignInPage />
        </ModuleProvider>
      </ErrorBoundary>
    ),
  },
  {
    path: "/signup",
    element: (
      <ErrorBoundary>
        <ModuleProvider>
          <SignUpPage />
        </ModuleProvider>
      </ErrorBoundary>
    ),
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
