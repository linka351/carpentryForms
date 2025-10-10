import { createBrowserRouter, RouterProvider } from "react-router-dom";
import FormatForms from "./components/FormatForms";

const router = createBrowserRouter([
  {
    path: "/",
    element: <FormatForms />,
  },
  {
    path: "/main",
    element: <div>Main</div>,
  },
]);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
