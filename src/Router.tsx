import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CutPlan from "./CutPlan";
import App from "./App";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/main",
    element: <div>Main</div>,
  },
  {
    path: "/cut-plan",
    element: <CutPlan />,
  },
]);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
