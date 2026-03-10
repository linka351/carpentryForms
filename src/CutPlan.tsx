import { useMemo, useRef } from "react";
import { useAppData } from "./context/useAppData.context";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface PackedItem extends Rect {
  originalIndex: number;
  data: string;
}

function CutPlan() {
  const {
    plateParams,
    cuts,
    toggleRotation,
    toggleEdge,
    isGlobalLocked,
    totalEdgeLength,
  } = useAppData();

  const { margin, kerf, width, length } = plateParams;
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Skalowanie
  const screenScale = 520 / width;
  const printScale = 720 / width;

  const workWidth = width - 2 * margin;
  const workHeight = length - 2 * margin;

  const reactToPrintFn = useReactToPrint({
    documentTitle: `Plan_Ciecia_${new Date().toISOString().slice(0, 10)}`,
  });

  // ALGORYTM PÓŁKOWY (SHELF) - Najlepszy do gilotyny i maksymalnego ścisku
  const { packedBins, stats } = useMemo(() => {
    let itemsToPack = cuts
      .map((cut, index) => ({
        w: cut.width,
        h: cut.length,
        originalIndex: index,
        label: cut.describe || "",
      }))
      .sort((a, b) => b.h - a.h || b.w - a.w);

    let bins: PackedItem[][] = [];
    let currentBin: PackedItem[] = [];
    let shelfX = 0;
    let shelfY = 0;
    let shelfHeight = 0;

    itemsToPack.forEach((item) => {
      // Czy wejdzie w aktualny rządek?
      if (shelfX + item.w <= workWidth && shelfY + item.h <= workHeight) {
        currentBin.push({
          x: shelfX,
          y: shelfY,
          w: item.w,
          h: item.h,
          originalIndex: item.originalIndex,
          data: item.label,
        });
        shelfX += item.w + kerf;
        shelfHeight = Math.max(shelfHeight, item.h);
      }
      // Czy nowa półka na tej samej płycie?
      else if (shelfY + shelfHeight + kerf + item.h <= workHeight) {
        shelfY += shelfHeight + kerf;
        shelfX = 0;
        shelfHeight = item.h;
        currentBin.push({
          x: shelfX,
          y: shelfY,
          w: item.w,
          h: item.h,
          originalIndex: item.originalIndex,
          data: item.label,
        });
        shelfX += item.w + kerf;
      }
      // Nowa płyta
      else {
        if (currentBin.length > 0) bins.push(currentBin);
        currentBin = [];
        shelfX = 0;
        shelfY = 0;
        shelfHeight = item.h;
        currentBin.push({
          x: shelfX,
          y: shelfY,
          w: item.w,
          h: item.h,
          originalIndex: item.originalIndex,
          data: item.label,
        });
        shelfX += item.w + kerf;
      }
    });

    if (currentBin.length > 0) bins.push(currentBin);

    return {
      packedBins: bins,
      stats: bins.map((bin) => ({
        efficiency:
          (bin.reduce((acc, item) => acc + item.w * item.h, 0) /
            (workWidth * workHeight)) *
          100,
      })),
    };
  }, [cuts, workWidth, workHeight, kerf]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          .no-print { display: none !important; }
          .print-sheet { 
            width: ${width * printScale}px !important; 
            height: ${length * printScale}px !important; 
            page-break-after: always;
            margin: 0 !important;
            border: 1px solid black !important;
          }
        }
      `,
        }}
      />

      <div className="max-w-5xl mx-auto flex flex-col gap-6 no-print">
        {/* PANEL STEROWANIA I STATYSTYKI */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-white border border-slate-300 rounded shadow-sm font-bold"
          >
            ⬅ Wróć
          </button>

          <div className="flex gap-4">
            <div className="bg-white p-3 rounded border-b-4 border-blue-500 text-center min-w-[80px]">
              <p className="text-[10px] text-gray-400 font-bold uppercase">
                Płyty
              </p>
              <p className="text-xl font-black">{packedBins.length}</p>
            </div>
            <div className="bg-white p-3 rounded border-b-4 border-green-500 text-center min-w-[80px]">
              <p className="text-[10px] text-gray-400 font-bold uppercase">
                Wydajność
              </p>
              <p className="text-xl font-black">
                {(
                  stats.reduce((a, b) => a + b.efficiency, 0) /
                  (stats.length || 1)
                ).toFixed(1)}
                %
              </p>
            </div>
            <div className="bg-white p-3 rounded border-b-4 border-orange-500 text-center min-w-[80px]">
              <p className="text-[10px] text-gray-400 font-bold uppercase">
                Okleina
              </p>
              <p className="text-xl font-black">
                {(totalEdgeLength / 1000).toFixed(1)}m
              </p>
            </div>
          </div>

          <button
            onClick={() => reactToPrintFn(() => contentRef.current)}
            className="px-6 py-2 bg-blue-600 text-white rounded font-bold shadow-md"
          >
            Drukuj
          </button>
        </div>

        {/* WIZUALIZACJA */}
        <div ref={contentRef} className="flex flex-col gap-10 items-center">
          {packedBins.map((bin, bIdx) => (
            <div
              key={bIdx}
              className="print-sheet relative bg-white border border-slate-300 shadow-xl"
              style={{
                width: width * screenScale,
                height: length * screenScale,
              }}
            >
              <p className="absolute -top-5 left-0 text-[10px] font-bold text-slate-400 uppercase no-print">
                Arkusz #{bIdx + 1} | Wydajność:{" "}
                {stats[bIdx].efficiency.toFixed(1)}%
              </p>

              <div
                className="relative"
                style={{
                  top: margin * screenScale,
                  left: margin * screenScale,
                }}
              >
                {bin.map((rect) => {
                  const cutData = cuts[rect.originalIndex];
                  return (
                    <div
                      key={rect.originalIndex}
                      className="absolute border border-black bg-white flex flex-col items-center justify-center overflow-hidden group cursor-pointer"
                      style={{
                        left: rect.x * screenScale,
                        top: rect.y * screenScale,
                        width: rect.w * screenScale,
                        height: rect.h * screenScale,
                      }}
                      onClick={() =>
                        !isGlobalLocked && toggleRotation(rect.originalIndex)
                      }
                    >
                      {/* Wymiary i Opis */}
                      <span className="absolute top-0.5 text-[7px] font-bold">
                        {rect.w}
                      </span>
                      <span className="absolute left-0.5 text-[7px] font-bold [writing-mode:vertical-lr]">
                        {rect.h}
                      </span>
                      <span className="text-[10px] font-black uppercase text-center leading-none">
                        {rect.data}
                      </span>

                      {/* Oklejanie (Użycie toggleEdge i totalEdgeLength) */}
                      {cutData?.edges.top && (
                        <div className="absolute top-0 w-full h-[2px] bg-red-600 z-10" />
                      )}
                      {cutData?.edges.bottom && (
                        <div className="absolute bottom-0 w-full h-[2px] bg-red-600 z-10" />
                      )}
                      {cutData?.edges.left && (
                        <div className="absolute left-0 h-full w-[2px] bg-red-600 z-10" />
                      )}
                      {cutData?.edges.right && (
                        <div className="absolute right-0 h-full w-[2px] bg-red-600 z-10" />
                      )}

                      {/* Interaktywne strefy oklejania */}
                      {!isGlobalLocked && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 z-20 no-print">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEdge(rect.originalIndex, "top");
                            }}
                            className="absolute top-0 w-full h-1/4 hover:bg-red-500/20"
                          />
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEdge(rect.originalIndex, "bottom");
                            }}
                            className="absolute bottom-0 w-full h-1/4 hover:bg-red-500/20"
                          />
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEdge(rect.originalIndex, "left");
                            }}
                            className="absolute left-0 h-full w-1/4 hover:bg-red-500/20"
                          />
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEdge(rect.originalIndex, "right");
                            }}
                            className="absolute right-0 h-full w-1/4 hover:bg-red-500/20"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CutPlan;
