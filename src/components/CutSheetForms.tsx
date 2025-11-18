import {
  cutSheetFormsValidation,
  type Cutout,
  type CutoutFormValues,
} from "@/validations/cutSheetFormsValidation";
import ReusableForm from "./ReusableForm";
import type { FormFieldConfig } from "./formFieldConfig";
import { useRef, useState } from "react";

const initialCutSheetValues: CutoutFormValues = {
  length: 0,
  width: 0,
  quanity: 0,
  describe: "",
};

const mainBoardFields: FormFieldConfig<CutoutFormValues>[] = [
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
    name: "quanity",
    label: "Ilość",
    placeholder: "Wprowadź ilość",
    type: "number",
  },
  {
    name: "describe",
    label: "Opis",
    placeholder: "Wprowadź Opis",
    type: "text",
  },
];

export default function CutSheetForms() {
  const [cuts, setCuts] = useState<Cutout[]>([]);
  const idCounter = useRef(0);

  const tableClass = "min-w-full divide-y divide-gray-200 border";
  const theadClass = "bg-gray-50";
  const thClass =
    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
  const tdClass = "px-6 py-4 whitespace-nowrap";
  const deleteButtonClass = "text-red-600 hover:text-red-900 font-medium";

  function handleMainBoardSubmit(
    values: CutoutFormValues,
    resetForm: (values?: CutoutFormValues) => void
  ) {
    const quantity = values.quanity;

    const elementsToAdd: Cutout[] = Array.from({ length: quantity }, () => ({
      ...values,
      quanity: 1,
      id: idCounter.current++,
    }));

    setCuts((prevCuts) => [...prevCuts, ...elementsToAdd]);
    resetForm(initialCutSheetValues);
  }

  const handleDeleteCutout = (id: number) => {
    setCuts((prevCuts) => prevCuts.filter((cut) => cut.id !== id));
  };

  return (
    <>
      <ReusableForm<CutoutFormValues>
        title="Parametry Formatki"
        defaultValues={initialCutSheetValues}
        validationSchema={cutSheetFormsValidation}
        onSubmit={handleMainBoardSubmit}
        fields={mainBoardFields}
      />
      {cuts.length > 0 && (
        <table className={tableClass}>
          <thead className={theadClass}>
            <tr>
              <th className={thClass}>Opis</th>
              <th className={thClass}>Długość (mm)</th>
              <th className={thClass}>Szerokość (mm)</th>
              <th className={thClass}>Ilość</th>
              <th className={thClass}>Akcje</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cuts.map((cut) => (
              <tr key={cut.id}>
                <td className={tdClass}>{cut.describe}</td>
                <td className={tdClass}>{cut.length}</td>
                <td className={tdClass}>{cut.width}</td>
                <td className={tdClass}>{cut.quanity}</td>
                <td className={tdClass}>
                  <button
                    onClick={() => handleDeleteCutout(cut.id)}
                    className={deleteButtonClass}
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
