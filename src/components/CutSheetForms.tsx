import { useMemo } from "react";
import { useAppData } from "../context/useAppData.context";
import ReusableForm, { type FormFieldConfig } from "./ReusableForm";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Minus } from "lucide-react";
import { applyEdgePattern } from "../utils/edgeUtils";
import type { ExtendedCutoutValues } from "../context/types";

export const initialCutSheetValues: CutoutFormValues = {
  length: 1,
  width: 1,
  quanity: 1,
  describe: "",
  isLocked: false,
  edges: { top: false, right: false, bottom: false, left: false },
};

const EDGE_OPTIONS = [
  { label: "O", value: "O" },
  { label: "1D", value: "1D" },
  { label: "2D", value: "2D" },
  { label: "1K", value: "1K" },
  { label: "2K", value: "2K" },
  { label: "X", value: "X" },
];

const mainBoardFields: FormFieldConfig<CutoutFormValues>[] = [
  { name: "length", label: "Długość (mm)", type: "number" },
  { name: "width", label: "Szerokość (mm)", type: "number" },
  { name: "quanity", label: "Ilość", type: "number" },
  { name: "describe", label: "Opis", type: "text" },
];

export default function CutSheetForms({
  showOnly,
}: {
  showOnly?: "form" | "table";
}) {
  const {
    cuts,
    addCuts,
    deleteCutout,
    toggleCutLock,
    updateCutEdges,
    isGlobalLocked,
    setIsGlobalLocked,
  } = useAppData();

  const groupedCuts = useMemo(() => {
    const groups: Record<string, ExtendedCutoutValues & { indices: number[] }> =
      {};
    cuts.forEach((cut, index) => {
      const key = `${cut.length}-${cut.width}-${cut.describe}-${!!cut.isLocked}-${cut.edgePattern}`;
      if (groups[key]) {
        groups[key].quanity += 1;
        groups[key].indices.push(index);
      } else {
        groups[key] = { ...cut, quanity: 1, indices: [index] };
      }
    });
    return Object.values(groups);
  }, [cuts]);

  function handleMainBoardSubmit(values: CutoutFormValues, resetForm: any) {
    const quantity = Number(values.quanity);
    const elementsToAdd = Array.from({ length: quantity }, () => ({
      ...values,
      quanity: 1,
      isLocked: false,
      edgePattern: "O",
      edges: { top: false, right: false, bottom: false, left: false },
    }));
    addCuts(elementsToAdd);
    resetForm(initialCutSheetValues);
  }

  return (
    <div className="w-full">
      {(!showOnly || showOnly === "form") && (
        <ReusableForm<CutoutFormValues>
          title="Nowa Formatka"
          defaultValues={initialCutSheetValues}
          validationSchema={cutSheetFormsSchema}
          onSubmit={handleMainBoardSubmit}
          fields={mainBoardFields}
          isAllDisabled={isGlobalLocked}
        />
      )}

      {(!showOnly || showOnly === "table") && (
        <div className="border border-slate-200 rounded-2xl bg-white shadow-lg overflow-hidden w-full">
          <Table className="w-full">
            <TableHeader className="bg-slate-50">
              <TableRow className="h-14">
                <TableHead className="w-[80px] text-center font-bold text-slate-400 uppercase text-[10px]">
                  Blokada
                </TableHead>
                <TableHead className="font-bold text-slate-400 uppercase text-[10px]">
                  Element
                </TableHead>
                <TableHead className="text-center font-bold text-slate-400 uppercase text-[10px]">
                  Wymiary (mm)
                </TableHead>
                <TableHead className="text-center font-bold text-slate-400 uppercase text-[10px]">
                  Ilość
                </TableHead>
                <TableHead className="text-center w-[280px] font-bold text-slate-400 uppercase text-[10px]">
                  Oklejanie
                </TableHead>
                <TableHead className="text-right pr-8 font-bold text-slate-400 uppercase text-[10px]">
                  Akcje
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedCuts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-slate-300 italic"
                  >
                    Lista formatowania jest pusta...
                  </TableCell>
                </TableRow>
              ) : (
                groupedCuts.map((group, gIdx) => (
                  <TableRow
                    key={gIdx}
                    className={`h-16 border-b transition-colors ${isGlobalLocked || group.isLocked ? "bg-slate-50/50 opacity-60" : "hover:bg-blue-50/20"}`}
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isGlobalLocked || group.isLocked}
                        disabled={isGlobalLocked}
                        onCheckedChange={() =>
                          group.indices.forEach(toggleCutLock)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-bold text-slate-700">
                      {group.describe || "-"}
                    </TableCell>
                    <TableCell className="text-center font-mono font-black text-blue-700 text-lg">
                      {group.length} × {group.width}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-black text-xl">
                        {group.quanity}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1 font-bold">
                        SZT
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-center">
                        {EDGE_OPTIONS.map((opt) => (
                          <label
                            key={opt.value}
                            className="flex flex-col items-center group cursor-pointer px-1"
                          >
                            <input
                              type="radio"
                              name={`edge-group-${gIdx}`}
                              checked={group.edgePattern === opt.value}
                              className="w-4 h-4 accent-blue-600"
                              onChange={() => {
                                const newEdges = applyEdgePattern(
                                  opt.value,
                                  group.length,
                                  group.width,
                                );
                                group.indices.forEach((idx) =>
                                  updateCutEdges(idx, newEdges, opt.value),
                                );
                              }}
                            />
                            <span className="text-[9px] mt-1 font-bold text-slate-400 group-hover:text-blue-600">
                              {opt.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 text-amber-600 border-amber-100 hover:bg-amber-50"
                          onClick={() =>
                            deleteCutout(
                              group.indices[group.indices.length - 1],
                            )
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 text-red-500 hover:bg-red-50"
                          onClick={() =>
                            [...group.indices].reverse().forEach(deleteCutout)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="p-4 bg-slate-50 flex items-center gap-3 border-t">
            <Checkbox
              id="global-lock"
              checked={isGlobalLocked}
              onCheckedChange={(val) => setIsGlobalLocked(!!val)}
            />
            <label
              htmlFor="global-lock"
              className="text-sm font-bold text-slate-600 cursor-pointer"
            >
              Zablokuj orientację wszystkich formatek (brak obrotu)
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
