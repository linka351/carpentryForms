import * as Yup from "yup";

export const formatFormsValidation = Yup.object({
  length: Yup.number()
    .min(1, "Długość musi być większa niż 0")
    .required("Długość jest wymagana"),

  width: Yup.number()
    .min(1, "Szerokość musi być większa niż 0")
    .required("Szerokość jest wymagana"),

  margin: Yup.number()
    .min(1, "margines musi być większy niż 0")
    .required("Margines jest wymagany"),

  kerf: Yup.number()
    .min(1, "kerf musi być większy niż 0")
    .required("Kerf jest wymagany"),
});

export type FormValues = Yup.InferType<typeof formatFormsValidation>;
