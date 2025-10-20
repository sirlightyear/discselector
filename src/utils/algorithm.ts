import {
  HandSide,
  ThrowType,
  DiscType,
  StabilityCategory,
  ReleaseType,
  WindComponents,
  ProTuneCoefficients,
  LineShape,
  Recommendation,
} from '../types';

export function normalizeWind(wd: number, ws: number): WindComponents {
  const angleRad = ((wd - 12) * 30 * Math.PI) / 180;
  const head = Math.cos(angleRad) * ws;
  const cross = Math.sin(angleRad) * ws;
  return { head, cross };
}

export function getHyzerSide(side: HandSide, throwType: ThrowType): 'left' | 'right' {
  if (side === 'R' && throwType === 'BH') return 'left';
  if (side === 'L' && throwType === 'BH') return 'right';
  if (side === 'R' && throwType === 'FH') return 'right';
  return 'left';
}

export function getBaseRelease(
  shape: LineShape,
  hyzerSide: 'left' | 'right'
): ReleaseType {
  if (shape === 'straight') return 'straight';
  if (
    (shape === 'left' && hyzerSide === 'left') ||
    (shape === 'right' && hyzerSide === 'right')
  ) {
    return 'hyzer';
  }
  return 'anhyzer';
}

export function calculateStability(
  side: HandSide,
  throwType: ThrowType,
  arm: number,
  wind: WindComponents,
  shape: LineShape,
  curv: number,
  dist: number,
  coef: ProTuneCoefficients
): { score: number; category: StabilityCategory } {
  const hyzerSide = getHyzerSide(side, throwType);
  const baseRelease = getBaseRelease(shape, hyzerSide);

  let curveBias = 0;
  if (baseRelease === 'hyzer') {
    curveBias = coef.curveK * curv;
  } else if (baseRelease === 'anhyzer') {
    curveBias = -coef.curveK * curv;
  }

  const crossWindTowardsHyzer =
    (hyzerSide === 'left' && wind.cross > 0) ||
    (hyzerSide === 'right' && wind.cross < 0);

  const crossBias = crossWindTowardsHyzer
    ? coef.crossK * Math.abs(wind.cross)
    : -coef.crossK * Math.abs(wind.cross);

  const armBias = coef.armK * (arm - 10);
  const headBias = coef.headK * wind.head;

  let distBias = 0;
  if (dist <= 60) {
    distBias = -0.1;
  } else if (dist >= 110 && shape === 'straight') {
    distBias = -0.15;
  }

  const score = Math.max(
    -1.5,
    Math.min(1.5, headBias + crossBias + armBias + curveBias + distBias)
  );

  let category: StabilityCategory;
  if (score < -2) category = 'Meget understabil';
  else if (score < 0) category = 'Understabil';
  else if (score < 1) category = 'Neutral';
  else if (score < 2) category = 'Overstabil';
  else category = 'Meget overstabil';

  return { score, category };
}

export function calculateDiscType(
  dist: number,
  wind: WindComponents,
  arm: number,
  coef: ProTuneCoefficients
): DiscType {
  const types: DiscType[] = ['Putter', 'Midrange', 'Fairway driver', 'Driver'];
  let typeIndex = 0;

  if (dist <= coef.tPutter) typeIndex = 0;
  else if (dist <= coef.tMid) typeIndex = 1;
  else if (dist <= coef.tFairway) typeIndex = 2;
  else typeIndex = 3;

  if (wind.head > coef.windStep1) {
    typeIndex = Math.min(3, typeIndex + 1);
  }
  if (wind.head > coef.windStep2) {
    typeIndex = Math.min(3, typeIndex + 1);
  }
  if (wind.head < -coef.windStep1) {
    typeIndex = Math.max(0, typeIndex - 1);
  }

  if (arm <= 9 && typeIndex === 3) typeIndex = 2;
  if (arm <= 8 && typeIndex > 1) typeIndex = 1;

  return types[typeIndex];
}

