import { useMemo } from "react";
import { MaxRectsPacker, Rectangle } from "maxrects-packer";
import { useAppData } from "./context/DataContext";

function CutPlan() {
  const { plateParams, cuts } = useAppData();

  // margin i kerf pobierane bezpośrednio z kontekstu/formularza
  const margin = plateParams.margin;
  const kerf = plateParams.kerf;

  const packedRects = useMemo(() => {
    if (!plateParams.width || !plateParams.length || cuts.length === 0)
      return [];

    // Kontener do packera pomniejszony o margines z każdej strony
    const packer = new MaxRectsPacker(
      plateParams.width - 2 * margin,
      plateParams.length - 2 * margin,
      kerf, // kerf = odstęp między elementami
      { smart: true, pot: false, allowRotation: true }
    );

    // Tworzymy prostokąty dla każdej sztuki
    const blocksToPack: Rectangle[] = cuts.flatMap((cut) =>
      Array.from({ length: cut.quanity || 1 }).map(
        () =>
          ({
            width: cut.width,
            height: cut.length,
          } as Rectangle)
      )
    );

    packer.addArray(blocksToPack);

    return packer.bins.flatMap((bin) => bin.rects);
  }, [plateParams, cuts, margin, kerf]);

  return (
    <>
      <div
        className="relative border-2 border-black bg-gray-200 overflow-hidden"
        style={{
          width: `${plateParams.width}px`,
          height: `${plateParams.length}px`,
        }}
      >
        {packedRects.map((rect, index) => {
          const width = rect.rot ? rect.height : rect.width;
          const height = rect.rot ? rect.width : rect.height;

          return (
            <div
              key={index}
              className="absolute flex items-center justify-center text-white text-[8px] box-border border border-blue-900 bg-blue-500/60"
              style={{
                top: `${rect.y + margin}px`,
                left: `${rect.x + margin}px`,

                width: `${width}px`,
                height: `${height}px`,
              }}
              title={`Wymiary: ${width}x${height} px\nPozycja: (${rect.x}, ${rect.y})`}
            >
              {`${width}x${height}`}
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold">Lista Cięć (Wejście):</h3>
        {cuts.map((cut, index) => (
          <p key={index} className="text-sm">
            {cut.length} x {cut.width} px, Ilość: {cut.quanity}, Opis:{" "}
            {cut.describe}
          </p>
        ))}
      </div>
    </>
  );
}

export default CutPlan;
