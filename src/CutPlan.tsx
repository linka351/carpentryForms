import { useMemo, useRef, useState } from "react";
import { useAppData } from "./context/useAppData.context";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

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
  edgeGroup?: string;
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
  const projectName = (plateParams as any).projectName;

  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const screenScale = 800 / width;
  const MAX_PRINT_WIDTH_MM = 190;
  const MAX_PRINT_HEIGHT_MM = 235;
  const printScale = Math.min(
    MAX_PRINT_WIDTH_MM / width,
    MAX_PRINT_HEIGHT_MM / length,
  );

  const reactToPrintFn = useReactToPrint({
    documentTitle: projectName
      ? `Plan_Ciecia_${projectName}`
      : `Plan_Ciecia_${new Date().toISOString().slice(0, 10)}`,
  });

  const handleDownloadPdf = async () => {
    const element = contentRef.current;
    if (!element) return;

    setIsPdfGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const pages = element.querySelectorAll(".pdf-export-wrap");
    const pdf = new jsPDF("p", "mm", "a4");

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement;

      try {
        const imgData = await toPng(page, {
          quality: 1,
          pixelRatio: 3,
          backgroundColor: "#ffffff",
          cacheBust: true,
          style: {
            margin: "0",
            padding: "0",
          },
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = MAX_PRINT_WIDTH_MM;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        const marginX = (210 - pdfWidth) / 2;
        const marginY = 10;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, "PNG", marginX, marginY, pdfWidth, pdfHeight);
      } catch (err) {
        console.error("Błąd podczas generowania obrazu strony: ", err);
      }
    }

    const filename = projectName
      ? `Plan_Ciecia_${projectName}.pdf`
      : `Plan_Ciecia_${new Date().toISOString().slice(0, 10)}.pdf`;

    pdf.save(filename);
    setIsPdfGenerating(false);
  };

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
          edgeGroup: cut.edgeGroup || "A",
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

  const hasEdges = Object.keys(totalEdgeLength || {}).length > 0;

  return (
    <div className="p-4 bg-slate-100 min-h-screen">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @page { size: A4 portrait; margin: 8mm; }
        @media print {
          .no-print { display: none !important; }
          body, html { background: white !important; padding: 0 !important; margin: 0 !important; }
          .print-container { width: 100% !important; padding: 0 !important; }
          .arkusz-page { page-break-after: always !important; page-break-inside: avoid !important; display: block; width: 100%; margin-bottom: 0 !important; height: auto !important;}
          .arkusz-page:last-child { page-break-after: auto !important; }
          
          .sync-print-width {
            width: ${width * printScale}mm !important;
          }

          .plate-box { 
            height: ${length * printScale}mm !important; 
          }
        }
      `,
        }}
      />

      <div className="max-w-6xl mx-auto flex flex-col gap-4 no-print mb-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          {/* ZMIANA: Powiększony przycisk Wstecz, z poziomym ułożeniem strzałki i tekstu */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold border-2 border-slate-200 shadow-sm transition-all text-base flex items-center gap-3 min-w-[130px] justify-center"
            >
              <span className="text-2xl leading-none -mt-1">←</span>
              <span>Wstecz</span>
            </button>

            <div className="flex gap-8 text-sm font-black uppercase text-slate-700 items-center">
              {projectName && (
                <div className="flex flex-col">
                  <span className="text-blue-600">Projekt:</span>
                  <span className="text-blue-700 text-lg">{projectName}</span>
                </div>
              )}
              <div className="flex flex-col">
                <span>Wydajność:</span>
                <span className="text-green-600 text-lg">
                  {(stats[0]?.efficiency || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex gap-3 flex-wrap border-l-2 pl-4 mr-4 border-slate-200">
              <span className="text-xs text-slate-400 self-center font-bold">
                OKLEINA:
              </span>
              {!hasEdges ? (
                <span className="text-slate-400 font-bold self-center">
                  BRAK
                </span>
              ) : (
                <div className="flex gap-3 flex-wrap max-w-[400px]">
                  {Object.entries(
                    totalEdgeLength as Record<string, number>,
                  ).map(([group, length]) => (
                    <span key={group} className="font-bold text-sm">
                      <span className="text-slate-600">{group}:</span>{" "}
                      <span className="text-orange-500">
                        {(length / 1000).toFixed(2)}M
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              className={`px-6 py-3 bg-slate-800 text-white rounded-xl font-bold shadow-md hover:bg-slate-900 text-sm flex items-center gap-2 transition-all ${isPdfGenerating ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isPdfGenerating ? "⏳ GENEROWANIE..." : "📥 POBIERZ PDF"}
            </button>

            <button
              onClick={() => reactToPrintFn(() => contentRef.current)}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 text-sm transition-all"
            >
              🖨️ DRUKUJ
            </button>
          </div>
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
              className={`pdf-export-wrap bg-white flex flex-col sync-print-width ${isPdfGenerating ? "pb-8" : "print:pb-0"}`}
              style={{ width: width * screenScale, maxWidth: "100%" }}
            >
              {/* NAGŁÓWEK */}
              <div className="pb-2 mb-2 flex justify-between items-start w-full">
                <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                  <h2
                    className={`text-xl font-black uppercase leading-none text-slate-900 ${isPdfGenerating ? "!text-3xl" : ""}`}
                  >
                    PLAN CIĘCIA
                  </h2>
                  <p
                    className={`text-[10px] font-medium text-slate-600 ${isPdfGenerating ? "!text-sm" : ""}`}
                  >
                    Arkusz: #{bIdx + 1} | {width}x{length}mm | Margines:{" "}
                    {margin}mm
                  </p>
                </div>

                <div className="flex gap-4 items-start text-right">
                  <div className="flex flex-col items-end gap-1">
                    <p
                      className={`text-[9px] font-black uppercase text-slate-400 ${isPdfGenerating ? "!text-xs" : ""}`}
                    >
                      Wydajność
                    </p>
                    <p
                      className={`text-lg font-black text-slate-950 ${isPdfGenerating ? "!text-2xl" : ""}`}
                    >
                      {stats[bIdx].efficiency.toFixed(1)}%
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 min-w-[150px]">
                    <p
                      className={`text-[9px] font-black uppercase text-slate-400 ${isPdfGenerating ? "!text-xs" : ""}`}
                    >
                      Okleina
                    </p>
                    <div className="flex gap-2">
                      {(() => {
                        const edgeEntries = Object.entries(
                          totalEdgeLength as Record<string, number>,
                        );
                        if (edgeEntries.length === 0)
                          return (
                            <div className="text-slate-400 italic text-[10px]">
                              BRAK
                            </div>
                          );

                        const chunkSize = Math.ceil(edgeEntries.length / 3);
                        const col1 = edgeEntries.slice(0, chunkSize);
                        const col2 = edgeEntries.slice(
                          chunkSize,
                          chunkSize * 2,
                        );
                        const col3 = edgeEntries.slice(chunkSize * 2);

                        const renderTable = (entries: [string, number][]) => (
                          <table
                            className={`table-auto text-[9px] font-mono text-slate-950 ${isPdfGenerating ? "!text-xs" : ""}`}
                          >
                            <tbody>
                              {entries.map(([group, len]) => (
                                <tr key={group}>
                                  <td className="text-left pr-1 font-semibold text-slate-600">
                                    Okl. {group}
                                  </td>
                                  <td
                                    className={`text-right tabular-nums ${len / 1000 > 0 ? "text-slate-950" : "text-slate-400"}`}
                                  >
                                    {(len / 1000).toFixed(2)}m
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        );

                        return (
                          <>
                            {renderTable(col1)}
                            {col2.length > 0 && (
                              <>
                                <div className="w-px bg-slate-200 mx-1"></div>
                                {renderTable(col2)}
                              </>
                            )}
                            {col3.length > 0 && (
                              <>
                                <div className="w-px bg-slate-200 mx-1"></div>
                                {renderTable(col3)}
                              </>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* PŁYTA (RYSUNEK) */}
              <div
                className="plate-box relative bg-white border-2 border-black w-full"
                style={{ height: length * screenScale }}
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

                      const rotateText =
                        rect.w < width * 0.1 && rect.h >= width * 0.1;

                      const descriptionShift = rotateText
                        ? isPdfGenerating
                          ? "!translate-x-8"
                          : "translate-x-4 print:translate-x-8"
                        : isPdfGenerating
                          ? "!translate-y-8"
                          : "translate-y-4 print:translate-y-8";

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
                            !isGlobalLocked &&
                            toggleRotation(rect.originalIndex)
                          }
                        >
                          <span
                            className={`absolute top-0.5 left-1/2 -translate-x-1/2 text-[11px] print:text-[20px] ${isPdfGenerating ? "!text-[20px]" : ""} font-bold text-slate-800 bg-white/90 px-0.5 z-20 leading-none ${rotateText ? "[writing-mode:vertical-rl] rotate-180" : ""}`}
                          >
                            {rect.w}
                          </span>

                          <span
                            className={`absolute left-0.5 top-1/2 -translate-y-1/2 text-[11px] print:text-[20px] ${isPdfGenerating ? "!text-[20px]" : ""} font-bold text-slate-600 bg-white/90 px-0.5 z-20 leading-none ${rotateText ? "[writing-mode:vertical-rl] rotate-180" : ""}`}
                          >
                            {rect.h}
                          </span>

                          <span
                            className={`text-[12px] print:text-[20px] ${isPdfGenerating ? "!text-[20px]" : ""} font-black text-center px-1 flex gap-1 items-center leading-none uppercase z-20 max-w-[95%] overflow-hidden text-ellipsis whitespace-nowrap ${rotateText ? `[writing-mode:vertical-rl] rotate-180 max-h-[90%] whitespace-normal ${descriptionShift}` : descriptionShift}`}
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

              {/* STOPKA PROJEKTU */}
              {projectName && (
                <div className="w-full flex justify-end items-center mt-2">
                  <span
                    className={`font-black uppercase text-slate-400 ${isPdfGenerating ? "!text-[16px]" : "text-[10px] print:text-[12px]"}`}
                  >
                    Projekt:{" "}
                    <span className="text-slate-900 ml-1">{projectName}</span>
                  </span>
                </div>
              )}

              {/* TWARDY MARGINES NA DOLE */}
              <div
                className={`w-full bg-transparent ${isPdfGenerating ? "h-12" : "h-0"} print:hidden`}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CutPlan;
