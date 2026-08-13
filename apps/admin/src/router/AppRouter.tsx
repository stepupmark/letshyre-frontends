import { createBrowserRouter, RouterProvider } from "react-router";
import { routeDefinitions } from "./routeConfig";

const router = createBrowserRouter(routeDefinitions);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
