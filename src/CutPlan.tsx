import { useMemo, useRef } from "react";
import { useAppData } from "./context/useAppData.context";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom"; // Zakładam użycie routera, jeśli nie - zamień na własną funkcję

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

  // Skala na ekran (kompaktowa)
  const screenScale = 520 / width;

  // Skala do druku (duża na A4)
  const printScale = 720 / width;

  const reactToPrintFn = useReactToPrint({
    documentTitle: `Plan_Ciecia_${new Date().toISOString().slice(0, 10)}`,
  });

  const handlePrint = () => reactToPrintFn(() => contentRef.current);

  const workWidth = width - 2 * margin;
  const workHeight = length - 2 * margin;

  // --- LOGIKA PAKOWANIA (MaxRects) ---
  const { packedBins, stats } = useMemo(() => {
    const itemsToPack = cuts.map((cut, index) => ({
      w: cut.width,
      h: cut.length,
      originalIndex: index,
      label: cut.describe || "",
    }));
    const sortedCuts = [...itemsToPack].sort((a, b) => b.w * b.h - a.w * a.h);
    let bins: PackedItem[][] = [];
    let freeRectsByBin: Rect[][] = [];

    const isContained = (a: Rect, b: Rect) =>
      a.x >= b.x &&
      a.y >= b.y &&
      a.x + a.w <= b.x + b.w &&
      a.y + a.h <= b.y + b.h;

    const placeInBin = (
      binIdx: number,
      itemW: number,
      itemH: number,
      itemIndex: number,
      label: string,
    ) => {
      let freeRects = freeRectsByBin[binIdx];
      let bestRectIdx = -1;
      let minShortSideFit = Infinity;
      for (let i = 0; i < freeRects.length; i++) {
        const r = freeRects[i];
        if (r.w >= itemW && r.h >= itemH) {
          const leftoverW = r.w - itemW;
          const leftoverH = r.h - itemH;
          const shortSideFit = Math.min(leftoverW, leftoverH);
          if (shortSideFit < minShortSideFit) {
            minShortSideFit = shortSideFit;
            bestRectIdx = i;
          }
        }
      }
      if (bestRectIdx === -1) return null;
      const chosenRect = freeRects[bestRectIdx];
      const newNode: PackedItem = {
        x: chosenRect.x,
        y: chosenRect.y,
        w: itemW,
        h: itemH,
        originalIndex: itemIndex,
        data: label,
      };
      const newFreeRects: Rect[] = [];
      const usedW = itemW + kerf;
      const usedH = itemH + kerf;
      for (let i = 0; i < freeRects.length; i++) {
        const free = freeRects[i];
        if (
          newNode.x >= free.x + free.w ||
          newNode.x + usedW <= free.x ||
          newNode.y >= free.y + free.h ||
          newNode.y + usedH <= free.y
        ) {
          newFreeRects.push(free);
          continue;
        }
        if (newNode.x + usedW < free.x + free.w)
          newFreeRects.push({
            ...free,
            x: newNode.x + usedW,
            w: free.x + free.w - (newNode.x + usedW),
          });
        if (newNode.x > free.x)
          newFreeRects.push({ ...free, w: newNode.x - free.x });
        if (newNode.y + usedH < free.y + free.h)
          newFreeRects.push({
            ...free,
            y: newNode.y + usedH,
            h: free.y + free.h - (newNode.y + usedH),
          });
        if (newNode.y > free.y)
          newFreeRects.push({ ...free, h: newNode.y - free.y });
      }
      const prunedRects: Rect[] = [];
      for (let i = 0; i < newFreeRects.length; i++) {
        let isRedundant = false;
        for (let j = 0; j < newFreeRects.length; j++) {
          if (i !== j && isContained(newFreeRects[i], newFreeRects[j])) {
            isRedundant = true;
            break;
          }
        }
        if (!isRedundant) prunedRects.push(newFreeRects[i]);
      }
      freeRectsByBin[binIdx] = prunedRects;
      return newNode;
    };

    sortedCuts.forEach((item) => {
      let placed = false;
      for (let i = 0; i < bins.length; i++) {
        const result = placeInBin(
          i,
          item.w,
          item.h,
          item.originalIndex,
          item.label,
        );
        if (result) {
          bins[i].push(result);
          placed = true;
          break;
        }
      }
      if (!placed) {
        bins.push([]);
        freeRectsByBin.push([{ x: 0, y: 0, w: workWidth, h: workHeight }]);
        const result = placeInBin(
          bins.length - 1,
          item.w,
          item.h,
          item.originalIndex,
          item.label,
        );
        if (result) bins[bins.length - 1].push(result);
      }
    });

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
    <div className="p-6 bg-slate-50 min-h-screen flex flex-col items-center">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @page { size: A4 portrait; margin: 15mm; }
        
        /* Styl na ekranie */
        .sheet-container {
          width: ${width * screenScale}px;
          height: ${length * screenScale}px;
          transition: all 0.2s ease;
        }

        @media print {
          .no-print { display: none !important; }
          .sheet-container { 
            width: ${width * printScale}px !important;
            height: ${length * printScale}px !important;
            box-shadow: none !important; 
            border: 2px solid #000 !important;
            page-break-after: always;
            margin-bottom: 0 !important;
          }
          .sheet-container:last-child { page-break-after: auto; }
        }
      `,
        }}
      />

      {/* PASEK PRZYCISKÓW */}
      <div className="mb-8 flex gap-3 no-print">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-white border-2 border-slate-300 text-slate-600 rounded-lg font-bold hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all"
        >
          <span>⬅️</span> Wróć do edycji
        </button>
        <button
          onClick={handlePrint}
          className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95"
        >
          <span>🖨️</span> Drukuj Plan
        </button>
      </div>

      {/* STATYSTYKI KOMPAKTOWE */}
      <div className="grid grid-cols-3 gap-3 mb-10 w-full max-w-xl no-print text-center">
        <div className="bg-white p-2 rounded shadow-sm border-b-2 border-blue-400">
          <span className="text-[9px] text-gray-400 uppercase font-black block tracking-widest">
            Płyty
          </span>
          <span className="text-md font-black">{packedBins.length}</span>
        </div>
        <div className="bg-white p-2 rounded shadow-sm border-b-2 border-green-400">
          <span className="text-[9px] text-gray-400 uppercase font-black block tracking-widest">
            Wydajność
          </span>
          <span className="text-md font-black">
            {(
              stats.reduce((a, b) => a + b.efficiency, 0) / stats.length || 0
            ).toFixed(1)}
            %
          </span>
        </div>
        <div className="bg-white p-2 rounded shadow-sm border-b-2 border-orange-400">
          <span className="text-[9px] text-gray-400 uppercase font-black block tracking-widest">
            Okleina
          </span>
          <span className="text-md font-black">
            {(totalEdgeLength / 1000).toFixed(2)}m
          </span>
        </div>
      </div>

      <div
        ref={contentRef}
        className="flex flex-col items-center gap-12 print:gap-0"
      >
        {packedBins.map((bin, bIdx) => {
          // Ustalanie skali w locie dla kontenera (ekran vs druk)
          const isPrinting =
            typeof window !== "undefined" && window.matchMedia("print").matches;
          const s = isPrinting ? printScale : screenScale;

          return (
            <div
              key={bIdx}
              className="sheet-container relative bg-white shadow-lg border border-slate-300"
            >
              <h3 className="absolute -top-6 left-0 font-bold text-slate-400 text-[9px] uppercase tracking-tighter print:text-black print:text-[12px]">
                Arkusz #{bIdx + 1} | {width}x{length}mm |{" "}
                {stats[bIdx].efficiency.toFixed(1)}%
              </h3>

              <div
                className="relative"
                style={{ top: margin * s, left: margin * s }}
              >
                {bin.map((rect) => {
                  const cutData = cuts[rect.originalIndex];
                  return (
                    <div
                      key={rect.originalIndex}
                      className="absolute border border-black flex flex-col items-center justify-center bg-white hover:bg-blue-50 print:bg-white overflow-hidden"
                      style={{
                        left: rect.x * s,
                        top: rect.y * s,
                        width: rect.w * s,
                        height: rect.h * s,
                      }}
                      onClick={() =>
                        !isGlobalLocked && toggleRotation(rect.originalIndex)
                      }
                    >
                      <span
                        className="absolute top-0.5 text-[8px] font-bold z-30"
                        style={{ fontSize: s * 30 > 7 ? "8px" : "6px" }}
                      >
                        {rect.w}
                      </span>
                      <span
                        className="absolute left-0.5 text-[8px] font-bold [writing-mode:vertical-lr] z-30"
                        style={{ fontSize: s * 30 > 7 ? "8px" : "6px" }}
                      >
                        {rect.h}
                      </span>

                      <span
                        className="font-bold text-blue-900 print:text-black text-center px-0.5 z-30 break-words leading-none"
                        style={{ fontSize: s * 40 > 9 ? "10px" : "7px" }}
                      >
                        {rect.data}
                      </span>

                      {cutData?.edges.top && (
                        <div className="absolute top-0 w-full h-[2px] bg-red-600 print:bg-black z-10" />
                      )}
                      {cutData?.edges.bottom && (
                        <div className="absolute bottom-0 w-full h-[2px] bg-red-600 print:bg-black z-10" />
                      )}
                      {cutData?.edges.left && (
                        <div className="absolute left-0 h-full w-[2px] bg-red-600 print:bg-black z-10" />
                      )}
                      {cutData?.edges.right && (
                        <div className="absolute top-0 right-0 h-full w-[2px] bg-red-600 print:bg-black z-10" />
                      )}

                      {!isGlobalLocked && (
                        <div className="absolute inset-0 z-20 no-print">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEdge(rect.originalIndex, "top");
                            }}
                            className="absolute top-0 w-full h-1/3 hover:bg-red-500/5"
                          />
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEdge(rect.originalIndex, "bottom");
                            }}
                            className="absolute bottom-0 w-full h-1/3 hover:bg-red-500/5"
                          />
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEdge(rect.originalIndex, "left");
                            }}
                            className="absolute left-0 h-full w-1/3 hover:bg-red-500/5"
                          />
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEdge(rect.originalIndex, "right");
                            }}
                            className="absolute right-0 h-full w-1/3 hover:bg-red-500/5"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CutPlan;
