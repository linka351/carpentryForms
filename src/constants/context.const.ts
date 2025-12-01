import { type CutoutFormValues } from "../validations/cutSheetFormsSchema.ts";
import { type FormValues } from "../validations/formatFormsValidation";

export const initialPlateValues: FormValues = {
  length: 0,
  width: 0,
  margin: 0,
  kerf: 0,
};

export const initialCutoutValues: CutoutFormValues[] = [];
