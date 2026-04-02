"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

function cbDistance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function cbBuildClosedLinePath(points: Array<{ x: number; y: number }>) {
  if (!points.length) return "";
  return `${points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")} Z`;
}

function cbSimplifyClosedPoints(points: Array<{ x: number; y: number }>, minGap = 2.4) {
  if (points.length < 3) return points.map((point) => ({ x: point.x, y: point.y }));

  const simplified: Array<{ x: number; y: number }> = [];
  let lastKept = points[0];
  simplified.push({ x: lastKept.x, y: lastKept.y });

  for (let i = 1; i < points.length; i += 1) {
    const current = points[i];
    if (cbDistance(lastKept, current) >= minGap) {
      simplified.push({ x: current.x, y: current.y });
      lastKept = current;
    }
  }

  if (simplified.length >= 2 && cbDistance(simplified[0], simplified[simplified.length - 1]) < minGap) {
    simplified.pop();
  }

  return simplified.length >= 3 ? simplified : points.map((point) => ({ x: point.x, y: point.y }));
}

function cbResampleClosedPoints(points: Array<{ x: number; y: number }>, targetCount = 48) {
  if (points.length < 3) return points.map((point) => ({ x: point.x, y: point.y }));

  let perimeter = 0;
  for (let i = 0; i < points.length; i += 1) {
    perimeter += cbDistance(points[i], points[(i + 1) % points.length]);
  }

  if (perimeter <= 0) return points.map((point) => ({ x: point.x, y: point.y }));

  const safeTargetCount = Math.max(24, Math.min(72, targetCount));
  const step = perimeter / safeTargetCount;
  const sampled: Array<{ x: number; y: number }> = [];

  sampled.push({ x: points[0].x, y: points[0].y });

  let edgeIndex = 0;
  let edgeStart = { x: points[0].x, y: points[0].y };
  let edgeEnd = { x: points[1 % points.length].x, y: points[1 % points.length].y };
  let edgeLength = cbDistance(edgeStart, edgeEnd);
  let distanceIntoEdge = 0;
  let traveled = step;

  while (sampled.length < safeTargetCount && edgeIndex < points.length * 3) {
    while (distanceIntoEdge + edgeLength < traveled) {
      traveled -= distanceIntoEdge + edgeLength;
      edgeIndex += 1;
      edgeStart = { x: points[edgeIndex % points.length].x, y: points[edgeIndex % points.length].y };
      edgeEnd = { x: points[(edgeIndex + 1) % points.length].x, y: points[(edgeIndex + 1) % points.length].y };
      edgeLength = cbDistance(edgeStart, edgeEnd);
      distanceIntoEdge = 0;
      if (edgeLength === 0) break;
    }

    if (edgeLength === 0) {
      edgeIndex += 1;
      continue;
    }

    const ratio = traveled / edgeLength;
    sampled.push({
      x: edgeStart.x + (edgeEnd.x - edgeStart.x) * ratio,
      y: edgeStart.y + (edgeEnd.y - edgeStart.y) * ratio,
    });

    traveled += step;
  }

  return sampled.length >= 3 ? sampled : points.map((point) => ({ x: point.x, y: point.y }));
}

function cbChaikinSmoothClosed(points: Array<{ x: number; y: number }>, passes = 3) {
  let next = points.map((point) => ({ x: point.x, y: point.y }));

  for (let pass = 0; pass < passes; pass += 1) {
    if (next.length < 3) return next;

    const refined: Array<{ x: number; y: number }> = [];

    for (let i = 0; i < next.length; i += 1) {
      const current = next[i];
      const following = next[(i + 1) % next.length];

      refined.push({
        x: current.x * 0.75 + following.x * 0.25,
        y: current.y * 0.75 + following.y * 0.25,
      });

      refined.push({
        x: current.x * 0.25 + following.x * 0.75,
        y: current.y * 0.25 + following.y * 0.75,
      });
    }

    next = refined;
  }

  return next;
}

function cbBuildSmoothClosedPath(points: Array<{ x: number; y: number }>) {
  if (!points.length) return "";
  if (points.length < 3) return cbBuildClosedLinePath(points);

  const simplified = cbSimplifyClosedPoints(points, 2.4);
  const targetCount = Math.max(28, Math.min(56, Math.round(simplified.length * 0.45)));
  const resampled = cbResampleClosedPoints(simplified, targetCount);
  const smoothed = cbChaikinSmoothClosed(resampled, 3);

  if (smoothed.length < 3) return cbBuildClosedLinePath(smoothed);

  const midpoints = smoothed.map((point, index) => {
    const next = smoothed[(index + 1) % smoothed.length];
    return {
      x: (point.x + next.x) / 2,
      y: (point.y + next.y) / 2,
    };
  });

  let d = `M ${midpoints[0].x} ${midpoints[0].y}`;

  for (let i = 0; i < smoothed.length; i += 1) {
    const control = smoothed[(i + 1) % smoothed.length];
    const end = midpoints[(i + 1) % midpoints.length];
    d += ` Q ${control.x} ${control.y} ${end.x} ${end.y}`;
  }

  return `${d} Z`;
}
type Point = {
  x: number;
  y: number;
};

type HolePosition = Point;

type UploadState = {
  name: string;
  typeLabel: string;
  sizeLabel: string;
  previewUrl: string | null;
};

type AutoCutlineState = {
  status: "idle" | "processing" | "ready" | "failed";
  path: string | null;
  points: Point[];
  centroid: Point | null;
};

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 640;

const ART_FRAME = {
  x: 96,
  y: 118,
  width: 368,
  height: 444,
} as const;

const ANALYSIS_WIDTH = 184;
const ANALYSIS_HEIGHT = 222;

const ELLIPSE = {
  cx: 280,
  cy: 344,
  rx: 170,
  ry: 220,
} as const;

const ROUNDED_RECT = {
  x: 122,
  y: 126,
  width: 316,
  height: 430,
  radius: 64,
} as const;

const PRICE_BASE = {
  원형: 3200,
  사각형: 3400,
  자동칼선: 3900,
} as const;

const SHAPE_MODES = ["원형", "사각형", "자동칼선"] as const;
const MATERIALS = ["투명 아크릴", "반투명 아크릴"] as const;
const THICKNESSES = ["3T", "5T"] as const;
const RINGS = ["실버 링", "골드 링", "볼체인"] as const;
const HOLE_SIZES = [2.5, 3] as const;
const AUTO_CUTLINE_MARGIN_OPTIONS = [2, 2.25, 2.5] as const;
const PRODUCTION_OUTER_CUTLINE_COLOR = "#ff0000";
const PRODUCTION_HOLE_CUTLINE_COLOR = "#000000";
const PRODUCTION_CUTLINE_STROKE_MM = 0.01;
const PREVIEW_CUTLINE_STROKE_PX = 3;
const PREVIEWABLE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

type ShapeMode = (typeof SHAPE_MODES)[number];
type Material = (typeof MATERIALS)[number];
type Thickness = (typeof THICKNESSES)[number];
type Ring = (typeof RINGS)[number];
type HoleSize = (typeof HOLE_SIZES)[number];
type AutoCutlineMarginMm = (typeof AUTO_CUTLINE_MARGIN_OPTIONS)[number];

let autoCutlineMarginMmLive: AutoCutlineMarginMm = 2.5;
let keyringArtScaleLive = 1;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalize(x: number, y: number) {
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}

