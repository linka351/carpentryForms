import { createContext } from "react";

export type CutoutItem = {
  id: string;
  describe?: string;
  width: number;
  length: number;
  quanity: number;
  rotated?: boolean;
};

export type PlateParams = {
  width: number;
  length: number;
  margin: number;
  kerf: number;
};

export type AppContextType = {
  plateParams: PlateParams;
  setPlateParams: (params: PlateParams) => void;
  cuts: CutoutItem[];
  addCuts: (newCuts: Omit<CutoutItem, "id" | "rotated">[]) => void;
  deleteCutout: (index: number) => void;
  resetCuts: () => void;
  updateCut: (updater: (prev: CutoutItem[]) => CutoutItem[]) => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);
