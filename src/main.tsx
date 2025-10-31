import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Router from "./Router";
import { AppProvider } from "./context/DataContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <Router />
    </AppProvider>
  </StrictMode>
);
