import * as Yup from "yup";

export const cutSheetFormsSchema = Yup.object({
  length: Yup.number()
    .min(1, "Długość musi być większa niż 0")
    .required("Długość jest wymagana"),

  width: Yup.number()
    .min(1, "Szerokość musi być większa niż 0")
    .required("Szerokość jest wymagana"),

  quanity: Yup.number().min(1, "minimum 1 formatka").required("Pole wymagane"),

  describe: Yup.string(),
});

export type CutoutFormValues = Yup.InferType<typeof cutSheetFormsSchema>;
