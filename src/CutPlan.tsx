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

  // --- SKALOWANIE ---
  const screenScale = 400 / width;

  // Twarde wymiary dla wydruku A4 (z marginesem bezpieczeństwa)
  const MAX_PRINT_WIDTH_MM = 190;
  const MAX_PRINT_HEIGHT_MM = 270;
  const printScale = Math.min(
    MAX_PRINT_WIDTH_MM / width,
    MAX_PRINT_HEIGHT_MM / length,
  );

  // Funkcja drukująca - przywrócona działająca wersja
  const reactToPrintFn = useReactToPrint({
    documentTitle: `Plan_Ciecia_${new Date().toISOString().slice(0, 10)}`,
  });

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
    let shelfX = 0,
      shelfY = 0,
      shelfHeight = 0;
    const workWidth = width - 2 * margin;
    const workHeight = length - 2 * margin;

    itemsToPack.forEach((item) => {
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
      } else if (shelfY + shelfHeight + kerf + item.h <= workHeight) {
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
      } else {
        if (currentBin.length > 0) bins.push(currentBin);
        currentBin = [
          {
            x: 0,
            y: 0,
            w: item.w,
            h: item.h,
            originalIndex: item.originalIndex,
            data: item.label,
          },
        ];
        shelfX = item.w + kerf;
        shelfY = 0;
        shelfHeight = item.h;
      }
    });
    if (currentBin.length > 0) bins.push(currentBin);

    return {
      packedBins: bins,
      stats: bins.map((bin) => ({
        efficiency:
          (bin.reduce(
            (acc: number, item: PackedItem) => acc + item.w * item.h,
            0,
          ) /
            (width * length)) *
          100,
      })),
    };
  }, [cuts, width, length, margin, kerf]);

  const formattedOkleina = (totalEdgeLength / 1000).toFixed(2);

  return (
    <div className="p-4 bg-slate-100 min-h-screen">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @page { 
          size: A4 portrait; 
          margin: 0mm; /* Brak nagłówków przeglądarki z adresami URL */
        }
        @media print {
          .no-print { display: none !important; }
          body, html { background: white !important; padding: 0 !important; margin: 0 !important; }
          
          .print-container { 
            width: 100% !important; 
            padding: 10mm !important; 
          }
          
          .arkusz-page {
            page-break-after: always !important;
            page-break-inside: avoid !important;
            display: block;
            width: 100%;
            margin-bottom: 0 !important;
          }
          
          .arkusz-page:last-child {
            page-break-after: auto !important; 
          }

          .plate-box { 
            width: ${width * printScale}mm !important; 
            height: ${length * printScale}mm !important; 
            margin: 0 auto !important;
          }
        }
      `,
        }}
      />

      {/* PANEL EKRANOWY */}
      <div className="max-w-5xl mx-auto flex flex-col gap-4 no-print mb-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 hover:bg-slate-100 rounded-lg font-bold border border-slate-300 text-sm"
          >
            ⬅ Wstecz
          </button>

          <div className="flex gap-6 text-sm font-black uppercase text-slate-700">
            <span>
              Wydajność:{" "}
              <span className="text-green-600">
                {(stats[0]?.efficiency || 0).toFixed(1)}%
              </span>
            </span>
            <span>
              Okleina:{" "}
              <span className="text-orange-500">{formattedOkleina}m</span>
            </span>
          </div>

          <button
            onClick={() => reactToPrintFn(() => contentRef.current)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 text-sm"
          >
            DRUKUJ
          </button>
        </div>
      </div>

      {/* OBSZAR WYDRUKU */}
      <div
        ref={contentRef}
        className="print-container mx-auto flex flex-col items-center bg-white"
      >
        {packedBins.map((bin, bIdx) => (
          <div
            key={bIdx}
            className="arkusz-page w-full flex flex-col items-center mb-10 print:mb-0"
          >
            {/* Nagłówek raportu */}
            <div
              className="border-b-2 border-black pb-2 mb-4 flex justify-between items-end"
              style={{ width: width * screenScale, maxWidth: "100%" }}
            >
              <div>
                <h2 className="text-xl font-black uppercase leading-none mb-1">
                  PLAN CIĘCIA
                </h2>
                <p className="text-[10px] font-bold text-slate-700">
                  Arkusz: #{bIdx + 1} | {width}x{length}mm | Margines: {margin}
                  mm
                </p>
              </div>
              <div className="flex gap-4 text-right">
                <div>
                  <p className="text-[9px] font-black uppercase leading-none">
                    Wydajność
                  </p>
                  <p className="text-sm font-black">
                    {stats[bIdx].efficiency.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase leading-none">
                    Suma Okleiny
                  </p>
                  <p className="text-sm font-black">{formattedOkleina} mb</p>
                </div>
              </div>
            </div>

            {/* Płyta z formatkami */}
            <div
              className="plate-box relative bg-white border-2 border-black mx-auto"
              style={{
                width: width * screenScale,
                height: length * screenScale,
              }}
            >
              {/* overflow-hidden ucina nadmiarowe wizualne rozciągnięcie kerfu przy krawędziach */}
              <div
                className="relative h-full w-full overflow-hidden"
                style={{ padding: `${(margin / width) * 100}%` }}
              >
                <div className="relative w-full h-full">
                  {bin.map((rect: PackedItem) => {
                    const cutData = cuts[rect.originalIndex];
                    const workW = width - 2 * margin;
                    const workL = length - 2 * margin;

                    // MAGIA: Wizualnie powiększamy formatkę o `kerf`, żeby przykleiła się do następnej.
                    // Eliminuje to błędy wyświetlania pustych przestrzeni i zaokrąglania pikseli.
                    const pLeft = (rect.x / workW) * 100;
                    const pTop = (rect.y / workL) * 100;
                    const pWidth = ((rect.w + kerf) / workW) * 100;
                    const pHeight = ((rect.h + kerf) / workL) * 100;

                    return (
                      <div
                        key={rect.originalIndex}
                        className={`absolute border border-black flex flex-col items-center justify-center bg-white group ${!isGlobalLocked ? "hover:bg-blue-50 cursor-pointer" : ""}`}
                        style={{
                          left: `${pLeft}%`,
                          top: `${pTop}%`,
                          width: `${pWidth}%`,
                          height: `${pHeight}%`,
                        }}
                        onClick={() =>
                          !isGlobalLocked && toggleRotation(rect.originalIndex)
                        }
                      >
                        {/* Wymiary: 11px, wyśrodkowane */}
                        <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[11px] font-bold text-slate-800 bg-white/90 px-1 z-20 leading-none">
                          {rect.w}
                        </span>

                        <span className="absolute left-0.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-600 bg-white/90 px-1 z-20 leading-none">
                          {rect.h}
                        </span>

                        <span className="text-[12px] font-black text-center px-1 leading-none uppercase z-20">
                          {rect.data}
                        </span>

                        {/* Oklejanie */}
                        {cutData?.edges.top && (
                          <div className="absolute top-0 w-full h-[3px] bg-red-600 z-10" />
                        )}
                        {cutData?.edges.bottom && (
                          <div className="absolute bottom-0 w-full h-[3px] bg-red-600 z-10" />
                        )}
                        {cutData?.edges.left && (
                          <div className="absolute left-0 h-full w-[3px] bg-red-600 z-10" />
                        )}
                        {cutData?.edges.right && (
                          <div className="absolute right-0 h-full w-[3px] bg-red-600 z-10" />
                        )}

                        {/* Strefy interakcji */}
                        {!isGlobalLocked && (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 z-30 no-print">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CutPlan;
