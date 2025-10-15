import { Disc } from 'lucide-react';
import { Recommendation } from '../types';
import { RecommendationCard } from './RecommendationCard';

interface RecommendationsSectionProps {
  recommendations: Recommendation[];
}

export function RecommendationsSection({
  recommendations,
}: RecommendationsSectionProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Disc className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-800">Anbefalinger</h2>
      </div>

      <div
        className={`grid gap-4 ${
          recommendations.length > 1 ? 'md:grid-cols-2' : 'md:grid-cols-1'
        }`}
      >
        {recommendations.map((rec, idx) => (
          <RecommendationCard key={idx} recommendation={rec} />
        ))}
      </div>
    </section>
  );
}
