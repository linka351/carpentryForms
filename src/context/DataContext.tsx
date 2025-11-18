import { useState, useCallback, type ReactNode } from "react";
import { AppContext } from "./app.context";
import {
  initialCutoutValues,
  initialPlateValues,
} from "@/constants/context.const";
import type { CutoutFormValues } from "@/validations/cutSheetFormsSchema.ts";

type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [plateParams, setPlateParams] = useState(initialPlateValues);
  const [cuts, setCuts] = useState(initialCutoutValues);

  const addCuts = useCallback((newCuts: CutoutFormValues[]) => {
    setCuts((prev) => [...prev, ...newCuts]);
  }, []);

  const deleteCutout = useCallback((indexToDelete: number) => {
    setCuts((prev) => prev.filter((_, i) => i !== indexToDelete));
  }, []);

  const resetCuts = useCallback(() => setCuts([]), []);

  return (
    <AppContext.Provider
      value={{
        plateParams,
        setPlateParams,
        cuts,
        addCuts,
        deleteCutout,
        resetCuts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