export function calculateRelease(
  side: HandSide,
  throwType: ThrowType,
  shape: LineShape,
  curv: number,
  wind: WindComponents
): { angle: number; text: string } {
  const hyzerSide = getHyzerSide(side, throwType);
  const baseRelease = getBaseRelease(shape, hyzerSide);

  let angle = 0;

  angle += wind.head * 1.2;
  angle += wind.head < 0 ? wind.head * 0.6 : 0;

  if (baseRelease === 'hyzer') {
    angle += 5 + curv * 15;
  } else if (baseRelease === 'anhyzer') {
    angle -= 5 + curv * 15;
  }

  const absAngle = Math.abs(angle);
  let text = '';

  if (angle > 3) {
    let intensity = 'lille';
    if (absAngle > 12) intensity = 'stor';
    else if (absAngle > 7) intensity = 'moderat';
    text = `Hyzer (${intensity}, ~${Math.round(absAngle)}°)`;
  } else if (angle < -3) {
    let intensity = 'lille';
    if (absAngle > 12) intensity = 'stor';
    else if (absAngle > 7) intensity = 'moderat';
    text = `Anhyzer (${intensity}, ~${Math.round(absAngle)}°)`;
  } else {
    text = `Flad (~${Math.round(absAngle)}°)`;
  }

  return { angle, text };
}

export function generateTips(
  wind: WindComponents,
  ws: number,
  shape: LineShape,
  dist: number
): string[] {
  const tips: string[] = [];

  if (ws >= 8 && wind.head > 0) {
    tips.push('Modvind: næsen lidt ned; undgå for understabile discs.');
  } else if (ws >= 8 && wind.head < 0) {
    tips.push('Medvind: let understabil kan holde lige linjer.');
  }

  if (Math.abs(wind.cross) >= 4) {
    tips.push('Sidevind: sigt 1–3° ind i vinden.');
  }

  if (shape === 'straight' && ws <= 4 && dist <= 70) {
    tips.push('Kort/lige: putter eller neutral midrange er lettest at kontrollere.');
  }

  if (tips.length === 0) {
    tips.push('Fokus: vælg linje først – disc/angle understøtter linjen.');
  }

  return tips;
}

function calculateThrowingPower(
  arm: number,
  dist: number,
  discType: DiscType,
  wind: WindComponents
): { recommendedSpeed: number; warning?: string } {
  const baseSpeedMap: Record<DiscType, number> = {
    'Putter': 3,
    'Midrange': 5,
    'Fairway driver': 9,
    'Driver': 12,
  };

  let baseSpeed = baseSpeedMap[discType];
  const distanceMultiplier = dist / 100;
  const windAdjustment = wind.head > 0 ? Math.min(wind.head * 0.5, 2) : 0;
  const recommendedSpeed = Math.min(14, Math.max(1, Math.round(baseSpeed * distanceMultiplier + windAdjustment)));

  const result: { recommendedSpeed: number; warning?: string } = {
    recommendedSpeed,
  };

  if (recommendedSpeed > arm + 1) {
    result.warning = `Du har måske ikke kraft nok til at nå de ${dist}m. Overvej en mere understabil disc eller kortere distance.`;
  } else if (recommendedSpeed > arm) {
    result.warning = `De ${dist}m er lige på grænsen af din armspeed. Kast med fuld kraft.`;
  }

  return result;
}

export function generateRecommendations(
  side: HandSide,
  bh: boolean,
  fh: boolean,
  arm: number,
  wind: WindComponents,
  ws: number,
  shape: LineShape,
  curv: number,
  dist: number,
  coef: ProTuneCoefficients
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const throwTypes: ThrowType[] = [];

  if (bh) throwTypes.push('BH');
  if (fh) throwTypes.push('FH');

  const tips = generateTips(wind, ws, shape, dist);

  for (const throwType of throwTypes) {
    const label = `${side}${throwType}`;
    const stability = calculateStability(
      side,
      throwType,
      arm,
      wind,
      shape,
      curv,
      dist,
      coef
    );
    const discType = calculateDiscType(dist, wind, arm, coef);
    const release = calculateRelease(side, throwType, shape, curv, wind);
    const throwingPower = calculateThrowingPower(arm, dist, discType, wind);

    recommendations.push({
      throwType,
      label,
      discType,
      stability: stability.category,
      stabilityScore: stability.score,
      release: release.text,
      releaseAngle: release.angle,
      tips,
      throwingPower,
    });
  }

  return recommendations;
}
