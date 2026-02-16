import Dashboard from "./components/dashboard/dashboard";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
]);
const App = () => {
  return (
    <div>
      <RouterProvider router={router} />, );
    </div>
  );
};

export default App;
