import { useContext } from "react";
import { AppContext } from "./app.context";

export const useAppData = () => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppData must be used within an AppProvider");
  }

  return context;
};
