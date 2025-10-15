import { useRef, useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { LineShape } from '../types';
import { Point, analyzeLine } from '../utils/lineDetection';

interface LineSectionProps {
  shape: LineShape;
  curv: number;
  onLineChange: (shape: LineShape, curv: number) => void;
}

export function LineSection({ shape, curv, onLineChange }: LineSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }
  }, [points]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    setPoints([coords]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    setPoints((prev) => [...prev, coords]);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const analysis = analyzeLine(points);
    onLineChange(analysis.shape, analysis.curv);
  };

  const handlePreset = (preset: LineShape) => {
    setPoints([]);
    onLineChange(preset, preset === 'straight' ? 0 : 0.5);
  };

  const handleClear = () => {
    setPoints([]);
    onLineChange('straight', 0);
  };

  const getShapeText = () => {
    if (shape === 'straight') return 'Lige';
    if (shape === 'left') return `Venstre-kurve (${curv.toFixed(2)})`;
    return `Højre-kurve (${curv.toFixed(2)})`;
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-amber-600" />
        <h2 className="text-xl font-bold text-slate-800">Ønsket linje</h2>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        Tegn venstre→højre. Vi udleder retning og kurvemængde.
      </p>

      <div className="mb-4">
        <div className="relative bg-slate-50 rounded-lg overflow-hidden border-2 border-slate-200">
          <canvas
            ref={canvasRef}
            width={600}
            height={300}
            className="w-full touch-none cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-sm font-medium text-slate-700">
            Tolkning: {getShapeText()}
          </span>
          <button
            onClick={handleClear}
            className="text-sm text-slate-600 hover:text-slate-800 underline"
          >
            Ryd
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Presets
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handlePreset('straight')}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              shape === 'straight' && points.length === 0
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Lige
          </button>
          <button
            onClick={() => handlePreset('left')}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              shape === 'left' && points.length === 0
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Venstre-kurve
          </button>
          <button
            onClick={() => handlePreset('right')}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              shape === 'right' && points.length === 0
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Højre-kurve
          </button>
        </div>
      </div>
    </section>
  );
}
