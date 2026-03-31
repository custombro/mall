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
const PREVIEWABLE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

type ShapeMode = (typeof SHAPE_MODES)[number];
type Material = (typeof MATERIALS)[number];
type Thickness = (typeof THICKNESSES)[number];
type Ring = (typeof RINGS)[number];
type HoleSize = (typeof HOLE_SIZES)[number];

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

  if (shapeMode === "원형") {
    return (
      <ellipse
        cx={ELLIPSE.cx}
        cy={ELLIPSE.cy}
        rx={ELLIPSE.rx}
        ry={ELLIPSE.ry}
        fill={fillValue}
        stroke="rgba(255,255,255,0.88)"
        strokeWidth="4"
      />
    );
  }

  if (shapeMode === "사각형") {
    return (
      <rect
        x={ROUNDED_RECT.x}
        y={ROUNDED_RECT.y}
        width={ROUNDED_RECT.width}
        height={ROUNDED_RECT.height}
        rx={ROUNDED_RECT.radius}
        fill={fillValue}
        stroke="rgba(255,255,255,0.88)"
        strokeWidth="4"
      />
    );
  }

  return null;
}

function renderClipShape(shapeMode: ShapeMode) {
  if (shapeMode === "원형") {
    return <ellipse cx={ELLIPSE.cx} cy={ELLIPSE.cy} rx={ELLIPSE.rx} ry={ELLIPSE.ry} />;
  }

  if (shapeMode === "사각형") {
    return (
      <rect
        x={ROUNDED_RECT.x}
        y={ROUNDED_RECT.y}
        width={ROUNDED_RECT.width}
        height={ROUNDED_RECT.height}
        rx={ROUNDED_RECT.radius}
      />
    );
  }

  return <rect x={ART_FRAME.x} y={ART_FRAME.y} width={ART_FRAME.width} height={ART_FRAME.height} rx="28" />;
}

function projectHoleToEllipse(pointer: HolePosition, holeSize: HoleSize): HolePosition {
  const holeOffset = getHoleVisualRadius(holeSize) * 0.6 + 2;
  let dx = pointer.x - ELLIPSE.cx;
  let dy = pointer.y - ELLIPSE.cy;

  if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
    dx = 0;
    dy = -1;
  }

  const scale = 1 / Math.sqrt((dx * dx) / (ELLIPSE.rx * ELLIPSE.rx) + (dy * dy) / (ELLIPSE.ry * ELLIPSE.ry));
  const bx = ELLIPSE.cx + dx * scale;
  const by = ELLIPSE.cy + dy * scale;

  const n = normalize(
    (bx - ELLIPSE.cx) / (ELLIPSE.rx * ELLIPSE.rx),
    (by - ELLIPSE.cy) / (ELLIPSE.ry * ELLIPSE.ry),
  );

  return {
    x: bx + n.x * holeOffset,
    y: by + n.y * holeOffset,
  };
}

