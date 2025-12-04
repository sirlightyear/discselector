export interface FlightPoint {
  x: number;
  y: number;
  height: number;
}

export interface FlightPathResult {
  points: FlightPoint[];
  maxDistance: number;
  maxHeight: number;
}

interface FlightParams {
  speed: number;
  glide: number;
  turn: number;
  fade: number;
  releaseAngle: 'anhyzer' | 'flat' | 'hyzer';
  throwStyle: string;
  isLeftHanded: boolean;
}

export function calculateFlightPath(params: FlightParams): FlightPathResult {
  const { speed, glide, turn, fade, releaseAngle, throwStyle, isLeftHanded } = params;

  const points: FlightPoint[] = [];
  const numPoints = 100;

  const maxDistance = calculateMaxDistance(speed, glide, throwStyle);
  const maxHeight = calculateMaxHeight(speed, glide, throwStyle);

  const handMultiplier = isLeftHanded ? -1 : 1;

  const releaseAngleOffset = getReleaseAngleOffset(releaseAngle);

  const throwStyleModifiers = getThrowStyleModifiers(throwStyle);

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;

    const distance = t * maxDistance;

    const height = calculateHeightAtPoint(t, maxHeight, throwStyleModifiers);

    const lateralOffset = calculateLateralOffset(
      t,
      turn,
      fade,
      maxDistance,
      releaseAngleOffset,
      throwStyleModifiers,
      handMultiplier
    );

    points.push({
      x: distance,
      y: lateralOffset,
      height,
    });
  }

  return {
    points,
    maxDistance,
    maxHeight,
  };
}

function calculateMaxDistance(speed: number, glide: number, throwStyle: string): number {
  let baseDistance = speed * 10;

  if (throwStyle.includes('roller')) {
    baseDistance *= 1.2;
  } else if (throwStyle.includes('approach') || throwStyle.includes('putt')) {
    baseDistance *= 0.4;
  } else if (throwStyle.includes('overhead') || throwStyle.includes('vertical')) {
    baseDistance *= 0.6;
  } else if (throwStyle === 'forehand_flex') {
    baseDistance *= 1.1;
  } else if (throwStyle === 'backhand_hyzerflip') {
    baseDistance *= 1.05;
  }

  baseDistance *= (1 + glide * 0.08);

  return baseDistance;
}

function calculateMaxHeight(speed: number, glide: number, throwStyle: string): number {
  let baseHeight = speed * 1.5;

  if (throwStyle.includes('roller')) {
    return 2;
  } else if (throwStyle.includes('putt')) {
    baseHeight *= 0.3;
  } else if (throwStyle.includes('approach')) {
    baseHeight *= 0.5;
  } else if (throwStyle === 'tomahawk' || throwStyle === 'thumber') {
    baseHeight *= 2;
  } else if (throwStyle === 'grenade' || throwStyle === 'vertical_backhand') {
    baseHeight *= 2.5;
  } else if (throwStyle === 'float_shot') {
    baseHeight *= 1.5;
  }

  baseHeight *= (1 + glide * 0.05);

  return baseHeight;
}

function calculateHeightAtPoint(
  t: number,
  maxHeight: number,
  modifiers: ThrowStyleModifiers
): number {
  if (modifiers.isRoller) {
    return 0.5;
  }

  if (modifiers.isVertical) {
    if (t < 0.3) {
      return (t / 0.3) * maxHeight;
    } else {
      return maxHeight * (1 - ((t - 0.3) / 0.7));
    }
  }

  const peakPosition = modifiers.heightPeakPosition;
  if (t < peakPosition) {
    return (t / peakPosition) * maxHeight;
  } else {
    return maxHeight * (1 - ((t - peakPosition) / (1 - peakPosition))) ** 1.5;
  }
}

function calculateLateralOffset(
  t: number,
  turn: number,
  fade: number,
  maxDistance: number,
  releaseAngleOffset: number,
  modifiers: ThrowStyleModifiers,
  handMultiplier: number
): number {
  if (modifiers.isRoller) {
    const rollerTurn = (turn - 2) * maxDistance * 0.15;
    const rollerFade = fade * maxDistance * 0.05;
    return (rollerTurn * t + rollerFade * t ** 2) * handMultiplier;
  }

  if (modifiers.isVertical) {
    const verticalDrift = modifiers.verticalDrift * maxDistance * 0.3;
    return verticalDrift * Math.sin(t * Math.PI) * handMultiplier;
  }

  const turnPhase = t < 0.6 ? t / 0.6 : 1;
  const fadePhase = t > 0.5 ? ((t - 0.5) / 0.5) ** 2 : 0;

  const turnAmount = turn * turnPhase * maxDistance * 0.08 * modifiers.turnMultiplier;
  const fadeAmount = fade * fadePhase * maxDistance * 0.12 * modifiers.fadeMultiplier;

  const releaseInfluence = releaseAngleOffset * maxDistance * 0.15 * (1 - t);

  const totalOffset = releaseInfluence + turnAmount * handMultiplier - fadeAmount * handMultiplier;

  return totalOffset;
}

function getReleaseAngleOffset(releaseAngle: 'anhyzer' | 'flat' | 'hyzer'): number {
  switch (releaseAngle) {
    case 'anhyzer':
      return 1;
    case 'hyzer':
      return -1;
    case 'flat':
    default:
      return 0;
  }
}

interface ThrowStyleModifiers {
  turnMultiplier: number;
  fadeMultiplier: number;
  heightPeakPosition: number;
  isRoller: boolean;
  isVertical: boolean;
  verticalDrift: number;
}

function getThrowStyleModifiers(throwStyle: string): ThrowStyleModifiers {
  const defaults: ThrowStyleModifiers = {
    turnMultiplier: 1,
    fadeMultiplier: 1,
    heightPeakPosition: 0.4,
    isRoller: false,
    isVertical: false,
    verticalDrift: 0,
  };

  if (throwStyle.includes('roller')) {
    return { ...defaults, isRoller: true };
  }

  if (throwStyle === 'grenade' || throwStyle === 'vertical_backhand') {
    return {
      ...defaults,
      isVertical: true,
      verticalDrift: 0.2,
    };
  }

  if (throwStyle === 'tomahawk') {
    return {
      ...defaults,
      isVertical: true,
      verticalDrift: -0.8,
      heightPeakPosition: 0.3,
    };
  }

  if (throwStyle === 'thumber') {
    return {
      ...defaults,
      isVertical: true,
      verticalDrift: 0.8,
      heightPeakPosition: 0.3,
    };
  }

  if (throwStyle === 'backhand_hyzerflip') {
    return {
      ...defaults,
      turnMultiplier: 1.5,
      fadeMultiplier: 0.7,
      heightPeakPosition: 0.5,
    };
  }

  if (throwStyle === 'forehand_flex') {
    return {
      ...defaults,
      turnMultiplier: 1.3,
      fadeMultiplier: 1.3,
      heightPeakPosition: 0.4,
    };
  }

  if (throwStyle.includes('approach')) {
    return {
      ...defaults,
      turnMultiplier: 0.7,
      fadeMultiplier: 1.1,
      heightPeakPosition: 0.35,
    };
  }

  if (throwStyle.includes('putt')) {
    return {
      ...defaults,
      turnMultiplier: 0.5,
      fadeMultiplier: 0.5,
      heightPeakPosition: 0.3,
    };
  }

  if (throwStyle === 'float_shot') {
    return {
      ...defaults,
      turnMultiplier: 0.3,
      fadeMultiplier: 0.8,
      heightPeakPosition: 0.25,
    };
  }

  return defaults;
}
