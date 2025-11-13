import {
  formatFormsValidation,
  type FormValues,
} from "@/validations/formatFormsValidation";

import { useAppData } from "@/context/DataContext";
import { useState } from "react";
import ReusableForm, { type FormFieldConfig } from "./ReusableForm";
function FormatForms() {
  const [test, setTest] = useState("");
  const initialValues: FormValues = {
    length: 1,
    width: 1,
    margin: 1,
    kerf: 1,
  };

  const mainBoardFields: FormFieldConfig<FormValues>[] = [
    {
      name: "length",
      label: "Długość Płyty (mm)",
      placeholder: "Wprowadź długość płyty",
      type: "number",
    },
    {
      name: "width",
      label: "Szerokość Płyty (mm)",
      placeholder: "Wprowadź szerokość płyty",
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
      placeholder: "Wprowadź kerf",
      type: "number",
    },
  ];

  const { setPlateParams } = useAppData();

  function onSubmit(
    values: FormValues,
    resetForm: (values?: FormValues) => void
  ) {
    setPlateParams(values);
    setTest(
      "Wymiary płyty zostały ustawione na: " +
        `Długość: ${values.length} mm, ` +
        `Szerokość: ${values.width} mm, ` +
        `Margines: ${values.margin} mm, ` +
        `Kerf: ${values.kerf} mm.`
    );
    resetForm();
  }

  return (
    <>
      <ReusableForm<FormValues>
        title="Parametry Płyty Głównej"
        defaultValues={initialValues}
        validationSchema={formatFormsValidation}
        onSubmit={onSubmit}
        fields={mainBoardFields}
      />

      {test && <p className="mt-4 text-green-600">{test}</p>}
    </>
  );
}

export default FormatForms;