function distanceSq(a: Point, b: Point) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${bytes}B`;
}

function getHoleVisualRadius(holeSize: HoleSize) {
  return holeSize === 3 ? 14 : 12;
}

function getHoleLabel(holeSize: HoleSize) {
  return holeSize === 2.5 ? "2.5mm · 기본 O링용" : "3mm · O링 / 체인링 / 와이어링용";
}

function getHoleLimitLabel(holeSize: HoleSize) {
  return holeSize === 2.5 ? "최대 1.25mm 돌출 허용" : "최대 1.5mm 돌출 허용";
}

function getAutoCutlineMarginVisualPxByMm(value: AutoCutlineMarginMm) {
  if (value === 2) return 16;
  if (value === 2.25) return 20;
  return 24;
}

function getAutoCutlineMarginVisualPx() {
  return getAutoCutlineMarginVisualPxByMm(autoCutlineMarginMmLive);
}

function getAutoCutlineGuideOuterRadius(holeSize: HoleSize, marginMm: AutoCutlineMarginMm) {
  return getHoleVisualRadius(holeSize) + getAutoCutlineMarginVisualPxByMm(marginMm);
}

function getHolePrintSafeRadius(holeSize: HoleSize) {
  return getHoleVisualRadius(holeSize) + getAutoCutlineMarginVisualPxByMm(2);
}

function getHoleOuterCutlineRadius(holeSize: HoleSize) {
  return getHoleVisualRadius(holeSize) + getAutoCutlineMarginVisualPx();
}

function getAdjustedAutoCutlinePoints(
  points: Point[],
  centroid: Point | null,
  frame: { x: number; y: number; width: number; height: number },
) {
  if (!centroid || points.length === 0) return points;

  const scaleX = frame.width / ANALYSIS_WIDTH;
  const scaleY = frame.height / ANALYSIS_HEIGHT;

  const mappedCentroid = {
    x: frame.x + centroid.x * scaleX,
    y: frame.y + centroid.y * scaleY,
  };

  const mappedPoints = points.map((point) => ({
    x: frame.x + point.x * scaleX,
    y: frame.y + point.y * scaleY,
  }));

  const extraPx = getAutoCutlineMarginVisualPx();
  if (extraPx <= 0) return mappedPoints;

  return mappedPoints.map((point) => {
    const dx = point.x - mappedCentroid.x;
    const dy = point.y - mappedCentroid.y;
    const len = Math.hypot(dx, dy) || 1;

    return {
      x: point.x + (dx / len) * extraPx,
      y: point.y + (dy / len) * extraPx,
    };
  });
}

function getAutoCutlinePreviewFrameForScale(artScale: number) {
  const baseWidth = ART_FRAME.width * artScale;
  const baseHeight = ART_FRAME.height * artScale;
  const autoInsetPx = getAutoCutlineMarginVisualPxByMm(2);
  const safeWidth = Math.max(24, baseWidth - autoInsetPx * 2);
  const safeHeight = Math.max(24, baseHeight - autoInsetPx * 2);
  const centeredX =
    ART_FRAME.x + (ART_FRAME.width - safeWidth) / 2;
  const centeredY =
    ART_FRAME.y + (ART_FRAME.height - safeHeight) / 2;

  return {
    width: safeWidth,
    height: safeHeight,
    x: Math.max(
      ART_FRAME.x + autoInsetPx,
      Math.min(ART_FRAME.x + ART_FRAME.width - autoInsetPx - safeWidth, centeredX),
    ),
    y: Math.max(
      ART_FRAME.y + autoInsetPx,
      Math.min(ART_FRAME.y + ART_FRAME.height - autoInsetPx - safeHeight, centeredY),
    ),
  };
}
function formatAutoCutlineMarginMm(value: number) {
  return Number.isInteger(value)
    ? value.toFixed(0)
    : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function getShapeDescription(shapeMode: ShapeMode) {
  if (shapeMode === "원형") return "구멍은 생성된 외곽선에 붙어서 이동";
  if (shapeMode === "사각형") return "구멍은 생성된 외곽선에 붙어서 이동";
  return "업로드 기반 자동칼선 1차 생성";
}

function isForeground(r: number, g: number, b: number, a: number) {
  if (a < 24) return false;
  if (a < 250) return true;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  const luminance = (r + g + b) / 3;

  return !(luminance > 244 && saturation < 0.08);
}

function renderBodyShape(shapeMode: ShapeMode, fillId: string, strokeOnly = false) {
  const fillValue = strokeOnly ? "transparent" : `url(#${fillId})`;
  const previewCx = ART_FRAME.x + ART_FRAME.width / 2;
  const previewCy = ART_FRAME.y + ART_FRAME.height / 2;
  const previewRx = ART_FRAME.width / 2;
  const previewRy = ART_FRAME.height / 2;
  const previewRadius = 28;

  if (shapeMode === "원형") {
    return (
      <ellipse
        cx={previewCx}
        cy={previewCy}
        rx={previewRx}
        ry={previewRy}
        fill={fillValue}
        stroke="rgba(255,255,255,0.88)"
        strokeWidth="4"
      />
    );
  }

  if (shapeMode === "사각형") {
    return (
      <rect
        x={ART_FRAME.x}
        y={ART_FRAME.y}
        width={ART_FRAME.width}
        height={ART_FRAME.height}
        rx={previewRadius}
        fill={fillValue}
        stroke="rgba(255,255,255,0.88)"
        strokeWidth="4"
      />
    );
  }

  return null;
}

function renderClipShape(shapeMode: ShapeMode) {
  const previewCx = ART_FRAME.x + ART_FRAME.width / 2;
  const previewCy = ART_FRAME.y + ART_FRAME.height / 2;
  const previewRx = ART_FRAME.width / 2;
  const previewRy = ART_FRAME.height / 2;
  const previewRadius = 28;

  if (shapeMode === "원형") {
    return <ellipse cx={previewCx} cy={previewCy} rx={previewRx} ry={previewRy} />;
  }

  if (shapeMode === "사각형") {
    return (
      <rect
        x={ART_FRAME.x}
        y={ART_FRAME.y}
        width={ART_FRAME.width}
        height={ART_FRAME.height}
        rx={previewRadius}
      />
    );
  }

  return <rect x={ART_FRAME.x} y={ART_FRAME.y} width={ART_FRAME.width} height={ART_FRAME.height} rx="28" />;
}

function renderPreviewOuterCutlineShape(shapeMode: ShapeMode) {
  const marginPx = getAutoCutlineMarginVisualPx();
  const previewCx = ART_FRAME.x + ART_FRAME.width / 2;
  const previewCy = ART_FRAME.y + ART_FRAME.height / 2;
  const previewRx = ART_FRAME.width / 2 + marginPx;
  const previewRy = ART_FRAME.height / 2 + marginPx;
  const previewRadius = 28 + marginPx * 0.55;

  if (shapeMode === "원형") {
    return (
      <>
        <ellipse
          cx={previewCx}
          cy={previewCy}
          rx={previewRx}
          ry={previewRy}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={PREVIEW_CUTLINE_STROKE_PX + 2}
        />
        <ellipse
          cx={previewCx}
          cy={previewCy}
          rx={previewRx}
          ry={previewRy}
          fill="none"
          stroke={PRODUCTION_OUTER_CUTLINE_COLOR}
          strokeWidth={PREVIEW_CUTLINE_STROKE_PX + 1}
        />
      </>
    );
  }

  if (shapeMode === "사각형") {
    return (
      <>
        <rect
          x={ART_FRAME.x - marginPx}
          y={ART_FRAME.y - marginPx}
          width={ART_FRAME.width + marginPx * 2}
          height={ART_FRAME.height + marginPx * 2}
          rx={previewRadius}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={PREVIEW_CUTLINE_STROKE_PX + 2}
        />
        <rect
          x={ART_FRAME.x - marginPx}
          y={ART_FRAME.y - marginPx}
          width={ART_FRAME.width + marginPx * 2}
          height={ART_FRAME.height + marginPx * 2}
          rx={previewRadius}
          fill="none"
          stroke={PRODUCTION_OUTER_CUTLINE_COLOR}
          strokeWidth={PREVIEW_CUTLINE_STROKE_PX + 1}
        />
      </>
    );
  }

  return null;
}

function projectHoleToAutoCutlineHalfOutside(
  pointer: HolePosition,
  points: Point[],
  holeSize: HoleSize,
): HolePosition {
  if (points.length < 2) {
    return pointer;
  }

  const projectToSegment = (p: Point, a: Point, b: Point): Point => {
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const lenSq = abx * abx + aby * aby;

    if (lenSq <= 0.0001) {
      return { x: a.x, y: a.y };
    }

    const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq));

    return {
      x: a.x + abx * t,
      y: a.y + aby * t,
    };
  };

  let bestPoint = points[0];
  let bestDist = Number.POSITIVE_INFINITY;

  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const projected = projectToSegment(pointer, a, b);
    const dist = Math.hypot(projected.x - pointer.x, projected.y - pointer.y);

    if (dist < bestDist) {
      bestDist = dist;
      bestPoint = projected;
    }
  }

  let sumX = 0;
  let sumY = 0;
  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
  }

  const centroid = {
    x: sumX / points.length,
    y: sumY / points.length,
  };

  const inward = normalize(centroid.x - bestPoint.x, centroid.y - bestPoint.y);
  const seatDepth = Math.max(3.5, getHoleOuterCutlineRadius(holeSize) * 0.58);
  const safeInside = Math.max(2.5, getHoleVisualRadius(holeSize) * 0.24);
  const insideShift = Math.max(seatDepth, safeInside);

  return {
    x: bestPoint.x + inward.x * insideShift,
    y: bestPoint.y + inward.y * insideShift,
  };
}
function projectHoleToEllipse(pointer: HolePosition, holeSize: HoleSize): HolePosition {
  const holeInset = getHoleOuterCutlineRadius(holeSize) + getAutoCutlineMarginVisualPxByMm(2);
  const holeInsideBias = Math.max(10, getHoleOuterCutlineRadius(holeSize) * 0.92);
  const cx = ART_FRAME.x + ART_FRAME.width / 2;
  const cy = ART_FRAME.y + ART_FRAME.height / 2;
  const rx = ART_FRAME.width / 2;
  const ry = ART_FRAME.height / 2;

  let dx = pointer.x - cx;
  let dy = pointer.y - cy;

  if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
    dx = 0;
    dy = -1;
  }

  const scale = 1 / Math.sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
  const bx = cx + dx * scale;
  const by = cy + dy * scale;

  const n = normalize(
    (bx - cx) / (rx * rx),
    (by - cy) / (ry * ry),
  );

  const extraInside = n.y < -0.2 ? holeInsideBias : holeInsideBias * 0.55;

  return {
    x: bx - n.x * (holeInset + extraInside),
    y: by - n.y * (holeInset + extraInside),
  };
}

