import React, { useRef, useEffect } from 'react';
import { Sparkles, Copy, Check, Info, Delete, RotateCcw } from 'lucide-react';
import { AngleMode } from '../types/calculator';

interface CalculatorDisplayProps {
  expression: string;
  previewResult: string;
  hasEvaluated: boolean;
  angleMode: AngleMode;
  onToggleAngleMode: () => void;
  isInverse: boolean;
  onToggleInverse: () => void;
  isHyp: boolean;
  onToggleHyp: () => void;
  memory: number;
  onClear: () => void;
  onBackspace: () => void;
  onExplainAI: () => void;
  onShowInsights: () => void;
  onExpressionChange: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  expression,
  previewResult,
  hasEvaluated,
  angleMode,
  onToggleAngleMode,
  isInverse,
  onToggleInverse,
  isHyp,
  onToggleHyp,
  memory,
  onClear,
  onBackspace,
  onExplainAI,
  onShowInsights,
  onExpressionChange,
  onKeyDown,
}) => {
  const [copied, setCopied] = React.useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    const textToCopy = hasEvaluated ? previewResult : expression || previewResult;
    if (textToCopy && textToCopy !== 'Error') {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    // Focus input on load
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Subtle ambient glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Indicators & Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {/* Angle Mode Toggle */}
          <button
            onClick={onToggleAngleMode}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              angleMode === 'DEG'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            }`}
            title="Toggle Degrees / Radians"
          >
            {angleMode}
          </button>

          {/* 2nd / Inverse Toggle */}
          <button
            onClick={onToggleInverse}
            className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
              isInverse
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Inverse functions (2nd / INV)"
          >
            INV
          </button>

          {/* Hyperbolic Toggle */}
          <button
            onClick={onToggleHyp}
            className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
              isHyp
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Hyperbolic trigonometric functions"
          >
            HYP
          </button>

          {/* Memory Status Indicator */}
          {memory !== 0 && (
            <span
              className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold"
              title={`Memory Stored: ${memory}`}
            >
              M ({memory})
            </span>
          )}
        </div>

        {/* Quick Utility Icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
            title="Copy Result"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={onClear}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer"
            title="All Clear (AC)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>AC</span>
          </button>
        </div>
      </div>

      {/* Expression Input Area */}
      <div className="relative mb-2">
        <input
          ref={inputRef}
          type="text"
          value={expression}
          onChange={(e) => onExpressionChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="0"
          className="w-full bg-transparent text-right font-mono text-xl sm:text-2xl text-slate-200 placeholder-slate-600 focus:outline-none tracking-wide"
        />
      </div>

      {/* Live Preview / Evaluated Output */}
      <div className="flex items-baseline justify-end gap-2 text-right">
        {hasEvaluated ? (
          <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-sm select-all break-all">
            {previewResult}
          </div>
        ) : (
          <div className="font-mono text-2xl sm:text-3xl font-semibold text-emerald-400/90 break-all">
            = {previewResult}
          </div>
        )}
      </div>

      {/* AI Quick Actions Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onExplainAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all cursor-pointer shadow-sm hover:shadow-emerald-500/10"
            title="Break down math order of operations with Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Explain Steps (AI)</span>
          </button>

          <button
            onClick={onShowInsights}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
            title="View mathematical properties of this result"
          >
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>Number Insights</span>
          </button>
        </div>

        <button
          onClick={onBackspace}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer"
          title="Backspace / Delete Last Character"
        >
          <Delete className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
