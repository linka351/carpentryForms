import {
  cutSheetFormsValidation,
  type CutoutFormValues,
} from "@/validations/cutSheetFormsValidation";
import ReusableForm, { type FormFieldConfig } from "./ReusableForm";

import { useAppData } from "../context/use.app.data.context";

const initialCutSheetValues: CutoutFormValues = {
  length: 1,
  width: 1,
  quanity: 1,
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

export default function FormatForms() {
  const { cuts, addCuts, deleteCutout } = useAppData();

  function handleMainBoardSubmit(
    values: CutoutFormValues,
    resetForm: (values?: CutoutFormValues) => void
  ) {
    const quantity = values.quanity;

    const elementsToAdd: CutoutFormValues[] = Array.from(
      { length: quantity },
      () => ({
        ...values,
        quanity: 1,
      })
    );

    addCuts(elementsToAdd);

    resetForm(initialCutSheetValues);
  }

  const handleDeleteCutout = (indexToDelete: number) => {
    deleteCutout(indexToDelete);
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
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Lista Formatów (Cięć):</h2>

        {cuts.length === 0 ? (
          <p>Brak wprowadzonych elementów.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Długość (mm)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Szerokość (mm)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ilość
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cuts.map((cut, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cut.describe}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{cut.length}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cut.width}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cut.quanity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteCutout(index)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
