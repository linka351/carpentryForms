import { createHashRouter, RouterProvider } from "react-router-dom";
import CutPlan from "./CutPlan";
import App from "./App";

// Używamy createHashRouter zamiast HashRouter jako funkcji
const router = createHashRouter([
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
  /* RouterProvider przekazuje konfigurację routera do aplikacji */
  return <RouterProvider router={router} />;
}

export default Router;
