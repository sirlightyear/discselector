import { useState } from 'react';
import { X } from 'lucide-react';
import { Disc } from '../lib/database.types';
import { ThrowStyleSelector } from './ThrowStyleSelector';
import { FlightPathVisualization } from './FlightPathVisualization';

interface FlightPathModalProps {
  disc: Disc;
  isLeftHanded: boolean;
  onClose: () => void;
  onSave?: (throwStyle: string, releaseAngle: string) => void;
}

export function FlightPathModal({ disc, isLeftHanded, onClose }: FlightPathModalProps) {
  const [throwStyle, setThrowStyle] = useState<string>(
    disc.throw_style || 'backhand_standard'
  );
  const [releaseAngle, setReleaseAngle] = useState<'anhyzer' | 'flat' | 'hyzer'>(
    (disc.release_angle as 'anhyzer' | 'flat' | 'hyzer') || 'flat'
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Flight Path - {disc.name}
            </h2>
            <div className="text-sm text-slate-600">
              {disc.speed} | {disc.glide} | {disc.turn} | {disc.fade}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Kast indstillinger</h3>
            <ThrowStyleSelector
              throwStyle={throwStyle}
              releaseAngle={releaseAngle}
              onThrowStyleChange={setThrowStyle}
              onReleaseAngleChange={(angle) =>
                setReleaseAngle(angle as 'anhyzer' | 'flat' | 'hyzer')
              }
            />
          </div>

          <FlightPathVisualization
            disc={disc}
            releaseAngle={releaseAngle}
            throwStyle={throwStyle}
            isLeftHanded={isLeftHanded}
          />

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Luk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
