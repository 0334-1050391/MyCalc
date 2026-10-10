import React, { useEffect, useState } from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { AiStepExplanation, AngleMode } from '../types/calculator';

interface AiStepExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  expression: string;
  result: string;
  angleMode: AngleMode;
}

export const AiStepExplanationModal: React.FC<AiStepExplanationModalProps> = ({
  isOpen,
  onClose,
  expression,
  result,
  angleMode,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AiStepExplanation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && expression) {
      fetchExplanation();
    }
  }, [isOpen, expression, result]);

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/explain-expression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression, result, angleMode }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${res.status}`);
      }

      const json: AiStepExplanation = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to explain steps.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base sm:text-lg">
                Step-by-Step AI Math Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                Order of operations (PEMDAS/BODMAS) & arithmetic decomposition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Active Expression Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">
                Expression
              </span>
              <div className="font-mono text-base sm:text-lg font-semibold text-slate-200 break-all">
                {expression}
              </div>
            </div>
            <div className="sm:text-right shrink-0">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">
                Evaluated Result
              </span>
              <div className="font-mono text-xl sm:text-2xl font-bold text-emerald-400">
                = {result}
              </div>
            </div>
          </div>

          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-sm font-medium">Deconstructing formula with Gemini...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <span className="font-semibold block">Explanation Notice</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {data && !loading && (
            <>
              {/* Summary */}
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-sm">
                <span className="font-semibold block text-indigo-300 mb-0.5">Overview</span>
                {data.summary}
              </div>

              {/* Order of Operations rules applied */}
              {data.orderOfOperations && data.orderOfOperations.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Order of Operations Sequence
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.orderOfOperations.map((rule, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {rule}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Steps breakdown */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                  Chronological Calculations
                </h4>
                <div className="space-y-2.5">
                  {data.steps.map((st) => (
                    <div
                      key={st.stepNumber}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-mono font-bold">
                          {st.stepNumber}
                        </span>
                        <span className="text-sm font-semibold text-slate-200">
                          {st.description}
                        </span>
                      </div>
                      {(st.subExpression || st.subResult) && (
                        <div className="ml-7 flex items-center gap-2 font-mono text-xs sm:text-sm text-slate-300">
                          {st.subExpression && <span className="text-amber-300/90">{st.subExpression}</span>}
                          {st.subResult && (
                            <>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-emerald-400 font-bold">{st.subResult}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Arithmetic Verification */}
              {data.verification && (
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2.5 text-xs sm:text-sm text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{data.verification}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
