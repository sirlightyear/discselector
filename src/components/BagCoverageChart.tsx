import { Disc } from '../lib/database.types';

interface BagCoverageChartProps {
  discs: Disc[];
}

export function BagCoverageChart({ discs }: BagCoverageChartProps) {
  const getSpeed = (disc: Disc) => disc.personal_speed ?? disc.speed;
  const getTurn = (disc: Disc) => disc.personal_turn ?? disc.turn;
  const getFade = (disc: Disc) => disc.personal_fade ?? disc.fade;

  const speedRanges = [
    { label: '1-3', min: 1, max: 3, color: 'bg-blue-500' },
    { label: '4-6', min: 4, max: 6, color: 'bg-cyan-500' },
    { label: '7-9', min: 7, max: 9, color: 'bg-yellow-500' },
    { label: '10-12', min: 10, max: 12, color: 'bg-orange-500' },
    { label: '13-14', min: 13, max: 14, color: 'bg-red-500' },
  ];

  const stabilityCategories = [
    { label: 'Meget understabil', min: -Infinity, max: -2, color: 'bg-green-500' },
    { label: 'Understabil', min: -2, max: -0.1, color: 'bg-lime-500' },
    { label: 'Neutral', min: -0.1, max: 1, color: 'bg-yellow-500' },
    { label: 'Overstabil', min: 1, max: 2.5, color: 'bg-orange-500' },
    { label: 'Meget overstabil', min: 2.5, max: Infinity, color: 'bg-red-500' },
  ];

  const getStabilityScore = (disc: Disc) => {
    const turn = getTurn(disc);
    const fade = getFade(disc);
    return turn + fade;
  };

  const speedCounts = speedRanges.map(range => ({
    ...range,
    count: discs.filter(d => {
      const speed = getSpeed(d);
      return speed >= range.min && speed <= range.max;
    }).length
  }));

  const stabilityCounts = stabilityCategories.map(cat => ({
    ...cat,
    count: discs.filter(d => {
      const score = getStabilityScore(d);
      if (cat.min === -Infinity) {
        return score < cat.max;
      }
      if (cat.max === Infinity) {
        return score > cat.min;
      }
      return score >= cat.min && score < cat.max;
    }).length
  }));

  const maxSpeedCount = Math.max(...speedCounts.map(s => s.count), 1);
  const maxStabilityCount = Math.max(...stabilityCounts.map(s => s.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Speed-fordeling</h3>
        <div className="space-y-2">
          {speedCounts.map((range) => (
            <div key={range.label} className="flex items-center gap-3">
              <div className="w-16 text-xs text-slate-600 font-medium">
                {range.label}
              </div>
              <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                <div
                  className={`${range.color} h-full rounded-full transition-all duration-300 flex items-center justify-end px-2`}
                  style={{ width: `${(range.count / maxSpeedCount) * 100}%` }}
                >
                  {range.count > 0 && (
                    <span className="text-xs font-semibold text-white">
                      {range.count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-slate-500">
          Total: {discs.length} discs
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Stabilitets-fordeling</h3>
        <div className="space-y-2">
          {stabilityCounts.map((cat) => (
            <div key={cat.label} className="flex items-center gap-3">
              <div className="w-32 text-xs text-slate-600 font-medium">
                {cat.label}
              </div>
              <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                <div
                  className={`${cat.color} h-full rounded-full transition-all duration-300 flex items-center justify-end px-2`}
                  style={{ width: `${(cat.count / maxStabilityCount) * 100}%` }}
                >
                  {cat.count > 0 && (
                    <span className="text-xs font-semibold text-white">
                      {cat.count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Bag Balance</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-600">Speed-spænd</div>
            <div className="font-semibold text-slate-800">
              {Math.min(...discs.map(d => getSpeed(d)))} - {Math.max(...discs.map(d => getSpeed(d)))}
            </div>
          </div>
          <div>
            <div className="text-slate-600">Fordeling</div>
            <div className="font-semibold text-slate-800">
              {speedCounts.filter(s => s.count > 0).length} af 5 ranges
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
