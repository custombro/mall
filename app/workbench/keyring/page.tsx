"use client";

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
function cbTriangleArea(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
) {
  return Math.abs(
    (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2,
  );
}

function cbPruneTinyBoundaryNoise(
  points: Array<{ x: number; y: number }>,
  minEdge = 2,
  minTriangleArea = 2.4,
  passes = 3,
) {
  let next = points.map((point) => ({ x: point.x, y: point.y }));

  for (let pass = 0; pass < passes; pass += 1) {
    if (next.length < 24) return next;

    const filtered = next.filter((point, index, arr) => {
      const prev = arr[(index - 1 + arr.length) % arr.length];
      const following = arr[(index + 1) % arr.length];
      const prevLen = cbDistance(prev, point);
      const nextLen = cbDistance(point, following);
      const span = cbDistance(prev, following);
      const triangleArea = cbTriangleArea(prev, point, following);

      const tinyCorner =
        prevLen <= minEdge &&
        nextLen <= minEdge * 1.18 &&
        triangleArea <= minTriangleArea;

      const shortNeedle =
        span <= minEdge * 1.12 &&
        triangleArea <= minTriangleArea * 1.35;

      return !(tinyCorner || shortNeedle);
    });

    if (filtered.length === next.length || filtered.length < 24) {
      return next;
    }

    next = filtered;
  }

  return next;
}

function cbAngleAwareContourSmoothing(
  points: Array<{ x: number; y: number }>,
  strength = 0.16,
  passes = 2,
  preserveCornerDeg = 44,
) {
  let next = points.map((point) => ({ x: point.x, y: point.y }));

  for (let pass = 0; pass < passes; pass += 1) {
    if (next.length < 16) return next;

    next = next.map((point, index, arr) => {
      const prev = arr[(index - 1 + arr.length) % arr.length];
      const following = arr[(index + 1) % arr.length];

      const prevLen = Math.max(0.0001, cbDistance(prev, point));
      const nextLen = Math.max(0.0001, cbDistance(point, following));

      if (prevLen <= 1 || nextLen <= 1) {
        return point;
      }

      const inVecX = point.x - prev.x;
      const inVecY = point.y - prev.y;
      const outVecX = following.x - point.x;
      const outVecY = following.y - point.y;
      const cosTheta = clamp(
        (inVecX * outVecX + inVecY * outVecY) / (prevLen * nextLen),
        -1,
        1,
      );
      const angleDeg = (Math.acos(cosTheta) * 180) / Math.PI;

      if (angleDeg <= preserveCornerDeg) {
        return point;
      }

      const neighborMidX = (prev.x + following.x) / 2;
      const neighborMidY = (prev.y + following.y) / 2;

      return {
        x: point.x + (neighborMidX - point.x) * strength,
        y: point.y + (neighborMidY - point.y) * strength,
      };
    });
  }

  return next;
}

function cbCollapseNarrowPeninsulas(
  points: Array<{ x: number; y: number }>,
  minBridge = 2.8,
  maxTriangleArea = 4.8,
  passes = 2,
) {
  let next = points.map((point) => ({ x: point.x, y: point.y }));

  for (let pass = 0; pass < passes; pass += 1) {
    if (next.length < 24) return next;

    const filtered = next.filter((point, index, arr) => {
      const prev2 = arr[(index - 2 + arr.length) % arr.length];
      const prev = arr[(index - 1 + arr.length) % arr.length];
      const following = arr[(index + 1) % arr.length];
      const next2 = arr[(index + 2) % arr.length];

      const bridge = cbDistance(prev, following);
      const armIn = cbDistance(prev, point);
      const armOut = cbDistance(point, following);
      const triangleArea = cbTriangleArea(prev, point, following);
      const widerContextSpan = cbDistance(prev2, next2);

      const narrowPeninsula =
        bridge <= minBridge &&
        triangleArea <= maxTriangleArea &&
        armIn + armOut >= bridge * 1.75 &&
        widerContextSpan <= minBridge * 2.85;

      return !narrowPeninsula;
    });

    if (filtered.length === next.length || filtered.length < 24) {
      return next;
    }

    next = filtered;
  }

  return next;
}
function cbStabilizeShortSegments(
  points: Array<{ x: number; y: number }>,
  minSegment = 1.9,
  maxJoinSpan = 3.6,
  passes = 2,
) {
  let next = points.map((point) => ({ x: point.x, y: point.y }));

  for (let pass = 0; pass < passes; pass += 1) {
    if (next.length < 24) return next;

    const filtered = next.filter((point, index, arr) => {
      const prev = arr[(index - 1 + arr.length) % arr.length];
      const following = arr[(index + 1) % arr.length];

      const prevLen = cbDistance(prev, point);
      const nextLen = cbDistance(point, following);
      const joinSpan = cbDistance(prev, following);
      const triangleArea = cbTriangleArea(prev, point, following);

      const tinyJog =
        prevLen <= minSegment &&
        nextLen <= minSegment * 1.28 &&
        joinSpan <= maxJoinSpan;

      const shallowZigzag =
        triangleArea <= minSegment * maxJoinSpan * 0.32 &&
        prevLen + nextLen <= maxJoinSpan * 1.8 &&
        joinSpan <= maxJoinSpan * 1.12;

      return !(tinyJog || shallowZigzag);
    });

    if (filtered.length === next.length || filtered.length < 24) {
      return next;
    }

    next = filtered;
  }

  return next;
}
function cbCullThinNecks(
  points: Array<{ x: number; y: number }>,
  minWidth = 2.6,
  maxPocketArea = 5.8,
  passes = 2,
) {
  let next = points.map((point) => ({ x: point.x, y: point.y }));

  for (let pass = 0; pass < passes; pass += 1) {
    if (next.length < 28) return next;

    const filtered = next.filter((point, index, arr) => {
      const prev2 = arr[(index - 2 + arr.length) % arr.length];
      const prev = arr[(index - 1 + arr.length) % arr.length];
      const following = arr[(index + 1) % arr.length];
      const next2 = arr[(index + 2) % arr.length];

      const bridge = cbDistance(prev, following);
      const outerBridge = cbDistance(prev2, next2);
      const armIn = cbDistance(prev, point);
      const armOut = cbDistance(point, following);
      const localArea = cbTriangleArea(prev, point, following);
      const outerArea =
        cbTriangleArea(prev2, prev, following) +
        cbTriangleArea(prev, following, next2);

      const thinNeck =
        bridge <= minWidth &&
        localArea <= maxPocketArea &&
        armIn + armOut >= bridge * 1.7 &&
        outerBridge <= minWidth * 2.55 &&
        outerArea <= maxPocketArea * 3.8;

      return !thinNeck;
    });

    if (filtered.length === next.length || filtered.length < 28) {
      return next;
    }

    next = filtered;
  }

  return next;
}
function cbSignedArea(points: Array<{ x: number; y: number }>) {
  let area = 0;

  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    area += current.x * next.y - next.x * current.y;
  }

  return area / 2;
}

