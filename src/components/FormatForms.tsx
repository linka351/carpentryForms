import ReusableForm from "@/components/ReusableForm";
import {
  formatFormsValidation,
  type FormValues,
} from "@/validations/formatFormsValidation";
import type { FormFieldConfig } from "@/components/formFieldConfig";

const initialFormatValues: FormValues = {
  length: 0,
  width: 0,
  margin: 0,
  kerf: 0,
};

const formatFields: FormFieldConfig<FormValues>[] = [
  {
    name: "length",
    label: "Długość (mm)",
    placeholder: "Wprowadź długość",
    type: "number",
  },
  {
    name: "width",
    label: "Szerokość (mm)",
    placeholder: "Wprowadź szerokość",
    type: "number",
  },
  {
    name: "margin",
    label: "Margines (mm)",
    placeholder: "Wprowadź margines",
    type: "number",
  },
  {
    name: "kerf",
    label: "Kerf (mm)",
    placeholder: "Wprowadź Kerf",
    type: "number",
  },
];

export default function FormatForms() {
  function handleSubmit(values: FormValues) {
    console.log(
      `Długość: ${values.length}, Szerokość: ${values.width}, Margines: ${values.margin}, Kerf: ${values.kerf}`
    );
  }

  return (
    <ReusableForm<FormValues>
      title="Parametry Płyty"
      defaultValues={initialFormatValues}
      validationSchema={formatFormsValidation}
      onSubmit={handleSubmit}
      fields={formatFields}
    />
  );
}
