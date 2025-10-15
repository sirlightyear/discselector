import { LineShape } from '../types';

export interface Point {
  x: number;
  y: number;
}

export interface LineAnalysis {
  shape: LineShape;
  curv: number;
}

export function analyzeLine(points: Point[]): LineAnalysis {
  if (points.length < 3) {
    return { shape: 'straight', curv: 0 };
  }

  const start = points[0];
  const end = points[points.length - 1];
  const midIndex = Math.floor(points.length / 2);
  const mid = points[midIndex];

  const chordDx = end.x - start.x;
  const chordDy = end.y - start.y;
  const chordLen = Math.sqrt(chordDx * chordDx + chordDy * chordDy);

  if (chordLen < 10) {
    return { shape: 'straight', curv: 0 };
  }

  const midDx = mid.x - start.x;
  const midDy = mid.y - start.y;

  const projLen = (midDx * chordDx + midDy * chordDy) / chordLen;
  const projX = start.x + (projLen * chordDx) / chordLen;
  const projY = start.y + (projLen * chordDy) / chordLen;

  const perpDist = Math.sqrt(
    Math.pow(mid.x - projX, 2) + Math.pow(mid.y - projY, 2)
  );

  const crossProduct = chordDx * (mid.y - start.y) - chordDy * (mid.x - start.x);

  let curv = perpDist / (chordLen + 1);
  curv = Math.max(0, Math.min(1, curv));

  let shape: LineShape = 'straight';
  if (curv > 0.05) {
    shape = crossProduct > 0 ? 'left' : 'right';
  }

  return { shape, curv };
}