function projectHoleToRoundedRect(pointer: HolePosition, holeSize: HoleSize): HolePosition {
  const holeOffset = getHoleVisualRadius(holeSize) * 0.6 + 2;

  const halfW = ROUNDED_RECT.width / 2;
  const halfH = ROUNDED_RECT.height / 2;
  const innerW = halfW - ROUNDED_RECT.radius;
  const innerH = halfH - ROUNDED_RECT.radius;
  const cx = ROUNDED_RECT.x + halfW;
  const cy = ROUNDED_RECT.y + halfH;

  const px = pointer.x - cx;
  const py = pointer.y - cy;
  const ax = Math.abs(px);
  const ay = Math.abs(py);
  const sx = px >= 0 ? 1 : -1;
  const sy = py >= 0 ? 1 : -1;

  let anchorX = 0;
  let anchorY = 0;
  let normalX = 0;
  let normalY = 0;

  if (ax <= innerW && ay <= innerH) {
    const distX = halfW - ax;
    const distY = halfH - ay;
    if (distY <= distX) {
      anchorX = px;
      anchorY = sy * halfH;
      normalX = 0;
      normalY = sy;
    } else {
      anchorX = sx * halfW;
      anchorY = py;
      normalX = sx;
      normalY = 0;
    }
  } else if (ax <= innerW) {
    anchorX = px;
    anchorY = sy * halfH;
    normalX = 0;
    normalY = sy;
  } else if (ay <= innerH) {
    anchorX = sx * halfW;
    anchorY = py;
    normalX = sx;
    normalY = 0;
  } else {
    const ccx = sx * innerW;
    const ccy = sy * innerH;
    const dir = normalize(px - ccx, py - ccy);
    anchorX = ccx + dir.x * ROUNDED_RECT.radius;
    anchorY = ccy + dir.y * ROUNDED_RECT.radius;
    normalX = dir.x;
    normalY = dir.y;
  }

  return {
    x: cx + anchorX + normalX * holeOffset,
    y: cy + anchorY + normalY * holeOffset,
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

  const holeOffset = getHoleVisualRadius(holeSize) * 0.6 + 2;
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

  if (shapeMode === "자동칼선" && autoCutline.status === "ready") {
    return projectHoleToPolyline(pointer, holeSize, autoCutline.points, autoCutline.centroid);
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

async function buildAutoCutlineFromImage(
  url: string,
): Promise<{ path: string; points: Point[]; centroid: Point } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
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

      const mask: boolean[][] = Array.from({ length: ANALYSIS_HEIGHT }, () =>
        Array.from({ length: ANALYSIS_WIDTH }, () => false),
      );

      let count = 0;
      let sumX = 0;
      let sumY = 0;

      for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
        for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
          const idx = (y * ANALYSIS_WIDTH + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          const fg = isForeground(r, g, b, a);

          if (fg) {
            mask[y][x] = true;
            count += 1;
            sumX += x + 0.5;
            sumY += y + 0.5;
          }
        }
      }

      if (count < 40) {
        resolve(null);
        return;
      }
  const autoCutlineMarginPx = Math.max(
      Math.round(Math.max(img.width, img.height) * 0.03),
      14,
    );

  if (autoCutlineMarginPx > 0) {
    const expandedMask = mask.map((row) => [...row]);

    for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
      for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
        if (!mask[y][x]) continue;

        for (let oy = -autoCutlineMarginPx; oy <= autoCutlineMarginPx; oy += 1) {
          const ny = y + oy;
          if (ny < 0 || ny >= ANALYSIS_HEIGHT) continue;

          for (let ox = -autoCutlineMarginPx; ox <= autoCutlineMarginPx; ox += 1) {
            const nx = x + ox;
            if (nx < 0 || nx >= ANALYSIS_WIDTH) continue;
            if (ox * ox + oy * oy > autoCutlineMarginPx * autoCutlineMarginPx) continue;
            expandedMask[ny][nx] = true;
          }
        }
      }
    }

    for (let y = 0; y < ANALYSIS_HEIGHT; y += 1) {
      for (let x = 0; x < ANALYSIS_WIDTH; x += 1) {
        mask[y][x] = expandedMask[y][x];
      }
    }
  }

      const centroidMask = {
        x: sumX / count,
        y: sumY / count,
      };

      const bins = 240;
      const radial: Array<{ d: number; x: number; y: number }> = Array.from({ length: bins }, () => ({
        d: -1,
        x: 0,
        y: 0,
      }));

      let boundaryCount = 0;

      for (let y = 1; y < ANALYSIS_HEIGHT - 1; y += 1) {
        for (let x = 1; x < ANALYSIS_WIDTH - 1; x += 1) {
          if (!mask[y][x]) continue;

          const boundary =
            !mask[y - 1][x] ||
            !mask[y + 1][x] ||
            !mask[y][x - 1] ||
            !mask[y][x + 1] ||
            !mask[y - 1][x - 1] ||
            !mask[y - 1][x + 1] ||
            !mask[y + 1][x - 1] ||
            !mask[y + 1][x + 1];

          if (!boundary) continue;

          boundaryCount += 1;

          const px = x + 0.5;
          const py = y + 0.5;
          const angle = Math.atan2(py - centroidMask.y, px - centroidMask.x);
          const bin = Math.floor((((angle + Math.PI) / (Math.PI * 2)) * bins)) % bins;
          const d = distanceSq({ x: px, y: py }, centroidMask);

          if (d > radial[bin].d) {
            radial[bin] = { d, x: px, y: py };
          }
        }
      }

      if (boundaryCount < 40) {
        resolve(null);
        return;
      }

      for (let i = 0; i < bins; i += 1) {
        if (radial[i].d >= 0) continue;

        let left = (i - 1 + bins) % bins;
        while (left !== i && radial[left].d < 0) {
          left = (left - 1 + bins) % bins;
        }

        let right = (i + 1) % bins;
        while (right !== i && radial[right].d < 0) {
          right = (right + 1) % bins;
        }

        if (radial[left].d >= 0 && radial[right].d >= 0) {
          radial[i] = {
            d: (radial[left].d + radial[right].d) / 2,
            x: (radial[left].x + radial[right].x) / 2,
            y: (radial[left].y + radial[right].y) / 2,
          };
        } else if (radial[left].d >= 0) {
          radial[i] = radial[left];
        } else if (radial[right].d >= 0) {
          radial[i] = radial[right];
        } else {
          resolve(null);
          return;
        }
      }

      const rawPoints: Point[] = [];

      for (let i = 0; i < bins; i += 1) {
        const point = radial[i];
        const svgPoint = {
          x: ART_FRAME.x + (point.x / ANALYSIS_WIDTH) * ART_FRAME.width,
          y: ART_FRAME.y + (point.y / ANALYSIS_HEIGHT) * ART_FRAME.height,
        };

        if (rawPoints.length === 0 || distanceSq(rawPoints[rawPoints.length - 1], svgPoint) > 3) {
          rawPoints.push(svgPoint);
        }
      }

      if (rawPoints.length < 24) {
        resolve(null);
        return;
      }

      const smoothPoints = rawPoints.map((point, index) => {
        const prev = rawPoints[(index - 1 + rawPoints.length) % rawPoints.length];
        const next = rawPoints[(index + 1) % rawPoints.length];
        return {
          x: (prev.x + point.x * 2 + next.x) / 4,
          y: (prev.y + point.y * 2 + next.y) / 4,
        };
      });

      const path = smoothPoints
        .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
        .join(" ") + " Z";

      const centroidSvg = {
        x: ART_FRAME.x + (centroidMask.x / ANALYSIS_WIDTH) * ART_FRAME.width,
        y: ART_FRAME.y + (centroidMask.y / ANALYSIS_HEIGHT) * ART_FRAME.height,
      };

      resolve({
        path,
        points: smoothPoints,
        centroid: centroidSvg,
      });
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
  const scaledArtFrame = (() => {
  const baseWidth = ART_FRAME.width * artScale;
  const baseHeight = ART_FRAME.height * artScale;
  const baseX = ART_FRAME.x + (ART_FRAME.width - baseWidth) / 2;
  const baseY = ART_FRAME.y + (ART_FRAME.height - baseHeight) / 2;
  const autoInsetPx = 0;

  return {
    width: Math.max(24, baseWidth - autoInsetPx * 2),
    height: Math.max(24, baseHeight - autoInsetPx * 2),
    x: baseX + autoInsetPx,
    y: baseY + autoInsetPx,
  };
})();

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
              d={cbBuildSmoothClosedPath(autoCutline.points)}
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
      )}

      <circle cx={hole.x} cy={hole.y} r={holeRadius + 8} fill="rgba(255,210,60,0.94)" />
      <circle cx={hole.x} cy={hole.y} r={holeRadius} fill="#263247" />
      <circle cx={hole.x} cy={hole.y} r="4" fill="#08111f" />
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
        const largestSize = Math.max(rawBounds.width, rawBounds.height);
        const autoMarginPx = largestSize >= 240 ? 24 : 20;
        const rawCentroid = result.centroid ?? {
          x: rawBounds.left + rawBounds.width / 2,
          y: rawBounds.top + rawBounds.height / 2,
        };
        const expandedPoints = cbExpandClosedPoints(result.points, rawCentroid, autoMarginPx);

        setAutoCutline({
          status: "ready",
          path: cbBuildSmoothClosedPath(expandedPoints),
          points: expandedPoints,
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

        <section className="mb-4 rounded-[28px] border border-white/10 bg-[#030b24] px-5 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-[980px]">
              <div className="mb-2 text-[11px] font-semibold tracking-[0.18em] text-[#8fb7ff]">상태창</div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white">
                키링 제작 / 외곽선 추종 구멍 + 자동칼선 1차
              </h1>
              <p className="mt-4 max-w-[980px] text-base leading-7 text-white/78">
                업로드 후 작업판 내부 글씨는 제거하고, 원형/사각형은 구멍이 외곽선에 붙어서 이동하도록 정리했다.
                자동칼선은 업로드 이미지 기준으로 1차 빨간 칼선을 생성한다.
              </p>
            </div>

            <div className="grid w-full max-w-[340px] gap-2 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm text-white/76">
              <div>업로드 후 작업판 내부 글씨 제거</div>
              <div>원형/사각형은 구멍이 외곽선에 붙어 이동</div>
              <div>자동칼선 업로드 시 빨간 칼선 1차 생성</div>
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
            <div className="mb-2 text-[12px] font-bold tracking-[0.18em] text-[#8fc0ff]">CENTER / 중앙 작업판</div>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-[42px] font-extrabold leading-none tracking-tight text-white">
                  {shapeMode} 작업판
                </h2>
                <p className="mt-4 max-w-[780px] text-base leading-7 text-white/76">
                  원형/사각형은 생성된 외곽선 기준으로 구멍이 따라 움직인다.
                  자동칼선은 업로드 이미지 기준으로 1차 빨간 칼선을 생성한다.
                </p>
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/72">
                {uploadState ? `업로드 파일: ${uploadState.name}` : "업로드 파일 대기"}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/68">
                현재 구멍 좌표: X {Math.round(hole.x)} / Y {Math.round(hole.y)}
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/68">
                현재 규격: {getHoleLabel(holeSize)}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/72">
                <div className="mb-2 flex items-center justify-between text-[11px] text-white/65">
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
                  className="w-full accent-white"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setArtScale((prev) => Math.max(0.7, Number((prev - 0.05).toFixed(2))))}
                    className="rounded-xl border border-white/10 px-3 py-2 text-[11px] text-white/75 transition hover:border-white/20 hover:text-white"
                  >
                    -5%
                  </button>
                  <button
                    type="button"
                    onClick={() => setArtScale(1)}
                    className="rounded-xl border border-white/10 px-3 py-2 text-[11px] text-white/75 transition hover:border-white/20 hover:text-white"
                  >
                    기본
                  </button>
                  <button
                    type="button"
                    onClick={() => setArtScale((prev) => Math.min(1.3, Number((prev + 0.05).toFixed(2))))}
                    className="rounded-xl border border-white/10 px-3 py-2 text-[11px] text-white/75 transition hover:border-white/20 hover:text-white"
                  >
                    +5%
                  </button>
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/68">
                현재 형태: {shapeMode}
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

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/72">
              <div className="mb-2 flex items-center justify-between text-[12px] text-white/70">
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
                className="w-full accent-white"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setArtScale((prev) => Math.max(0.7, Number((prev - 0.05).toFixed(2))))}
                  className="rounded-xl border border-white/10 px-3 py-2 text-[11px] text-white/75 transition hover:border-white/20 hover:text-white"
                >
                  -5%
                </button>
                <button
                  type="button"
                  onClick={() => setArtScale(1)}
                  className="rounded-xl border border-white/10 px-3 py-2 text-[11px] text-white/75 transition hover:border-white/20 hover:text-white"
                >
                  기본
                </button>
                <button
                  type="button"
                  onClick={() => setArtScale((prev) => Math.min(1.3, Number((prev + 0.05).toFixed(2))))}
                  className="rounded-xl border border-white/10 px-3 py-2 text-[11px] text-white/75 transition hover:border-white/20 hover:text-white"
                >
                  +5%
                </button>
              </div>
            </div>

            <div
              className={`mt-4 overflow-hidden rounded-[28px] border ${
                dragging ? "border-[#7fbaff]/70" : "border-white/10"
              } bg-[#02091f] p-4 transition cursor-grab active:cursor-grabbing select-none`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
              onPointerLeave={stopDrag}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white/82">메인 작업대</div>
                <div className="text-sm text-white/62">
                  {autoCutlineLocked ? "자동칼선 계산 완료 후 구멍 이동 가능" : "구멍은 외곽선에 붙어서 이동"}
                </div>
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

