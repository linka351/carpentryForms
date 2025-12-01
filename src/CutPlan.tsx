import { Bin, MaxRectsPacker, Rectangle } from "maxrects-packer";
import { useAppData } from "./context/useAppData.context";

function CutPlan() {
  const { plateParams, cuts } = useAppData();

  const { margin, kerf, width, length } = plateParams;

  const workWidth = width - 2 * margin;
  const workHeight = length - 2 * margin;

  const packer = new MaxRectsPacker(workWidth, workHeight, kerf, {
    smart: false,
    allowRotation: true,
    pot: false,
    square: false,
  });

  cuts
    .toSorted(
      (a, b) => Math.max(b.width, b.length) - Math.max(a.width, a.length)
    )
    .forEach(({ width, length, describe }) => {
      packer.add(
        width,
        length,
        describe ? `${describe} (${width}×${length})` : `${width}×${length}`
      );
    });

  const usageData = (bin: Bin<Rectangle>) => {
    const usedArea = bin.rects.reduce((sum, rect) => {
      const widthWithKerf = rect.x > 0 ? rect.width + kerf : rect.width;
      const heightWithKerf = rect.y > 0 ? rect.height + kerf : rect.height;
      return sum + widthWithKerf * heightWithKerf;
    }, 0);

    const totalArea = workWidth * workHeight;

    return ((usedArea / totalArea) * 100).toFixed(2);
  };

  return (
    <>
      {packer.bins.map((bin, binIndex) => {
        const usagePercent = usageData(bin);

        return (
          <div key={binIndex} className="mb-10">
            <div
              className="relative m-5 border-2 border-black"
              style={{
                width: width,
                height: length,
              }}
            >
              <div
                className="absolute box-border"
                style={{
                  top: margin,
                  left: margin,
                  right: margin,
                  bottom: margin,
                }}
              >
                {bin.rects.map((rect, idx) => (
                  // TODO: zastąpić idx na unikalne rect.id jeśli istnieje
                  <div
                    key={idx}
                    className="absolute flex items-center justify-center text-[8px] text-center bg-blue-500/30 box-content border"
                    style={{
                      left: rect.x,
                      top: rect.y,
                      width: rect.width,
                      height: rect.height,
                    }}
                  >
                    {rect.data}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center font-bold">
              Wykorzystanie płyty: {usagePercent}%
            </p>
          </div>
        );
      })}
    </>
  );
}

export default CutPlan;
