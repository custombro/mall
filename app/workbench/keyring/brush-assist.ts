export type BrushPoint = {
  x: number;
  y: number;
};

export type SubjectAssistBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type AnalysisFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function distance(a: BrushPoint, b: BrushPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function distanceSq(a: BrushPoint, b: BrushPoint) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function normalizeSubjectAssistBox(box: SubjectAssistBox | null): SubjectAssistBox | null {
  if (!box) return null;

  const left = Math.min(box.x, box.x + box.width);
  const top = Math.min(box.y, box.y + box.height);
  const right = Math.max(box.x, box.x + box.width);
  const bottom = Math.max(box.y, box.y + box.height);

  return {
    x: left,
    y: top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

export function simplifyBrushPoints(points: BrushPoint[], minGap = 4.5) {
  if (points.length <= 1) {
    return points.map((point) => ({ x: point.x, y: point.y }));
  }

  const next: BrushPoint[] = [points[0]];
  let lastKept = points[0];

  for (let i = 1; i < points.length; i += 1) {
    const point = points[i];
    if (distance(lastKept, point) >= minGap) {
      next.push({ x: point.x, y: point.y });
      lastKept = point;
    }
  }

  const tail = points[points.length - 1];
  if (!next.length || distance(next[next.length - 1], tail) >= 1.2) {
    next.push({ x: tail.x, y: tail.y });
  }

  return next;
}

export function buildSubjectAssistStrokeBounds(points: BrushPoint[], pad = 16): SubjectAssistBox | null {
  if (!points.length) return null;

  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;

  for (const point of points) {
    if (point.x < minX) minX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.x > maxX) maxX = point.x;
    if (point.y > maxY) maxY = point.y;
  }

  return normalizeSubjectAssistBox({
    x: minX - pad,
    y: minY - pad,
    width: Math.max(1, maxX - minX + pad * 2),
    height: Math.max(1, maxY - minY + pad * 2),
  });
}

export function buildStrokeSvgPath(points: BrushPoint[]) {
  if (points.length === 0) return "";
  return `M ${points.map((point) => `${point.x} ${point.y}`).join(" L ")}`;
}

export function projectPointToSegment(point: BrushPoint, start: BrushPoint, end: BrushPoint): BrushPoint {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lenSq = dx * dx + dy * dy || 1;
  const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lenSq, 0, 1);

  return {
    x: start.x + dx * t,
    y: start.y + dy * t,
  };
}

export function mapStrokeToAnalysisSpace(
  stroke: BrushPoint[],
  previewFrame: AnalysisFrame,
  analysisFrame: AnalysisFrame,
) {
  return stroke.map((point) => {
    const normalizedX = clamp((point.x - previewFrame.x) / Math.max(1, previewFrame.width), 0, 1);
    const normalizedY = clamp((point.y - previewFrame.y) / Math.max(1, previewFrame.height), 0, 1);

    return {
      x: analysisFrame.x + normalizedX * analysisFrame.width,
      y: analysisFrame.y + normalizedY * analysisFrame.height,
    };
  });
}

export function collectStrokeSeedPixels(
  width: number,
  height: number,
  mappedStroke: BrushPoint[],
  seedRadius: number,
) {
  const seedRadiusSq = seedRadius * seedRadius;
  const mask: boolean[][] = Array.from({ length: height }, () => Array.from({ length: width }, () => false));

  const isNearStroke = (x: number, y: number) => {
    const point = { x, y };

    for (let i = 0; i < mappedStroke.length; i += 1) {
      const current = mappedStroke[i];
      if (distanceSq(point, current) <= seedRadiusSq) return true;
      if (i === 0) continue;
      const projected = projectPointToSegment(point, mappedStroke[i - 1], current);
      if (distanceSq(point, projected) <= seedRadiusSq) return true;
    }

    return false;
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (isNearStroke(x, y)) {
        mask[y][x] = true;
      }
    }
  }

  return mask;
}

export function growMaskFromSeeds(
  width: number,
  height: number,
  candidateMask: boolean[][],
  seedMask: boolean[][],
) {
  const grownMask: boolean[][] = Array.from({ length: height }, () => Array.from({ length: width }, () => false));
  const queue: Array<{ x: number; y: number }> = [];
  let head = 0;

  const neighbors = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: 1 },
  ] as const;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!seedMask[y][x] || !candidateMask[y][x]) continue;
      grownMask[y][x] = true;
      queue.push({ x, y });
    }
  }

  while (head < queue.length) {
    const current = queue[head];
    head += 1;

    for (const next of neighbors) {
      const nx = current.x + next.x;
      const ny = current.y + next.y;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      if (grownMask[ny][nx] || !candidateMask[ny][nx]) continue;
      grownMask[ny][nx] = true;
      queue.push({ x: nx, y: ny });
    }
  }

  return grownMask;
}
