import { ProTuneCoefficients } from '../types';
import { DEFAULT_COEFFICIENTS, LOCAL_STORAGE_KEY } from '../constants';

export function loadCoefficients(): ProTuneCoefficients {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_COEFFICIENTS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load coefficients:', e);
  }
  return { ...DEFAULT_COEFFICIENTS };
}

export function saveCoefficients(coef: ProTuneCoefficients): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(coef));
  } catch (e) {
    console.error('Failed to save coefficients:', e);
  }
}
