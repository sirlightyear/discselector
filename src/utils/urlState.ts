import { AppState, HandSide, LineShape } from '../types';

export function parseURLState(): Partial<AppState> {
  const params = new URLSearchParams(window.location.search);
  const state: Partial<AppState> = {};

  const side = params.get('side');
  if (side === 'R' || side === 'L') state.side = side as HandSide;

  const bh = params.get('bh');
  if (bh === '1' || bh === '0') state.bh = bh === '1';

  const fh = params.get('fh');
  if (fh === '1' || fh === '0') state.fh = fh === '1';

  const arm = params.get('arm');
  if (arm) {
    const armNum = parseInt(arm, 10);
    if (armNum >= 8 && armNum <= 14) state.arm = armNum;
  }

  const wd = params.get('wd');
  if (wd) {
    const wdNum = parseInt(wd, 10);
    if (wdNum >= 1 && wdNum <= 12) state.wd = wdNum;
  }

  const ws = params.get('ws');
  if (ws) {
    const wsNum = parseInt(ws, 10);
    if (wsNum >= 1 && wsNum <= 15) state.ws = wsNum;
  }

  const dist = params.get('dist');
  if (dist) {
    const distNum = parseInt(dist, 10);
    if (distNum >= 30 && distNum <= 150) state.dist = distNum;
  }

  const shape = params.get('shape');
  if (shape === 'straight' || shape === 'left' || shape === 'right') {
    state.shape = shape as LineShape;
  }

  const curv = params.get('curv');
  if (curv) {
    const curvNum = parseFloat(curv);
    if (!isNaN(curvNum) && curvNum >= 0 && curvNum <= 1) {
      state.curv = curvNum;
    }
  }

  return state;
}

export function buildURL(state: AppState): string {
  const params = new URLSearchParams();
  params.set('v', '5');

  if (state.side) params.set('side', state.side);
  params.set('bh', state.bh ? '1' : '0');
  params.set('fh', state.fh ? '1' : '0');
  params.set('arm', state.arm.toString());

  if (state.wd !== null) params.set('wd', state.wd.toString());
  if (state.ws !== null) params.set('ws', state.ws.toString());
  if (state.dist !== null) params.set('dist', state.dist.toString());

  params.set('shape', state.shape);
  params.set('curv', state.curv.toFixed(2));

  return `${window.location.pathname}?${params.toString()}`;
}

export function shouldSkipProfileUI(urlState: Partial<AppState>): boolean {
  return (
    urlState.side !== undefined &&
    urlState.bh !== undefined &&
    urlState.fh !== undefined
  );
}
