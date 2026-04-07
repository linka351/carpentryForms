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
  autoRotated?: boolean;
  edgeGroup?: string; // DODANE DO TYPU
}

function CutPlan() {
  const {
    plateParams,
    cuts,
    toggleRotation,
    toggleEdge,
    isGlobalLocked,
    totalEdgeLength, // To teraz jest obiekt!
  } = useAppData();

  const { margin, kerf, width, length } = plateParams;
  const projectName = (plateParams as any).projectName;

  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const screenScale = 400 / width;
  const MAX_PRINT_WIDTH_MM = 190;
  const MAX_PRINT_HEIGHT_MM = 245;
  const printScale = Math.min(
    MAX_PRINT_WIDTH_MM / width,
    MAX_PRINT_HEIGHT_MM / length,
  );

  const reactToPrintFn = useReactToPrint({
    documentTitle: projectName
      ? `Plan_Ciecia_${projectName}`
      : `Plan_Ciecia_${new Date().toISOString().slice(0, 10)}`,
  });

  const { packedBins, stats } = useMemo(() => {
    const workWidth = width - 2 * margin;
    const workHeight = length - 2 * margin;

    let itemsToPack = cuts
      .map((cut, index) => {
        let w = cut.width;
        let h = cut.length;
        let autoRotated = false;

        let wWithKerf = w + kerf;
        let hWithKerf = h + kerf;

        if (wWithKerf > workWidth || hWithKerf > workHeight) {
          if (hWithKerf <= workWidth && wWithKerf <= workHeight) {
            w = cut.length;
            h = cut.width;
            autoRotated = true;
          } else {
            if (wWithKerf > workWidth) w = Math.max(10, workWidth - kerf);
            if (hWithKerf > workHeight) h = Math.max(10, workHeight - kerf);
          }
        }

        return {
          w,
          h,
          originalIndex: index,
          label: cut.describe || "",
          edgeGroup: cut.edgeGroup || "A", // POBIERAMY GRUPĘ DO RYSUNKU
          autoRotated,
        };
      })
      .sort((a, b) => {
        const areaB = b.w * b.h;
        const areaA = a.w * a.h;
        if (areaB !== areaA) return areaB - areaA;
        return Math.max(b.w, b.h) - Math.max(a.w, a.h);
      });

    let bins: { placed: PackedItem[]; freeRects: Rect[] }[] = [];

    itemsToPack.forEach((item) => {
      let placed = false;
      let itemW = item.w + kerf;
      let itemH = item.h + kerf;

      for (let b = 0; b < bins.length; b++) {
        let bin = bins[b];
        let bestFitIndex = -1;
        let bestFitArea = Infinity;

        for (let f = 0; f < bin.freeRects.length; f++) {
          let fr = bin.freeRects[f];
          if (fr.w >= itemW && fr.h >= itemH) {
            let areaFit = fr.w * fr.h;
            if (areaFit < bestFitArea) {
              bestFitArea = areaFit;
              bestFitIndex = f;
            }
          }
        }

        if (bestFitIndex !== -1) {
          let fr = bin.freeRects[bestFitIndex];
          bin.freeRects.splice(bestFitIndex, 1);

          bin.placed.push({
            x: fr.x,
            y: fr.y,
            w: item.w,
            h: item.h,
            originalIndex: item.originalIndex,
            data: item.label,
            edgeGroup: item.edgeGroup,
            autoRotated: item.autoRotated,
          });

          const remW = fr.w - itemW;
          const remH = fr.h - itemH;

          if (remW > 0 || remH > 0) {
            if (remW > remH) {
              if (remH > 0)
                bin.freeRects.push({
                  x: fr.x,
                  y: fr.y + itemH,
                  w: itemW,
                  h: remH,
                });
              if (remW > 0)
                bin.freeRects.push({
                  x: fr.x + itemW,
                  y: fr.y,
                  w: remW,
                  h: fr.h,
                });
            } else {
              if (remW > 0)
                bin.freeRects.push({
                  x: fr.x + itemW,
                  y: fr.y,
                  w: remW,
                  h: itemH,
                });
              if (remH > 0)
                bin.freeRects.push({
                  x: fr.x,
                  y: fr.y + itemH,
                  w: fr.w,
                  h: remH,
                });
            }
          }
          placed = true;
          break;
        }
      }

      if (!placed) {
        let newBin = {
          placed: [
            {
              x: 0,
              y: 0,
              w: item.w,
              h: item.h,
              originalIndex: item.originalIndex,
              data: item.label,
              edgeGroup: item.edgeGroup,
              autoRotated: item.autoRotated,
            },
          ],
          freeRects: [] as Rect[],
        };

        const remW = workWidth - itemW;
        const remH = workHeight - itemH;

        if (remW > remH) {
          if (remH > 0)
            newBin.freeRects.push({ x: 0, y: itemH, w: itemW, h: remH });
          if (remW > 0)
            newBin.freeRects.push({ x: itemW, y: 0, w: remW, h: workHeight });
        } else {
          if (remW > 0)
            newBin.freeRects.push({ x: itemW, y: 0, w: remW, h: itemH });
          if (remH > 0)
            newBin.freeRects.push({ x: 0, y: itemH, w: workWidth, h: remH });
        }
        bins.push(newBin);
      }
    });

    const finalPackedBins = bins.map((bin) => bin.placed);

    return {
      packedBins: finalPackedBins,
      stats: finalPackedBins.map((bin) => ({
        efficiency:
          (bin.reduce((acc, item) => acc + item.w * item.h, 0) /
            (width * length)) *
          100,
      })),
    };
  }, [cuts, width, length, margin, kerf]);

  return (
    <div className="p-4 bg-slate-100 min-h-screen">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @page { size: A4 portrait; margin: 0mm; }
        @media print {
          .no-print { display: none !important; }
          body, html { background: white !important; padding: 0 !important; margin: 0 !important; }
          .print-container { width: 100% !important; padding: 10mm !important; }
          .arkusz-page { page-break-after: always !important; page-break-inside: avoid !important; display: block; width: 100%; margin-bottom: 0 !important; }
          .arkusz-page:last-child { page-break-after: auto !important; }
          .plate-box { 
            width: ${width * printScale}mm !important; 
            height: ${length * printScale}mm !important; 
            margin: 0 auto !important;
          }
        }
      `,
        }}
      />

      <div className="max-w-5xl mx-auto flex flex-col gap-4 no-print mb-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 hover:bg-slate-100 rounded-lg font-bold border border-slate-300 text-sm"
          >
            ⬅ Wstecz
          </button>

          <div className="flex gap-6 text-sm font-black uppercase text-slate-700 items-center">
            {projectName && (
              <span className="text-blue-600 mr-4">Projekt: {projectName}</span>
            )}
            <span>
              Wydajność:{" "}
              <span className="text-green-600">
                {(stats[0]?.efficiency || 0).toFixed(1)}%
              </span>
            </span>

            {/* RENDEROWANIE GRUP OKLEIN NA EKRANIE */}
            <div className="flex gap-3 flex-wrap border-l-2 pl-4">
              <span className="text-xs text-slate-400">OKLEINA:</span>
              {Object.entries(totalEdgeLength as Record<string, number>).map(
                ([group, length]) => (
                  <span key={group}>
                    {group}:{" "}
                    <span className="text-orange-500">
                      {(length / 1000).toFixed(2)}m
                    </span>
                  </span>
                ),
              )}
            </div>
          </div>

          <button
            onClick={() => reactToPrintFn(() => contentRef.current)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 text-sm"
          >
            DRUKUJ
          </button>
        </div>
      </div>

      <div
        ref={contentRef}
        className="print-container mx-auto flex flex-col items-center bg-white"
      >
        {packedBins.map((bin, bIdx) => (
          <div
            key={bIdx}
            className="arkusz-page w-full flex flex-col items-center mb-10 print:mb-0"
          >
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
                {/* RENDEROWANIE GRUP OKLEIN NA WYDRUKU */}
                <div>
                  <p className="text-[9px] font-black uppercase leading-none">
                    Suma Okleiny
                  </p>
                  <div className="text-[11px] font-black leading-tight">
                    {Object.entries(
                      totalEdgeLength as Record<string, number>,
                    ).map(([group, length]) => (
                      <div key={group}>
                        {group}:{" "}
                        <span className="text-slate-600">
                          {(length / 1000).toFixed(2)} mb
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="plate-box relative bg-white border-2 border-black mx-auto"
              style={{
                width: width * screenScale,
                height: length * screenScale,
              }}
            >
              <div
                className="relative h-full w-full overflow-hidden"
                style={{ padding: `${(margin / width) * 100}%` }}
              >
                <div className="relative w-full h-full">
                  {bin.map((rect: PackedItem) => {
                    const cutData = cuts[rect.originalIndex];
                    const workW = width - 2 * margin;
                    const workL = length - 2 * margin;

                    const pLeft = (rect.x / workW) * 100;
                    const pTop = (rect.y / workL) * 100;
                    const pWidth = ((rect.w + kerf) / workW) * 100;
                    const pHeight = ((rect.h + kerf) / workL) * 100;

                    const renderEdges = rect.autoRotated
                      ? {
                          top: cutData.edges.left,
                          right: cutData.edges.top,
                          bottom: cutData.edges.right,
                          left: cutData.edges.bottom,
                        }
                      : cutData.edges;

                    const narrowThreshold = width * 0.1;
                    const rotateText =
                      rect.w < narrowThreshold && rect.h >= narrowThreshold;

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
                        <span
                          className={`absolute top-0.5 left-1/2 -translate-x-1/2 text-[11px] print:text-[20px] font-bold text-slate-800 bg-white/90 px-0.5 z-20 leading-none ${rotateText ? "[writing-mode:vertical-rl] rotate-180" : ""}`}
                        >
                          {rect.w}
                        </span>

                        <span
                          className={`absolute left-0.5 top-1/2 -translate-y-1/2 text-[11px] print:text-[20px] font-bold text-slate-600 bg-white/90 px-0.5 z-20 leading-none ${rotateText ? "[writing-mode:vertical-rl] rotate-180" : ""}`}
                        >
                          {rect.h}
                        </span>

                        {/* DODANIE LITERY GRUPY PRZED OPISEM */}
                        <span
                          className={`text-[12px] print:text-[20px] font-black text-center px-1 flex gap-1 items-center leading-none uppercase z-20 max-w-[95%] overflow-hidden text-ellipsis whitespace-nowrap ${rotateText ? "[writing-mode:vertical-rl] rotate-180 max-h-[90%] whitespace-normal translate-x-5" : "translate-y-5"}`}
                        >
                          <span className="text-blue-600 print:text-black opacity-80">
                            {rect.edgeGroup}
                          </span>
                          <span>{rect.data}</span>
                        </span>

                        {renderEdges?.top && (
                          <div className="absolute top-0 w-full h-[3px] bg-red-600 z-10" />
                        )}
                        {renderEdges?.bottom && (
                          <div className="absolute bottom-0 w-full h-[3px] bg-red-600 z-10" />
                        )}
                        {renderEdges?.left && (
                          <div className="absolute left-0 h-full w-[3px] bg-red-600 z-10" />
                        )}
                        {renderEdges?.right && (
                          <div className="absolute right-0 h-full w-[3px] bg-red-600 z-10" />
                        )}

                        {!isGlobalLocked && (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 z-30 no-print">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleEdge(
                                  rect.originalIndex,
                                  rect.autoRotated ? "left" : "top",
                                );
                              }}
                              className="absolute top-0 w-full h-1/4 hover:bg-red-500/20"
                            />
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleEdge(
                                  rect.originalIndex,
                                  rect.autoRotated ? "right" : "bottom",
                                );
                              }}
                              className="absolute bottom-0 w-full h-1/4 hover:bg-red-500/20"
                            />
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleEdge(
                                  rect.originalIndex,
                                  rect.autoRotated ? "bottom" : "left",
                                );
                              }}
                              className="absolute left-0 h-full w-1/4 hover:bg-red-500/20"
                            />
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleEdge(
                                  rect.originalIndex,
                                  rect.autoRotated ? "top" : "right",
                                );
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

            {projectName && (
              <div
                className="mt-2 text-right font-black uppercase text-slate-500 text-[10px] print:text-[14px]"
                style={{ width: width * screenScale, maxWidth: "100%" }}
              >
                Projekt: <span className="text-black ml-1">{projectName}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CutPlan;
