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

export type CutlineResult = {
  path: string;
  shape: "smoothed-hull" | "rounded-rect";
  pointCount: number;
  bounds: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  };
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function fixed(value: number) {
  return Number(value.toFixed(2));
}

function getBounds(points: Point[]) {
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

  return {
    left: fixed(minX),
    top: fixed(minY),
    right: fixed(maxX),
    bottom: fixed(maxY),
    width: fixed(maxX - minX),
    height: fixed(maxY - minY),
  };
}

function midpoint(a: Point, b: Point): Point {
  return {
    x: fixed((a.x + b.x) / 2),
    y: fixed((a.y + b.y) / 2),
  };
}

function cross(origin: Point, a: Point, b: Point) {
  return (a.x - origin.x) * (b.y - origin.y) - (a.y - origin.y) * (b.x - origin.x);
}

function dedupePoints(points: Point[]) {
  const seen = new Set<string>();
  const deduped: Point[] = [];

  for (const point of points) {
    const normalized = { x: fixed(point.x), y: fixed(point.y) };
    const key = `${normalized.x}:${normalized.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(normalized);
  }

  return deduped;
}

function samplePointCloud(points: Point[], maxPoints = 180) {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  return points.filter((_, index) => index % step === 0);
}

function buildConvexHull(points: Point[]) {
  if (points.length <= 1) return points;

  const sorted = [...points].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
  const lower: Point[] = [];

  for (const point of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  }

  const upper: Point[] = [];

  for (let index = sorted.length - 1; index >= 0; index -= 1) {
    const point = sorted[index];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  }

  lower.pop();
  upper.pop();
  return [...lower, ...upper];
}

function expandHull(points: Point[], padding: number) {
  const center = points.reduce(
    (acc, point) => ({ x: acc.x + point.x / points.length, y: acc.y + point.y / points.length }),
    { x: 0, y: 0 },
  );

  return points.map((point) => {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const distance = Math.hypot(dx, dy) || 1;
    const scale = (distance + padding) / distance;
    return {
      x: fixed(clamp(center.x + dx * scale, 0, 100)),
      y: fixed(clamp(center.y + dy * scale, 0, 100)),
    };
  });
}

function buildRoundedRectFromBounds(points: Point[], padding: number): CutlineResult {
  const raw = getBounds(points);
  const left = clamp(raw.left - padding, 0, 100);
  const top = clamp(raw.top - padding, 0, 100);
  const right = clamp(raw.right + padding, 0, 100);
  const bottom = clamp(raw.bottom + padding, 0, 100);
  const width = Math.max(8, right - left);
  const height = Math.max(8, bottom - top);
  const normalizedRight = fixed(left + width);
  const normalizedBottom = fixed(top + height);
  const radius = fixed(Math.max(2, Math.min(width, height) * 0.18));

  const path = [
    `M ${fixed(left + radius)} ${fixed(top)}`,
    `L ${fixed(normalizedRight - radius)} ${fixed(top)}`,
    `Q ${fixed(normalizedRight)} ${fixed(top)} ${fixed(normalizedRight)} ${fixed(top + radius)}`,
    `L ${fixed(normalizedRight)} ${fixed(normalizedBottom - radius)}`,
    `Q ${fixed(normalizedRight)} ${fixed(normalizedBottom)} ${fixed(normalizedRight - radius)} ${fixed(normalizedBottom)}`,
    `L ${fixed(left + radius)} ${fixed(normalizedBottom)}`,
    `Q ${fixed(left)} ${fixed(normalizedBottom)} ${fixed(left)} ${fixed(normalizedBottom - radius)}`,
    `L ${fixed(left)} ${fixed(top + radius)}`,
    `Q ${fixed(left)} ${fixed(top)} ${fixed(left + radius)} ${fixed(top)}`,
    "Z",
  ].join(" ");

  return {
    path,
    shape: "rounded-rect",
    pointCount: points.length,
    bounds: {
      left: fixed(left),
      top: fixed(top),
      right: normalizedRight,
      bottom: normalizedBottom,
      width: fixed(normalizedRight - left),
      height: fixed(normalizedBottom - top),
    },
  };
}

function buildSmoothHullPath(points: Point[]) {
  if (points.length < 3) return "";
  const mids = points.map((point, index) => midpoint(point, points[(index + 1) % points.length]));
  const commands = [`M ${mids[0].x} ${mids[0].y}`];

  for (let index = 0; index < points.length; index += 1) {
    const control = points[(index + 1) % points.length];
    const target = mids[(index + 1) % mids.length];
    commands.push(`Q ${control.x} ${control.y} ${target.x} ${target.y}`);
  }

  commands.push("Z");
  return commands.join(" ");
}

export function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${bytes}B`;
}

export function buildBrushPath(stroke: BrushStroke) {
  if (!stroke.points.length) return "";
  if (stroke.points.length === 1) {
    const point = stroke.points[0];
    return `M ${point.x} ${point.y} L ${point.x + 0.01} ${point.y + 0.01}`;
  }
  return stroke.points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

export function buildCutlineFromStrokeCloud(strokes: BrushStroke[]): CutlineResult | null {
  const flatPoints = strokes.flatMap((stroke) => stroke.points);
  if (!flatPoints.length) return null;

  if (flatPoints.length <= 2) {
    return buildRoundedRectFromBounds(flatPoints, 8);
  }

  const sampled = samplePointCloud(dedupePoints(flatPoints));
  if (sampled.length < 3) {
    return buildRoundedRectFromBounds(sampled, 7);
  }

  const hull = buildConvexHull(sampled);
  if (hull.length < 3) {
    return buildRoundedRectFromBounds(sampled, 6);
  }

  const rawBounds = getBounds(hull);
  const padding = Math.max(3.2, Math.min(8, Math.max(rawBounds.width, rawBounds.height) * 0.08));
  const expandedHull = expandHull(hull, padding);
  const path = buildSmoothHullPath(expandedHull);

  if (!path) {
    return buildRoundedRectFromBounds(sampled, 6);
  }

  return {
    path,
    shape: "smoothed-hull",
    pointCount: expandedHull.length,
    bounds: getBounds(expandedHull),
  };
}
