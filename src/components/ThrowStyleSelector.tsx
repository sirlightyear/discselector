import { useState } from 'react';
import { Info } from 'lucide-react';
import {
  THROW_STYLE_CATEGORIES,
  RELEASE_ANGLES,
  getThrowStyleById,
} from '../constants/throwStyles';

interface ThrowStyleSelectorProps {
  throwStyle: string;
  releaseAngle: string;
  onThrowStyleChange: (style: string) => void;
  onReleaseAngleChange: (angle: string) => void;
}

export function ThrowStyleSelector({
  throwStyle,
  releaseAngle,
  onThrowStyleChange,
  onReleaseAngleChange,
}: ThrowStyleSelectorProps) {
  const [showDescription, setShowDescription] = useState(false);

  const selectedStyle = getThrowStyleById(throwStyle);
  const selectedCategory = THROW_STYLE_CATEGORIES.find((cat) =>
    cat.styles.some((s) => s.id === throwStyle)
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Kastestil
        </label>
        <div className="space-y-2">
          <select
            value={selectedCategory?.id || 'backhand'}
            onChange={(e) => {
              const category = THROW_STYLE_CATEGORIES.find(
                (c) => c.id === e.target.value
              );
              if (category && category.styles[0]) {
                onThrowStyleChange(category.styles[0].id);
              }
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {THROW_STYLE_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {selectedCategory && (
            <select
              value={throwStyle}
              onChange={(e) => onThrowStyleChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {selectedCategory.styles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedStyle && (
          <div className="mt-2">
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
            >
              <Info className="w-4 h-4" />
              {showDescription ? 'Skjul beskrivelse' : 'Vis beskrivelse'}
            </button>
            {showDescription && (
              <div className="mt-2 p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm text-slate-700">
                {selectedStyle.description}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Release vinkel
        </label>
        <div className="grid grid-cols-3 gap-2">
          {RELEASE_ANGLES.map((angle) => (
            <button
              key={angle.id}
              onClick={() => onReleaseAngleChange(angle.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                releaseAngle === angle.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {angle.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
