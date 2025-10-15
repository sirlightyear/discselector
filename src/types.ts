export type HandSide = 'R' | 'L';

export type ThrowType = 'BH' | 'FH';

export type DiscType = 'Putter' | 'Midrange' | 'Fairway driver' | 'Driver';

export type LineShape = 'straight' | 'left' | 'right';

export type StabilityCategory =
  | 'Meget understabil'
  | 'Understabil'
  | 'Neutral'
  | 'Overstabil'
  | 'Meget overstabil';

export type ReleaseType = 'hyzer' | 'anhyzer' | 'straight';

export interface AppState {
  side: HandSide | null;
  bh: boolean;
  fh: boolean;
  arm: number;
  wd: number | null;
  ws: number | null;
  dist: number | null;
  shape: LineShape;
  curv: number;
}

export interface ProTuneCoefficients {
  headK: number;
  crossK: number;
  armK: number;
  curveK: number;
  tPutter: number;
  tMid: number;
  tFairway: number;
  windStep1: number;
  windStep2: number;
}

export interface Recommendation {
  throwType: ThrowType;
  label: string;
  discType: DiscType;
  stability: StabilityCategory;
  stabilityScore: number;
  release: string;
  releaseAngle: number;
  tips: string[];
}

export interface WindComponents {
  head: number;
  cross: number;
}
