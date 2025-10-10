import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Home</div>,
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
