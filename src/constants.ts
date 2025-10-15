import { ProTuneCoefficients } from './types';

export const DEFAULT_COEFFICIENTS: ProTuneCoefficients = {
  headK: 0.18,
  crossK: 0.08,
  armK: 0.12,
  curveK: 0.30,
  tPutter: 45,
  tMid: 75,
  tFairway: 105,
  windStep1: 4,
  windStep2: 8,
};

export const COEF_LIMITS = {
  headK: { min: 0.0, max: 0.4, step: 0.01 },
  crossK: { min: 0.0, max: 0.2, step: 0.005 },
  armK: { min: 0.0, max: 0.3, step: 0.01 },
  curveK: { min: 0.0, max: 0.6, step: 0.01 },
  tPutter: { min: 20, max: 80, step: 5 },
  tMid: { min: 50, max: 120, step: 5 },
  tFairway: { min: 80, max: 160, step: 5 },
  windStep1: { min: 0, max: 10, step: 1 },
  windStep2: { min: 0, max: 15, step: 1 },
};

export const DISC_TYPE_COLORS = {
  Putter: '#10b981',
  Midrange: '#3b82f6',
  'Fairway driver': '#f59e0b',
  Driver: '#ef4444',
};

export const STABILITY_COLORS = {
  'Meget understabil': '#22c55e',
  Understabil: '#84cc16',
  Neutral: '#eab308',
  Overstabil: '#f97316',
  'Meget overstabil': '#ef4444',
};

export const LOCAL_STORAGE_KEY = 'dg_coef';
