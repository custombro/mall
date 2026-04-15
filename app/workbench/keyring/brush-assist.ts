export type Point = { x: number; y: number };

export type BrushStroke = {
  points: Point[];
};

export type UploadItem = {
  id: string;
  name: string;
  sizeLabel: string;
  previewUrl: string | null;
};

export function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${bytes}B`;
}

export function buildBrushPath(stroke: BrushStroke) {
  if (!stroke.points.length) return "";
  return stroke.points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

export function buildCutlineFromStrokeCloud(strokes: BrushStroke[]) {
  const points = strokes.flatMap((stroke) => stroke.points);
  if (points.length < 2) return null;

  let minX = 100;
  let minY = 100;
  let maxX = 0;
  let maxY = 0;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  const padding = 4;
  const left = Math.max(0, minX - padding);
  const top = Math.max(0, minY - padding);
  const right = Math.min(100, maxX + padding);
  const bottom = Math.min(100, maxY + padding);

  const width = Math.max(4, right - left);
  const height = Math.max(4, bottom - top);
  const radius = Math.max(2, Math.min(width, height) * 0.12);

  const path = [
    `M ${left + radius} ${top}`,
    `L ${right - radius} ${top}`,
    `Q ${right} ${top} ${right} ${top + radius}`,
    `L ${right} ${bottom - radius}`,
    `Q ${right} ${bottom} ${right - radius} ${bottom}`,
    `L ${left + radius} ${bottom}`,
    `Q ${left} ${bottom} ${left} ${bottom - radius}`,
    `L ${left} ${top + radius}`,
    `Q ${left} ${top} ${left + radius} ${top}`,
    "Z",
  ].join(" ");

  return { path, bounds: { left, top, right, bottom } };
}