function cbOffsetClosedContour(
  points: Array<{ x: number; y: number }>,
  amount = 2,
) {
  if (points.length < 3 || amount === 0) {
    return points.map((point) => ({ x: point.x, y: point.y }));
  }

  const signedArea = cbSignedArea(points);
  const winding = signedArea >= 0 ? 1 : -1;

  return points.map((point, index, arr) => {
    const prev = arr[(index - 1 + arr.length) % arr.length];
    const following = arr[(index + 1) % arr.length];

    const inDx = point.x - prev.x;
    const inDy = point.y - prev.y;
    const outDx = following.x - point.x;
    const outDy = following.y - point.y;

    const inLen = Math.max(0.0001, Math.sqrt(inDx * inDx + inDy * inDy));
    const outLen = Math.max(0.0001, Math.sqrt(outDx * outDx + outDy * outDy));

    const inNormalX = winding >= 0 ? inDy / inLen : -inDy / inLen;
    const inNormalY = winding >= 0 ? -inDx / inLen : inDx / inLen;
    const outNormalX = winding >= 0 ? outDy / outLen : -outDy / outLen;
    const outNormalY = winding >= 0 ? -outDx / outLen : outDx / outLen;

    let normalX = inNormalX + outNormalX;
    let normalY = inNormalY + outNormalY;
    const normalLen = Math.sqrt(normalX * normalX + normalY * normalY);

    if (normalLen <= 0.0001) {
      normalX = outNormalX;
      normalY = outNormalY;
    } else {
      normalX /= normalLen;
      normalY /= normalLen;
    }

    return {
      x: point.x + normalX * amount,
      y: point.y + normalY * amount,
    };
  });
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
  const outward = normalize(bestPoint.x - centroid.x, bestPoint.y - centroid.y);
  const attachInset = Math.max(0, getHoleOuterCutlineRadius(holeSize) - getHoleVisualRadius(holeSize));
  return {
    x: bestPoint.x - outward.x * attachInset,
    y: bestPoint.y - outward.y * attachInset,
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
  if (points.length < 3) {
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

  let bestPoint = points[0];
  let bestSegmentIndex = 0;
  let bestDist = Number.POSITIVE_INFINITY;

  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const projected = projectToSegment(hole, a, b);
    const dist = Math.hypot(projected.x - hole.x, projected.y - hole.y);

    if (dist < bestDist) {
      bestDist = dist;
      bestPoint = projected;
      bestSegmentIndex = i;
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

  const outward = normalize(bestPoint.x - centroid.x, bestPoint.y - centroid.y);
  const segmentNext = points[(bestSegmentIndex + 1) % points.length];
  const segmentDir = normalize(
    segmentNext.x - points[bestSegmentIndex].x,
    segmentNext.y - points[bestSegmentIndex].y,
  );

  const holeOuter = getHoleOuterCutlineRadius(holeSize);
  const neckHalf = Math.max(0.9, holeOuter * 0.12);
  const shoulderLift = Math.max(0.12, holeOuter * 0.04);
  const topLift = Math.max(0.28, holeOuter * 0.08);

  const leftNeck = {
    x: bestPoint.x - segmentDir.x * neckHalf + outward.x * shoulderLift,
    y: bestPoint.y - segmentDir.y * neckHalf + outward.y * shoulderLift,
  };

  const topNeck = {
    x: bestPoint.x + outward.x * topLift,
    y: bestPoint.y + outward.y * topLift,
  };

  const rightNeck = {
    x: bestPoint.x + segmentDir.x * neckHalf + outward.x * shoulderLift,
    y: bestPoint.y + segmentDir.y * neckHalf + outward.y * shoulderLift,
  };

  const mergedPoints: Point[] = [];
  for (let i = 0; i < points.length; i += 1) {
    mergedPoints.push(points[i]);
    if (i === bestSegmentIndex) {
      mergedPoints.push(leftNeck, topNeck, rightNeck);
    }
  }

  return cbBuildSmoothClosedPath(mergedPoints);
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

  const imageData = ctx.getImageData(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  const image = imageData.data;
  const mask: boolean[][] = Array.from({ length: VIEW_HEIGHT }, () =>
    Array.from({ length: VIEW_WIDTH }, () => false),
  );

  let transparentPixelCount = 0;
  let visiblePixelCount = 0;

  for (let i = 0; i < image.length; i += 4) {
    const alpha = image[i + 3];
    if (alpha > 16) {
      visiblePixelCount += 1;
    } else {
      transparentPixelCount += 1;
    }
  }

  const hasMeaningfulTransparency =
    transparentPixelCount > 0 &&
    transparentPixelCount / Math.max(1, transparentPixelCount + visiblePixelCount) > 0.01;

  let count = 0;
  let sumX = 0;
  let sumY = 0;

  for (let y = 0; y < VIEW_HEIGHT; y += 1) {
    for (let x = 0; x < VIEW_WIDTH; x += 1) {
      const pixelIndex = (y * VIEW_WIDTH + x) * 4;
      const r = image[pixelIndex];
      const g = image[pixelIndex + 1];
      const b = image[pixelIndex + 2];
      const a = image[pixelIndex + 3];
      const keepPixel = hasMeaningfulTransparency ? a > 16 : isForeground(r, g, b, a);

      if (keepPixel) {
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

            const transparentLike = a <= 36;
            const whiteLike = a >= 150 && brightness >= 214 && chroma <= 40;
            const edgeColorLike =
              a >= 120 &&
              dist <= 52 &&
              Math.abs(brightness - avgBorderBrightness) <= 38 &&
              chroma <= 58;

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
  previewUrl,
  preferOriginalPreview,
  autoCutline,
  autoCutlinePreviewEnabled,
  autoCutlinePreviewMinGap,
  artScale,
}: {
  hole: HolePosition;
  shapeMode: ShapeMode;
  holeSize: HoleSize;
  imageUrl: string | null;
  previewUrl: string | null;
  preferOriginalPreview?: boolean;
  autoCutline: AutoCutlineState;
  autoCutlinePreviewEnabled: boolean;
  autoCutlinePreviewMinGap: number;
  artScale: number;
}) {
  const fillId = `cb_fill_${shapeMode}`;
  const clipId = `cb_clip_${shapeMode}`;
  const holeRadius = getHoleVisualRadius(holeSize);
  const normalizePreviewPath = (value: string | Point[] | null | undefined) => {
    if (typeof value === "string") return value;
    if (Array.isArray(value) && value.length > 1) {
      return "M " + value.map((p) => p.x + " " + p.y).join(" L ") + " Z";
    }
    return "";
  };
  const [transparentPreviewUrl, setTransparentPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!previewUrl) {
      setTransparentPreviewUrl(null);
      return;
    }

    const img = new window.Image();
    img.decoding = "async";

    img.onload = () => {
      if (cancelled) return;

      const canvas = document.createElement("canvas");
      const width = Math.max(1, img.naturalWidth || img.width || 1);
      const height = Math.max(1, img.naturalHeight || img.height || 1);
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setTransparentPreviewUrl(previewUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const visited = new Uint8Array(width * height);
      const stack: number[] = [];

      const push = (x: number, y: number) => {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        const idx = y * width + x;
        if (visited[idx]) return;
        visited[idx] = 1;
        stack.push(idx);
      };

      const isNearWhiteBg = (offset: number) => {
        const r = data[offset] ?? 0;
        const g = data[offset + 1] ?? 0;
        const b = data[offset + 2] ?? 0;
        const a = data[offset + 3] ?? 0;
        if (a < 8) return false;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        return r >= 232 && g >= 232 && b >= 232 && (max - min) <= 20;
      };

      for (let x = 0; x < width; x++) {
        push(x, 0);
        push(x, height - 1);
      }
      for (let y = 0; y < height; y++) {
        push(0, y);
        push(width - 1, y);
      }

      while (stack.length > 0) {
        const idx = stack.pop();
        if (idx === undefined) break;

        const x = idx % width;
        const y = Math.floor(idx / width);
        const offset = idx * 4;

        if (!isNearWhiteBg(offset)) continue;

        data[offset + 3] = 0;

        push(x - 1, y);
        push(x + 1, y);
        push(x, y - 1);
        push(x, y + 1);
      }

      ctx.putImageData(imageData, 0, 0);

      let minX = width;
      let minY = height;
      let maxX = -1;
      let maxY = -1;
      let opaquePixelCount = 0;

      for (let scanY = 0; scanY < height; scanY++) {
        for (let scanX = 0; scanX < width; scanX++) {
          const alpha = data[(scanY * width + scanX) * 4 + 3] ?? 0;
          if (alpha > 8) {
            opaquePixelCount += 1;
            if (scanX < minX) minX = scanX;
            if (scanY < minY) minY = scanY;
            if (scanX > maxX) maxX = scanX;
            if (scanY > maxY) maxY = scanY;
          }
        }
      }

      const minOpaquePixels = Math.max(24, Math.floor(width * height * 0.0012));
      if (opaquePixelCount < minOpaquePixels || maxX < minX || maxY < minY) {
        setTransparentPreviewUrl(previewUrl);
        return;
      }

      let exportCanvas = canvas;
      if (maxX >= minX && maxY >= minY) {
        const pad = 1;
        minX = Math.max(0, minX - pad);
        minY = Math.max(0, minY - pad);
        maxX = Math.min(width - 1, maxX + pad);
        maxY = Math.min(height - 1, maxY + pad);

        const cropWidth = Math.max(1, maxX - minX + 1);
        const cropHeight = Math.max(1, maxY - minY + 1);
        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = cropWidth;
        cropCanvas.height = cropHeight;

        const cropCtx = cropCanvas.getContext("2d");
        if (cropCtx) {
          cropCtx.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
          exportCanvas = cropCanvas;
        }
      }

      try {
        const nextUrl = exportCanvas.toDataURL("image/png");
        if (!cancelled) setTransparentPreviewUrl(nextUrl);
      } catch {
        if (!cancelled) setTransparentPreviewUrl(previewUrl);
      }
    };

    img.onerror = () => {
      if (!cancelled) setTransparentPreviewUrl(previewUrl);
    };

    img.src = previewUrl;

    return () => {
      cancelled = true;
    };
  }, [previewUrl]);

  const autoRenderImageUrl =
    preferOriginalPreview && previewUrl
      ? previewUrl
      : transparentPreviewUrl ?? previewUrl ?? imageUrl;
  const shapeRenderImageUrl = transparentPreviewUrl ?? imageUrl ?? previewUrl;
  const renderImageUrl = shapeMode === "자동칼선" ? autoRenderImageUrl : shapeRenderImageUrl;
  const autoPreviewInsetEnabled = Boolean(autoRenderImageUrl) && shapeMode === "자동칼선";
  const hasUpload = Boolean(renderImageUrl);
  const showShapeImage = hasUpload && shapeMode !== "자동칼선";
  const showAutoImage = hasUpload && shapeMode === "자동칼선";
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

  const previewContourBounds = (() => {
  const pts = Array.isArray(autoCutlinePreviewPoints) ? autoCutlinePreviewPoints : [];
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const point of pts) {
    const x = typeof point?.x === "number" ? point.x : (Array.isArray(point) ? Number(point[0]) : Number.NaN);
    const y = typeof point?.y === "number" ? point.y : (Array.isArray(point) ? Number(point[1]) : Number.NaN);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    minX = scaledArtFrame.x;
    minY = scaledArtFrame.y;
    maxX = scaledArtFrame.x + scaledArtFrame.width;
    maxY = scaledArtFrame.y + scaledArtFrame.height;
  }

  const x = minX;
  const y = minY;
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);

  return { x, y, minX, minY, maxX, maxY, width, height };
})();

  const autoCutlinePreviewPath =
    (shapeMode === "자동칼선" && autoCutlinePreviewEnabled && autoCutline.status === "ready" && autoCutline.points.length > 0)
      ? cbBuildSmoothClosedPath(cbSimplifyClosedPoints(autoCutlinePreviewPoints, autoCutlinePreviewMinGap))
      : null;
  const baseShapeUnionPreviewPath =
    shapeMode === "원형" || shapeMode === "사각형"
      ? cbBuildBaseShapeUnionPreviewPath(shapeMode, hole, holeSize)
      : null;

const autoCutlinePending = shapeMode === "자동칼선";
const previewImageClipPath =
  shapeMode === "자동칼선"
    ? autoCutlinePreviewPath
    : shapeMode === "원형" || shapeMode === "사각형"
      ? baseShapeUnionPreviewPath
      : null;

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className="block h-full w-full"
      role="img"
      aria-label="정면 작업판"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9fd0ff" stopOpacity="0.96" />
          <stop offset="100%" stopColor="#1d2f47" stopOpacity="1" />
        </linearGradient>
        <clipPath id={clipId}>{renderClipShape(shapeMode)}</clipPath>
        {normalizePreviewPath(previewImageClipPath) ? (
          <clipPath id="cb-preview-image-clip">
            <path d={normalizePreviewPath(previewImageClipPath)} />
          </clipPath>
        ) : null}
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
          {showShapeImage ? (
            <>
              <image
                href={shapeRenderImageUrl!}
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
          {!hasUpload ? (
            <rect
              x={scaledArtFrame.x}
              y={scaledArtFrame.y}
              width={scaledArtFrame.width}
              height={scaledArtFrame.height}
              rx="28"
              fill="rgba(255,255,255,0.03)"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="2"
            />
          ) : null}

          {showAutoImage ? (
            <image
              href={autoRenderImageUrl!}
                x={previewContourBounds.x + (autoPreviewInsetEnabled ? 4 : 0)}
                y={previewContourBounds.y + (autoPreviewInsetEnabled ? 4 : 0)}
                width={Math.max(1, previewContourBounds.width - (autoPreviewInsetEnabled ? 8 : 0))}
                height={Math.max(1, previewContourBounds.height - (autoPreviewInsetEnabled ? 8 : 0))}
              preserveAspectRatio="xMidYMid meet"
              clipPath={previewImageClipPath ? "url(#cb-preview-image-clip)" : undefined}
            />
          ) : null}

          {(shapeMode === "자동칼선" && autoCutlinePreviewEnabled && autoCutline.status === "ready" && autoCutline.points.length > 0) && autoCutline.path ? (
            <path
              d={normalizePreviewPath(autoCutlinePreviewPath) || cbBuildSmoothClosedPath(cbSimplifyClosedPoints(autoCutlinePreviewPoints, autoCutlinePreviewMinGap))}
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
                키링 작업대
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
          {!hasUpload || autoCutline.status !== "ready" ? (
            <text
              x="470"
              y="108"
              textAnchor="end"
              fill="rgba(255,255,255,0.72)"
              fontSize="12"
              fontWeight="700"
            >
              {autoCutline.status === "ready"
                ? "자동칼선 1차 생성"
                : autoCutline.status === "processing"
                  ? "자동칼선 계산중"
                  : autoCutline.status === "failed"
                    ? "자동칼선 생성 실패"
                    : "업로드 대기"}
            </text>
          ) : null}
        </>
          )}      {shapeMode !== "자동칼선" || !(shapeMode === "자동칼선" && autoCutlinePreviewEnabled && autoCutline.status === "ready" && autoCutline.points.length > 0) || !autoCutline.path ? null : (
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

async function buildTransparentTraceSourceUrlCore(sourceUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const naturalWidth = Math.max(1, img.naturalWidth || img.width || 1);
        const naturalHeight = Math.max(1, img.naturalHeight || img.height || 1);
        const maxSide = 1024;
        const scale = Math.min(1, maxSide / Math.max(naturalWidth, naturalHeight));
        const workWidth = Math.max(1, Math.round(naturalWidth * scale));
        const workHeight = Math.max(1, Math.round(naturalHeight * scale));

        const canvas = document.createElement("canvas");
        canvas.width = workWidth;
        canvas.height = workHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) {
          resolve(sourceUrl);
          return;
        }

        ctx.clearRect(0, 0, workWidth, workHeight);
        ctx.drawImage(img, 0, 0, workWidth, workHeight);

        const imageData = ctx.getImageData(0, 0, workWidth, workHeight);
        const data = imageData.data;

        let hasMeaningfulTransparency = false;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 245) {
            hasMeaningfulTransparency = true;
            break;
          }
        }

        if (hasMeaningfulTransparency) {
          resolve(sourceUrl);
          return;
        }

        const getPixel = (x: number, y: number) => {
          const idx = (y * workWidth + x) * 4;
          return {
            idx,
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2],
            a: data[idx + 3],
          };
        };

        const getGrad = (x: number, y: number) => {
          const current = getPixel(x, y);
          const rightX = Math.min(workWidth - 1, x + 1);
          const downY = Math.min(workHeight - 1, y + 1);
          const right = getPixel(rightX, y);
          const down = getPixel(x, downY);
          return (
            Math.abs(current.r - right.r) +
            Math.abs(current.g - right.g) +
            Math.abs(current.b - right.b) +
            Math.abs(current.r - down.r) +
            Math.abs(current.g - down.g) +
            Math.abs(current.b - down.b)
          );
        };

        const borderSamples: Array<{ r: number; g: number; b: number }> = [];
        const pushBorderSample = (x: number, y: number) => {
          if (x < 0 || y < 0 || x >= workWidth || y >= workHeight) return;
          const pixel = getPixel(x, y);
          borderSamples.push({ r: pixel.r, g: pixel.g, b: pixel.b });
        };

        for (let x = 0; x < workWidth; x += 1) {
          pushBorderSample(x, 0);
          pushBorderSample(x, workHeight - 1);
        }
        for (let y = 1; y < workHeight - 1; y += 1) {
          pushBorderSample(0, y);
          pushBorderSample(workWidth - 1, y);
        }

        if (borderSamples.length < 24) {
          resolve(sourceUrl);
          return;
        }

        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let sumChroma = 0;
        for (const sample of borderSamples) {
          sumR += sample.r;
          sumG += sample.g;
          sumB += sample.b;
          sumChroma += Math.max(sample.r, sample.g, sample.b) - Math.min(sample.r, sample.g, sample.b);
        }

        const borderAvgR = sumR / borderSamples.length;
        const borderAvgG = sumG / borderSamples.length;
        const borderAvgB = sumB / borderSamples.length;
        const borderBrightness = (borderAvgR + borderAvgG + borderAvgB) / 3;
        const borderChroma = sumChroma / borderSamples.length;

        const matchesBorderWhite = (x: number, y: number) => {
          const pixel = getPixel(x, y);
          const brightness = (pixel.r + pixel.g + pixel.b) / 3;
          const chroma = Math.max(pixel.r, pixel.g, pixel.b) - Math.min(pixel.r, pixel.g, pixel.b);
          const borderDistance = Math.sqrt(
            (pixel.r - borderAvgR) * (pixel.r - borderAvgR) +
              (pixel.g - borderAvgG) * (pixel.g - borderAvgG) +
              (pixel.b - borderAvgB) * (pixel.b - borderAvgB),
          );
          return (
            brightness >= borderBrightness - 18 &&
            chroma <= Math.max(24, borderChroma + 10) &&
            borderDistance <= 48
          );
        };

        let borderWhiteLikeCount = 0;
        for (let x = 0; x < workWidth; x += 1) {
          if (matchesBorderWhite(x, 0)) borderWhiteLikeCount += 1;
          if (matchesBorderWhite(x, workHeight - 1)) borderWhiteLikeCount += 1;
        }
        for (let y = 1; y < workHeight - 1; y += 1) {
          if (matchesBorderWhite(0, y)) borderWhiteLikeCount += 1;
          if (matchesBorderWhite(workWidth - 1, y)) borderWhiteLikeCount += 1;
        }

        const borderChecks = Math.max(1, workWidth * 2 + Math.max(0, workHeight - 2) * 2);
        const borderWhiteRatio = borderWhiteLikeCount / borderChecks;

        if (borderBrightness < 232 || borderChroma > 24 || borderWhiteRatio < 0.58) {
          resolve(sourceUrl);
          return;
        }

        const centerProtectionMap: boolean[][] = Array.from({ length: workHeight }, () =>
          Array.from({ length: workWidth }, () => false),
        );

        const centerLeft = Math.floor(workWidth * 0.16);
        const centerRight = Math.ceil(workWidth * 0.84);
        const centerTop = Math.floor(workHeight * 0.08);
        const centerBottom = Math.ceil(workHeight * 0.92);
        const centerX = (workWidth - 1) / 2;
        const centerY = (workHeight - 1) / 2;
        let bestProtectScore = 0;
        const protectScoreMap: number[][] = Array.from({ length: workHeight }, () =>
          Array.from({ length: workWidth }, () => 0),
        );

        for (let y = centerTop; y <= centerBottom; y += 1) {
          for (let x = centerLeft; x <= centerRight; x += 1) {
            const pixel = getPixel(x, y);
            if (pixel.a < 24) continue;

            const brightness = (pixel.r + pixel.g + pixel.b) / 3;
            const chroma = Math.max(pixel.r, pixel.g, pixel.b) - Math.min(pixel.r, pixel.g, pixel.b);
            const borderDistance = Math.sqrt(
              (pixel.r - borderAvgR) * (pixel.r - borderAvgR) +
                (pixel.g - borderAvgG) * (pixel.g - borderAvgG) +
                (pixel.b - borderAvgB) * (pixel.b - borderAvgB),
            );
            const grad = getGrad(x, y);

            const centerBiasX = 1 - Math.min(1, Math.abs(x - centerX) / (workWidth * 0.5));
            const centerBiasY = 1 - Math.min(1, Math.abs(y - centerY) / (workHeight * 0.5));
            const centerBias = Math.max(0, (centerBiasX + centerBiasY) / 2);

            let score = 0;
            score += Math.max(0, borderDistance - 8) * 0.95;
            score += Math.max(0, borderBrightness - brightness - 2) * 1.1;
            score += Math.max(0, chroma - Math.max(4, borderChroma + 1)) * 1.05;
            score += Math.max(0, grad - 10) * 0.55;
            score += centerBias * 16;

            if (matchesBorderWhite(x, y) && grad < 18 && chroma <= Math.max(8, borderChroma + 2)) {
              score *= 0.28;
            }

            protectScoreMap[y][x] = score;
            if (score > bestProtectScore) bestProtectScore = score;
          }
        }

        const protectThreshold = Math.max(10, bestProtectScore * 0.36);
        const strictCenterThreshold = Math.max(8, bestProtectScore * 0.24);

        for (let y = centerTop; y <= centerBottom; y += 1) {
          for (let x = centerLeft; x <= centerRight; x += 1) {
            const inStrictCenter =
              x >= workWidth * 0.28 &&
              x <= workWidth * 0.72 &&
              y >= workHeight * 0.16 &&
              y <= workHeight * 0.84;

            const score = protectScoreMap[y][x];
            centerProtectionMap[y][x] =
              score >= protectThreshold ||
              (inStrictCenter && score >= strictCenterThreshold);
          }
        }

        const backgroundMask: boolean[][] = Array.from({ length: workHeight }, () =>
          Array.from({ length: workWidth }, () => false),
        );
        const queue: Array<{ x: number; y: number }> = [];
        let head = 0;

        const enqueue = (x: number, y: number) => {
          if (x < 0 || y < 0 || x >= workWidth || y >= workHeight) return;
          if (backgroundMask[y][x]) return;
          if (centerProtectionMap[y][x]) return;
          if (!matchesBorderWhite(x, y)) return;
          backgroundMask[y][x] = true;
          queue.push({ x, y });
        };

        for (let x = 0; x < workWidth; x += 1) {
          enqueue(x, 0);
          enqueue(x, workHeight - 1);
        }
        for (let y = 1; y < workHeight - 1; y += 1) {
          enqueue(0, y);
          enqueue(workWidth - 1, y);
        }

        while (head < queue.length) {
          const current = queue[head];
          head += 1;

          enqueue(current.x - 1, current.y);
          enqueue(current.x + 1, current.y);
          enqueue(current.x, current.y - 1);
          enqueue(current.x, current.y + 1);
          enqueue(current.x - 1, current.y - 1);
          enqueue(current.x + 1, current.y - 1);
          enqueue(current.x - 1, current.y + 1);
          enqueue(current.x + 1, current.y + 1);
        }

        let removedBackgroundPixels = 0;
        for (let y = 0; y < workHeight; y += 1) {
          for (let x = 0; x < workWidth; x += 1) {
            if (!backgroundMask[y][x]) continue;
            const pixel = getPixel(x, y);
            data[pixel.idx + 3] = 0;
            removedBackgroundPixels += 1;
          }
        }

        const minimumRemovalPixels = Math.max(20, Math.floor(workWidth * workHeight * 0.02));

        if (removedBackgroundPixels < minimumRemovalPixels) {
          const looseBackgroundMask: boolean[][] = Array.from({ length: workHeight }, () =>
            Array.from({ length: workWidth }, () => false),
          );
          const looseQueue: Array<{ x: number; y: number }> = [];
          let looseHead = 0;

          const matchesLooseBorderWhite = (x: number, y: number) => {
            const pixel = getPixel(x, y);
            const brightness = (pixel.r + pixel.g + pixel.b) / 3;
            const chroma = Math.max(pixel.r, pixel.g, pixel.b) - Math.min(pixel.r, pixel.g, pixel.b);
            const borderDistance = Math.sqrt(
              (pixel.r - borderAvgR) * (pixel.r - borderAvgR) +
                (pixel.g - borderAvgG) * (pixel.g - borderAvgG) +
                (pixel.b - borderAvgB) * (pixel.b - borderAvgB),
            );
            const grad = getGrad(x, y);

            return (
              brightness >= borderBrightness - 32 &&
              chroma <= Math.max(34, borderChroma + 16) &&
              borderDistance <= 74 &&
              grad <= 68
            );
          };

          const enqueueLoose = (x: number, y: number) => {
            if (x < 0 || y < 0 || x >= workWidth || y >= workHeight) return;
            if (looseBackgroundMask[y][x]) return;
            if (centerProtectionMap[y][x]) return;
            if (!matchesLooseBorderWhite(x, y)) return;
            looseBackgroundMask[y][x] = true;
            looseQueue.push({ x, y });
          };

          for (let x = 0; x < workWidth; x += 1) {
            enqueueLoose(x, 0);
            enqueueLoose(x, workHeight - 1);
          }
          for (let y = 1; y < workHeight - 1; y += 1) {
            enqueueLoose(0, y);
            enqueueLoose(workWidth - 1, y);
          }

          while (looseHead < looseQueue.length) {
            const current = looseQueue[looseHead];
            looseHead += 1;

            enqueueLoose(current.x - 1, current.y);
            enqueueLoose(current.x + 1, current.y);
            enqueueLoose(current.x, current.y - 1);
            enqueueLoose(current.x, current.y + 1);
            enqueueLoose(current.x - 1, current.y - 1);
            enqueueLoose(current.x + 1, current.y - 1);
            enqueueLoose(current.x - 1, current.y + 1);
            enqueueLoose(current.x + 1, current.y + 1);
          }

          let looseRemovedBackgroundPixels = 0;
          for (let y = 0; y < workHeight; y += 1) {
            for (let x = 0; x < workWidth; x += 1) {
              if (!looseBackgroundMask[y][x]) continue;
              if (backgroundMask[y][x]) continue;
              const pixel = getPixel(x, y);
              data[pixel.idx + 3] = 0;
              looseRemovedBackgroundPixels += 1;
            }
          }

          removedBackgroundPixels += looseRemovedBackgroundPixels;

          if (
            removedBackgroundPixels <
            Math.max(12, Math.floor(workWidth * workHeight * 0.006))
          ) {
            resolve(sourceUrl);
            return;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(sourceUrl);
      }
    };

    img.onerror = () => resolve(sourceUrl);
    img.src = sourceUrl;
  });
}

/* CB_WHITE_JPG_SELFTEST_SAFE_REGION_START */
type WhiteJpgSelftestCase<TInput, TOutput> = {
  name: string
  input: TInput
  assert: (output: TOutput) => boolean
  describeFailure?: (output: TOutput) => string
}

type WhiteJpgSelftestResult = {
  name: string
  ok: boolean
  reason: string
}

type WhiteJpgSelftestSummary = {
  total: number
  pass: number
  fail: number
  results: WhiteJpgSelftestResult[]
}

function runWhiteJpgSelftestCases<TInput, TOutput>(
  cases: WhiteJpgSelftestCase<TInput, TOutput>[],
  execute: (input: TInput) => TOutput,
): WhiteJpgSelftestSummary {
  const results: WhiteJpgSelftestResult[] = cases.map((testCase) => {
    try {
      const output = execute(testCase.input)
      const ok = testCase.assert(output)
      const reason = ok
        ? 'PASS'
        : (testCase.describeFailure?.(output) ?? 'ASSERT_FAILED')

      return {
        name: testCase.name,
        ok,
        reason,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        name: testCase.name,
        ok: false,
        reason: `THREW:${message}`,
      }
    }
  })

  const pass = results.filter((result) => result.ok).length

  return {
    total: results.length,
    pass,
    fail: results.length - pass,
    results,
  }
}
/* CB_WHITE_JPG_SELFTEST_SAFE_REGION_END */
/* CB_WHITE_JPG_TRACE_SELFTEST_BINDING_START */
type WhiteJpgTraceSelftestInput = "center-square" | "left-large-right-small"

type WhiteJpgTraceSelftestOutput = {
  traceSourceUrl: string
  opaquePixelCount: number
  bounds: {
    minX: number
    minY: number
    maxX: number
    maxY: number
    width: number
    height: number
  }
  centroidX: number
  centroidY: number
}

function buildWhiteJpgSyntheticSourceUrl(mode: WhiteJpgTraceSelftestInput): string {
  const canvas = document.createElement("canvas")
  canvas.width = 160
  canvas.height = 120

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("CTX_UNAVAILABLE")
  }

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = "#111111"
  if (mode === "center-square") {
    ctx.fillRect(40, 30, 80, 60)
  } else {
    ctx.fillRect(18, 20, 78, 78)
    ctx.fillRect(118, 44, 16, 16)
  }

  return canvas.toDataURL("image/jpeg", 0.92)
}

async function analyzeWhiteJpgTraceSourceUrl(traceSourceUrl: string): Promise<WhiteJpgTraceSelftestOutput> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = "async"
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = img.naturalWidth || img.width
        canvas.height = img.naturalHeight || img.height

        const ctx = canvas.getContext("2d", { willReadFrequently: true })
        if (!ctx) {
          reject(new Error("CTX_UNAVAILABLE"))
          return
        }

        ctx.drawImage(img, 0, 0)
        const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)

        let minX = width
        let minY = height
        let maxX = -1
        let maxY = -1
        let opaquePixelCount = 0
        let sumX = 0
        let sumY = 0

        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const alpha = data[(y * width + x) * 4 + 3]
            if (alpha >= 32) {
              opaquePixelCount += 1
              sumX += x
              sumY += y
              if (x < minX) minX = x
              if (y < minY) minY = y
              if (x > maxX) maxX = x
              if (y > maxY) maxY = y
            }
          }
        }

        if (opaquePixelCount === 0 || maxX < minX || maxY < minY) {
          reject(new Error("NO_OPAQUE_PIXELS"))
          return
        }

        resolve({
          traceSourceUrl,
          opaquePixelCount,
          bounds: {
            minX,
            minY,
            maxX,
            maxY,
            width: maxX - minX + 1,
            height: maxY - minY + 1,
          },
          centroidX: sumX / opaquePixelCount,
          centroidY: sumY / opaquePixelCount,
        })
      } catch (error) {
        reject(error)
      }
    }
    img.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"))
    img.src = traceSourceUrl
  })
}

