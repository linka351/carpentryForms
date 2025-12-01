import { useState, useCallback, type ReactNode } from "react";
import { AppContext } from "./app.context";
import { type CutoutItem, type PlateParams } from "./types";
import {
  initialCutoutItemValues,
  initialPlateValues,
} from "@/constants/context.const";

type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [plateParams, setPlateParams] =
    useState<PlateParams>(initialPlateValues);
  const [cuts, setCuts] = useState<CutoutItem[]>(initialCutoutItemValues);

  const addCuts = useCallback(
    (newCuts: Omit<CutoutItem, "id" | "rotated">[]) => {
      const cutsWithId: CutoutItem[] = newCuts.map((c) => ({
        ...c,
        id: crypto.randomUUID(),
        rotated: false,
      }));
      setCuts((prev) => [...prev, ...cutsWithId]);
    },
    []
  );

  const deleteCutout = useCallback((index: number) => {
    setCuts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const resetCuts = useCallback(() => setCuts([]), []);

  const updateCut = useCallback(
    (updater: (prev: CutoutItem[]) => CutoutItem[]) => {
      setCuts((prev) => updater(prev));
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        plateParams,
        setPlateParams,
        cuts,
        addCuts,
        deleteCutout,
        resetCuts,
        updateCut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
