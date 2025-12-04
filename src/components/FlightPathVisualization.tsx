import { useState, useEffect, useRef } from 'react';
import { Trash2, Save } from 'lucide-react';
import { Disc } from '../lib/database.types';
import { supabase } from '../lib/supabase';

interface FlightPathVisualizationProps {
  disc: Disc;
  releaseAngle: 'anhyzer' | 'flat' | 'hyzer';
  throwStyle: string;
  isLeftHanded: boolean;
}

interface Point {
  x: number;
  y: number;
}

export function FlightPathVisualization({
  disc,
  releaseAngle,
  throwStyle,
}: FlightPathVisualizationProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<SVGSVGElement>(null);

  const width = 800;
  const height = 600;
  const padding = 60;
  const maxDistance = 80; // meters
  const maxHeight = 120; // meters

  // Load existing flight path
  useEffect(() => {
    loadFlightPath();
  }, [disc.disc_id, throwStyle, releaseAngle]);

  const loadFlightPath = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_flight_paths')
        .select('path_data')
        .eq('disc_id', disc.disc_id)
        .eq('throw_style', throwStyle)
        .eq('release_angle', releaseAngle)
        .maybeSingle();

      if (error) throw error;

      if (data && data.path_data) {
        setPoints(data.path_data as Point[]);
      } else {
        setPoints([]);
      }
    } catch (error) {
      console.error('Error loading flight path:', error);
      setPoints([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFlightPath = async () => {
    if (points.length === 0) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('custom_flight_paths')
        .upsert({
          disc_id: disc.disc_id,
          throw_style: throwStyle,
          release_angle: releaseAngle,
          path_data: points,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'disc_id,throw_style,release_angle'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving flight path:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const clearPath = () => {
    if (confirm('Er du sikker på at du vil slette denne flight path?')) {
      setPoints([]);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel coordinates to meters
    const distanceMeters = ((x - padding) / (width - padding * 2)) * maxDistance;
    const heightMeters = ((height - padding - y) / (height - padding * 2)) * maxHeight;

    // Ensure values are within bounds
    if (distanceMeters >= 0 && distanceMeters <= maxDistance &&
        heightMeters >= 0 && heightMeters <= maxHeight) {
      setPoints([...points, { x: distanceMeters, y: heightMeters }]);
    }
  };

  const removePoint = (index: number) => {
    setPoints(points.filter((_, i) => i !== index));
  };

  // Convert meters to pixels
  const xScale = (meters: number) => padding + (meters / maxDistance) * (width - padding * 2);
  const yScale = (meters: number) => height - padding - (meters / maxHeight) * (height - padding * 2);

  // Create path data
  const pathData = points.length > 0
    ? points.map((p, i) => {
        const x = xScale(p.x);
        const y = yScale(p.y);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      }).join(' ')
    : '';

  // Generate grid lines
  const gridLines = [];

  // Vertical grid lines (distance)
  for (let i = 0; i <= maxDistance; i += 10) {
    const x = xScale(i);
    gridLines.push(
      <line
        key={`v-${i}`}
        x1={x}
        y1={padding}
        x2={x}
        y2={height - padding}
        stroke="#334155"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
    );
    gridLines.push(
      <text
        key={`t-x-${i}`}
        x={x}
        y={height - padding + 20}
        fontSize="11"
        fill="#94a3b8"
        textAnchor="middle"
      >
        {i}m
      </text>
    );
  }

  // Horizontal grid lines (height)
  for (let i = 0; i <= maxHeight; i += 10) {
    const y = yScale(i);
    gridLines.push(
      <line
        key={`h-${i}`}
        x1={padding}
        y1={y}
        x2={width - padding}
        y2={y}
        stroke="#334155"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
    );
    gridLines.push(
      <text
        key={`t-y-${i}`}
        x={padding - 10}
        y={y + 4}
        fontSize="11"
        fill="#94a3b8"
        textAnchor="end"
      >
        {i} m
      </text>
    );
  }

  // Axes
  gridLines.push(
    <line
      key="x-axis"
      x1={padding}
      y1={height - padding}
      x2={width - padding}
      y2={height - padding}
      stroke="#94a3b8"
      strokeWidth="2"
    />
  );
  gridLines.push(
    <line
      key="y-axis"
      x1={padding}
      y1={padding}
      x2={padding}
      y2={height - padding}
      stroke="#94a3b8"
      strokeWidth="2"
    />
  );

  const color = disc.color || '#f59e0b';

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="text-white text-center py-8">Indlæser...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">
          Flight Path Tegning - {disc.name}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={clearPath}
            disabled={points.length === 0}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Ryd
          </button>
          <button
            onClick={saveFlightPath}
            disabled={points.length === 0 || isSaving}
            className="px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Gemmer...' : 'Gem kurve'}
          </button>
        </div>
      </div>

      <div className="text-sm text-slate-300 mb-2">
        Klik på grafen for at tilføje punkter til flight path. Klik på et punkt for at fjerne det.
      </div>

      <svg
        ref={canvasRef}
        width={width}
        height={height}
        className="bg-slate-900 rounded cursor-crosshair"
        onClick={handleCanvasClick}
      >
        {gridLines}

        {/* Flight path */}
        {pathData && (
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={xScale(point.x)}
            cy={yScale(point.y)}
            r="6"
            fill={color}
            stroke="white"
            strokeWidth="2"
            className="cursor-pointer hover:r-8 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              removePoint(index);
            }}
          />
        ))}

        {/* Axis labels */}
        <text
          x={width / 2}
          y={height - 5}
          fontSize="13"
          fill="#94a3b8"
          textAnchor="middle"
          fontWeight="bold"
        >
          Distance (m)
        </text>
        <text
          x={20}
          y={height / 2}
          fontSize="13"
          fill="#94a3b8"
          textAnchor="middle"
          fontWeight="bold"
          transform={`rotate(-90 20 ${height / 2})`}
        >
          Højde (m)
        </text>
      </svg>

      {points.length > 0 && (
        <div className="mt-3 text-sm text-slate-300">
          {points.length} punkt{points.length !== 1 ? 'er' : ''} tegnet
        </div>
      )}
    </div>
  );
}
