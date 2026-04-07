import { useState, useCallback, useMemo, type ReactNode } from "react";
import { AppContext } from "./app.context";
import {
  initialCutoutValues,
  initialPlateValues,
} from "@/constants/context.const";
//import type { CutoutFormValues } from "@/validations/cutSheetFormsSchema.ts";
import type { ExtendedCutoutValues } from "./types";

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [plateParams, setPlateParams] = useState(initialPlateValues);
  const [isGlobalLocked, setIsGlobalLocked] = useState(false);
  const [cuts, setCuts] = useState<ExtendedCutoutValues[]>(
    initialCutoutValues.map((cut) => ({
      ...cut,
      edgePattern: ["O"], // ZMIANA: Tablica zamiast stringa
      isLocked: false,
      edges: { top: false, right: false, bottom: false, left: false },
    })),
  );

  // OBLICZANIE SUMY OKLEINY
  const totalEdgeLength = useMemo(() => {
    const totals: Record<string, number> = {};
    cuts.forEach((cut) => {
      const group = cut.edgeGroup || "A"; // Domyślnie trafia do A
      let currentCutSum = 0;
      if (cut.edges.top) currentCutSum += cut.width;
      if (cut.edges.bottom) currentCutSum += cut.width;
      if (cut.edges.left) currentCutSum += cut.length;
      if (cut.edges.right) currentCutSum += cut.length;

      if (currentCutSum > 0) {
        if (!totals[group]) totals[group] = 0;
        totals[group] += currentCutSum;
      }
    });
    return totals; // Zwraca np. { A: 12000, B: 4500 }
  }, [cuts]);

  // DODAWANIE FORMATEK
  const addCuts = useCallback((newCuts: any[]) => {
    const cutsWithDefaults = newCuts.map((cut) => ({
      ...cut,
      // Jeśli formatka ma zablokowany obrót, zostawiamy, jak nie - domyślnie false
      isLocked: cut.isLocked !== undefined ? cut.isLocked : false,

      // Jeśli klonujemy i ma wzór, zostawiamy go, jak nie - domyślnie "O"
      edgePattern: cut.edgePattern || ["O"],

      // Zostawiamy grupę
      edgeGroup: cut.edgeGroup || "A",

      // Jeśli klonujemy krawędzie, zostawiamy, jak nie - czyste
      edges: cut.edges || {
        top: false,
        right: false,
        bottom: false,
        left: false,
      },
    }));

    setCuts((prev) => [...prev, ...cutsWithDefaults]);
  }, []);

  // AKTUALIZACJA KRAWĘDZI (pojedyncza krawędź - kliknięcie na planie)
  const toggleEdge = useCallback(
    (index: number, edge: keyof ExtendedCutoutValues["edges"]) => {
      setCuts((prev) =>
        prev.map((cut, i) =>
          i === index
            ? {
                ...cut,
                edgePattern: ["custom"], // ZMIANA: Tablica zamiast stringa
                edges: { ...cut.edges, [edge]: !cut.edges[edge] },
              }
            : cut,
        ),
      );
    },
    [],
  );

  // AKTUALIZACJA KRAWĘDZI (cały wzór - Checkboxy w tabeli)
  const updateCutEdges = useCallback(
    (
      index: number,
      newEdges: ExtendedCutoutValues["edges"],
      patterns: string[], // ZMIANA: Typ string[] zamiast string
    ) => {
      setCuts((prev) =>
        prev.map((cut, i) =>
          i === index
            ? { ...cut, edges: newEdges, edgePattern: patterns }
            : cut,
        ),
      );
    },
    [],
  );

  // OBRÓT FORMATKI
  const toggleRotation = useCallback(
    (indexToRotate: number) => {
      setCuts((prev) => {
        const cut = prev[indexToRotate];
        if (isGlobalLocked || cut?.isLocked) return prev;

        return prev.map((c, i) => {
          if (i !== indexToRotate) return c;

          const rotatedEdges = {
            top: c.edges.left,
            right: c.edges.top,
            bottom: c.edges.right,
            left: c.edges.bottom,
          };

          return {
            ...c,
            width: c.length,
            length: c.width,
            edges: rotatedEdges,
            edgePattern: c.edgePattern, // Tu zostaje tablica, więc jest OK
          };
        });
      });
    },
    [isGlobalLocked],
  );

  const toggleCutLock = useCallback((i: number) => {
    setCuts((p) =>
      p.map((c, idx) => (idx === i ? { ...c, isLocked: !c.isLocked } : c)),
    );
  }, []);

  const deleteCutout = useCallback((i: number) => {
    setCuts((p) => p.filter((_, idx) => idx !== i));
  }, []);

  const resetCuts = useCallback(() => setCuts([]), []);

  return (
    <AppContext.Provider
      value={{
        plateParams,
        setPlateParams,
        cuts,
        addCuts,
        updateCutEdges,
        toggleRotation,
        isGlobalLocked,
        setIsGlobalLocked,
        totalEdgeLength,
        toggleEdge,
        deleteCutout,
        resetCuts,
        toggleCutLock,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
