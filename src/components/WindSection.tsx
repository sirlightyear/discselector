import { Wind } from 'lucide-react';

interface WindSectionProps {
  wd: number | null;
  ws: number | null;
  onWindDirectionChange: (wd: number) => void;
  onWindSpeedChange: (ws: number) => void;
}

export function WindSection({
  wd,
  ws,
  onWindDirectionChange,
  onWindSpeedChange,
}: WindSectionProps) {
  const clockPositions = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const getClockPosition = (hour: number) => {
    const angle = (hour - 3) * 30;
    const rad = (angle * Math.PI) / 180;
    const centerX = 50;
    const centerY = 50;
    const radius = 35;
    const x = centerX + radius * Math.cos(rad);
    const y = centerY + radius * Math.sin(rad);
    return { x, y };
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Wind className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-slate-800">Vind</h2>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        12=modvind, 6=medvind, 3=højre→venstre, 9=venstre→højre
      </p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Vindretning (ur)
        </label>
        <div className="relative w-64 h-64 mx-auto">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            {clockPositions.map((hour) => {
              const pos = getClockPosition(hour);
              return (
                <g key={hour}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="8"
                    className={`cursor-pointer transition-all ${
                      wd === hour
                        ? 'fill-blue-600'
                        : 'fill-slate-200 hover:fill-slate-300'
                    }`}
                    onClick={() => onWindDirectionChange(hour)}
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-xs font-bold pointer-events-none ${
                      wd === hour ? 'fill-white' : 'fill-slate-700'
                    }`}
                  >
                    {hour}
                  </text>
                </g>
              );
            })}
            {wd !== null && (
              <circle cx="50" cy="50" r="3" fill="#3b82f6" />
            )}
          </svg>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Vindstyrke (m/s)
        </label>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 15 }, (_, i) => i + 1).map((speed) => (
            <button
              key={speed}
              onClick={() => onWindSpeedChange(speed)}
              className={`py-2 px-3 rounded-lg font-medium transition-all ${
                ws === speed
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              aria-pressed={ws === speed}
            >
              {speed}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