function projectHoleToRoundedRect(pointer: HolePosition, holeSize: HoleSize): HolePosition {
  const holeInset = getHoleOuterCutlineRadius(holeSize) + getAutoCutlineMarginVisualPxByMm(2);
  const holeInsideBias = Math.max(10, getHoleOuterCutlineRadius(holeSize) * 0.92);
  const previewRadius = 28;
  const halfW = ART_FRAME.width / 2;
  const halfH = ART_FRAME.height / 2;
  const innerW = halfW - previewRadius;
  const innerH = halfH - previewRadius;
  const cx = ART_FRAME.x + halfW;
  const cy = ART_FRAME.y + halfH;

  let dx = pointer.x - cx;
  let dy = pointer.y - cy;

  if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
    dx = 0;
    dy = -1;
  }

  const signX = dx === 0 ? 0 : dx / Math.abs(dx);
  const signY = dy === 0 ? 0 : dy / Math.abs(dy);
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  let bx = cx;
  let by = cy;
  let nx = 0;
  let ny = -1;

  if (absX <= innerW - 2 && absY > innerH) {
    bx = cx + dx;
    by = cy + signY * halfH;
    nx = 0;
    ny = signY;
  } else {
    if (absY <= innerH - 2 && absX > innerW) {
      bx = cx + signX * halfW;
      by = cy + dy;
      nx = signX;
      ny = 0;
    } else {
      const cornerCx = cx + signX * innerW;
      const cornerCy = cy + signY * innerH;
      const v = normalize(pointer.x - cornerCx, pointer.y - cornerCy);
      bx = cornerCx + v.x * previewRadius;
      by = cornerCy + v.y * previewRadius;
      nx = v.x;
      ny = v.y;
    }
  }

  const normal = normalize(nx, ny);
  const extraInside = normal.y < -0.2 ? holeInsideBias : holeInsideBias * 0.55;

  return {
    x: bx - normal.x * (holeInset + extraInside),
    y: by - normal.y * (holeInset + extraInside),
  };
}

function projectPointToSegment(point: Point, a: Point, b: Point) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const abLenSq = abx * abx + aby * aby || 1;
  const apx = point.x - a.x;
  const apy = point.y - a.y;
  const t = clamp((apx * abx + apy * aby) / abLenSq, 0, 1);

  return {
    x: a.x + abx * t,
    y: a.y + aby * t,
  };
}

function projectHoleToPolyline(
  pointer: HolePosition,
  holeSize: HoleSize,
  points: Point[],
  centroid: Point | null,
): HolePosition {
  if (points.length < 2 || !centroid) {
    return { x: 280, y: 108 };
  }

  let bestPoint = points[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const candidate = projectPointToSegment(pointer, a, b);
    const d = distanceSq(pointer, candidate);
    if (d < bestDistance) {
      bestDistance = d;
      bestPoint = candidate;
    }
  }

  const holeOffset = getHoleOuterCutlineRadius(holeSize) * 0.6 + 2;
  const outward = normalize(bestPoint.x - centroid.x, bestPoint.y - centroid.y);

  return {
    x: bestPoint.x + outward.x * holeOffset,
    y: bestPoint.y + outward.y * holeOffset,
  };
}

function cbBuildCirclePolyline(
  frame: { x: number; y: number; width: number; height: number },
  segments = 72,
) {
  const cx = frame.x + frame.width / 2;
  const cy = frame.y + frame.height / 2;
  const rx = frame.width / 2;
  const ry = frame.height / 2;

  return Array.from({ length: segments }, (_, index) => {
    const angle = -Math.PI / 2 + (index / segments) * Math.PI * 2;
    return {
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry,
    };
  });
}

function cbBuildRoundedRectPolyline(
  frame: { x: number; y: number; width: number; height: number },
  radius = 44,
  arcSegments = 12,
) {
  const maxRadius = Math.min(frame.width, frame.height) / 2;
  const r = Math.max(0, Math.min(radius, maxRadius));
  const left = frame.x;
  const top = frame.y;
  const right = frame.x + frame.width;
  const bottom = frame.y + frame.height;

  const pushArc = (
    points: Array<{ x: number; y: number }>,
    cx: number,
    cy: number,
    startAngle: number,
    endAngle: number,
  ) => {
    for (let i = 0; i <= arcSegments; i += 1) {
      const t = i / arcSegments;
      const angle = startAngle + (endAngle - startAngle) * t;
      points.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      });
    }
  };

  const points: Array<{ x: number; y: number }> = [];
  pushArc(points, right - r, top + r, -Math.PI / 2, 0);
  pushArc(points, right - r, bottom - r, 0, Math.PI / 2);
  pushArc(points, left + r, bottom - r, Math.PI / 2, Math.PI);
  pushArc(points, left + r, top + r, Math.PI, (Math.PI * 3) / 2);

  return points;
}

