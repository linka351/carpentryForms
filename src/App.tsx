import { useState, type FormEvent } from "react";
import { MaxRectsPacker } from "maxrects-packer";

type PackedRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  data?: { name?: string } | any;
  id?: string;
};

function MaxRectDemo() {
  const [packer] = useState(
    () => new MaxRectsPacker(1024, 1024, 0, { smart: true })
  );
  const [rects, setRects] = useState<PackedRect[]>([]);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const handleAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const w = parseInt(width);
    const h = parseInt(height);
    if (!w || !h) return alert("Podaj szerokość i wysokość!");

    const newRect = {
      width: w,
      height: h,
      data: { name: `rect-${rects.length + 1}` },
    };
    packer.addArray([newRect as any]);

    // pobieramy wszystkie prostokąty z pierwszego binu
    const allRects =
      packer.bins[0]?.rects.map((r: any) => ({
        x: r.x ?? 0,
        y: r.y ?? 0,
        width: r.width ?? r.w ?? 0,
        height: r.height ?? r.h ?? 0,
        data: r.data,
        id: r.data?.name || Math.random().toString(36).slice(2),
      })) || [];

    setRects(allRects);
    setWidth("");
    setHeight("");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">🧩 MaxRectsPacker Demo</h2>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          placeholder="Szerokość"
          className="border p-2 rounded w-24"
        />
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="Wysokość"
          className="border p-2 rounded w-24"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Dodaj
        </button>
      </form>

      <div
        className="relative border border-black bg-gray-100"
        style={{
          width: "512px",
          height: "512px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {rects.map((r) => (
          <div
            key={r.id}
            title={`${r.width}x${r.height}`}
            style={{
              position: "absolute",
              left: `${(r.x / 1024) * 512}px`,
              top: `${(r.y / 1024) * 512}px`,
              width: `${(r.width / 1024) * 512}px`,
              height: `${(r.height / 1024) * 512}px`,
              backgroundColor: "rgba(0,150,255,0.5)",
              border: "1px solid #0077ff",
              boxSizing: "border-box",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                color: "#000",
                position: "absolute",
                bottom: "2px",
                left: "2px",
              }}
            >
              {r.width}×{r.height}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MaxRectDemo;
