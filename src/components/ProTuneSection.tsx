import { useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { ProTuneCoefficients } from '../types';
import { COEF_LIMITS, DEFAULT_COEFFICIENTS } from '../constants';

interface ProTuneSectionProps {
  coefficients: ProTuneCoefficients;
  onCoefficientsChange: (coef: ProTuneCoefficients) => void;
  onSave: () => void;
  onReset: () => void;
}

export function ProTuneSection({
  coefficients,
  onCoefficientsChange,
  onSave,
  onReset,
}: ProTuneSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: keyof ProTuneCoefficients, value: number) => {
    onCoefficientsChange({ ...coefficients, [key]: value });
  };

  const renderSlider = (
    key: keyof ProTuneCoefficients,
    label: string,
    description: string
  ) => {
    const limits = COEF_LIMITS[key];
    return (
      <div key={key} className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <span className="text-sm font-bold text-slate-800">
            {coefficients[key]}
          </span>
        </div>
        <input
          type="range"
          min={limits.min}
          max={limits.max}
          step={limits.step}
          value={coefficients[key]}
          onChange={(e) => handleChange(key, parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
    );
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-slate-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-600" />
          <h2 className="text-xl font-bold text-slate-800">Pro-tune (avanceret)</h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-600" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-6">
          <p className="text-sm text-slate-600 mb-6">
            Juster vægtning og grænser for algoritmen. Ændringer opdaterer resultatet i realtid.
          </p>

          <div className="space-y-1">
            {renderSlider(
              'headK',
              'headK',
              'Hvor meget mod-/medvind påvirker stabilitet'
            )}
            {renderSlider(
              'crossK',
              'crossK',
              'Hvor meget sidevind påvirker stabilitet'
            )}
            {renderSlider(
              'armK',
              'armK',
              'Hvor meget arm-speed påvirker stabilitet'
            )}
            {renderSlider(
              'curveK',
              'curveK',
              'Hvor meget ønsket kurve påvirker stabilitet'
            )}
            {renderSlider(
              'tPutter',
              'tPutter (m)',
              'Afstandsgrænse Putter→Midrange'
            )}
            {renderSlider(
              'tMid',
              'tMid (m)',
              'Afstandsgrænse Midrange→Fairway'
            )}
            {renderSlider(
              'tFairway',
              'tFairway (m)',
              'Afstandsgrænse Fairway→Driver'
            )}
            {renderSlider(
              'windStep1',
              'windStep1 (m/s)',
              'Første vindtrin for disc-type hop'
            )}
            {renderSlider(
              'windStep2',
              'windStep2 (m/s)',
              'Andet vindtrin for disc-type hop'
            )}
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button
              onClick={onSave}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Gem tuning
            </button>
            <button
              onClick={onReset}
              className="bg-slate-200 text-slate-700 py-3 px-4 rounded-lg font-medium hover:bg-slate-300 transition-colors"
            >
              Reset til standard
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
