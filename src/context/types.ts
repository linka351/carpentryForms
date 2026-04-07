import type { FormValues } from "@/validations/formatFormsValidation";
import type { CutoutFormValues } from "@/validations/cutSheetFormsSchema.ts";

export type AppContextType = {
  plateParams: FormValues;
  setPlateParams: (values: FormValues) => void;
  cuts: ExtendedCutoutValues[];
  addCuts: (newCuts: CutoutFormValues[]) => void;
  deleteCutout: (indexToDelete: number) => void;
  resetCuts: () => void;
  toggleRotation: (indexToRotate: number) => void;
  toggleCutLock: (indexToLock: number) => void;
  toggleEdge: (
    index: number,
    edge: "top" | "right" | "bottom" | "left",
  ) => void;
  totalEdgeLength: Record<string, number>;
  isGlobalLocked: boolean;
  setIsGlobalLocked: (locked: boolean) => void;
  // POPRAWKA: Dodajemy trzeci argument 'pattern', aby zapisać wybór (np. "1D")
  updateCutEdges: (
    index: number,
    edges: ExtendedCutoutValues["edges"],
    pattern: string[],
  ) => void;
};

export interface ExtendedCutoutValues extends CutoutFormValues {
  edgeGroup?: string; // Nowa właściwość do grupowania krawędzi
  isLocked: boolean;
  edgePattern: string[]; // Przechowuje informację o wybranym Radio (np. "1D", "2K")
  edges: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
}
