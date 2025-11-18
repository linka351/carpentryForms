import type { FormValues } from "@/validations/formatFormsValidation";
import type { CutoutFormValues } from "@/validations/cutSheetFormsSchema.ts";

export type AppContextType = {
  plateParams: FormValues;
  setPlateParams: (values: FormValues) => void;
  cuts: CutoutFormValues[];
  addCuts: (newCuts: CutoutFormValues[]) => void;
  deleteCutout: (indexToDelete: number) => void;
  resetCuts: () => void;
};
