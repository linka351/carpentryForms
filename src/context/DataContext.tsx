import { useState, useCallback, useMemo, type ReactNode } from "react";
import { AppContext } from "./app.context";
import {
  initialCutoutValues,
  initialPlateValues,
} from "@/constants/context.const";
import type { CutoutFormValues } from "@/validations/cutSheetFormsSchema.ts";
import type { ExtendedCutoutValues } from "./types";

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [plateParams, setPlateParams] = useState(initialPlateValues);
  const [isGlobalLocked, setIsGlobalLocked] = useState(false);
  const [cuts, setCuts] = useState<ExtendedCutoutValues[]>(
    initialCutoutValues.map((cut) => ({
      ...cut,
      isLocked: false,
      edgePattern: "O",
      edges: { top: false, right: false, bottom: false, left: false },
    })),
  );

  // OBLICZANIE SUMY OKLEINY
  const totalEdgeLength = useMemo(() => {
    return cuts.reduce((total, cut) => {
      let currentCutSum = 0;
      if (cut.edges.top) currentCutSum += cut.width;
      if (cut.edges.bottom) currentCutSum += cut.width;
      if (cut.edges.left) currentCutSum += cut.length;
      if (cut.edges.right) currentCutSum += cut.length;
      return total + currentCutSum;
    }, 0);
  }, [cuts]);

  // DODAWANIE FORMATEK
  const addCuts = useCallback((newCuts: CutoutFormValues[]) => {
    const cutsWithDefaults = newCuts.map((cut) => ({
      ...cut,
      isLocked: false,
      edgePattern: "O",
      edges: { top: true, right: true, bottom: true, left: true },
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
                edgePattern: "custom", // Resetujemy wzór, bo użytkownik zmienił go ręcznie
                edges: { ...cut.edges, [edge]: !cut.edges[edge] },
              }
            : cut,
        ),
      );
    },
    [],
  );

  // AKTUALIZACJA KRAWĘDZI (cały wzór - Radio w tabeli)
  const updateCutEdges = useCallback(
    (
      index: number,
      newEdges: ExtendedCutoutValues["edges"],
      pattern: string,
    ) => {
      setCuts((prev) =>
        prev.map((cut, i) =>
          i === index ? { ...cut, edges: newEdges, edgePattern: pattern } : cut,
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

          // Obracamy fizyczne krawędzie o 90 stopni
          const rotatedEdges = {
            top: c.edges.left,
            right: c.edges.top,
            bottom: c.edges.right,
            left: c.edges.bottom,
          };

          return {
            ...c,
            width: c.length, // Zamiana wymiarów mm
            length: c.width,
            edges: rotatedEdges,
            // Kluczowe: zostawiamy ten sam wzór (np. "1D"),
            // bo długi bok to wciąż długi bok!
            edgePattern: c.edgePattern,
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
