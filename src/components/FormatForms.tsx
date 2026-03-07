import { useState } from "react";
import ReusableForm, { type FormFieldConfig } from "./ReusableForm";
import { useAppData } from "@/context/useAppData.context";
import {
  formatFormsValidation,
  type FormValues,
} from "@/validations/formatFormsValidation";

export default function FormatForms() {
  const [message, setMessage] = useState("");
  const { setPlateParams } = useAppData();

  const initialValues: FormValues = {
    length: 2800,
    width: 2070,
    margin: 10,
    kerf: 4,
  };

  const mainBoardFields: FormFieldConfig<FormValues>[] = [
    { name: "length", label: "Długość Płyty (mm)", type: "number" },
    { name: "width", label: "Szerokość Płyty (mm)", type: "number" },
    { name: "margin", label: "Margines (mm)", type: "number" },
    { name: "kerf", label: "Rzaz (mm)", type: "number" },
  ];

  function onSubmit(values: FormValues) {
    setPlateParams(values);
    setMessage("✔️ Parametry płyty zapisane!");
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <div className="w-full">
      <ReusableForm<FormValues>
        title="Płyta Główna"
        defaultValues={initialValues}
        validationSchema={formatFormsValidation}
        onSubmit={onSubmit}
        fields={mainBoardFields}
      />
      {message && (
        <p className="mt-2 text-[10px] font-black text-green-600 uppercase tracking-widest px-2">
          {message}
        </p>
      )}
    </div>
  );
}
