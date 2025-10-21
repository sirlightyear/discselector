import { TrendingUp } from 'lucide-react';
import { LineShape } from '../types';

interface LineSectionProps {
  shape: LineShape;
  curv: number;
  onLineChange: (shape: LineShape, curv: number) => void;
}

type CurvePreset = {
  label: string;
  shape: LineShape;
  curv: number;
};

export function LineSection({ shape, curv, onLineChange }: LineSectionProps) {
  const presets: CurvePreset[] = [
    { label: 'Meget venstre', shape: 'left', curv: 1.0 },
    { label: 'Venstre', shape: 'left', curv: 0.7 },
    { label: 'Lidt venstre', shape: 'left', curv: 0.3 },
    { label: 'Lige', shape: 'straight', curv: 0 },
    { label: 'Lidt højre', shape: 'right', curv: 0.3 },
    { label: 'Højre', shape: 'right', curv: 0.7 },
    { label: 'Meget højre', shape: 'right', curv: 1.0 },
  ];

  const handlePreset = (preset: CurvePreset) => {
    onLineChange(preset.shape, preset.curv);
  };

  const isActive = (preset: CurvePreset) => {
    return shape === preset.shape && Math.abs(curv - preset.curv) < 0.1;
  };

  const getShapeText = () => {
    if (shape === 'straight') return 'Lige';
    if (shape === 'left') return `Venstre-kurve (${curv.toFixed(1)})`;
    return `Højre-kurve (${curv.toFixed(1)})`;
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-amber-600" />
        <h2 className="text-xl font-bold text-slate-800">Ønsket linje</h2>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        Vælg ønsket linje for dit kast
      </p>

      <div className="mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePreset(preset)}
              className={`py-3 px-2 rounded-lg font-medium transition-all text-sm ${
                isActive(preset)
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center py-2 bg-slate-50 rounded-lg">
        <span className="text-sm font-medium text-slate-700">
          Valgt: {getShapeText()}
        </span>
      </div>
    </section>
  );
}
