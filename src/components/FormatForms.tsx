import ReusableForm from "./ReusableForm";
import {
  formatFormsValidation,
  type FormValues as MainBoardFormValues,
} from "@/validations/formatFormsValidation";
import { useMemo } from "react";

const initialMainBoardValues: MainBoardFormValues = {
  length: 0,
  width: 0,
  margin: 0,
  kerf: 0,
};

function handleMainBoardSubmit(values: MainBoardFormValues) {
  console.log(
    `Długość: ${values.length}, Szerokość: ${values.width}, Margines: ${values.margin}, Kerf: ${values.kerf}`
  );
}

export default function FormatForms() {
  const mainBoardFields = useMemo(
    () =>
      [
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
      ] as const,
    []
  );

  return (
    <ReusableForm<MainBoardFormValues>
      title="Parametry Płyty"
      defaultValues={initialMainBoardValues}
      validationSchema={formatFormsValidation as any}
      onSubmit={handleMainBoardSubmit}
      fields={mainBoardFields as any}
    />
  );
}
