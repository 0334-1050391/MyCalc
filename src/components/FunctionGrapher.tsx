import React, { useState, useMemo, useRef } from 'react';
import { LineChart, ZoomIn, ZoomOut, RotateCcw, Crosshair } from 'lucide-react';
import { AngleMode } from '../types/calculator';
import { evaluateExpression } from '../utils/calculatorEngine';

interface FunctionGrapherProps {
  angleMode: AngleMode;
}

const PRESET_FUNCTIONS = [
  { label: 'sin(x)', expr: 'sin(x)' },
  { label: 'cos(x)', expr: 'cos(x)' },
  { label: 'tan(x)', expr: 'tan(x)' },
  { label: 'Parabola: x² - 4', expr: 'x^2 - 4' },
  { label: 'Cubic: x³ - 3x', expr: 'x^3 - 3*x' },
  { label: 'Square Root: √(x)', expr: 'sqrt(x)' },
  { label: 'Natural Log: ln(x)', expr: 'ln(x)' },
  { label: 'Exponential: 2ˣ', expr: '2^x' },
  { label: 'Hyperbola: 1/x', expr: '1/x' },
  { label: 'Damped Oscillation: exp(-0.2*x)*sin(2*x)', expr: 'exp(-0.2*x) * sin(2*x)' },
];

export const FunctionGrapher: React.FC<FunctionGrapherProps> = ({ angleMode }) => {
  const [funcExpr, setFuncExpr] = useState('sin(x)');
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-5);
  const [yMax, setYMax] = useState(5);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const width = 640;
  const height = 360;

  // Zoom helpers
  const handleZoom = (factor: number) => {
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;
    const xSpan = (xMax - xMin) * factor;
    const ySpan = (yMax - yMin) * factor;

    setXMin(Math.round((xCenter - xSpan / 2) * 10) / 10);
    setXMax(Math.round((xCenter + xSpan / 2) * 10) / 10);
    setYMin(Math.round((yCenter - ySpan / 2) * 10) / 10);
    setYMax(Math.round((yCenter + ySpan / 2) * 10) / 10);
  };

  const handleReset = () => {
    setXMin(-10);
    setXMax(10);
    setYMin(-5);
    setYMax(5);
  };

  // Convert math coordinate (x, y) to SVG screen coordinates (px, py)
  const toScreenX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
  const toScreenY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

  // Generate plot points
  const { pathData, pointsCount } = useMemo(() => {
    const steps = 300;
    const stepSize = (xMax - xMin) / steps;
    const points: Array<[number, number]> = [];

    for (let i = 0; i <= steps; i++) {
      const xVal = xMin + i * stepSize;
      // Substitute x into function
      const substituted = funcExpr.replace(/\bx\b/g, `(${xVal})`);
      const { numericValue, error } = evaluateExpression(substituted, angleMode);

      if (!error && numericValue !== undefined && isFinite(numericValue)) {
        if (numericValue >= yMin - 10 && numericValue <= yMax + 10) {
          points.push([toScreenX(xVal), toScreenY(numericValue)]);
        }
      }
    }

    if (points.length === 0) return { pathData: '', pointsCount: 0 };

    // Build SVG path
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      // Avoid vertical jumps (e.g. asymptotes like 1/x or tan(x))
      const prevY = points[i - 1][1];
      const curY = points[i][1];
      if (Math.abs(curY - prevY) > height * 0.8) {
        d += ` M ${points[i][0]} ${points[i][1]}`;
      } else {
        d += ` L ${points[i][0]} ${points[i][1]}`;
      }
    }

    return { pathData: d, pointsCount: points.length };
  }, [funcExpr, xMin, xMax, yMin, yMax, angleMode]);

  // Handle mouse hover for inspector
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const mathX = xMin + (screenX / rect.width) * (xMax - xMin);
    const substituted = funcExpr.replace(/\bx\b/g, `(${mathX})`);
    const { numericValue } = evaluateExpression(substituted, angleMode);

    if (numericValue !== undefined && isFinite(numericValue)) {
      setMousePos({ x: Math.round(mathX * 100) / 100, y: Math.round(numericValue * 100) / 100 });
    } else {
      setMousePos(null);
    }
  };

  // Generate grid ticks
  const originX = toScreenX(0);
  const originY = toScreenY(0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <LineChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">
              2D Scientific Function Grapher
            </h3>
            <p className="text-xs text-slate-400">
              Interactive coordinate visualizer with real-time curve rendering
            </p>
          </div>
        </div>

        {/* Zoom & Reset Tools */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => handleZoom(0.75)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(1.33)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Function Input & Presets */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
          <span className="font-mono text-cyan-400 font-bold text-sm">f(x) =</span>
          <input
            type="text"
            value={funcExpr}
            onChange={(e) => setFuncExpr(e.target.value)}
            placeholder="e.g. sin(x) or x^2 - 4"
            className="w-full bg-transparent font-mono text-sm sm:text-base text-slate-200 focus:outline-none"
          />
        </div>

        <div className="md:col-span-4">
          <select
            onChange={(e) => setFuncExpr(e.target.value)}
            value={funcExpr}
            className="w-full h-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="" disabled>Select Preset Function</option>
            {PRESET_FUNCTIONS.map((p, idx) => (
              <option key={idx} value={p.expr}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div className="relative rounded-xl bg-slate-950 border border-slate-800/90 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair select-none block"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMousePos(null)}
        >
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Coordinate Axes */}
          {originY >= 0 && originY <= height && (
            <line
              x1="0"
              y1={originY}
              x2={width}
              y2={originY}
              stroke="rgba(148, 163, 184, 0.5)"
              strokeWidth="1.5"
            />
          )}
          {originX >= 0 && originX <= width && (
            <line
              x1={originX}
              y1="0"
              x2={originX}
              y2={height}
              stroke="rgba(148, 163, 184, 0.5)"
              strokeWidth="1.5"
            />
          )}

          {/* Plotted Function Curve */}
          {pathData && (
            <path
              d={pathData}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Mouse Inspector Dot */}
          {mousePos && (
            <circle
              cx={toScreenX(mousePos.x)}
              cy={toScreenY(mousePos.y)}
              r="4.5"
              fill="#22c55e"
              stroke="#ffffff"
              strokeWidth="2"
            />
          )}
        </svg>

        {/* Coordinate Readout Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 backdrop-blur-md text-xs font-mono">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          {mousePos ? (
            <span className="text-slate-200">
              x: <strong className="text-cyan-400">{mousePos.x}</strong>, y:{' '}
              <strong className="text-emerald-400">{mousePos.y}</strong>
            </span>
          ) : (
            <span className="text-slate-500">Hover graph to inspect (x, y)</span>
          )}
        </div>

        {/* Domain labels */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
          x: [{xMin}, {xMax}] · y: [{yMin}, {yMax}]
        </div>
      </div>
    </div>
  );
};
