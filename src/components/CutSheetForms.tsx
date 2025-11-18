import ReusableForm, { type FormFieldConfig } from "./ReusableForm";
import { useAppData } from "../context/useAppData.context";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/table";
import {
  cutSheetFormsSchema,
  type CutoutFormValues,
} from "../validations/cutSheetFormsSchema.ts";
import { Button } from "./ui/button/button";

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
      () => ({ ...values, quanity: 1 })
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
        validationSchema={cutSheetFormsSchema}
        onSubmit={handleMainBoardSubmit}
        fields={mainBoardFields}
      />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Lista Formatów (Cięć):</h2>

        {cuts.length === 0 ? (
          <p>Brak wprowadzonych elementów.</p>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Opis</TableHead>
                <TableHead>Długość (mm)</TableHead>
                <TableHead>Szerokość (mm)</TableHead>
                <TableHead>Ilość</TableHead>
                <TableHead>Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cuts.map((cut, index) => (
                <TableRow key={index}>
                  <TableCell>{cut.describe}</TableCell>
                  <TableCell>{cut.length}</TableCell>
                  <TableCell>{cut.width}</TableCell>
                  <TableCell>{cut.quanity}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCutout(index)}
                    >
                      Usuń
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}
