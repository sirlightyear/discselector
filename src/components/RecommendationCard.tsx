import { Recommendation } from '../types';
import { DISC_TYPE_COLORS, STABILITY_COLORS } from '../constants';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const getStabilityPosition = (score: number): number => {
    return ((score + 1.5) / 3) * 100;
  };

  const position = getStabilityPosition(recommendation.stabilityScore);

  return (
    <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-600">
      <div className="mb-4">
        <span className="inline-block bg-slate-800 text-white px-3 py-1 rounded-full text-sm font-bold">
          {recommendation.label}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: DISC_TYPE_COLORS[recommendation.discType] }}
          />
          <span className="font-bold text-slate-800">{recommendation.discType}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium text-slate-700 mb-2">Stabilitet</div>
        <div className="text-base font-bold mb-2" style={{ color: STABILITY_COLORS[recommendation.stability] }}>
          {recommendation.stability}
        </div>
        <div className="relative h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full">
          <div
            className="absolute w-3 h-3 bg-white border-2 rounded-full transform -translate-y-0.5"
            style={{
              left: `${position}%`,
              borderColor: STABILITY_COLORS[recommendation.stability],
              transform: `translateX(-50%) translateY(-25%)`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>US</span>
          <span>OS</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium text-slate-700 mb-1">Release</div>
        <div className="text-base font-semibold text-slate-800">
          {recommendation.release}
        </div>
      </div>

      {recommendation.throwingPower && (
        <div className="mb-4">
          <div className="text-sm font-medium text-slate-700 mb-1">Anbefalet kastekraft</div>
          <div className="text-base font-semibold text-emerald-700">
            Speed {recommendation.throwingPower.recommendedSpeed}
          </div>
          {recommendation.throwingPower.warning && (
            <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded text-sm">
              {recommendation.throwingPower.warning}
            </div>
          )}
        </div>
      )}

      <div>
        <div className="text-sm font-medium text-slate-700 mb-2">Tips</div>
        <ul className="space-y-1">
          {recommendation.tips.map((tip, idx) => (
            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