async function runWhiteJpgTraceSourceSelftests(): Promise<WhiteJpgSelftestSummary> {
  const cases: WhiteJpgSelftestCase<WhiteJpgTraceSelftestInput, WhiteJpgTraceSelftestOutput>[] = [
    {
      name: "WHITE_JPG_CENTER_SQUARE_TRACE_SOURCE",
      input: "center-square",
      assert: (output) =>
        output.opaquePixelCount > 2000 &&
        output.bounds.minX >= 24 &&
        output.bounds.minX <= 60 &&
        output.bounds.maxX >= 96 &&
        output.bounds.maxX <= 136 &&
        output.bounds.minY >= 18 &&
        output.bounds.minY <= 44 &&
        output.bounds.maxY >= 72 &&
        output.bounds.maxY <= 102,
      describeFailure: (output) =>
        `BOUNDS=${output.bounds.minX},${output.bounds.minY},${output.bounds.maxX},${output.bounds.maxY}|OPAQUE=${output.opaquePixelCount}`,
    },
    {
      name: "WHITE_JPG_LARGEST_ISLAND_TRACE_SOURCE",
      input: "left-large-right-small",
      assert: (output) =>
        output.opaquePixelCount > 2500 &&
        output.bounds.minX >= 8 &&
        output.bounds.minX <= 30 &&
        output.bounds.maxX >= 70 &&
        output.bounds.maxX <= 108 &&
        output.bounds.width >= 55 &&
        output.bounds.width <= 95 &&
        output.centroidX <= 70,
      describeFailure: (output) =>
        `BOUNDS=${output.bounds.minX},${output.bounds.minY},${output.bounds.maxX},${output.bounds.maxY}|WIDTH=${output.bounds.width}|CENTROID_X=${output.centroidX.toFixed(2)}|OPAQUE=${output.opaquePixelCount}`,
    },
  ]

  const results: WhiteJpgSelftestResult[] = []

  for (const testCase of cases) {
    try {
      const sourceUrl = buildWhiteJpgSyntheticSourceUrl(testCase.input)
      const traceSourceUrl = await buildTransparentTraceSourceUrl(sourceUrl)
      const output = await analyzeWhiteJpgTraceSourceUrl(traceSourceUrl)
      const ok = testCase.assert(output)
      const reason = ok ? "PASS" : (testCase.describeFailure?.(output) ?? "ASSERT_FAILED")

      results.push({
        name: testCase.name,
        ok,
        reason,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      results.push({
        name: testCase.name,
        ok: false,
        reason: `THREW:${message}`,
      })
    }
  }

  const pass = results.filter((result) => result.ok).length
  return {
    total: results.length,
    pass,
    fail: results.length - pass,
    results,
  }
}

function bindWhiteJpgTraceSourceSelftests(): void {
  if (typeof window === "undefined") return

  const globalWindow = window as Window & typeof globalThis & {
    __CB_WHITE_JPG_TRACE_SELFTEST_BOUND__?: boolean
    __CB_WHITE_JPG_TRACE_SELFTEST__?: () => Promise<WhiteJpgSelftestSummary>
    __CB_WHITE_JPG_TRACE_SELFTEST_LAST__?: WhiteJpgSelftestSummary | null
  }

  globalWindow.__CB_WHITE_JPG_TRACE_SELFTEST_BOUND__ = true
  globalWindow.__CB_WHITE_JPG_TRACE_SELFTEST__ = async () => {
    const summary = await runWhiteJpgTraceSourceSelftests()
    globalWindow.__CB_WHITE_JPG_TRACE_SELFTEST_LAST__ = summary
    console.info("[CB_WHITE_JPG_TRACE_SELFTEST]", `${summary.pass}/${summary.total}`, summary)
    return summary
  }
}

bindWhiteJpgTraceSourceSelftests()
/* CB_WHITE_JPG_TRACE_SELFTEST_BINDING_END */
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

const buildAutoCutlineFromForegroundMask = async (
  url: string,
): Promise<{ path: string; points: Point[]; centroid: Point } | null> => {

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
        const drawWidth = Math.max(1, img.width * scale);
        const drawHeight = Math.max(1, img.height * scale);
        const drawX = (ANALYSIS_WIDTH - drawWidth) / 2;
        const drawY = (ANALYSIS_HEIGHT - drawHeight) / 2;

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        const imageData = ctx.getImageData(0, 0, ANALYSIS_WIDTH, ANALYSIS_HEIGHT);
        const data = imageData.data;

        let transparentPixelCount = 0;
        let visiblePixelCount = 0;

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha > 16) {
            visiblePixelCount += 1;
          } else {
            transparentPixelCount += 1;
          }
        }

        const hasMeaningfulTransparency =
          transparentPixelCount > 0 &&
          transparentPixelCount / Math.max(1, transparentPixelCount + visiblePixelCount) > 0.01;

        const borderSamples: Array<{ r: number; g: number; b: number; a: number }> = [];
        const sampleStep = 3;

        const pushBorderSample = (x: number, y: number) => {
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

        let sampleLeft = Math.max(0, Math.floor(drawX));
        let sampleTop = Math.max(0, Math.floor(drawY));
        let sampleRight = Math.min(ANALYSIS_WIDTH - 1, Math.ceil(drawX + drawWidth - 1));
        let sampleBottom = Math.min(ANALYSIS_HEIGHT - 1, Math.ceil(drawY + drawHeight - 1));

        const isWhiteMarginPixel = (x: number, y: number) => {
          const idx = (y * ANALYSIS_WIDTH + x) * 4;
          const a = data[idx + 3];
          if (a < 96) return true;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const brightness = (r + g + b) / 3;
          const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(b - r));
          return brightness >= 228 && maxDiff <= 24;
        };

        const whiteMarginRatioForColumn = (x: number) => {
          let bg = 0;
          let total = 0;
          for (let y = sampleTop; y <= sampleBottom; y += 2) {
            total += 1;
            if (isWhiteMarginPixel(x, y)) bg += 1;
          }
          return bg / Math.max(1, total);
        };

        const whiteMarginRatioForRow = (y: number) => {
          let bg = 0;
          let total = 0;
          for (let x = sampleLeft; x <= sampleRight; x += 2) {
            total += 1;
            if (isWhiteMarginPixel(x, y)) bg += 1;
          }
          return bg / Math.max(1, total);
        };

        if (drawWidth >= 32 && drawHeight >= 32) {
          while (sampleLeft < sampleRight - 12 && whiteMarginRatioForColumn(sampleLeft) >= 0.94) sampleLeft += 1;
          while (sampleRight > sampleLeft + 12 && whiteMarginRatioForColumn(sampleRight) >= 0.94) sampleRight -= 1;
          while (sampleTop < sampleBottom - 12 && whiteMarginRatioForRow(sampleTop) >= 0.94) sampleTop += 1;
          while (sampleBottom > sampleTop + 12 && whiteMarginRatioForRow(sampleBottom) >= 0.94) sampleBottom -= 1;
        }

        const subjectPixelRatioForColumn = (x: number) => {
          let fg = 0;
          let total = 0;
          for (let y = sampleTop; y <= sampleBottom; y += 2) {
            total += 1;
            if (!isWhiteMarginPixel(x, y)) fg += 1;
          }
          return fg / Math.max(1, total);
        };

        const subjectPixelRatioForRow = (y: number) => {
          let fg = 0;
          let total = 0;
          for (let x = sampleLeft; x <= sampleRight; x += 2) {
            total += 1;
            if (!isWhiteMarginPixel(x, y)) fg += 1;
          }
          return fg / Math.max(1, total);
        };

        if (drawWidth >= 32 && drawHeight >= 32) {
          while (sampleLeft < sampleRight - 12 && subjectPixelRatioForColumn(sampleLeft) <= 0.04) sampleLeft += 1;
          while (sampleRight > sampleLeft + 12 && subjectPixelRatioForColumn(sampleRight) <= 0.04) sampleRight -= 1;
          while (sampleTop < sampleBottom - 12 && subjectPixelRatioForRow(sampleTop) <= 0.04) sampleTop += 1;
          while (sampleBottom > sampleTop + 12 && subjectPixelRatioForRow(sampleBottom) <= 0.04) sampleBottom -= 1;
        }

        for (let x = sampleLeft; x <= sampleRight; x += sampleStep) {
          pushBorderSample(x, sampleTop);
          pushBorderSample(x, sampleBottom);
        }
        for (let y = sampleTop; y <= sampleBottom; y += sampleStep) {
          pushBorderSample(sampleLeft, y);
          pushBorderSample(sampleRight, y);
        }

        if (borderSamples.length < 8) {
          for (let x = 0; x < ANALYSIS_WIDTH; x += sampleStep) {
            pushBorderSample(x, 0);
            pushBorderSample(x, ANALYSIS_HEIGHT - 1);
          }
          for (let y = 0; y < ANALYSIS_HEIGHT; y += sampleStep) {
            pushBorderSample(0, y);
            pushBorderSample(ANALYSIS_WIDTH - 1, y);
          }
        }

        const borderSums = borderSamples.reduce(
          (acc, sample) => ({
            r: acc.r + sample.r,
            g: acc.g + sample.g,
            b: acc.b + sample.b,
          }),
          { r: 0, g: 0, b: 0 },
        );

        const borderCount = Math.max(1, borderSamples.length);
        const avgBorder = {
          r: borderSums.r / borderCount,
          g: borderSums.g / borderCount,
          b: borderSums.b / borderCount,
        };
        const avgBorderBrightness = (avgBorder.r + avgBorder.g + avgBorder.b) / 3;

        const colorDistanceFromBorder = (r: number, g: number, b: number) =>
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
            const brightness = (r + g + b) / 3;
            const chroma = Math.max(r, g, b) - Math.min(r, g, b);
            const dist = colorDistanceFromBorder(r, g, b);

            const transparentLike = a <= 24;
              const whiteLike = a >= 96 && brightness >= Math.max(196, avgBorderBrightness - 6) && chroma <= 48;
            const edgeColorLike =
              a >= 96 &&
              dist <= 48 &&
              Math.abs(brightness - avgBorderBrightness) <= 40 &&
              chroma <= 60;

            bgCandidate[y][x] = transparentLike || whiteLike || edgeColorLike;
          }
        }

        const edgeBackground: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
          Array.from({ length: ANALYSIS_WIDTH }, () => false),
        );

        const queue: Array<{ x: number; y: number }> = [];
        const pushBg = (x: number, y: number) => {
          if (x < 0 || y < 0 || x >= ANALYSIS_WIDTH || y >= ANALYSIS_HEIGHT) return;
          if (edgeBackground[y][x] || !bgCandidate[y][x]) return;
          edgeBackground[y][x] = true;
          queue.push({ x, y });
        };

        for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
          pushBg(x, 0);
          pushBg(x, ANALYSIS_HEIGHT - 1);
        }
        for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
          pushBg(0, y);
          pushBg(ANALYSIS_WIDTH - 1, y);
        }

          for (let x = sampleLeft; x <= sampleRight; x += 1) {
            pushBg(x, sampleTop);
            pushBg(x, sampleBottom);
          }
          for (let y = sampleTop; y <= sampleBottom; y += 1) {
            pushBg(sampleLeft, y);
            pushBg(sampleRight, y);
          }

        while (queue.length > 0) {
          const current = queue.shift();
          if (!current) break;
          pushBg(current.x - 1, current.y);
          pushBg(current.x + 1, current.y);
          pushBg(current.x, current.y - 1);
          pushBg(current.x, current.y + 1);
          pushBg(current.x - 1, current.y - 1);
          pushBg(current.x + 1, current.y - 1);
          pushBg(current.x - 1, current.y + 1);
          pushBg(current.x + 1, current.y + 1);
        }

        const seedMask: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
          Array.from({ length: ANALYSIS_WIDTH }, () => false),
        );

        for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
          for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
            const idx = (y * ANALYSIS_WIDTH + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            const brightness = (r + g + b) / 3;
            const chroma = Math.max(r, g, b) - Math.min(r, g, b);
            const dist = colorDistanceFromBorder(r, g, b);

            seedMask[y][x] = hasMeaningfulTransparency
              ? a > 16
              : !edgeBackground[y][x] &&
                a > 28 &&
                (isForeground(r, g, b, a) ||
                  dist >= 34 ||
                  brightness <= avgBorderBrightness - 18 ||
                  chroma >= 20);
          }
        }

        const neighborOffsets = [
          { x: -1, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: -1 },
          { x: 0, y: 1 },
          { x: -1, y: -1 },
          { x: 1, y: -1 },
          { x: -1, y: 1 },
          { x: 1, y: 1 },
        ] as const;

        const collectLargestComponent = (mask: boolean[][]) => {
          const visited: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
            Array.from({ length: ANALYSIS_WIDTH }, () => false),
          );

          let best: Point[] = [];

          for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
            for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
              if (!mask[y][x] || visited[y][x]) continue;

              const component: Point[] = [];
              const queue: Array<{ x: number; y: number }> = [{ x, y }];
              visited[y][x] = true;

              while (queue.length > 0) {
                const current = queue.shift();
                if (!current) break;

                component.push({ x: current.x, y: current.y });

                for (const next of neighborOffsets) {
                  const nextX = current.x + next.x;
                  const nextY = current.y + next.y;
                  if (
                    nextX < 0 ||
                    nextY < 0 ||
                    nextX >= ANALYSIS_WIDTH ||
                    nextY >= ANALYSIS_HEIGHT
                  ) {
                    continue;
                  }
                  if (visited[nextY][nextX] || !mask[nextY][nextX]) continue;
                  visited[nextY][nextX] = true;
                  queue.push({ x: nextX, y: nextY });
                }
              }

              if (component.length > best.length) {
                best = component;
              }
            }
          }

          return best;
        };

        const cornerPatch = Math.max(4, Math.floor(Math.min(ANALYSIS_WIDTH, ANALYSIS_HEIGHT) * 0.06));
        const cornerSamples: Array<{ r: number; g: number; b: number; a: number }> = [];

        const pushCornerSample = (x: number, y: number) => {
          if (x < 0 || y < 0 || x >= ANALYSIS_WIDTH || y >= ANALYSIS_HEIGHT) return;
          const idx = (y * ANALYSIS_WIDTH + x) * 4;
          const a = data[idx + 3];
          if (a < 24) return;
          cornerSamples.push({
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2],
            a,
          });
        };

        for (let dy = 0; dy < cornerPatch; dy += 1) {
          for (let dx = 0; dx < cornerPatch; dx += 1) {
            pushCornerSample(dx, dy);
            pushCornerSample(ANALYSIS_WIDTH - 1 - dx, dy);
            pushCornerSample(dx, ANALYSIS_HEIGHT - 1 - dy);
            pushCornerSample(ANALYSIS_WIDTH - 1 - dx, ANALYSIS_HEIGHT - 1 - dy);
          }
        }

        let cornerAvgR = 255;
        let cornerAvgG = 255;
        let cornerAvgB = 255;
        let cornerBrightness = 255;
        let cornerChroma = 0;

        if (cornerSamples.length > 0) {
          let sumR = 0;
          let sumG = 0;
          let sumB = 0;
          let sumChroma = 0;

          for (const sample of cornerSamples) {
            sumR += sample.r;
            sumG += sample.g;
            sumB += sample.b;
            sumChroma += Math.max(sample.r, sample.g, sample.b) - Math.min(sample.r, sample.g, sample.b);
          }

          cornerAvgR = sumR / cornerSamples.length;
          cornerAvgG = sumG / cornerSamples.length;
          cornerAvgB = sumB / cornerSamples.length;
          cornerBrightness = (cornerAvgR + cornerAvgG + cornerAvgB) / 3;
          cornerChroma = sumChroma / cornerSamples.length;
        }

        const whiteCornerMode =
          !hasMeaningfulTransparency &&
          cornerSamples.length >= 24 &&
          cornerBrightness >= 236 &&
          cornerChroma <= 18;

        const whiteCornerBackground: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
          Array.from({ length: ANALYSIS_WIDTH }, () => false),
        );

        const matchesWhiteCorner = (x: number, y: number) => {
          const idx = (y * ANALYSIS_WIDTH + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          if (a < 24) return false;

          const brightness = (r + g + b) / 3;
          const chroma = Math.max(r, g, b) - Math.min(r, g, b);
          const cornerDistance = Math.sqrt(
            (r - cornerAvgR) * (r - cornerAvgR) +
              (g - cornerAvgG) * (g - cornerAvgG) +
              (b - cornerAvgB) * (b - cornerAvgB),
          );

          return (
            brightness >= cornerBrightness - 16 &&
            chroma <= Math.max(22, cornerChroma + 10) &&
            cornerDistance <= 42
          );
        };

        if (whiteCornerMode) {
          const whiteQueue: Array<{ x: number; y: number }> = [];
          let whiteHead = 0;

          const enqueueWhite = (x: number, y: number) => {
            if (x < 0 || y < 0 || x >= ANALYSIS_WIDTH || y >= ANALYSIS_HEIGHT) return;
            if (whiteCornerBackground[y][x]) return;
            if (!matchesWhiteCorner(x, y)) return;
            whiteCornerBackground[y][x] = true;
            whiteQueue.push({ x, y });
          };

          for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
            enqueueWhite(x, 0);
            enqueueWhite(x, ANALYSIS_HEIGHT - 1);
          }
          for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
            enqueueWhite(0, y);
            enqueueWhite(ANALYSIS_WIDTH - 1, y);
          }

          while (whiteHead < whiteQueue.length) {
            const current = whiteQueue[whiteHead];
            whiteHead += 1;

            for (const next of neighborOffsets) {
              enqueueWhite(current.x + next.x, current.y + next.y);
            }
          }
        }

        const subjectBounds = {
          minX: 0,
          minY: 0,
          maxX: ANALYSIS_WIDTH - 1,
          maxY: ANALYSIS_HEIGHT - 1,
        };

        if (whiteCornerMode) {
          const candidateMask: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
            Array.from({ length: ANALYSIS_WIDTH }, () => false),
          );
          const candidateVisited: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
            Array.from({ length: ANALYSIS_WIDTH }, () => false),
          );
          const centerX = (ANALYSIS_WIDTH - 1) / 2;
          const centerY = (ANALYSIS_HEIGHT - 1) / 2;

          for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
            for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
              const idx = (y * ANALYSIS_WIDTH + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const a = data[idx + 3];
              if (whiteCornerBackground[y][x] || a < 28) continue;

              const brightness = (r + g + b) / 3;
              const chroma = Math.max(r, g, b) - Math.min(r, g, b);
              const cornerDistance = Math.sqrt(
                (r - cornerAvgR) * (r - cornerAvgR) +
                  (g - cornerAvgG) * (g - cornerAvgG) +
                  (b - cornerAvgB) * (b - cornerAvgB),
              );

              candidateMask[y][x] =
                cornerDistance >= 28 ||
                brightness <= cornerBrightness - 10 ||
                chroma >= Math.max(18, cornerChroma + 6) ||
                (x > ANALYSIS_WIDTH * 0.18 &&
                  x < ANALYSIS_WIDTH * 0.82 &&
                  y > ANALYSIS_HEIGHT * 0.1 &&
                  y < ANALYSIS_HEIGHT * 0.92 &&
                  brightness <= cornerBrightness - 4 &&
                  chroma >= Math.max(10, cornerChroma + 2));
            }
          }

          let bestScore = -Infinity;
          let bestMinX = 0;
          let bestMinY = 0;
          let bestMaxX = ANALYSIS_WIDTH - 1;
          let bestMaxY = ANALYSIS_HEIGHT - 1;

          for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
            for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
              if (!candidateMask[y][x] || candidateVisited[y][x]) continue;

              const queue: Array<{ x: number; y: number }> = [{ x, y }];
              let head = 0;
              candidateVisited[y][x] = true;

              let count = 0;
              let minX = x;
              let minY = y;
              let maxX = x;
              let maxY = y;
              let touchLeft = false;
              let touchRight = false;
              let touchTop = false;
              let touchBottom = false;

              while (head < queue.length) {
                const current = queue[head];
                head += 1;
                count += 1;

                if (current.x < minX) minX = current.x;
                if (current.y < minY) minY = current.y;
                if (current.x > maxX) maxX = current.x;
                if (current.y > maxY) maxY = current.y;

                if (current.x <= 0) touchLeft = true;
                if (current.x >= ANALYSIS_WIDTH - 1) touchRight = true;
                if (current.y <= 0) touchTop = true;
                if (current.y >= ANALYSIS_HEIGHT - 1) touchBottom = true;

                for (const next of neighborOffsets) {
                  const nextX = current.x + next.x;
                  const nextY = current.y + next.y;
                  if (
                    nextX < 0 ||
                    nextY < 0 ||
                    nextX >= ANALYSIS_WIDTH ||
                    nextY >= ANALYSIS_HEIGHT
                  ) {
                    continue;
                  }
                  if (candidateVisited[nextY][nextX] || !candidateMask[nextY][nextX]) continue;
                  candidateVisited[nextY][nextX] = true;
                  queue.push({ x: nextX, y: nextY });
                }
              }

              const boxW = maxX - minX + 1;
              const boxH = maxY - minY + 1;
              const fillRatio = count / Math.max(1, boxW * boxH);
              const compCenterX = (minX + maxX) / 2;
              const compCenterY = (minY + maxY) / 2;
              const centerPenalty =
                (Math.abs(compCenterX - centerX) / ANALYSIS_WIDTH) +
                (Math.abs(compCenterY - centerY) / ANALYSIS_HEIGHT);
              const edgeTouches =
                (touchLeft ? 1 : 0) +
                (touchRight ? 1 : 0) +
                (touchTop ? 1 : 0) +
                (touchBottom ? 1 : 0);

              let score = count;
              score += Math.max(0, 180 - centerPenalty * 320);
              if (edgeTouches >= 3) score -= 220;
              if (fillRatio > 0.9 && boxW > ANALYSIS_WIDTH * 0.55 && boxH > ANALYSIS_HEIGHT * 0.55) score -= 320;
              if (minY <= ANALYSIS_HEIGHT * 0.06 && boxW > ANALYSIS_WIDTH * 0.45) score -= 140;
              if (boxH <= ANALYSIS_HEIGHT * 0.08) score -= 120;

              if (score > bestScore) {
                bestScore = score;
                bestMinX = minX;
                bestMinY = minY;
                bestMaxX = maxX;
                bestMaxY = maxY;
              }
            }
          }

          if (bestScore > 0) {
            const padX = Math.max(4, Math.floor((bestMaxX - bestMinX + 1) * 0.12));
            const padY = Math.max(4, Math.floor((bestMaxY - bestMinY + 1) * 0.12));
            subjectBounds.minX = Math.max(0, bestMinX - padX);
            subjectBounds.minY = Math.max(0, bestMinY - padY);
            subjectBounds.maxX = Math.min(ANALYSIS_WIDTH - 1, bestMaxX + padX);
            subjectBounds.maxY = Math.min(ANALYSIS_HEIGHT - 1, bestMaxY + padY);
            const countInkForColumn = (targetX: number) => {
              let count = 0;
              for (let targetY = subjectBounds.minY; targetY <= subjectBounds.maxY; targetY += 1) {
                if (whiteCornerBackground[targetY][targetX]) continue;

                const idx = (targetY * ANALYSIS_WIDTH + targetX) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const brightness = (r + g + b) / 3;
                const chroma = Math.max(r, g, b) - Math.min(r, g, b);
                const cornerDistance = Math.sqrt(
                  (r - cornerAvgR) * (r - cornerAvgR) +
                    (g - cornerAvgG) * (g - cornerAvgG) +
                    (b - cornerAvgB) * (b - cornerAvgB),
                );

                const rightX = Math.min(ANALYSIS_WIDTH - 1, targetX + 1);
                const downY = Math.min(ANALYSIS_HEIGHT - 1, targetY + 1);
                const rightIdx = (targetY * ANALYSIS_WIDTH + rightX) * 4;
                const downIdx = (downY * ANALYSIS_WIDTH + targetX) * 4;
                const grad =
                  Math.abs(r - data[rightIdx]) +
                  Math.abs(g - data[rightIdx + 1]) +
                  Math.abs(b - data[rightIdx + 2]) +
                  Math.abs(r - data[downIdx]) +
                  Math.abs(g - data[downIdx + 1]) +
                  Math.abs(b - data[downIdx + 2]);

                const inkLike =
                  cornerDistance >= 30 ||
                  brightness <= cornerBrightness - 14 ||
                  chroma >= Math.max(16, cornerChroma + 6) ||
                  grad >= 42;

                if (inkLike) count += 1;
              }
              return count;
            };

            const countInkForRow = (targetY: number) => {
              let count = 0;
              for (let targetX = subjectBounds.minX; targetX <= subjectBounds.maxX; targetX += 1) {
                if (whiteCornerBackground[targetY][targetX]) continue;

                const idx = (targetY * ANALYSIS_WIDTH + targetX) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const brightness = (r + g + b) / 3;
                const chroma = Math.max(r, g, b) - Math.min(r, g, b);
                const cornerDistance = Math.sqrt(
                  (r - cornerAvgR) * (r - cornerAvgR) +
                    (g - cornerAvgG) * (g - cornerAvgG) +
                    (b - cornerAvgB) * (b - cornerAvgB),
                );

                const rightX = Math.min(ANALYSIS_WIDTH - 1, targetX + 1);
                const downY = Math.min(ANALYSIS_HEIGHT - 1, targetY + 1);
                const rightIdx = (targetY * ANALYSIS_WIDTH + rightX) * 4;
                const downIdx = (downY * ANALYSIS_WIDTH + targetX) * 4;
                const grad =
                  Math.abs(r - data[rightIdx]) +
                  Math.abs(g - data[rightIdx + 1]) +
                  Math.abs(b - data[rightIdx + 2]) +
                  Math.abs(r - data[downIdx]) +
                  Math.abs(g - data[downIdx + 1]) +
                  Math.abs(b - data[downIdx + 2]);

                const inkLike =
                  cornerDistance >= 30 ||
                  brightness <= cornerBrightness - 14 ||
                  chroma >= Math.max(16, cornerChroma + 6) ||
                  grad >= 42;

                if (inkLike) count += 1;
              }
              return count;
            };

            const originalBoxW = subjectBounds.maxX - subjectBounds.minX + 1;
            const originalBoxH = subjectBounds.maxY - subjectBounds.minY + 1;
            const columnThreshold = Math.max(3, Math.floor(originalBoxH * 0.08));
            const rowThreshold = Math.max(3, Math.floor(originalBoxW * 0.06));

            let trimMinX = subjectBounds.minX;
            let trimMaxX = subjectBounds.maxX;
            let trimMinY = subjectBounds.minY;
            let trimMaxY = subjectBounds.maxY;

            while (trimMinX < trimMaxX && countInkForColumn(trimMinX) < columnThreshold) {
              trimMinX += 1;
            }
            while (trimMaxX > trimMinX && countInkForColumn(trimMaxX) < columnThreshold) {
              trimMaxX -= 1;
            }
            while (trimMinY < trimMaxY && countInkForRow(trimMinY) < rowThreshold) {
              trimMinY += 1;
            }
            while (trimMaxY > trimMinY && countInkForRow(trimMaxY) < rowThreshold) {
              trimMaxY -= 1;
            }

            const trimmedW = trimMaxX - trimMinX + 1;
            const trimmedH = trimMaxY - trimMinY + 1;

            if (
              trimmedW >= Math.max(18, Math.floor(originalBoxW * 0.35)) &&
              trimmedH >= Math.max(18, Math.floor(originalBoxH * 0.35))
            ) {
              const trimPadX = Math.max(2, Math.floor(trimmedW * 0.04));
              const trimPadY = Math.max(2, Math.floor(trimmedH * 0.04));
              subjectBounds.minX = Math.max(0, trimMinX - trimPadX);
              subjectBounds.maxX = Math.min(ANALYSIS_WIDTH - 1, trimMaxX + trimPadX);
              subjectBounds.minY = Math.max(0, trimMinY - trimPadY);
              subjectBounds.maxY = Math.min(ANALYSIS_HEIGHT - 1, trimMaxY + trimPadY);
            }
          }
        }

        const centerAnchorMask: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
          Array.from({ length: ANALYSIS_WIDTH }, () => false),
        );
        let useCenterAnchor = false;

        if (whiteCornerMode) {
          const anchorScoreMap: number[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
            Array.from({ length: ANALYSIS_WIDTH }, () => 0),
          );
          const anchorCandidateMask: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
            Array.from({ length: ANALYSIS_WIDTH }, () => false),
          );
          const anchorVisited: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
            Array.from({ length: ANALYSIS_WIDTH }, () => false),
          );
          const midLeft = Math.floor(ANALYSIS_WIDTH * 0.18);
          const midRight = Math.ceil(ANALYSIS_WIDTH * 0.82);
          const midTop = Math.floor(ANALYSIS_HEIGHT * 0.08);
          const midBottom = Math.ceil(ANALYSIS_HEIGHT * 0.92);
          const centerX = (ANALYSIS_WIDTH - 1) / 2;
          const centerY = (ANALYSIS_HEIGHT - 1) / 2;
          let bestPixelScore = 0;

          for (let y = midTop; y <= midBottom; y += 1) {
            for (let x = midLeft; x <= midRight; x += 1) {
              if (whiteCornerBackground[y][x]) continue;
              if (x < subjectBounds.minX || x > subjectBounds.maxX || y < subjectBounds.minY || y > subjectBounds.maxY) continue;

              const idx = (y * ANALYSIS_WIDTH + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              const a = data[idx + 3];
              if (a < 24) continue;

              const brightness = (r + g + b) / 3;
              const chroma = Math.max(r, g, b) - Math.min(r, g, b);
              const cornerDistance = Math.sqrt(
                (r - cornerAvgR) * (r - cornerAvgR) +
                  (g - cornerAvgG) * (g - cornerAvgG) +
                  (b - cornerAvgB) * (b - cornerAvgB),
              );

              const rightX = Math.min(ANALYSIS_WIDTH - 1, x + 1);
              const downY = Math.min(ANALYSIS_HEIGHT - 1, y + 1);
              const rightIdx = (y * ANALYSIS_WIDTH + rightX) * 4;
              const downIdx = (downY * ANALYSIS_WIDTH + x) * 4;
              const grad =
                Math.abs(r - data[rightIdx]) +
                Math.abs(g - data[rightIdx + 1]) +
                Math.abs(b - data[rightIdx + 2]) +
                Math.abs(r - data[downIdx]) +
                Math.abs(g - data[downIdx + 1]) +
                Math.abs(b - data[downIdx + 2]);

              const centerBiasX = 1 - Math.min(1, Math.abs(x - centerX) / (ANALYSIS_WIDTH * 0.5));
              const centerBiasY = 1 - Math.min(1, Math.abs(y - centerY) / (ANALYSIS_HEIGHT * 0.5));
              const centerBias = Math.max(0, (centerBiasX + centerBiasY) / 2);

              let pixelScore = 0;
              pixelScore += Math.max(0, cornerDistance - 10) * 0.9;
              pixelScore += Math.max(0, cornerBrightness - brightness - 2) * 1.15;
              pixelScore += Math.max(0, chroma - Math.max(4, cornerChroma + 1)) * 1.2;
              pixelScore += Math.max(0, grad - 12) * 0.55;
              pixelScore += centerBias * 18;

              if (
                brightness >= cornerBrightness - 2 &&
                chroma <= Math.max(6, cornerChroma + 2) &&
                grad < 20
              ) {
                pixelScore *= 0.25;
              }

              anchorScoreMap[y][x] = pixelScore;
              if (pixelScore > bestPixelScore) bestPixelScore = pixelScore;
            }
          }

          const scoreThreshold = Math.max(14, bestPixelScore * 0.42);
          const strictCenterThreshold = Math.max(10, bestPixelScore * 0.28);

          for (let y = midTop; y <= midBottom; y += 1) {
            for (let x = midLeft; x <= midRight; x += 1) {
              const score = anchorScoreMap[y][x];
              const inStrictCenter =
                x >= ANALYSIS_WIDTH * 0.3 &&
                x <= ANALYSIS_WIDTH * 0.7 &&
                y >= ANALYSIS_HEIGHT * 0.16 &&
                y <= ANALYSIS_HEIGHT * 0.84;

              anchorCandidateMask[y][x] =
                score >= scoreThreshold ||
                (inStrictCenter && score >= strictCenterThreshold);
            }
          }

          let bestAnchor: Point[] = [];
          let bestAnchorScore = -Infinity;

          for (let y = midTop; y <= midBottom; y += 1) {
            for (let x = midLeft; x <= midRight; x += 1) {
              if (!anchorCandidateMask[y][x] || anchorVisited[y][x]) continue;

              const queue: Array<{ x: number; y: number }> = [{ x, y }];
              const component: Point[] = [];
              let head = 0;
              anchorVisited[y][x] = true;

              let minX = x;
              let minY = y;
              let maxX = x;
              let maxY = y;
              let compScore = 0;

              while (head < queue.length) {
                const current = queue[head];
                head += 1;
                component.push({ x: current.x, y: current.y });
                compScore += anchorScoreMap[current.y][current.x];

                if (current.x < minX) minX = current.x;
                if (current.y < minY) minY = current.y;
                if (current.x > maxX) maxX = current.x;
                if (current.y > maxY) maxY = current.y;

                for (const next of neighborOffsets) {
                  const nextX = current.x + next.x;
                  const nextY = current.y + next.y;
                  if (nextX < midLeft || nextX > midRight || nextY < midTop || nextY > midBottom) continue;
                  if (anchorVisited[nextY][nextX] || !anchorCandidateMask[nextY][nextX]) continue;
                  anchorVisited[nextY][nextX] = true;
                  queue.push({ x: nextX, y: nextY });
                }
              }

              const compCenterX = (minX + maxX) / 2;
              const compCenterY = (minY + maxY) / 2;
              const centerPenalty =
                Math.abs(compCenterX - centerX) / ANALYSIS_WIDTH +
                Math.abs(compCenterY - centerY) / ANALYSIS_HEIGHT;
              const boxW = maxX - minX + 1;
              const boxH = maxY - minY + 1;

              let score = compScore;
              score += Math.max(0, 140 - centerPenalty * 260);
              if (boxW >= ANALYSIS_WIDTH * 0.58 && boxH >= ANALYSIS_HEIGHT * 0.58) score -= 220;
              if (boxH <= ANALYSIS_HEIGHT * 0.08) score -= 140;

              if (score > bestAnchorScore) {
                bestAnchorScore = score;
                bestAnchor = component;
              }
            }
          }

          if (bestAnchor.length >= 16) {
            const anchorGrowVisited: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
              Array.from({ length: ANALYSIS_WIDTH }, () => false),
            );
            const anchorGrowQueue: Array<{ x: number; y: number }> = [];
            let anchorGrowHead = 0;
            const growThreshold = Math.max(6, bestPixelScore * 0.16);

            for (const point of bestAnchor) {
              if (anchorGrowVisited[point.y][point.x]) continue;
              anchorGrowVisited[point.y][point.x] = true;
              centerAnchorMask[point.y][point.x] = true;
              anchorGrowQueue.push({ x: point.x, y: point.y });
            }

            while (anchorGrowHead < anchorGrowQueue.length) {
              const current = anchorGrowQueue[anchorGrowHead];
              anchorGrowHead += 1;

              for (const next of neighborOffsets) {
                const nextX = current.x + next.x;
                const nextY = current.y + next.y;
                if (nextX < 0 || nextY < 0 || nextX >= ANALYSIS_WIDTH || nextY >= ANALYSIS_HEIGHT) continue;
                if (anchorGrowVisited[nextY][nextX]) continue;
                if (whiteCornerBackground[nextY][nextX]) continue;
                if (nextX < subjectBounds.minX || nextX > subjectBounds.maxX || nextY < subjectBounds.minY || nextY > subjectBounds.maxY) continue;
                if (anchorScoreMap[nextY][nextX] < growThreshold) continue;

                anchorGrowVisited[nextY][nextX] = true;
                centerAnchorMask[nextY][nextX] = true;
                anchorGrowQueue.push({ x: nextX, y: nextY });
              }
            }

            useCenterAnchor = true;
          }
        }

        const subjectSeedMask: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
          Array.from({ length: ANALYSIS_WIDTH }, () => false),
        );

        for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
          for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
            const insideSubjectBounds =
              x >= subjectBounds.minX &&
              x <= subjectBounds.maxX &&
              y >= subjectBounds.minY &&
              y <= subjectBounds.maxY;
            const anchorAllowed = !whiteCornerMode || !useCenterAnchor || centerAnchorMask[y][x];
            subjectSeedMask[y][x] =
              seedMask[y][x] &&
              !(whiteCornerMode && whiteCornerBackground[y][x]) &&
              (!whiteCornerMode || insideSubjectBounds) &&
              anchorAllowed;
          }
        }

        const coreMask: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
          Array.from({ length: ANALYSIS_WIDTH }, () => false),
        );

        for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
          for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
            const idx = (y * ANALYSIS_WIDTH + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            const brightness = (r + g + b) / 3;
            const chroma = Math.max(r, g, b) - Math.min(r, g, b);
            const dist = colorDistanceFromBorder(r, g, b);

            coreMask[y][x] = hasMeaningfulTransparency
              ? a > 40
              : subjectSeedMask[y][x] &&
                !edgeBackground[y][x] &&
                a > 42 &&
                (dist >= 40 ||
                  brightness <= avgBorderBrightness - 14 ||
                  chroma >= 22 ||
                  brightness <= cornerBrightness - 20);
          }
        }

        const corePixels = collectLargestComponent(coreMask);
        let bestPixels: Point[] = [];

        if (corePixels.length >= 18) {
          const grownVisited: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
            Array.from({ length: ANALYSIS_WIDTH }, () => false),
          );
          const growQueue: Array<{ x: number; y: number }> = [];
          let growHead = 0;

          for (const point of corePixels) {
            if (grownVisited[point.y][point.x] || !subjectSeedMask[point.y][point.x]) continue;
            grownVisited[point.y][point.x] = true;
            growQueue.push({ x: point.x, y: point.y });
            bestPixels.push({ x: point.x, y: point.y });
          }

          while (growHead < growQueue.length) {
            const current = growQueue[growHead];
            growHead += 1;

            for (const next of neighborOffsets) {
              const nextX = current.x + next.x;
              const nextY = current.y + next.y;
              if (
                nextX < 0 ||
                nextY < 0 ||
                nextX >= ANALYSIS_WIDTH ||
                nextY >= ANALYSIS_HEIGHT
              ) {
                continue;
              }
              if (grownVisited[nextY][nextX] || !subjectSeedMask[nextY][nextX]) continue;
              grownVisited[nextY][nextX] = true;
              growQueue.push({ x: nextX, y: nextY });
              bestPixels.push({ x: nextX, y: nextY });
            }
          }
        }

        if (bestPixels.length < 48) {
          bestPixels = collectLargestComponent(subjectSeedMask);
        }

        if (bestPixels.length < 48) {
          resolve(null);
          return;
        }

        const mainMask: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
          Array.from({ length: ANALYSIS_WIDTH }, () => false),
        );
        for (const point of bestPixels) {
          mainMask[point.y][point.x] = true;
        }

        for (let pass = 0; pass < 2; pass += 1) {
          const nextMask = mainMask.map((row) => row.slice());
          for (let y = 1; y < ANALYSIS_HEIGHT - 1; y += 1) {
            for (let x = 1; x < ANALYSIS_WIDTH - 1; x += 1) {
              if (!mainMask[y][x]) continue;

              let neighborCount = 0;
              for (const next of [
                [x - 1, y],
                [x + 1, y],
                [x, y - 1],
                [x, y + 1],
                [x - 1, y - 1],
                [x + 1, y - 1],
                [x - 1, y + 1],
                [x + 1, y + 1],
              ]) {
                if (mainMask[next[1]][next[0]]) neighborCount += 1;
              }

              if (neighborCount <= 1) {
                nextMask[y][x] = false;
              }
            }
          }

          for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
            for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
              mainMask[y][x] = nextMask[y][x];
            }
          }
        }

        const cloneMask = (source: boolean[][]) => source.map((row) => row.slice());

        const countNeighbors = (source: boolean[][], x: number, y: number) => {
          let total = 0;
          for (let yy = Math.max(0, y - 1); yy <= Math.min(ANALYSIS_HEIGHT - 1, y + 1); yy += 1) {
            for (let xx = Math.max(0, x - 1); xx <= Math.min(ANALYSIS_WIDTH - 1, x + 1); xx += 1) {
              if (xx === x && yy === y) continue;
              if (source[yy][xx]) total += 1;
            }
          }
          return total;
        };

        for (let pass = 0; pass < 2; pass += 1) {
          const nextMask = cloneMask(mainMask);
          for (let y = 1; y < ANALYSIS_HEIGHT - 1; y += 1) {
            for (let x = 1; x < ANALYSIS_WIDTH - 1; x += 1) {
              if (mainMask[y][x] && countNeighbors(mainMask, x, y) <= 2) {
                nextMask[y][x] = false;
              }
            }
          }
          for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
            for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
              mainMask[y][x] = nextMask[y][x];
            }
          }
        }

        for (let pass = 0; pass < 2; pass += 1) {
          const nextMask = cloneMask(mainMask);
          for (let y = 1; y < ANALYSIS_HEIGHT - 1; y += 1) {
            for (let x = 1; x < ANALYSIS_WIDTH - 1; x += 1) {
              if (!mainMask[y][x] && countNeighbors(mainMask, x, y) >= 6) {
                nextMask[y][x] = true;
              }
            }
          }
          for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
            for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
              mainMask[y][x] = nextMask[y][x];
            }
          }
        }

        let sumX = 0;
        let sumY = 0;
        let count = 0;
        const boundaryPoints: Point[] = [];

        for (let y = 1; y < ANALYSIS_HEIGHT - 1; y += 1) {
          for (let x = 1; x < ANALYSIS_WIDTH - 1; x += 1) {
            if (!mainMask[y][x]) continue;

            sumX += x;
            sumY += y;
            count += 1;

            const isBoundary =
              !mainMask[y][x - 1] ||
              !mainMask[y][x + 1] ||
              !mainMask[y - 1][x] ||
              !mainMask[y + 1][x];

            if (isBoundary) {
              boundaryPoints.push({ x, y });
            }
          }
        }

        if (count < 48 || boundaryPoints.length < 24) {
          resolve(null);
          return;
        }

        const centroid = { x: sumX / count, y: sumY / count };
        const keyOf = (x: number, y: number) => `${x},${y}`;
        const pointFromKey = (key: string): Point => {
          const [sx, sy] = key.split(",");
          return { x: Number(sx), y: Number(sy) };
        };
        const isFilled = (x: number, y: number) =>
          x >= 0 &&
          y >= 0 &&
          x < ANALYSIS_WIDTH &&
          y < ANALYSIS_HEIGHT &&
          mainMask[y][x];

        const segments: Array<[Point, Point]> = [];

        for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
          for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
            if (!mainMask[y][x]) continue;

            if (!isFilled(x - 1, y)) segments.push([{ x, y }, { x, y: y + 1 }]);
            if (!isFilled(x, y - 1)) segments.push([{ x, y }, { x: x + 1, y }]);
            if (!isFilled(x + 1, y)) segments.push([{ x: x + 1, y }, { x: x + 1, y: y + 1 }]);
            if (!isFilled(x, y + 1)) segments.push([{ x, y: y + 1 }, { x: x + 1, y: y + 1 }]);
          }
        }

        if (segments.length < 24) {
          resolve(null);
          return;
        }

        const adjacency = new Map<string, Array<{ edgeIndex: number; nextKey: string }>>();
        const addAdjacency = (from: Point, to: Point, edgeIndex: number) => {
          const fromKey = keyOf(from.x, from.y);
          const toKey = keyOf(to.x, to.y);
          const list = adjacency.get(fromKey) ?? [];
          list.push({ edgeIndex, nextKey: toKey });
          adjacency.set(fromKey, list);
        };

        segments.forEach(([start, end], edgeIndex) => {
          addAdjacency(start, end, edgeIndex);
          addAdjacency(end, start, edgeIndex);
        });

        const visitedEdges = new Set<number>();
        const loops: Point[][] = [];

        segments.forEach(([start, end], edgeIndex) => {
          if (visitedEdges.has(edgeIndex)) return;

          const startKey = keyOf(start.x, start.y);
          let currentKey = keyOf(end.x, end.y);
          const loopKeys = [startKey, currentKey];
          visitedEdges.add(edgeIndex);

          let guard = 0;
          while (currentKey !== startKey && guard < segments.length + 8) {
            guard += 1;
            const nextAdj = (adjacency.get(currentKey) ?? []).find(
              (candidate) => !visitedEdges.has(candidate.edgeIndex),
            );

            if (!nextAdj) break;

            visitedEdges.add(nextAdj.edgeIndex);
            currentKey = nextAdj.nextKey;
            loopKeys.push(currentKey);
          }

          if (currentKey === startKey && loopKeys.length >= 5) {
            const deduped = loopKeys.slice(0, -1).map(pointFromKey);
            if (deduped.length >= 4) {
              loops.push(deduped);
            }
          }
        });

        const polygonArea = (points: Point[]) => {
          let area = 0;
          for (let i = 0; i < points.length; i += 1) {
            const a = points[i];
            const b = points[(i + 1) % points.length];
            area += a.x * b.y - b.x * a.y;
          }
          return area / 2;
        };

        const outerLoop = loops.sort(
          (a, b) => Math.abs(polygonArea(b)) - Math.abs(polygonArea(a)),
        )[0];

        if (!outerLoop || outerLoop.length < 24) {
          resolve(null);
          return;
        }

        const smoothClosedPoints = (points: Point[], radius = 2) => {
          if (points.length < radius * 2 + 3) {
            return points.map((point) => ({ x: point.x, y: point.y }));
          }

          return points.map((_, index) => {
            let sumX = 0;
            let sumY = 0;
            let samples = 0;

            for (let offset = -radius; offset <= radius; offset += 1) {
              const point = points[(index + offset + points.length) % points.length];
              sumX += point.x;
              sumY += point.y;
              samples += 1;
            }

            return { x: sumX / samples, y: sumY / samples };
          });
        };

        const lightlySmoothedLoop = smoothClosedPoints(outerLoop, 1);
