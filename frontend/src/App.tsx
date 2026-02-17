import Dashboard from "./components/dashboard/dashboard";
import SignInPage from "./components/auth/SignInPage";
import SignUpPage from "./components/auth/SignUpPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import AdminPanel from "./components/admin/AdminPanel";
import { store } from "./store";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

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
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  {
    path: "/admin",
    element: (
      <ErrorBoundary>
        <ProtectedRoute>
          <AdminPanel />
        </ProtectedRoute>
      </ErrorBoundary>
    ),
  },
  {
    path: "/signin",
    element: (
      <ErrorBoundary>
        <SignInPage />
      </ErrorBoundary>
    ),
  },
  {
    path: "/signup",
    element: (
      <ErrorBoundary>
        <SignUpPage />
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
