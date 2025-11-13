import { useAppData } from "./context/DataContext";
import { MaxRectsPacker } from "maxrects-packer";

function CutPlan() {
  const { plateParams, cuts } = useAppData();

  const margin = plateParams.margin;
  const kerf = plateParams.kerf;
  const plateWidth = plateParams.width;
  const plateHeight = plateParams.length;

  const workWidth = plateWidth - 2 * margin;
  const workHeight = plateHeight - 2 * margin;

  const packer = new MaxRectsPacker(workWidth, workHeight, kerf, {
    smart: false,
    allowRotation: true,
    pot: false,
    square: false,
  });

  cuts
    .sort((a, b) => Math.max(b.width, b.length) - Math.max(a.width, a.length))
    .forEach((cut) => {
      packer.add(
        cut.width,
        cut.length,
        cut.describe
          ? `${cut.describe} (${cut.width}×${cut.length})`
          : `${cut.width}×${cut.length}`
      );
    });

  const usageData = packer.bins.map((bin) => {
    const usedArea = bin.rects.reduce((sum, rect) => {
      const widthWithKerf = rect.x > 0 ? rect.width + kerf : rect.width;
      const heightWithKerf = rect.y > 0 ? rect.height + kerf : rect.height;
      return sum + widthWithKerf * heightWithKerf;
    }, 0);

    const totalArea = workWidth * workHeight;
    const usagePercent = ((usedArea / totalArea) * 100).toFixed(2);
    return { usedArea, totalArea, usagePercent };
  });

  return (
    <>
      {packer.bins.map((bin, binIndex) => (
        <div key={binIndex} className="mb-10">
          <div
            className="relative m-5 border-2 border-black box-border"
            style={{
              width: plateWidth,
              height: plateHeight,
              boxSizing: "content-box",
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
                <div
                  key={idx}
                  className="absolute flex items-center justify-center text-[8px] text-center bg-blue-500/30"
                  style={{
                    left: rect.x,
                    top: rect.y,
                    width: rect.width,
                    height: rect.height,
                    boxSizing: "content-box",
                  }}
                >
                  {rect.data}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center font-bold">
            Wykorzystanie płyty: {usageData[binIndex].usagePercent}%
          </p>
        </div>
      ))}
    </>
  );
}

export default CutPlan;
