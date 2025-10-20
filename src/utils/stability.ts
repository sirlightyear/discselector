import { StabilityCategory } from '../types';

export function calculateStabilityScore(turn: number, fade: number): number {
  return fade - turn;
}

export function getStabilityCategory(turn: number, fade: number): StabilityCategory {
  const stability = calculateStabilityScore(turn, fade);

  if (stability < -1.5) return 'Meget understabil';
  if (stability < -0.5) return 'Understabil';
  if (stability <= 0.5) return 'Neutral';
  if (stability <= 2.5) return 'Overstabil';
  return 'Meget overstabil';
}

export function getStabilityColor(turn: number, fade: number): string {
  const stability = calculateStabilityScore(turn, fade);

  if (stability < -1.5) return 'bg-green-500';
  if (stability < -0.5) return 'bg-lime-500';
  if (stability <= 0.5) return 'bg-yellow-500';
  if (stability <= 2.5) return 'bg-orange-500';
  return 'bg-red-500';
}