function cbGetClosedBounds(points: Array<{ x: number; y: number }>) {
  if (!points.length) {
    return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
  }

  let left = points[0].x;
  let right = points[0].x;
  let top = points[0].y;
  let bottom = points[0].y;

  for (const point of points) {
    if (point.x < left) left = point.x;
    if (point.x > right) right = point.x;
    if (point.y < top) top = point.y;
    if (point.y > bottom) bottom = point.y;
  }

  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

function cbExpandClosedPoints(
  points: Array<{ x: number; y: number }>,
  centroid: { x: number; y: number },
  outwardPx: number,
) {
  if (!points.length || outwardPx === 0) return points.map((point) => ({ x: point.x, y: point.y }));

  return points.map((point) => {
    const dx = point.x - centroid.x;
    const dy = point.y - centroid.y;
    const distance = Math.hypot(dx, dy);

    if (distance <= 0.0001) {
      return { x: point.x, y: point.y };
    }

    const ratio = (distance + outwardPx) / distance;
    return {
      x: centroid.x + dx * ratio,
      y: centroid.y + dy * ratio,
    };
  });
}

function projectHole(
  pointer: { x: number; y: number },
  holeSize: 2.5 | 3,
  shapeMode: string,
  autoCutline: AutoCutlineState,
) {
  const frameCentroid = {
    x: ART_FRAME.x + ART_FRAME.width / 2,
    y: ART_FRAME.y + ART_FRAME.height / 2,
  };

  if (shapeMode === "자동칼선" && autoCutline.status === "ready" && autoCutline.points.length > 0) {
      return projectHoleToAutoCutlineHalfOutside(
        pointer,
        autoCutline.centroid
          ? getAdjustedAutoCutlinePoints(
              autoCutline.points,
              autoCutline.centroid,
              getAutoCutlinePreviewFrameForScale(keyringArtScaleLive),
            )
          : autoCutline.points,
        holeSize,
      );
    }

  if (shapeMode === "원형") {
    return projectHoleToPolyline(
      pointer,
      holeSize,
      cbBuildCirclePolyline(ART_FRAME, 72),
      frameCentroid,
    );
  }

  if (shapeMode === "사각형") {
    return projectHoleToPolyline(
      pointer,
      holeSize,
      cbBuildRoundedRectPolyline(ART_FRAME, 44, 12),
      frameCentroid,
    );
  }

  return projectHoleToPolyline(
    pointer,
    holeSize,
    cbBuildCirclePolyline(ART_FRAME, 72),
    frameCentroid,
  );
}

function cbBuildAutoCutlineUnionPreviewPath(
  points: Point[],
  hole: HolePosition,
  holeSize: HoleSize,
) {
  if (points.length < 3 || typeof document === "undefined") {
    return cbBuildSmoothClosedPath(points);
  }

  const canvas = document.createElement("canvas");
  canvas.width = VIEW_WIDTH;
  canvas.height = VIEW_HEIGHT;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return cbBuildSmoothClosedPath(points);
  }

  const projectToSegment = (p: Point, a: Point, b: Point): Point => {
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const lenSq = abx * abx + aby * aby;

    if (lenSq <= 0.0001) {
      return { x: a.x, y: a.y };
    }

    const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq));

    return {
      x: a.x + abx * t,
      y: a.y + aby * t,
    };
  };

  ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.fillStyle = "#000";

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fill();

  let bestPoint = points[0];
  let bestDist = Number.POSITIVE_INFINITY;

  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const projected = projectToSegment(hole, a, b);
    const dist = Math.hypot(projected.x - hole.x, projected.y - hole.y);

    if (dist < bestDist) {
      bestDist = dist;
      bestPoint = projected;
    }
  }

  let sumX = 0;
  let sumY = 0;
  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
  }

  const centroid = {
    x: sumX / points.length,
    y: sumY / points.length,
  };

  const inward = normalize(centroid.x - bestPoint.x, centroid.y - bestPoint.y);
  const outward = { x: -inward.x, y: -inward.y };

  const outerRadius = getHoleOuterCutlineRadius(holeSize) * 0.9;
  const bridgeHalf = Math.max(5, outerRadius * 0.62);

  const bridgeStart = {
    x: bestPoint.x - outward.x * Math.max(1.6, outerRadius * 0.18),
    y: bestPoint.y - outward.y * Math.max(1.6, outerRadius * 0.18),
  };

  const bridgeEnd = {
    x: hole.x - inward.x * Math.max(1.4, outerRadius * 0.14),
    y: hole.y - inward.y * Math.max(1.4, outerRadius * 0.14),
  };

  ctx.save();
  ctx.strokeStyle = "#000";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = bridgeHalf * 2;
  ctx.beginPath();
  ctx.moveTo(bridgeStart.x, bridgeStart.y);
  ctx.lineTo(bridgeEnd.x, bridgeEnd.y);
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(hole.x, hole.y, outerRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  const image = ctx.getImageData(0, 0, VIEW_WIDTH, VIEW_HEIGHT).data;
  const mask: boolean[][] = Array.from({ length: VIEW_HEIGHT }, () =>
    Array.from({ length: VIEW_WIDTH }, () => false),
  );

  let count = 0;
  let contourSumX = 0;
  let contourSumY = 0;

  for (let y = 0; y < VIEW_HEIGHT; y += 1) {
    for (let x = 0; x < VIEW_WIDTH; x += 1) {
      const idx = (y * VIEW_WIDTH + x) * 4 + 3;
      if (image[idx] > 16) {
        mask[y][x] = true;
        count += 1;
        contourSumX += x;
        contourSumY += y;
      }
    }
  }

  if (count < 48) {
    return cbBuildSmoothClosedPath(points);
  }

  const contourCentroid = {
    x: contourSumX / count,
    y: contourSumY / count,
  };

  const sectorCount = 160;
  const buckets = Array.from(
    { length: sectorCount },
    () => null as { x: number; y: number; dist: number } | null,
  );

  for (let y = 1; y < VIEW_HEIGHT - 1; y += 1) {
    for (let x = 1; x < VIEW_WIDTH - 1; x += 1) {
      if (!mask[y][x]) continue;

      const isBoundary =
        !mask[y][x - 1] ||
        !mask[y][x + 1] ||
        !mask[y - 1][x] ||
        !mask[y + 1][x];

      if (!isBoundary) continue;

      const dx = x - contourCentroid.x;
      const dy = y - contourCentroid.y;
      let angle = Math.atan2(dy, dx);
      if (angle < 0) angle += Math.PI * 2;

      const sector = Math.min(
        sectorCount - 1,
        Math.floor((angle / (Math.PI * 2)) * sectorCount),
      );
      const dist = Math.hypot(dx, dy);
      const prev = buckets[sector];

      if (!prev || dist > prev.dist) {
        buckets[sector] = { x, y, dist };
      }
    }
  }

  const outlinePoints = buckets
    .filter((bucket): bucket is { x: number; y: number; dist: number } => Boolean(bucket))
    .map((bucket) => ({ x: bucket.x, y: bucket.y }));

  if (outlinePoints.length < 24) {
    return cbBuildSmoothClosedPath(points);
  }

  return cbBuildSmoothClosedPath(outlinePoints);
}
function cbBuildBaseShapeUnionPreviewPath(
  shapeMode: ShapeMode,
  hole: HolePosition,
  holeSize: HoleSize,
) {
  if (typeof document === "undefined") {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = VIEW_WIDTH;
  canvas.height = VIEW_HEIGHT;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.fillStyle = "#000";
  const outerMargin = getAutoCutlineMarginVisualPx();

  if (shapeMode === "원형") {
    ctx.beginPath();
    ctx.ellipse(
      ART_FRAME.x + ART_FRAME.width / 2,
      ART_FRAME.y + ART_FRAME.height / 2,
      ART_FRAME.width / 2 + outerMargin,
      ART_FRAME.height / 2 + outerMargin,
      0,
      0,
      Math.PI * 2,
    );
    ctx.closePath();
    ctx.fill();
  } else if (shapeMode === "사각형") {
    const x = ART_FRAME.x - outerMargin;
    const y = ART_FRAME.y - outerMargin;
    const w = ART_FRAME.width + outerMargin * 2;
    const h = ART_FRAME.height + outerMargin * 2;
    const r = 28 + outerMargin;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  } else {
    return null;
  }

  ctx.beginPath();
  ctx.arc(hole.x, hole.y, getHoleOuterCutlineRadius(holeSize), 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  const image = ctx.getImageData(0, 0, VIEW_WIDTH, VIEW_HEIGHT).data;
  const mask: boolean[][] = Array.from({ length: VIEW_HEIGHT }, () =>
    Array.from({ length: VIEW_WIDTH }, () => false),
  );

  let count = 0;
  let sumX = 0;
  let sumY = 0;

  for (let y = 0; y < VIEW_HEIGHT; y += 1) {
    for (let x = 0; x < VIEW_WIDTH; x += 1) {
      const idx = (y * VIEW_WIDTH + x) * 4 + 3;
      if (image[idx] > 16) {
        mask[y][x] = true;
        count += 1;
        sumX += x;
        sumY += y;
      }
    }
  }

  if (count < 48) return null;

  const centroid = { x: sumX / count, y: sumY / count };
  const sectorCount = 160;
  const buckets = Array.from(
    { length: sectorCount },
    () => null as { x: number; y: number; dist: number } | null,
  );

  for (let y = 1; y < VIEW_HEIGHT - 1; y += 1) {
    for (let x = 1; x < VIEW_WIDTH - 1; x += 1) {
      if (!mask[y][x]) continue;

      const isBoundary =
        !mask[y][x - 1] ||
        !mask[y][x + 1] ||
        !mask[y - 1][x] ||
        !mask[y + 1][x];

      if (!isBoundary) continue;

      const dx = x - centroid.x;
      const dy = y - centroid.y;
      let angle = Math.atan2(dy, dx);
      if (angle < 0) angle += Math.PI * 2;

      const sector = Math.min(
        sectorCount - 1,
        Math.floor((angle / (Math.PI * 2)) * sectorCount),
      );
      const dist = Math.hypot(dx, dy);
      const prev = buckets[sector];

      if (!prev || dist > prev.dist) {
        buckets[sector] = { x, y, dist };
      }
    }
  }

  const outlinePoints = buckets
    .filter((bucket): bucket is { x: number; y: number; dist: number } => Boolean(bucket))
    .map((bucket) => ({ x: bucket.x, y: bucket.y }));

  if (outlinePoints.length < 24) return null;

  return cbBuildSmoothClosedPath(outlinePoints);
}
async function buildAutoCutlineFromImage(
  url: string,
): Promise<{ path: string; points: Point[]; centroid: Point } | null> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = ANALYSIS_WIDTH;
        canvas.height = ANALYSIS_HEIGHT;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.clearRect(0, 0, ANALYSIS_WIDTH, ANALYSIS_HEIGHT);

        const scale = Math.min(ANALYSIS_WIDTH / img.width, ANALYSIS_HEIGHT / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const drawX = (ANALYSIS_WIDTH - drawWidth) / 2;
        const drawY = (ANALYSIS_HEIGHT - drawHeight) / 2;

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        const imageData = ctx.getImageData(0, 0, ANALYSIS_WIDTH, ANALYSIS_HEIGHT);
        const data = imageData.data;

        const borderSamples: { r: number; g: number; b: number; a: number }[] = [];
        const sampleStep = 3;

        const pushSample = (x: number, y: number) => {
          const idx = (y * ANALYSIS_WIDTH + x) * 4;
          const a = data[idx + 3];
          if (a <= 12) return;
          borderSamples.push({
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2],
            a,
          });
        };

        for (let x = 0; x < ANALYSIS_WIDTH; x += sampleStep) {
          pushSample(x, 0);
          pushSample(x, ANALYSIS_HEIGHT - 1);
        }
        for (let y = 0; y < ANALYSIS_HEIGHT; y += sampleStep) {
          pushSample(0, y);
          pushSample(ANALYSIS_WIDTH - 1, y);
        }

        const borderAvg =
          borderSamples.length > 0
            ? borderSamples.reduce(
                (acc, sample) => ({
                  r: acc.r + sample.r,
                  g: acc.g + sample.g,
                  b: acc.b + sample.b,
                }),
                { r: 0, g: 0, b: 0 },
              )
            : { r: 245 * 8, g: 245 * 8, b: 245 * 8 };

        const borderCount = Math.max(1, borderSamples.length);
        const avgBorder = {
          r: borderAvg.r / borderCount,
          g: borderAvg.g / borderCount,
          b: borderAvg.b / borderCount,
        };
        const avgBorderBrightness = (avgBorder.r + avgBorder.g + avgBorder.b) / 3;

        const colorDistance = (r: number, g: number, b: number) =>
          Math.hypot(r - avgBorder.r, g - avgBorder.g, b - avgBorder.b);

        const bgCandidate: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
          Array.from({ length: ANALYSIS_WIDTH }, () => false),
        );

        for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
          for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
            const idx = (y * ANALYSIS_WIDTH + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            const maxChannel = Math.max(r, g, b);
            const minChannel = Math.min(r, g, b);
            const brightness = (r + g + b) / 3;
            const chroma = maxChannel - minChannel;
            const dist = colorDistance(r, g, b);

            const transparentLike = a <= 20;
            const whiteLike = a >= 220 && brightness >= 236 && chroma <= 26;
            const edgeColorLike =
              a >= 180 &&
              dist <= 34 &&
              Math.abs(brightness - avgBorderBrightness) <= 26 &&
              chroma <= 42;

            bgCandidate[y][x] = transparentLike || whiteLike || edgeColorLike;
          }
        }

        const bgVisited: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
          Array.from({ length: ANALYSIS_WIDTH }, () => false),
        );

        const queueX: number[] = [];
        const queueY: number[] = [];
        let head = 0;

        const pushBg = (x: number, y: number) => {
          if (x < 0 || y < 0 || x >= ANALYSIS_WIDTH || y >= ANALYSIS_HEIGHT) return;
          if (bgVisited[y][x] || !bgCandidate[y][x]) return;
          bgVisited[y][x] = true;
          queueX.push(x);
          queueY.push(y);
        };

        for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
          pushBg(x, 0);
          pushBg(x, ANALYSIS_HEIGHT - 1);
        }
        for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
          pushBg(0, y);
          pushBg(ANALYSIS_WIDTH - 1, y);
        }

        const dirs8 = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ] as const;

        while (head < queueX.length) {
          const x = queueX[head];
          const y = queueY[head];
          head += 1;

          for (const [dx, dy] of dirs8) {
            pushBg(x + dx, y + dy);
          }
        }

        const fgMask: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
          Array.from({ length: ANALYSIS_WIDTH }, () => false),
        );

        let fgCount = 0;
        for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
          for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
            const idx = (y * ANALYSIS_WIDTH + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            const brightness = (r + g + b) / 3;
            const maxChannel = Math.max(r, g, b);
            const minChannel = Math.min(r, g, b);
            const chroma = maxChannel - minChannel;

            const definitelyInk = a > 34 && !(brightness >= 247 && chroma <= 10);
            const isForeground = definitelyInk && !bgVisited[y][x];

            if (isForeground) {
              fgMask[y][x] = true;
              fgCount += 1;
            }
          }
        }

        if (fgCount < 40) {
          resolve(null);
          return;
        }

        const componentVisited: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
          Array.from({ length: ANALYSIS_WIDTH }, () => false),
        );

        let bestPoints: Point[] = [];

        const pushFg = (
          x: number,
          y: number,
          xs: number[],
          ys: number[],
          points: Point[],
        ) => {
          if (x < 0 || y < 0 || x >= ANALYSIS_WIDTH || y >= ANALYSIS_HEIGHT) return;
          if (componentVisited[y][x] || !fgMask[y][x]) return;
          componentVisited[y][x] = true;
          xs.push(x);
          ys.push(y);
          points.push({ x, y });
        };

        const dirs4 = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ] as const;

        for (let startY = 0; startY < ANALYSIS_HEIGHT; startY += 1) {
          for (let startX = 0; startX < ANALYSIS_WIDTH; startX += 1) {
            if (componentVisited[startY][startX] || !fgMask[startY][startX]) continue;

            const xs: number[] = [];
            const ys: number[] = [];
            const points: Point[] = [];
            let localHead = 0;

            pushFg(startX, startY, xs, ys, points);

            while (localHead < xs.length) {
              const x = xs[localHead];
              const y = ys[localHead];
              localHead += 1;

              for (const [dx, dy] of dirs4) {
                pushFg(x + dx, y + dy, xs, ys, points);
              }
            }

            if (points.length > bestPoints.length) {
              bestPoints = points;
            }
          }
        }

        if (bestPoints.length < 24) {
          resolve(null);
          return;
        }

        const componentMask: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
          Array.from({ length: ANALYSIS_WIDTH }, () => false),
        );

        let sumX = 0;
        let sumY = 0;
        for (const point of bestPoints) {
          componentMask[point.y][point.x] = true;
          sumX += point.x;
          sumY += point.y;
        }

        const centroid = {
          x: sumX / bestPoints.length,
          y: sumY / bestPoints.length,
        };

        const sectorCount = Math.max(96, Math.min(180, Math.round(bestPoints.length / 4)));
        const buckets = Array.from(
          { length: sectorCount },
          () => null as { x: number; y: number; dist: number } | null,
        );

        for (const point of bestPoints) {
          const x = point.x;
          const y = point.y;

          const isBoundary =
            x === 0 ||
            y === 0 ||
            x === ANALYSIS_WIDTH - 1 ||
            y === ANALYSIS_HEIGHT - 1 ||
            !componentMask[y][x - 1] ||
            !componentMask[y][x + 1] ||
            !componentMask[y - 1][x] ||
            !componentMask[y + 1][x];

          if (!isBoundary) continue;

          const dx = x - centroid.x;
          const dy = y - centroid.y;
          let angle = Math.atan2(dy, dx);
          if (angle < 0) angle += Math.PI * 2;

          const sector = Math.min(sectorCount - 1, Math.floor((angle / (Math.PI * 2)) * sectorCount));
          const dist = Math.hypot(dx, dy);
          const prev = buckets[sector];

          if (!prev || dist > prev.dist) {
            buckets[sector] = { x, y, dist };
          }
        }

        const outlinePoints: Point[] = [];
        for (const bucket of buckets) {
          if (bucket) {
            outlinePoints.push({ x: bucket.x, y: bucket.y });
          }
        }

        const deduped = outlinePoints.filter((point, index, arr) => {
          if (!arr.length) return false;
          const prev = arr[(index - 1 + arr.length) % arr.length];
          return Math.hypot(point.x - prev.x, point.y - prev.y) > 3.2;
        });

        if (deduped.length < 18) {
          resolve(null);
          return;
        }

        resolve({
          path: cbBuildSmoothClosedPath(deduped),
          points: deduped,
          centroid,
        });
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = url;
  });
}
function KeyringCanvas({
  hole,
  shapeMode,
  holeSize,
  imageUrl,
  autoCutline,
  artScale,
}: {
  hole: HolePosition;
  shapeMode: ShapeMode;
  holeSize: HoleSize;
  imageUrl: string | null;
  autoCutline: AutoCutlineState;
  artScale: number;
}) {
  const fillId = `cb_fill_${shapeMode}`;
  const clipId = `cb_clip_${shapeMode}`;
  const holeRadius = getHoleVisualRadius(holeSize);
  const hasUpload = Boolean(imageUrl);
  const minGuideOuterRadius = getAutoCutlineGuideOuterRadius(holeSize, AUTO_CUTLINE_MARGIN_OPTIONS[0]);
  const maxGuideOuterRadius =
    getAutoCutlineGuideOuterRadius(holeSize, AUTO_CUTLINE_MARGIN_OPTIONS[AUTO_CUTLINE_MARGIN_OPTIONS.length - 1]);
  const holePrintSafeRadius = getHolePrintSafeRadius(holeSize);
  const frameCenter = {
    x: ART_FRAME.x + ART_FRAME.width / 2,
    y: ART_FRAME.y + ART_FRAME.height / 2,
  };
  const bridgeDirection = normalize(frameCenter.x - hole.x, frameCenter.y - hole.y);
  const bridgeNeckInset = Math.max(4, getHoleOuterCutlineRadius(holeSize) * 0.16);
  const bridgeStart = {
    x: hole.x + bridgeDirection.x * (holeRadius + 2),
    y: hole.y + bridgeDirection.y * (holeRadius + 2),
  };
  const bridgeEnd = {
    x: hole.x + bridgeDirection.x * (getHoleOuterCutlineRadius(holeSize) + bridgeNeckInset),
    y: hole.y + bridgeDirection.y * (getHoleOuterCutlineRadius(holeSize) + bridgeNeckInset),
  };
  keyringArtScaleLive = artScale;
  const scaledArtFrame = getAutoCutlinePreviewFrameForScale(artScale);
  const autoCutlinePreviewPoints =
    autoCutline.centroid
      ? getAdjustedAutoCutlinePoints(autoCutline.points, autoCutline.centroid, scaledArtFrame)
      : autoCutline.points;
  const autoCutlinePreviewPath =
    shapeMode === "자동칼선" && autoCutline.status === "ready" && autoCutline.points.length > 0
      ? cbBuildAutoCutlineUnionPreviewPath(autoCutlinePreviewPoints, hole, holeSize)
      : null;
  const baseShapeUnionPreviewPath =
    shapeMode === "원형" || shapeMode === "사각형"
      ? cbBuildBaseShapeUnionPreviewPath(shapeMode, hole, holeSize)
      : null;

const autoCutlinePending = shapeMode === "자동칼선";

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className="h-full w-full"
      role="img"
      aria-label="정면 작업판"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9fd0ff" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#1d2f47" stopOpacity="1" />
        </linearGradient>
        <clipPath id={clipId}>{renderClipShape(shapeMode)}</clipPath>
      </defs>

      <rect x="0" y="0" width={VIEW_WIDTH} height={VIEW_HEIGHT} rx="28" fill="#041129" />
      <rect x="70" y="72" width="420" height="514" rx="28" fill="rgba(0,0,0,0.16)" />

      {!autoCutlinePending ? (
        <>
                    {shapeMode === "원형" || shapeMode === "사각형" ? (
            <path
              d={baseShapeUnionPreviewPath ?? ""}
              fill="none"
              stroke={PRODUCTION_OUTER_CUTLINE_COLOR}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : (
            renderPreviewOuterCutlineShape(shapeMode)
          )}
          {renderBodyShape(shapeMode, fillId)}
          {hasUpload ? (
            <>
              <image
                href={imageUrl!}
                x={scaledArtFrame.x}
                y={scaledArtFrame.y}
                width={scaledArtFrame.width}
                height={scaledArtFrame.height}
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#${clipId})`}
              />
              {renderBodyShape(shapeMode, fillId, true)}
            </>
          ) : (
            <>
              <text
                x="280"
                y="334"
                textAnchor="middle"
                fill="rgba(255,255,255,0.96)"
                fontSize="34"
                fontWeight="800"
                letterSpacing="1.1"
              >
                {shapeMode} 작업판
              </text>
              <text
                x="280"
                y="384"
                textAnchor="middle"
                fill="rgba(255,255,255,0.78)"
                fontSize="20"
                fontWeight="500"
              >
                구멍은 외곽선에 붙어서 이동
              </text>
              <text
                x="280"
                y="420"
                textAnchor="middle"
                fill="rgba(255,255,255,0.64)"
                fontSize="16"
                fontWeight="600"
              >
                {getHoleLabel(holeSize)}
              </text>
              <text
                x="280"
                y="470"
                textAnchor="middle"
                fill="rgba(255,255,255,0.42)"
                fontSize="16"
                fontWeight="600"
              >
                이미지 업로드 대기
              </text>
            </>
          )}
        </>
      ) : (
        <>
          <rect
            x={ART_FRAME.x}
            y={ART_FRAME.y}
            width={ART_FRAME.width}
            height={ART_FRAME.height}
            rx="28"
            fill="rgba(255,255,255,0.03)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="2"
          />

          {hasUpload ? (
            <image
              href={imageUrl!}
              x={scaledArtFrame.x}
              y={scaledArtFrame.y}
              width={scaledArtFrame.width}
              height={scaledArtFrame.height}
              preserveAspectRatio="xMidYMid meet"
            />
          ) : null}

          {autoCutline.status === "ready" && autoCutline.path ? (
            <path
              d={autoCutlinePreviewPath ?? cbBuildSmoothClosedPath(autoCutlinePreviewPoints)}
              fill="none"
              stroke="#ff2b2b"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}

          {!hasUpload ? (
            <>
              <text
                x="280"
                y="334"
                textAnchor="middle"
                fill="rgba(255,255,255,0.96)"
                fontSize="34"
                fontWeight="800"
                letterSpacing="1.1"
              >
                자동칼선 작업판
              </text>
              <text
                x="280"
                y="384"
                textAnchor="middle"
                fill="rgba(255,255,255,0.78)"
                fontSize="20"
                fontWeight="500"
              >
                업로드 후 자동칼선 생성
              </text>
            </>
          ) : null}

          <text
            x="470"
            y="108"
            textAnchor="end"
            fill="rgba(255,255,255,0.72)"
            fontSize="12"
            fontWeight="700"
          >
            {autoCutline.status === "ready"
              ? "자동칼선 생성 완료"
              : autoCutline.status === "processing"
                ? "자동칼선 계산중"
                : autoCutline.status === "failed"
                  ? "자동칼선 생성 실패"
                  : "업로드 대기"}
          </text>
        </>
      )}      {shapeMode !== "자동칼선" || (shapeMode === "자동칼선" && !(autoCutline.status === "ready" && autoCutline.path)) ? null : (
        <g>
          <circle
            cx={hole.x}
            cy={hole.y}
            r={holeRadius * 2.4 + 1.5}
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={4.6}
          />
          <circle
            cx={hole.x}
            cy={hole.y}
            r={holeRadius * 2.4}
            fill="none"
            stroke={PRODUCTION_OUTER_CUTLINE_COLOR}
            strokeWidth={2.2}
          />
        </g>
      )}
      <circle cx={hole.x} cy={hole.y} r={holeRadius} fill="#263247" />
        <circle cx={hole.x} cy={hole.y} r={Math.max(2.2, holeRadius * 0.42)} fill="#08111f" />
    </svg>
  );
}

function OptionButton({
  active,
  label,
  description,
  onClick,
  compact = false,
}: {
  active: boolean;
  label: string;
  description?: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-2xl border text-left transition",
        compact ? "px-4 py-3" : "px-4 py-4",
        active
          ? "border-[#7fbaff] bg-[#95c9ff]/18 text-white"
          : "border-white/10 bg-white/[0.03] text-white/78 hover:bg-white/[0.08]",
      ].join(" ")}
    >
      <div className="text-sm font-semibold">{label}</div>
      {description ? <div className="mt-1 text-xs leading-5 text-white/58">{description}</div> : null}
    </button>
  );
}

