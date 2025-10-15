import { HandSide } from '../types';

interface ProfileSectionProps {
  side: HandSide | null;
  bh: boolean;
  fh: boolean;
  arm: number;
  onSideChange: (side: HandSide) => void;
  onBHChange: (enabled: boolean) => void;
  onFHChange: (enabled: boolean) => void;
  onArmChange: (arm: number) => void;
  onCopyLink: () => void;
  onReset: () => void;
  skipProfile: boolean;
}

export function ProfileSection({
  side,
  bh,
  fh,
  arm,
  onSideChange,
  onBHChange,
  onFHChange,
  onArmChange,
  onCopyLink,
  onReset,
  skipProfile,
}: ProfileSectionProps) {
  const handleBHToggle = () => {
    if (bh && !fh) return;
    onBHChange(!bh);
  };

  const handleFHToggle = () => {
    if (fh && !bh) return;
    onFHChange(!fh);
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Profil</h2>

      {!skipProfile && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Håndside
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => onSideChange('R')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  side === 'R'
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-pressed={side === 'R'}
              >
                Højrehåndet
              </button>
              <button
                onClick={() => onSideChange('L')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  side === 'L'
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-pressed={side === 'L'}
              >
                Venstrehåndet
              </button>
            </div>
          </div>

          {side && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kastetyper der indgår i råd
              </label>
              <div className="flex gap-3">
                <button
                  onClick={handleBHToggle}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    bh
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  } ${bh && !fh ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-pressed={bh}
                  disabled={bh && !fh}
                >
                  Backhand
                </button>
                <button
                  onClick={handleFHToggle}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    fh
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  } ${fh && !bh ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-pressed={fh}
                  disabled={fh && !bh}
                >
                  Forehand
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {side && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Arm-speed: {arm}
          </label>
          <div className="grid grid-cols-7 gap-2">
            {[8, 9, 10, 11, 12, 13, 14].map((speed) => (
              <button
                key={speed}
                onClick={() => onArmChange(speed)}
                className={`py-2 px-3 rounded-lg font-medium transition-all ${
                  arm === speed
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-pressed={arm === speed}
              >
                {speed}
              </button>
            ))}
          </div>
        </div>
      )}

      {side && (
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={onCopyLink}
            className="flex-1 bg-slate-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-700 transition-colors"
          >
            Kopier link
          </button>
          <button
            onClick={onReset}
            className="bg-slate-200 text-slate-700 py-3 px-4 rounded-lg font-medium hover:bg-slate-300 transition-colors"
          >
            Nulstil
          </button>
        </div>
      )}
    </section>
  );
}
