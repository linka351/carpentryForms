export const applyEdgePattern = (
  pattern: string,
  length: number,
  width: number,
) => {
  const edges = { top: false, right: false, bottom: false, left: false };

  // Sprawdzamy, który wymiar jest fizycznie większy
  const isLengthLonger = length >= width;

  switch (pattern) {
    case "1D":
      // Jeśli length (pion) jest dłuższą krawędzią -> oklejamy LEFT
      // Jeśli width (poziom) jest dłuższą krawędzią -> oklejamy TOP
      isLengthLonger ? (edges.left = true) : (edges.top = true);
      break;

    case "2D":
      if (isLengthLonger) {
        // Dwie długie w pionie
        edges.left = true;
        edges.right = true;
      } else {
        // Dwie długie w poziomie
        edges.top = true;
        edges.bottom = true;
      }
      break;

    case "1K":
      // Jeśli length jest dłuższy, to krótkim bokiem jest szerokość (poziom) -> TOP
      // Jeśli width jest dłuższy, to krótkim bokiem jest długość (pion) -> LEFT
      isLengthLonger ? (edges.top = true) : (edges.left = true);
      break;

    case "2K":
      if (isLengthLonger) {
        // Dwie krótkie to góra i dół
        edges.top = true;
        edges.bottom = true;
      } else {
        // Dwie krótkie to lewo i prawo
        edges.left = true;
        edges.right = true;
      }
      break;

    case "X":
      return { top: true, right: true, bottom: true, left: true };
    case "O":
      return { top: false, right: false, bottom: false, left: false };
    default:
      return edges;
  }

  return edges;
};
