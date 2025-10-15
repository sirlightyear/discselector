import { Target } from 'lucide-react';

interface DistanceSectionProps {
  dist: number | null;
  onDistanceChange: (dist: number) => void;
}

export function DistanceSection({ dist, onDistanceChange }: DistanceSectionProps) {
  const distances = Array.from({ length: 13 }, (_, i) => 30 + i * 10);

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-emerald-600" />
        <h2 className="text-xl font-bold text-slate-800">Afstand</h2>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
        {distances.map((distance) => (
          <button
            key={distance}
            onClick={() => onDistanceChange(distance)}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              dist === distance
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            aria-pressed={dist === distance}
          >
            {distance}m
          </button>
        ))}
      </div>
    </section>
  );
}
