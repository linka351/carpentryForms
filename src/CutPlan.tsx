import { useEffect, useState } from "react";
import { MaxRectsPacker } from "maxrects-packer";
import { useAppData } from "./context/useAppData.context";

type PackedRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  data: string;
};

type MaxRectsBin = {
  rects: PackedRect[];
};

type UsageInfo = {
  usagePercent: string;
};

export default function CutPlan() {
  const { plateParams, cuts, updateCut } = useAppData();

  const [bins, setBins] = useState<MaxRectsBin[]>([]);
  const [usageData, setUsageData] = useState<UsageInfo[]>([]);

  const { margin, kerf, width, length } = plateParams;

  const workWidth = width - 2 * margin;
  const workHeight = length - 2 * margin;

  function toggleRotation(id: string) {
    updateCut((prev) =>
      prev.map((cut) =>
        cut.id === id ? { ...cut, rotated: !cut.rotated } : cut
      )
    );
  }

  const preparedCuts = cuts.map((cut) => {
    const rotated = cut.rotated ?? false;
    return {
      ...cut,
      width: rotated ? cut.length : cut.width,
      length: rotated ? cut.width : cut.length,
    };
  });

  useEffect(() => {
    const packer = new MaxRectsPacker(workWidth, workHeight, kerf, {
      smart: false,
      allowRotation: false,
      pot: false,
      square: false,
    });

    preparedCuts
      .toSorted(
        (a, b) => Math.max(b.width, b.length) - Math.max(a.width, a.length)
      )
      .forEach((cut) => {
        packer.add(cut.width, cut.length, cut.id);
      });

    setBins(packer.bins as MaxRectsBin[]);

    const newUsageData: UsageInfo[] = packer.bins.map((bin) => {
      const usedArea = (bin.rects as PackedRect[]).reduce((sum, rect) => {
        const widthWithKerf = rect.x > 0 ? rect.width + kerf : rect.width;
        const heightWithKerf = rect.y > 0 ? rect.height + kerf : rect.height;

        return sum + widthWithKerf * heightWithKerf;
      }, 0);

      const totalArea = workWidth * workHeight;
      const usagePercent = ((usedArea / totalArea) * 100).toFixed(2);
      return { usagePercent };
    });

    setUsageData(newUsageData);
  }, [cuts, workWidth, workHeight, kerf]);

  return (
    <>
      {bins.map((bin, binIndex) => (
        <div key={binIndex} className="mb-10">
          <div
            className="relative m-5 outline box-content"
            style={{
              width: width,
              height: length,
            }}
          >
            <div
              className="absolute outline"
              style={{
                top: margin,
                left: margin,
                right: margin,
                bottom: margin,
              }}
            >
              {bin.rects.map((rect: PackedRect, idx: number) => {
                const cut = preparedCuts.find((c) => c.id === rect.data);

                return (
                  <div
                    key={idx}
                    onClick={() => toggleRotation(rect.data)}
                    className="absolute flex items-center justify-center text-[8px] text-center bg-blue-500/30 cursor-pointer hover:bg-blue-500/40 transition"
                    style={{
                      left: rect.x,
                      top: rect.y,
                      width: rect.width,
                      height: rect.height,
                    }}
                  >
                    {cut?.describe
                      ? `${cut.describe} (${cut.width}×${cut.length})`
                      : `${cut?.width}×${cut?.length}`}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-center font-bold">
            Wykorzystanie płyty: {usageData[binIndex]?.usagePercent ?? "0.00"}%
          </p>
        </div>
      ))}
    </>
  );
}
