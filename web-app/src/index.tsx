import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App } from "./app";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);

const container = document.getElementById("root");
if (container != null) {
  const root = createRoot(container);
  root.render(<RouterProvider router={router} />);
} else {
  throw new Error("Missing root element!");
}
