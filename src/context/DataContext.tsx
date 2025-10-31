import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useCallback,
} from "react";

import { type CutoutFormValues } from "@/validations/cutSheetFormsValidation";
import { type FormValues } from "@/validations/formatFormsValidation";

const initialPlateValues: FormValues = {
  length: 0,
  width: 0,
  margin: 0,
  kerf: 0,
};
const initialCutoutValues: CutoutFormValues[] = [];

export type AppContextType = {
  plateParams: FormValues;
  setPlateParams: (values: FormValues) => void;

  cuts: CutoutFormValues[];
  addCuts: (newCuts: CutoutFormValues[]) => void;
  deleteCutout: (indexToDelete: number) => void;
  resetCuts: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [plateParams, setPlateParams] =
    useState<FormValues>(initialPlateValues);

  const [cuts, setCuts] = useState<CutoutFormValues[]>(initialCutoutValues);

  const addCuts = useCallback((newCuts: CutoutFormValues[]) => {
    setCuts((prevCuts) => [...prevCuts, ...newCuts]);
  }, []);

  const deleteCutout = useCallback((indexToDelete: number) => {
    setCuts((prevCuts) =>
      prevCuts.filter((_, index) => index !== indexToDelete)
    );
  }, []);

  const resetCuts = useCallback(() => {
    setCuts([]);
  }, []);

  const contextValue: AppContextType = {
    plateParams,
    setPlateParams,

    cuts,
    addCuts,
    deleteCutout,
    resetCuts,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppData must be used within an AppProvider");
  }

  return context;
};