const outerLoopBounds = cbGetClosedBounds(lightlySmoothedLoop);
const minNoiseEdge = clamp(
  Math.min(outerLoopBounds.width, outerLoopBounds.height) * 0.012,
  1.6,
  4.6,
);
const minNoiseTriangleArea = clamp(
  (outerLoopBounds.width * outerLoopBounds.height) * 0.00022,
  1.2,
  8.4,
);
const noiseReducedLoop = cbPruneTinyBoundaryNoise(
  lightlySmoothedLoop,
  minNoiseEdge,
  minNoiseTriangleArea,
  3,
);
const simplifiedPoints = cbSimplifyClosedPoints(
  noiseReducedLoop,
  Math.max(1.15, minNoiseEdge * 0.55),
);
const resampledPoints = cbResampleClosedPoints(simplifiedPoints, 112);
const postResampleNoiseReduced = cbPruneTinyBoundaryNoise(
  resampledPoints,
  Math.max(1.4, minNoiseEdge * 0.82),
  Math.max(1, minNoiseTriangleArea * 0.82),
  2,
);
const curveSmoothedPoints = cbAngleAwareContourSmoothing(
  postResampleNoiseReduced,
  clamp(minNoiseEdge * 0.06, 0.12, 0.22),
  2,
  clamp(38 + minNoiseEdge * 3.2, 38, 54),
);
const peninsulaReducedPoints = cbCollapseNarrowPeninsulas(
  curveSmoothedPoints,
  clamp(Math.min(outerLoopBounds.width, outerLoopBounds.height) * 0.0175, 2.2, 6.4),
  clamp((outerLoopBounds.width * outerLoopBounds.height) * 0.00034, 1.8, 12.6),
  2,
);
const segmentStablePoints = cbStabilizeShortSegments(
  peninsulaReducedPoints,
  clamp(minNoiseEdge * 0.92, 1.6, 3.4),
  clamp(minNoiseEdge * 1.75, 2.8, 6.2),
  2,
);
const minWidthCulledPoints = cbCullThinNecks(
  segmentStablePoints,
  clamp(Math.min(outerLoopBounds.width, outerLoopBounds.height) * 0.016, 2.2, 5.6),
  clamp((outerLoopBounds.width * outerLoopBounds.height) * 0.00028, 1.6, 10.4),
  2,
);
const outwardOffsetPoints = cbOffsetClosedContour(
  minWidthCulledPoints,
  clamp(Math.min(outerLoopBounds.width, outerLoopBounds.height) * 0.0065, 1.6, 2.5),
);
const finalPoints = cbSimplifyClosedPoints(
  smoothClosedPoints(outwardOffsetPoints, 1),
  Math.max(1.18, minNoiseEdge * 0.56),
);if (finalPoints.length < 24) {
          resolve(null);
          return;
        }

        resolve({
          path: cbBuildClosedLinePath(finalPoints),
          points: finalPoints,
          centroid,
        });
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = url;
  });
};

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

    buildTransparentTraceSourceUrl(uploadState.previewUrl)
      .then(async (traceSourceUrl: string) => {
        const originalSource = uploadState.previewUrl!;
        const primarySource = traceSourceUrl || originalSource;
        const primaryResult = await buildAutoCutlineFromForegroundMask(primarySource);

        if (primaryResult) {
          return primaryResult;
        }

        if (primarySource !== originalSource) {
          const retryOriginalResult = await buildAutoCutlineFromForegroundMask(originalSource);
          if (retryOriginalResult) {
            return retryOriginalResult;
          }
        }

        return buildAutoCutlineFromImage(originalSource);
      })
      .then((result) => {
      if (cancelled) return;

      if (result) {
        
const rawBounds = cbGetClosedBounds(result.points);
        const rawCentroid = result.centroid ?? {
          x: rawBounds.left + rawBounds.width / 2,
          y: rawBounds.top + rawBounds.height / 2,
        };

        setAutoCutline({
          status: "ready",
          path: result.path,
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

  const uploadStateFileName =
    ((uploadState as { fileName?: string; name?: string } | null)?.fileName ??
      (uploadState as { fileName?: string; name?: string } | null)?.name ??
      "");
  const uploadStateMimeType =
    ((uploadState as { mimeType?: string; typeLabel?: string } | null)?.mimeType ??
      (uploadState as { mimeType?: string; typeLabel?: string } | null)?.typeLabel ??
      "");
  const isJpegUploadForAutoCutline =
    /^image\/jpe?g$/i.test(uploadStateMimeType) ||
    /\.jpe?g$/i.test(uploadStateFileName);const effectiveHoleShapeMode = shapeMode;
  const projectHoleForCurrentUpload = (pointer: HolePosition) => projectHole(pointer, holeSize, shapeMode, autoCutline);

  useEffect(() => {
    setHole((prev) => projectHoleForCurrentUpload(prev));
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
    setHole(projectHoleForCurrentUpload({ x, y }));
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
        ? "업로드 상태: 정책 판정 기준 반영됨"
        : "PDF / AI / PSD는 업로드 기록만 유지하고 실시간 미리보기는 생략"
    );
  };

/* CB_WHITE_JPG_AUTO_CUTLINE_SELFTEST_BINDING_START */
if (typeof window !== "undefined") {
  const globalWindow = window as Window & typeof globalThis & {
    __CB_WHITE_JPG_AUTO_CUTLINE_SELFTEST_BOUND__?: boolean
    __CB_WHITE_JPG_AUTO_CUTLINE_SELFTEST__?: () => Promise<WhiteJpgSelftestSummary>
    __CB_WHITE_JPG_AUTO_CUTLINE_SELFTEST_LAST__?: WhiteJpgSelftestSummary | null
  }

  globalWindow.__CB_WHITE_JPG_AUTO_CUTLINE_SELFTEST_BOUND__ = true
  globalWindow.__CB_WHITE_JPG_AUTO_CUTLINE_SELFTEST__ = async () => {
    const cases: WhiteJpgSelftestCase<WhiteJpgTraceSelftestInput, { path: string; points: Point[]; centroid: Point } | null>[] = [
      {
        name: "WHITE_JPG_CENTER_SQUARE_AUTO_CUTLINE",
        input: "center-square",
        assert: (output) => {
          if (!output || output.points.length < 8) return false
          const xs = output.points.map((point) => point.x)
          const ys = output.points.map((point) => point.y)
          const minX = Math.min(...xs)
          const maxX = Math.max(...xs)
          const minY = Math.min(...ys)
          const maxY = Math.max(...ys)
          const width = maxX - minX
          const height = maxY - minY
          const centerX = (minX + maxX) / 2
          const centerY = (minY + maxY) / 2

          return (
            width >= 60 &&
            width <= 150 &&
            height >= 45 &&
            height <= 130 &&
            Math.abs(output.centroid.x - centerX) <= Math.max(6, width * 0.14) &&
            Math.abs(output.centroid.y - centerY) <= Math.max(6, height * 0.14)
          )
        },
        describeFailure: (output) => {
          if (!output) return "NULL_RESULT"
          const xs = output.points.map((point) => point.x)
          const ys = output.points.map((point) => point.y)
          const minX = Math.min(...xs)
          const maxX = Math.max(...xs)
          const minY = Math.min(...ys)
          const maxY = Math.max(...ys)
          const width = maxX - minX
          const height = maxY - minY
          const centerX = (minX + maxX) / 2
          const centerY = (minY + maxY) / 2

          return (
            "POINTS=" +
            output.points.length +
            "|CENTROID=" +
            output.centroid.x.toFixed(2) +
            "," +
            output.centroid.y.toFixed(2) +
            "|BOX_CENTER=" +
            centerX.toFixed(2) +
            "," +
            centerY.toFixed(2) +
            "|WIDTH=" +
            width.toFixed(2) +
            "|HEIGHT=" +
            height.toFixed(2) +
            "|PATHLEN=" +
            output.path.length
          )
        },
      },
      {
        name: "WHITE_JPG_LARGEST_ISLAND_AUTO_CUTLINE",
        input: "left-large-right-small",
        assert: (output) =>
          !!output &&
          output.points.length >= 8 &&
          output.centroid.x <= 72,
        describeFailure: (output) =>
          output
            ? "POINTS=" +
              output.points.length +
              "|CENTROID=" +
              output.centroid.x.toFixed(2) +
              "," +
              output.centroid.y.toFixed(2) +
              "|PATHLEN=" +
              output.path.length
            : "NULL_RESULT",
      },
    ]

    const results: WhiteJpgSelftestResult[] = []

    for (const testCase of cases) {
      try {
        const sourceUrl = buildWhiteJpgSyntheticSourceUrl(testCase.input)
        const traceSourceUrl = await buildTransparentTraceSourceUrl(sourceUrl)
        const output = await buildAutoCutlineFromForegroundMask(traceSourceUrl)
        const ok = testCase.assert(output)
        const reason = ok ? "PASS" : (testCase.describeFailure?.(output) ?? "ASSERT_FAILED")

        results.push({
          name: testCase.name,
          ok,
          reason,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        results.push({
          name: testCase.name,
          ok: false,
          reason: `THREW:${message}`,
        })
      }
    }

    const pass = results.filter((result) => result.ok).length
    const summary: WhiteJpgSelftestSummary = {
      total: results.length,
      pass,
      fail: results.length - pass,
      results,
    }

    globalWindow.__CB_WHITE_JPG_AUTO_CUTLINE_SELFTEST_LAST__ = summary
    console.info("[CB_WHITE_JPG_AUTO_CUTLINE_SELFTEST]", `${summary.pass}/${summary.total}`, summary)
    return summary
  }
}
/* CB_WHITE_JPG_AUTO_CUTLINE_SELFTEST_BINDING_END */
  return (
    <main className="min-h-screen bg-[#041129] text-white">
      <div className="mx-auto w-full max-w-[1820px] px-4 py-5">

        <section className="rounded-2xl border border-slate-800 bg-[#09142b] px-5 py-4">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="min-w-0">
      <p className="text-[11px] font-semibold tracking-[0.24em] text-cyan-300">KEYRING / WORKBENCH</p>
      <h1 className="mt-1 text-[22px] font-semibold text-white">키링 작업대</h1>
      <p className="mt-1 text-sm text-slate-300">업로드한 이미지로 칼선 · 구멍 · 배율을 바로 조정하는 작업 화면</p>
    </div>
    <div className="rounded-full border border-slate-700 bg-[#0b1730] px-3 py-1 text-xs text-slate-300">
      기본 포장 포함 · 수량/규격 자동 반영
    </div>
  </div>
</section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(820px,1fr)_300px]">
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
              <div>PNG/JPG 1차 생성, JPG는 자동칼선 검수 권장</div>
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
                  width: "min(92vw, 760px)",
                  height: "min(calc(92vw * 8 / 7), 868px)",
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
                style={{ width: "min(92vw, 760px)", height: "min(calc(92vw * 8 / 7), 868px)" }}
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

              <div className="mx-auto aspect-[7/8] w-full max-w-[760px] overflow-hidden">
                <KeyringCanvas
                  hole={hole}
                  shapeMode={shapeMode}
                  holeSize={holeSize}
                  imageUrl={uploadState?.previewUrl ?? null}
              previewUrl={uploadState?.previewUrl ?? null}
                  autoCutline={effectiveAutoCutline}
                preferOriginalPreview={isJpegUploadForAutoCutline}
                artScale={artScale}
          autoCutlinePreviewEnabled={true}
          autoCutlinePreviewMinGap={isJpegUploadForAutoCutline ? 11.5 : 2.4}
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
                      자동칼선 상태: {autoCutline.status === "ready" ? (isJpegUploadForAutoCutline ? "JPG 1차 생성" : "1차 생성") : autoCutline.status === "processing" ? "계산중" : autoCutline.status === "failed" ? "생성 실패" : "대기"}
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
              <div>PNG/JPG 1차 생성, JPG는 자동칼선 검수 권장</div>
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
                {autoCutlineLocked ? (isJpegUploadForAutoCutline ? "JPG 자동칼선 계산 후 주문" : "자동칼선 생성 후 주문") : "주문으로"}
              </button>
            </div>
          </aside>
        </section>
      </div>
    
      </main>
  );
}

async function retainLargestOpaqueIslandFromDataUrl(inputUrl: string): Promise<string> {
  if (!inputUrl) return inputUrl;

  type AutoCutlineCleanupDecision =
    | "AUTO_PASS"
    | "AUTO_TRIM"
    | "REVIEW_REQUIRED"
    | "REJECT";

  type AutoCutlineCleanupPolicy = {
    borderDistanceThreshold: number;
    lightBackgroundLumaFloor: number;
    lightBackgroundChromaMax: number;
    minKeepCoverageRatio: number;
    maxKeepCoverageRatio: number;
    maxBorderTouchRatio: number;
    maxBottomMatteSpanRatio: number;
    matteBandStartRatio: number;
  };

  type AutoCutlineCleanupMetrics = {
    totalArea: number;
    keepArea: number;
    coverageRatio: number;
    bboxWidth: number;
    bboxHeight: number;
    borderTouchRatio: number;
    removedBackgroundRatio: number;
    bottomMatteSpanRatio: number;
    mattePixelRatio: number;
  };

  const computeAutoCutlineCleanupPolicy = (input: {
    width: number;
    height: number;
    borderMeanLuma: number;
    borderStdLuma: number;
    borderMeanChroma: number;
  }): AutoCutlineCleanupPolicy => {
    const borderDistanceThreshold = Math.min(
      72,
      Math.max(26, 34 + input.borderStdLuma * 2.1)
    );

    const lightBackgroundLumaFloor = Math.max(
      168,
      Math.min(245, input.borderMeanLuma - Math.max(10, input.borderStdLuma * 0.8))
    );

    const lightBackgroundChromaMax = Math.max(
      22,
      Math.min(56, input.borderMeanChroma + 16)
    );

    return {
      borderDistanceThreshold,
      lightBackgroundLumaFloor,
      lightBackgroundChromaMax,
      minKeepCoverageRatio: 0.025,
      maxKeepCoverageRatio: 0.88,
      maxBorderTouchRatio: 0.06,
      maxBottomMatteSpanRatio: 0.16,
      matteBandStartRatio: 0.58,
    };
  };

  const decideAutoCutlineCleanup = (
    metrics: AutoCutlineCleanupMetrics,
    policy: AutoCutlineCleanupPolicy
  ): AutoCutlineCleanupDecision => {
    if (metrics.coverageRatio < policy.minKeepCoverageRatio) {
      return "REJECT";
    }

    if (metrics.coverageRatio > policy.maxKeepCoverageRatio) {
      return "REVIEW_REQUIRED";
    }

    if (metrics.borderTouchRatio > policy.maxBorderTouchRatio) {
      return "REVIEW_REQUIRED";
    }

    if (metrics.bottomMatteSpanRatio > policy.maxBottomMatteSpanRatio) {
      return "REVIEW_REQUIRED";
    }

    if (metrics.mattePixelRatio > 0.002) {
      return "AUTO_TRIM";
    }

    return "AUTO_PASS";
  };

  return await new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const width = Math.max(1, img.naturalWidth || img.width || 0);
        const height = Math.max(1, img.naturalHeight || img.height || 0);
        const total = width * height;
        if (total <= 0) {
          resolve(inputUrl);
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(inputUrl);
          return;
        }

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const alphaThreshold = 16;

        const alphaAt = (index: number) => data[index * 4 + 3];
        const luminanceAt = (index: number) =>
          data[index * 4] * 0.2126 +
          data[index * 4 + 1] * 0.7152 +
          data[index * 4 + 2] * 0.0722;

        const chromaAt = (index: number) => {
          const r = data[index * 4];
          const g = data[index * 4 + 1];
          const b = data[index * 4 + 2];
          return Math.max(r, g, b) - Math.min(r, g, b);
        };

        const colorDistanceTo = (index: number, mr: number, mg: number, mb: number) => {
          const dr = data[index * 4] - mr;
          const dg = data[index * 4 + 1] - mg;
          const db = data[index * 4 + 2] - mb;
          return Math.sqrt(dr * dr + dg * dg + db * db);
        };

        const isOpaque = (index: number) => alphaAt(index) > alphaThreshold;

        const forEachNeighbor = (
          index: number,
          visit: (next: number, nx: number, ny: number) => void
        ) => {
          const x = index % width;
          const y = (index / width) | 0;

          for (let dy = -1; dy <= 1; dy += 1) {
            for (let dx = -1; dx <= 1; dx += 1) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              const ny = y + dy;
              if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
              visit(ny * width + nx, nx, ny);
            }
          }
        };

        const borderIndexes: number[] = [];
        for (let x = 0; x < width; x += 1) {
          borderIndexes.push(x);
          if (height > 1) borderIndexes.push((height - 1) * width + x);
        }
        for (let y = 1; y + 1 < height; y += 1) {
          borderIndexes.push(y * width);
          if (width > 1) borderIndexes.push(y * width + (width - 1));
        }

        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let sumL = 0;
        let sumL2 = 0;
        let sumC = 0;
        let borderCount = 0;

        for (const index of borderIndexes) {
          if (!isOpaque(index)) continue;
          const r = data[index * 4];
          const g = data[index * 4 + 1];
          const b = data[index * 4 + 2];
          const l = luminanceAt(index);
          const c = chromaAt(index);
          sumR += r;
          sumG += g;
          sumB += b;
          sumL += l;
          sumL2 += l * l;
          sumC += c;
          borderCount += 1;
        }

        const meanR = borderCount > 0 ? sumR / borderCount : 255;
        const meanG = borderCount > 0 ? sumG / borderCount : 255;
        const meanB = borderCount > 0 ? sumB / borderCount : 255;
        const borderMeanLuma = borderCount > 0 ? sumL / borderCount : 255;
        const borderMeanChroma = borderCount > 0 ? sumC / borderCount : 0;
        const borderStdLuma = borderCount > 1
          ? Math.sqrt(Math.max(0, sumL2 / borderCount - borderMeanLuma * borderMeanLuma))
          : 0;

        const cleanupPolicy = computeAutoCutlineCleanupPolicy({
          width,
          height,
          borderMeanLuma,
          borderStdLuma,
          borderMeanChroma,
        });

        const isBackgroundCandidate = (index: number) => {
          if (!isOpaque(index)) return true;

          const luma = luminanceAt(index);
          const chroma = chromaAt(index);
          const distance = colorDistanceTo(index, meanR, meanG, meanB);

          const closeToBorderColor = distance <= cleanupPolicy.borderDistanceThreshold;
          const closeToLightBorder =
            borderMeanLuma >= 170 &&
            luma >= cleanupPolicy.lightBackgroundLumaFloor &&
            chroma <= cleanupPolicy.lightBackgroundChromaMax;

          return closeToBorderColor || closeToLightBorder;
        };

        const background = new Uint8Array(total);
        const backgroundQueue: number[] = [];
        let bgHead = 0;
        let backgroundCount = 0;

        const seedBackground = (index: number) => {
          if (background[index]) return;
          if (!isBackgroundCandidate(index)) return;
          background[index] = 1;
          backgroundQueue.push(index);
          backgroundCount += 1;
        };

        for (const index of borderIndexes) {
          seedBackground(index);
        }

        while (bgHead < backgroundQueue.length) {
          const current = backgroundQueue[bgHead++];

          forEachNeighbor(current, (next) => {
            if (background[next]) return;
            if (!isBackgroundCandidate(next)) return;
            background[next] = 1;
            backgroundQueue.push(next);
            backgroundCount += 1;
          });
        }

        const visited = new Uint8Array(total);
        const keep = new Uint8Array(total);
        let bestStart = -1;
        let bestArea = 0;

        for (let start = 0; start < total; start += 1) {
          if (visited[start]) continue;
          visited[start] = 1;
          if (!isOpaque(start) || background[start]) continue;

          const queue: number[] = [start];
          let head = 0;
          let area = 0;

          while (head < queue.length) {
            const current = queue[head++];
            area += 1;

            forEachNeighbor(current, (next) => {
              if (visited[next]) return;
              visited[next] = 1;
              if (!isOpaque(next) || background[next]) return;
              queue.push(next);
            });
          }

          if (area > bestArea) {
            bestArea = area;
            bestStart = start;
          }
        }

        if (bestStart < 0 || bestArea <= 0) {
          resolve("");
          return;
        }

        let keepMinX = width;
        let keepMinY = height;
        let keepMaxX = -1;
        let keepMaxY = -1;

        {
          const queue: number[] = [bestStart];
          keep[bestStart] = 1;
          let head = 0;

          while (head < queue.length) {
            const current = queue[head++];
            const x = current % width;
            const y = (current / width) | 0;

            if (x < keepMinX) keepMinX = x;
            if (y < keepMinY) keepMinY = y;
            if (x > keepMaxX) keepMaxX = x;
            if (y > keepMaxY) keepMaxY = y;

            forEachNeighbor(current, (next) => {
              if (keep[next]) return;
              if (!isOpaque(next) || background[next]) return;
              keep[next] = 1;
              queue.push(next);
            });
          }
        }

        const bboxWidth = Math.max(1, keepMaxX - keepMinX + 1);
        const bboxHeight = Math.max(1, keepMaxY - keepMinY + 1);
        const coverageRatio = bestArea / total;
        const removedBackgroundRatio = backgroundCount / total;

        let borderTouchCount = 0;
        for (let x = keepMinX; x <= keepMaxX; x += 1) {
          const top = x;
          const bottom = (height - 1) * width + x;
          if (keep[top]) borderTouchCount += 1;
          if (height > 1 && keep[bottom]) borderTouchCount += 1;
        }
        for (let y = keepMinY + 1; y < keepMaxY; y += 1) {
          const left = y * width;
          const right = y * width + (width - 1);
          if (keep[left]) borderTouchCount += 1;
          if (width > 1 && keep[right]) borderTouchCount += 1;
        }

        const matte = new Uint8Array(total);
        const matteQueue: number[] = [];
        let matteHead = 0;
        let mattePixelCount = 0;
        let matteMinX = width;
        let matteMaxX = -1;

        const matteStartY = keepMinY + Math.floor(bboxHeight * cleanupPolicy.matteBandStartRatio);

        const isBottomMatteCandidate = (index: number, y: number) => {
          if (!keep[index]) return false;
          if (y < matteStartY) return false;

          const luma = luminanceAt(index);
          const chroma = chromaAt(index);
          const distance = colorDistanceTo(index, meanR, meanG, meanB);

          const closeToBorderColor = distance <= cleanupPolicy.borderDistanceThreshold * 0.92;
          const closeToLightBorder =
            borderMeanLuma >= 160 &&
            luma >= cleanupPolicy.lightBackgroundLumaFloor - 6 &&
            chroma <= cleanupPolicy.lightBackgroundChromaMax + 6;

          return closeToBorderColor || closeToLightBorder;
        };

        const seedMatte = (index: number, y: number) => {
          if (matte[index]) return;
          if (!isBottomMatteCandidate(index, y)) return;
          matte[index] = 1;
          matteQueue.push(index);
          mattePixelCount += 1;
          const x = index % width;
          if (x < matteMinX) matteMinX = x;
          if (x > matteMaxX) matteMaxX = x;
        };

        for (let x = keepMinX; x <= keepMaxX; x += 1) {
          const index = keepMaxY * width + x;
          seedMatte(index, keepMaxY);
        }

        while (matteHead < matteQueue.length) {
          const current = matteQueue[matteHead++];

          forEachNeighbor(current, (next, nx, ny) => {
            if (matte[next]) return;
            if (!isBottomMatteCandidate(next, ny)) return;
            matte[next] = 1;
            matteQueue.push(next);
            mattePixelCount += 1;
            if (nx < matteMinX) matteMinX = nx;
            if (nx > matteMaxX) matteMaxX = nx;
          });
        }

        const bottomMatteSpanRatio =
          mattePixelCount > 0 && matteMaxX >= matteMinX
            ? (matteMaxX - matteMinX + 1) / Math.max(1, bboxWidth)
            : 0;

        const cleanupMetrics: AutoCutlineCleanupMetrics = {
          totalArea: total,
          keepArea: Math.max(1, bestArea),
          coverageRatio,
          bboxWidth,
          bboxHeight,
          borderTouchRatio: borderTouchCount / Math.max(1, 2 * bboxWidth + 2 * bboxHeight),
          removedBackgroundRatio,
          bottomMatteSpanRatio,
          mattePixelRatio: mattePixelCount / Math.max(1, bestArea),
        };

        const cleanupDecision = decideAutoCutlineCleanup(
          cleanupMetrics,
          cleanupPolicy
        );

        if (
          cleanupDecision === "REVIEW_REQUIRED" ||
          cleanupDecision === "REJECT"
        ) {
          resolve("");
          return;
        }

        for (let i = 0; i < total; i += 1) {
          if (!keep[i]) {
            data[i * 4 + 3] = 0;
            continue;
          }

          if (cleanupDecision === "AUTO_TRIM" && matte[i]) {
            data[i * 4 + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);

        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve("");
      }
    };

    img.onerror = () => resolve("");
    img.src = inputUrl;
  });
}

async function buildTransparentTraceSourceUrl(...args: Parameters<typeof buildTransparentTraceSourceUrlCore>): Promise<Awaited<ReturnType<typeof buildTransparentTraceSourceUrlCore>>> {
  const intermediateUrl = await buildTransparentTraceSourceUrlCore(...args);

  if (typeof intermediateUrl !== "string" || intermediateUrl.length === 0) {
    return intermediateUrl as Awaited<ReturnType<typeof buildTransparentTraceSourceUrlCore>>;
  }

  const filteredUrl = await retainLargestOpaqueIslandFromDataUrl(intermediateUrl);
  if (typeof filteredUrl !== "string" || filteredUrl.length === 0) {
    return intermediateUrl as Awaited<ReturnType<typeof buildTransparentTraceSourceUrlCore>>;
  }
  return filteredUrl as Awaited<ReturnType<typeof buildTransparentTraceSourceUrlCore>>;
}






