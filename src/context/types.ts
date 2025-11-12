import type { FormValues } from "@/validations/formatFormsValidation";
import type { CutoutFormValues } from "@/validations/cutSheetFormsValidation";

export type AppContextType = {
  plateParams: FormValues;
  setPlateParams: (values: FormValues) => void;
  cuts: CutoutFormValues[];
  addCuts: (newCuts: CutoutFormValues[]) => void;
  deleteCutout: (indexToDelete: number) => void;
  resetCuts: () => void;
};
