import React, { useState } from 'react';
import { Sparkles, ArrowRight, BookOpen, CheckCircle, Lightbulb, Calculator, AlertCircle, RefreshCw } from 'lucide-react';
import { AiProblemSolution, AngleMode } from '../types/calculator';

interface AiProblemSolverProps {
  angleMode: AngleMode;
  onSendToCalculator: (value: string) => void;
}

const PRESET_PROBLEMS = [
  {
    category: 'Physics',
    label: 'Acceleration & Distance',
    prompt: 'A sports car accelerates uniformly from 0 to 60 mph in 4.5 seconds. What is its acceleration in m/s² and total distance covered?',
  },
  {
    category: 'Finance',
    label: 'Monthly Loan Payment',
    prompt: 'Calculate the monthly payment for a $28,000 auto loan at 6.2% annual interest compounded monthly over 5 years.',
  },
  {
    category: 'Geometry',
    label: 'Cylinder Surface & Volume',
    prompt: 'Find the total surface area and volume of a cylinder with radius 4.5 cm and height 12 cm.',
  },
  {
    category: 'Algebra',
    label: 'Quadratic Roots',
    prompt: 'Solve the quadratic equation 3x^2 - 11x - 4 = 0 using the quadratic formula and explain the roots.',
  },
  {
    category: 'Trigonometry',
    label: 'Angle of Elevation',
    prompt: 'A surveyor stands 50 meters away from the base of a cell tower. The angle of elevation to the top is 38 degrees. What is the height of the tower?',
  },
  {
    category: 'Arithmetic',
    label: 'Compound Percentage',
    prompt: 'An investment portfolio of $15,000 grows by 12% in year one, drops 5% in year two, and gains 8% in year three. What is the final value and overall net percentage return?',
  },
];

export const AiProblemSolver: React.FC<AiProblemSolverProps> = ({
  angleMode,
  onSendToCalculator,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<AiProblemSolution | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSolve = async (customPrompt?: string) => {
    const textToSolve = customPrompt || prompt;
    if (!textToSolve.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSolve, angleMode }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server returned error (${res.status})`);
      }

      const data: AiProblemSolution = await res.json();
      setSolution(data);
    } catch (err: any) {
      setError(err.message || 'Failed to solve problem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header and prompt area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white">
                AI Scientific Problem Solver
              </h2>
              <p className="text-xs text-slate-400">
                Type any word problem, STEM query, physics formula, or arithmetic challenge
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            Mode: {angleMode}
          </span>
        </div>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSolve();
              }
            }}
            placeholder="e.g. A 50kg crate is pulled across a floor with 120N force at an angle of 30 degrees above horizontal. If friction is 25N, calculate work done over 15 meters."
            rows={3}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-sm sm:text-base text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all font-sans resize-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
          <span className="text-xs text-slate-500">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Ctrl+Enter</kbd> to solve
          </span>

          <button
            onClick={() => handleSolve()}
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Solving with Gemini...</span>
              </>
            ) : (
              <>
                <span>Solve Problem</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Problem Cards */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Preset Questions</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESET_PROBLEMS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(item.prompt);
                handleSolve(item.prompt);
              }}
              className="text-left p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-850 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider font-mono">
                  {item.category}
                </span>
                <span className="text-xs text-slate-500 group-hover:text-indigo-300">
                  Try &rarr;
                </span>
              </div>
              <div className="text-sm font-medium text-slate-200 group-hover:text-white mb-1">
                {item.label}
              </div>
              <div className="text-xs text-slate-400 line-clamp-2">
                {item.prompt}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <span className="font-semibold block">Solver Notice</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Solution Presentation */}
      {solution && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-5 animate-in fade-in duration-300">
          {/* Solution Top Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono font-medium text-indigo-400 uppercase tracking-wider">
                {solution.title}
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
                {solution.solution}
              </div>
              <p className="text-sm text-slate-300 mt-1">
                {solution.summary}
              </p>
            </div>

            {solution.numericValue !== undefined && solution.numericValue !== null && (
              <button
                onClick={() => onSendToCalculator(String(solution.numericValue))}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all cursor-pointer"
                title="Send raw number back to Calculator keypad"
              >
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Use {solution.numericValue} in Calculator</span>
              </button>
            )}
          </div>

          {/* Formula Card if available */}
          {solution.formula && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Primary Formula
                </span>
              </div>
              <div className="font-mono text-sm sm:text-base font-bold text-amber-300">
                {solution.formula}
              </div>
            </div>
          )}

          {/* Step-by-step derivation */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Step-by-Step Derivation</span>
            </h3>

            <div className="space-y-3">
              {solution.steps.map((st, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col gap-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-mono font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-200">
                      {st.title}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 pl-7">
                    {st.explanation}
                  </p>
                  {st.mathExpression && (
                    <div className="ml-7 mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto">
                      {st.mathExpression}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Key Concepts Pills */}
          {solution.keyConcepts && solution.keyConcepts.length > 0 && (
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Core Concepts:</span>
              {solution.keyConcepts.map((concept, cIdx) => (
                <span
                  key={cIdx}
                  className="px-2.5 py-1 rounded-lg text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  {concept}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