export default function KeyringWorkbenchPage() {
  const [shapeMode, setShapeMode] = useState<ShapeMode>("원형");
  const [material, setMaterial] = useState<Material>("투명 아크릴");
  const [thickness, setThickness] = useState<Thickness>("3T");
  const [ring, setRing] = useState<Ring>("실버 링");
  const [holeSize, setHoleSize] = useState<HoleSize>(2.5);
const [autoCutlineMarginMm, setAutoCutlineMarginMm] = useState<AutoCutlineMarginMm>(2.5);

useEffect(() => {
  autoCutlineMarginMmLive = autoCutlineMarginMm;
}, [autoCutlineMarginMm]);

const [quantity, setQuantity] = useState(10);
  const [dragging, setDragging] = useState(false);
  const [hole, setHole] = useState<HolePosition>({ x: 280, y: 108 });
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [uploadGuide, setUploadGuide] = useState("실시간 미리보기 가능 형식: PNG / JPG / WEBP");
  const [artScale, setArtScale] = useState(1);
  const [autoCutline, setAutoCutline] = useState<AutoCutlineState>({
    status: "idle",
    path: null,
    points: [],
    centroid: null,
  });

  const effectiveAutoCutline = useMemo(() => {
  return autoCutline;
}, [autoCutline]);

const effectiveHoleAutoCutline = useMemo(() => {
  return effectiveAutoCutline;
}, [effectiveAutoCutline]);


  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (shapeMode !== "자동칼선") {
      setAutoCutline((prev) =>
        prev.status === "idle"
          ? prev
          : {
              status: "idle",
              path: null,
              points: [],
              centroid: null,
            },
      );
      return () => {
        cancelled = true;
      };
    }

    if (!uploadState?.previewUrl) {
      setAutoCutline({
        status: "idle",
        path: null,
        points: [],
        centroid: null,
      });
      return () => {
        cancelled = true;
      };
    }

    setAutoCutline({
      status: "processing",
      path: null,
      points: [],
      centroid: null,
    });

    buildAutoCutlineFromImage(uploadState.previewUrl).then((result) => {
      if (cancelled) return;

      if (result) {
        
const rawBounds = cbGetClosedBounds(result.points);
        const rawCentroid = result.centroid ?? {
          x: rawBounds.left + rawBounds.width / 2,
          y: rawBounds.top + rawBounds.height / 2,
        };

        setAutoCutline({
          status: "ready",
          path: cbBuildSmoothClosedPath(result.points),
          points: result.points,
          centroid: rawCentroid,
        });

      } else {
        setAutoCutline({
          status: "failed",
          path: null,
          points: [],
          centroid: null,
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [shapeMode, uploadState?.previewUrl]);

  useEffect(() => {
    setHole((prev) => projectHole(prev, holeSize, shapeMode, autoCutline));
  }, [holeSize, shapeMode, autoCutline.status, autoCutline.path]);

  useEffect(() => {
    return () => {
      if (uploadState?.previewUrl) {
        URL.revokeObjectURL(uploadState.previewUrl);
      }
    };
  }, [uploadState]);

  const unitPrice = useMemo(() => {
    let next = PRICE_BASE[shapeMode];
    if (material === "반투명 아크릴") next += 200;
    if (thickness === "5T") next += 300;
    if (ring !== "실버 링") next += 100;
    if (holeSize === 3) next += 100;
    return next;
  }, [holeSize, material, ring, shapeMode, thickness]);

  const totalPrice = unitPrice * quantity;
  const autoCutlineLocked = shapeMode === "자동칼선" && autoCutline.status !== "ready";

  const productionStatus = useMemo(() => {
    if (shapeMode === "자동칼선" && !uploadState?.previewUrl) {
      return {
        label: "업로드 필요",
        tone: "amber" as const,
        detail: "자동칼선은 업로드 이미지가 있어야 칼선 계산 가능",
      };
    }

    if (shapeMode === "자동칼선" && autoCutline.status !== "ready") {
      return {
        label: "계산 중",
        tone: "amber" as const,
        detail: "자동칼선 계산 완료 후 구멍 위치와 가이드 확인 가능",
      };
    }

    if (holeSize === 3) {
      return {
        label: "확인 필요",
        tone: "amber" as const,
        detail: getHoleLimitLabel(holeSize),
      };
    }

    return {
      label: "제작 가능",
      tone: "cyan" as const,
      detail: getHoleLimitLabel(holeSize),
    };
  }, [autoCutline.status, holeSize, shapeMode, uploadState?.previewUrl]);

  const updateHole = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (autoCutlineLocked) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;
    setHole(projectHole({ x, y }, holeSize, shapeMode, autoCutline));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (autoCutlineLocked) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    updateHole(event);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging || autoCutlineLocked) return;
    updateHole(event);
  };

  const stopDrag = () => {
    setDragging(false);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const clearUpload = () => {
    setUploadState((prev) => {
      if (prev?.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return null;
    });
    setUploadGuide("실시간 미리보기 가능 형식: PNG / JPG / WEBP");
    setAutoCutline({
      status: "idle",
      path: null,
      points: [],
      centroid: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewable = PREVIEWABLE_TYPES.includes(file.type as (typeof PREVIEWABLE_TYPES)[number]);
    const nextPreviewUrl = previewable ? URL.createObjectURL(file) : null;

    setUploadState((prev) => {
      if (prev?.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return {
        name: file.name,
        typeLabel: file.type || "알 수 없는 형식",
        sizeLabel: formatFileSize(file.size),
        previewUrl: nextPreviewUrl,
      };
    });

    setUploadGuide(
      previewable
        ? "업로드 상태: 작업판에 즉시 반영됨"
        : "PDF / AI / PSD는 업로드 기록만 유지하고 실시간 미리보기는 생략"
    );
  };

  return (
    <main className="min-h-screen bg-[#041129] text-white">
      <div className="mx-auto w-full max-w-[1680px] px-4 py-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-[0.08em] text-white/90 transition hover:bg-white/10"
          >
            CUSTOMBRO HOME
          </Link>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-[#09142b] px-5 py-4">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="min-w-0">
      <p className="text-[11px] font-semibold tracking-[0.24em] text-cyan-300">KEYRING / AUTO CUTLINE</p>
      <h1 className="mt-1 text-[22px] font-semibold text-white">자동칼선 작업판</h1>
      <p className="mt-1 text-sm text-slate-300">업로드한 이미지를 기준으로 구멍 위치와 자동칼선을 바로 잡는 간소화 작업대</p>
    </div>
    <div className="rounded-full border border-slate-700 bg-[#0b1730] px-3 py-1 text-xs text-slate-300">
      기본 포장 포함 · 수량/규격 자동 반영
    </div>
  </div>
</section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
          <aside className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
            <div className="mb-4 text-[12px] font-bold tracking-[0.18em] text-[#8fc0ff]">LEFT / 제작 세팅</div>

            <div className="mb-6">
              <div className="mb-3 text-sm font-semibold text-white/86">형태 모드</div>
              <div className="grid gap-2">
                {SHAPE_MODES.map((item) => (
                  <OptionButton
                    key={item}
                    active={shapeMode === item}
                    label={item}
                    description={getShapeDescription(item)}
                    onClick={() => setShapeMode(item)}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-3 text-sm font-semibold text-white/86">자재</div>
              <div className="grid gap-2">
                {MATERIALS.map((item) => (
                  <OptionButton
                    key={item}
                    active={material === item}
                    label={item}
                    onClick={() => setMaterial(item)}
                    compact
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-3 text-sm font-semibold text-white/86">두께</div>
              <div className="flex gap-2">
                {THICKNESSES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setThickness(item)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      thickness === item
                        ? "border-[#7fbaff] bg-[#95c9ff]/18 text-white"
                        : "border-white/10 bg-white/[0.03] text-white/78 hover:bg-white/[0.08]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="mb-3 text-sm font-semibold text-white/86">링 / 체결</div>
              <div className="grid gap-2">
                {RINGS.map((item) => (
                  <OptionButton
                    key={item}
                    active={ring === item}
                    label={item}
                    onClick={() => setRing(item)}
                    compact
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">

          <div data-testid="left-cutline-margin-panel-v3" className="mt-8">
            <div className="text-sm font-semibold text-white/82">칼선 여백</div>
            <div className="mt-2 text-xs leading-5 text-white/58">
              자동칼선 전용 · 이미지 외곽선 기준 바깥 2 ~ 2.5mm
            </div>
            <div className="mt-3 grid gap-3">
              {AUTO_CUTLINE_MARGIN_OPTIONS.map((marginMm) => (
                <OptionButton
                  key={`cutline-margin-v3-${marginMm}`}
                  active={shapeMode === "자동칼선" && autoCutlineMarginMm === marginMm}
                  label={`${formatAutoCutlineMarginMm(marginMm)}mm`}
                  description={
                    shapeMode === "자동칼선"
                      ? `이미지 외곽선 기준 바깥 ${formatAutoCutlineMarginMm(marginMm)}mm`
                      : "자동칼선 모드에서 적용"
                  }
                  compact
                  onClick={() => {
                    if (shapeMode === "자동칼선") {
                      setAutoCutlineMarginMm(marginMm);
                    }
                  }}
                />
              ))}
            </div>
            <div className="mt-2 text-xs leading-5 text-white/58">
              레이저 커팅 보호 여백 · 외곽/키링 빨강 · 구멍 검정 · 0.01mm
            </div>
          </div>
              <div className="mb-3 text-sm font-semibold text-white/86">구멍 규격</div>
              <div className="grid gap-2">
                {HOLE_SIZES.map((item) => (
                  <OptionButton
                    key={String(item)}
                    active={holeSize === item}
                    label={getHoleLabel(item)}
                    description={getHoleLimitLabel(item)}
                    onClick={() => setHoleSize(item)}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/68">
              <div>업로드 후 작업판 내부 글씨 제거</div>
              <div>원형/사각형은 구멍이 외곽선에 붙어 이동</div>
              <div>자동칼선 업로드 시 빨간 칼선 1차 생성</div>
            </div>
          </aside>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.2)]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[12px] font-bold tracking-[0.18em] text-[#8fc0ff]">CENTER / 작업 상태</div>
                <p className="mt-1 text-sm text-white/68">
                  구멍 위치·규격·형태는 아래 작업대에서 바로 조정
                </p>
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/72">
                {uploadState ? `업로드 파일: ${uploadState.name}` : "업로드 파일 대기"}
              </div>
            </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-cyan-300/20 bg-cyan-400/[0.10] px-3 py-2 text-[11px] font-semibold text-cyan-100">
                  기준판 150 x 150mm
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-white/82">
                  현재 배율 {Math.round(artScale * 100)}%
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-white/82">
                  작업대 좌표 X {Math.round(hole.x)} / Y {Math.round(hole.y)}px
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-white/82">
                  구멍 규격 {getHoleLabel(holeSize)}
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-white/82">
                  현재 형태 {shapeMode}
                </div>
                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-white/82">
                  <span className="font-semibold text-cyan-100">
                    현재 칼선 여백 {formatAutoCutlineMarginMm(autoCutlineMarginMm)}mm
                  </span>
                  {AUTO_CUTLINE_MARGIN_OPTIONS.map((marginMm) => {
                    const active = autoCutlineMarginMm === marginMm;
                    const disabled = shapeMode !== "자동칼선";
                    return (
                      <button
                        key={`hud-cutline-margin-${marginMm}`}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          if (!disabled) {
                            setAutoCutlineMarginMm(marginMm);
                          }
                        }}
                        className={[
                          "rounded-lg border px-2 py-1 text-[10px] font-semibold transition",
                          active
                            ? "border-cyan-300/40 bg-cyan-400/[0.14] text-cyan-100"
                            : "border-white/10 bg-white/[0.03] text-white/72 hover:border-white/20 hover:text-white",
                          disabled ? "cursor-not-allowed opacity-45" : ""
                        ].join(" ")}
                      >
                        {formatAutoCutlineMarginMm(marginMm)}mm
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-2 text-[11px] text-white/55">
                구멍 중심은 칼선 안쪽 유지 · 구멍 안쪽은 이미지 배치 불가 · 이미지는 외곽/구멍 보호영역에서 2mm 이격 · 가이드는 mm 기준
              </div>
            </div>

            {/* DATA_SIZE_INLINE_UI_START */}
            <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.08] p-4 text-sm text-white/85">
              <div className="mb-2 flex items-center justify-between text-[12px] font-medium text-cyan-100">
                <span>데이터 크기</span>
                <span>{Math.round(artScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="130"
                step="1"
                value={Math.round(artScale * 100)}
                onChange={(e) => setArtScale(Number(e.target.value) / 100)}
                className="w-full accent-cyan-300"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setArtScale((prev) => Math.max(0.7, Number((prev - 0.05).toFixed(2))))}
                  className="rounded-xl border border-white/10 px-3 py-2 text-[11px] text-white/85 transition hover:border-white/20 hover:text-white"
                >
                  -5%
                </button>
                <button
                  type="button"
                  onClick={() => setArtScale(1)}
                  className="rounded-xl border border-white/10 px-3 py-2 text-[11px] text-white/85 transition hover:border-white/20 hover:text-white"
                >
                  기본
                </button>
                <button
                  type="button"
                  onClick={() => setArtScale((prev) => Math.min(1.3, Number((prev + 0.05).toFixed(2))))}
                  className="rounded-xl border border-white/10 px-3 py-2 text-[11px] text-white/85 transition hover:border-white/20 hover:text-white"
                >
                  +5%
                </button>
              </div>
              <div className="mt-2 text-[11px] text-white/60">
                70% ~ 130% 범위에서 데이터/칼선/구멍을 함께 확인
              </div>
            </div>
                        {/* DATA_SIZE_INLINE_UI_END */}
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[11px] text-white/68">
              <div className="flex items-center justify-between gap-2 text-cyan-100/90">
                <span>0mm</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
                <span>125</span>
                <span>150mm</span>
              </div>
              <div className="mt-2 h-px w-full bg-gradient-to-r from-cyan-200/70 via-cyan-200/40 to-cyan-200/70" />
              <div className="mt-2 flex flex-wrap gap-3">
                <span className="font-semibold text-cyan-100">기준판 150 x 150mm</span>
                <span>주 눈금 25mm</span>
                <span>보조 눈금 5mm</span>
                <span>숫자 눈금 25mm 간격</span>
                <span>현재 배율 {Math.round(artScale * 100)}%</span>
                <span>칼선 여백: 좌측 mm 버튼</span>
              </div>
            </div>


            <div
              className={`mt-4 overflow-hidden rounded-[28px] border ${
                dragging ? "border-[#7fbaff]/70" : "border-white/10"
              } relative bg-[#02091f] p-4 transition cursor-grab active:cursor-grabbing select-none`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
              onPointerLeave={stopDrag}
            >              <div
                className="pointer-events-none absolute left-1/2 top-4 z-0 -translate-x-1/2 rounded-[24px] border border-cyan-300/12 opacity-80"
                style={{
                  width: "min(72vw, 600px)",
                  height: "min(72vw, 600px)",
                  backgroundImage: `
                    linear-gradient(to right, rgba(143,192,255,0.08) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(143,192,255,0.08) 1px, transparent 1px),
                    linear-gradient(to right, rgba(143,192,255,0.16) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(143,192,255,0.16) 1px, transparent 1px)
                  `,
                  backgroundSize: "4px 4px, 4px 4px, 20px 20px, 20px 20px",
                  boxShadow: "inset 0 0 0 1px rgba(143,192,255,0.1)",
                }}
              />
              <div
                className="pointer-events-none absolute left-1/2 top-4 z-0 -translate-x-1/2"
                style={{ width: "min(72vw, 600px)", height: "min(72vw, 600px)" }}
              >
                <div className="absolute inset-x-3 top-1 flex items-center justify-between text-[10px] font-medium text-cyan-100/58">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                  <span>125</span>
                  <span>150mm</span>
                </div>
                <div className="absolute inset-y-3 left-1 flex flex-col items-start justify-between text-[10px] font-medium text-cyan-100/52">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                  <span>125</span>
                  <span>150</span>
                </div>
              </div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-white/82">메인 작업대</div>
                  <div
                    className={[
                      "rounded-full border px-3 py-1 text-[11px] font-semibold",
                      productionStatus.tone === "cyan"
                        ? "border-cyan-300/30 bg-cyan-400/[0.12] text-cyan-100"
                        : "border-amber-300/30 bg-amber-300/[0.12] text-amber-100",
                    ].join(" ")}
                  >
                    {productionStatus.label}
                  </div>
                </div>
                <div className="text-sm text-white/62">{productionStatus.detail}</div>
              </div>

              <div className="h-[700px] w-full">
                <KeyringCanvas
                  hole={hole}
                  shapeMode={shapeMode}
                  holeSize={holeSize}
                  imageUrl={uploadState?.previewUrl ?? null}
                  autoCutline={effectiveAutoCutline}
                artScale={artScale}
                />
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
            <div className="mb-4 text-[12px] font-bold tracking-[0.18em] text-[#8fc0ff]">RIGHT / 업로드 · 제작 정보 · 주문</div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-2 text-sm font-semibold text-white/88">업로드 상태</div>
              <div className="mb-3 text-sm leading-6 text-white/70">{uploadGuide}</div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.pdf,.ai,.psd"
                className="hidden"
                onChange={handleUploadChange}
              />

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="rounded-2xl bg-[#a9d7ff] px-4 py-4 text-base font-extrabold text-[#0a1730] transition hover:brightness-105"
                >
                  파일 선택
                </button>

                <button
                  type="button"
                  onClick={clearUpload}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-base font-extrabold text-white transition hover:bg-white/[0.08]"
                >
                  업로드 비우기
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-[#000923] p-4 text-sm leading-7 text-white/72">
                <div>실시간 미리보기 가능 형식: PNG / JPG / WEBP</div>
                <div>PDF / AI / PSD는 업로드 기록만 유지</div>
                <div>가능하면 투명 배경, 300dpi 기준</div>
              </div>

              {uploadState ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-white/72">
                  <div>파일명: {uploadState.name}</div>
                  <div>형식: {uploadState.typeLabel}</div>
                  <div>크기: {uploadState.sizeLabel}</div>
                  <div>작업판 반영: {uploadState.previewUrl ? "즉시 반영" : "기록만 유지"}</div>
                  {shapeMode === "자동칼선" ? (
                    <div>
                      자동칼선 상태: {autoCutline.status === "ready" ? "생성 완료" : autoCutline.status === "processing" ? "계산중" : autoCutline.status === "failed" ? "생성 실패" : "대기"}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 text-sm font-semibold text-white/86">수량</div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="h-12 w-12 rounded-2xl border border-white/10 bg-white/[0.03] text-lg font-bold text-white/86 transition hover:bg-white/[0.08]"
                >
                  -
                </button>
                <div className="flex-1 rounded-2xl border border-white/10 bg-[#000923] px-4 py-3 text-center text-xl font-bold text-white">
                  {quantity}
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="h-12 w-12 rounded-2xl border border-white/10 bg-white/[0.03] text-lg font-bold text-white/86 transition hover:bg-white/[0.08]"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3 text-sm text-white/68">
                <span>예상 단가</span>
                <strong className="text-3xl font-extrabold tracking-tight text-white">
                  {unitPrice.toLocaleString("ko-KR")}원
                </strong>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm text-white/68">
                <span>예상 합계</span>
                <strong className="text-4xl font-extrabold tracking-tight text-white">
                  {totalPrice.toLocaleString("ko-KR")}원
                </strong>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/72">
              <div className="mb-2 text-sm font-semibold text-white/88">제작 기준</div>
              <div>업로드 후 작업판 내부 글씨 제거</div>
              <div>원형/사각형은 구멍이 외곽선에 붙어 이동</div>
              <div>자동칼선 업로드 시 빨간 칼선 1차 생성</div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/72">
              <div className="mb-2 text-sm font-semibold text-white/88">제작 정보</div>
              <div>형태: {shapeMode}</div>
              <div>자재: {material}</div>
              <div>두께: {thickness}</div>
              <div>링: {ring}</div>
              <div>인쇄: 기본 양면 인쇄</div>
              <div>구멍 규격: {getHoleLabel(holeSize)}</div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/68">
              <div className="mb-2 text-sm font-semibold text-white/88">업로드 기준</div>
              <div>PNG / PSD / PDF / AI 권장</div>
              <div>가능하면 투명 배경, 300dpi 기준</div>
              <div>JPG/WEBP는 밝은 배경 제거 후 자동칼선 1차 추정</div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/68">
              <div className="mb-2 text-sm font-semibold text-white/88">운영 규칙</div>
              <div>기본 포장 포함</div>
              <div>수량 / 규격에 따라 자동 반영</div>
              <div>운영 규칙 적용</div>
            </div>

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                className="rounded-2xl bg-[#a9d7ff] px-4 py-4 text-base font-extrabold text-[#0a1730] transition hover:brightness-105"
              >
                서랍 저장
              </button>
              <button
                type="button"
                disabled={autoCutlineLocked}
                className={`rounded-2xl px-4 py-4 text-base font-extrabold transition ${
                  autoCutlineLocked
                    ? "cursor-not-allowed border border-white/10 bg-white/[0.03] text-white/40"
                    : "border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                }`}
              >
                {autoCutlineLocked ? "자동칼선 생성 후 주문" : "주문으로"}
              </button>
            </div>
          </aside>
        </section>
      </div>
    
      </main>
  );
}














