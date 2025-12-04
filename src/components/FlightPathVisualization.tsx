import { useMemo } from 'react';
import { calculateFlightPath, FlightPathResult } from '../utils/flightPath';
import { Disc } from '../lib/database.types';

interface FlightPathVisualizationProps {
  disc: Disc;
  releaseAngle: 'anhyzer' | 'flat' | 'hyzer';
  throwStyle: string;
  isLeftHanded: boolean;
}

export function FlightPathVisualization({
  disc,
  releaseAngle,
  throwStyle,
  isLeftHanded,
}: FlightPathVisualizationProps) {
  const flightPath = useMemo(() => {
    return calculateFlightPath({
      speed: disc.speed,
      glide: disc.glide,
      turn: Number(disc.turn),
      fade: Number(disc.fade),
      releaseAngle,
      throwStyle,
      isLeftHanded,
    });
  }, [disc, releaseAngle, throwStyle, isLeftHanded]);

  return (
    <div className="space-y-6">
      <TopDownView flightPath={flightPath} discName={disc.name} discColor={disc.color} />
      <SideView flightPath={flightPath} discName={disc.name} />
      <FlightStats flightPath={flightPath} />
    </div>
  );
}

function TopDownView({
  flightPath,
  discName,
  discColor,
}: {
  flightPath: FlightPathResult;
  discName: string;
  discColor: string | null;
}) {
  const { points, maxDistance } = flightPath;

  const padding = 40;
  const width = 800;
  const height = 400;

  const maxLateral = Math.max(...points.map((p) => Math.abs(p.y)));
  const lateralRange = maxLateral * 2.2;

  const xScale = (x: number) => padding + (x / maxDistance) * (width - padding * 2);
  const yScale = (y: number) => height / 2 - (y / lateralRange) * (height - padding * 2);

  const pathData = points.map((p, i) => {
    const x = xScale(p.x);
    const y = yScale(p.y);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  const gridLines = [];
  for (let i = 0; i <= maxDistance; i += Math.ceil(maxDistance / 10)) {
    const x = xScale(i);
    gridLines.push(
      <line
        key={`v-${i}`}
        x1={x}
        y1={padding}
        x2={x}
        y2={height - padding}
        stroke="#e2e8f0"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
    );
    gridLines.push(
      <text
        key={`t-${i}`}
        x={x}
        y={height - padding + 20}
        fontSize="11"
        fill="#64748b"
        textAnchor="middle"
      >
        {i}m
      </text>
    );
  }

  const centerY = height / 2;
  gridLines.push(
    <line
      key="center"
      x1={padding}
      y1={centerY}
      x2={width - padding}
      y2={centerY}
      stroke="#94a3b8"
      strokeWidth="2"
    />
  );

  const color = discColor || '#3b82f6';

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-2">Top-down visning - {discName}</h3>
      <svg width={width} height={height} className="bg-slate-900 rounded">
        {gridLines}
        <path d={pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <circle
          cx={xScale(0)}
          cy={yScale(0)}
          r="6"
          fill="#10b981"
          stroke="white"
          strokeWidth="2"
        />
        <circle
          cx={xScale(points[points.length - 1].x)}
          cy={yScale(points[points.length - 1].y)}
          r="6"
          fill="#ef4444"
          stroke="white"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

function SideView({
  flightPath,
  discName,
}: {
  flightPath: FlightPathResult;
  discName: string;
}) {
  const { points, maxDistance, maxHeight } = flightPath;

  const padding = 40;
  const width = 800;
  const height = 300;

  const xScale = (x: number) => padding + (x / maxDistance) * (width - padding * 2);
  const yScale = (h: number) => height - padding - (h / (maxHeight * 1.2)) * (height - padding * 2);

  const pathData = points.map((p, i) => {
    const x = xScale(p.x);
    const y = yScale(p.height);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  const gridLines = [];
  for (let i = 0; i <= maxDistance; i += Math.ceil(maxDistance / 10)) {
    const x = xScale(i);
    gridLines.push(
      <line
        key={`v-${i}`}
        x1={x}
        y1={padding}
        x2={x}
        y2={height - padding}
        stroke="#e2e8f0"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
    );
  }

  const groundY = height - padding;
  gridLines.push(
    <line
      key="ground"
      x1={padding}
      y1={groundY}
      x2={width - padding}
      y2={groundY}
      stroke="#94a3b8"
      strokeWidth="2"
    />
  );

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-2">Sidevisning - {discName}</h3>
      <svg width={width} height={height} className="bg-slate-900 rounded">
        {gridLines}
        <path
          d={pathData}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle
          cx={xScale(0)}
          cy={yScale(points[0].height)}
          r="6"
          fill="#10b981"
          stroke="white"
          strokeWidth="2"
        />
        <circle
          cx={xScale(points[points.length - 1].x)}
          cy={yScale(points[points.length - 1].height)}
          r="6"
          fill="#ef4444"
          stroke="white"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

function FlightStats({ flightPath }: { flightPath: FlightPathResult }) {
  const { maxDistance, maxHeight } = flightPath;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
        <div className="text-sm opacity-90">Maks distance</div>
        <div className="text-3xl font-bold">{Math.round(maxDistance)}m</div>
      </div>
      <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white">
        <div className="text-sm opacity-90">Maks højde</div>
        <div className="text-3xl font-bold">{Math.round(maxHeight)}m</div>
      </div>
    </div>
  );
}
