import React, { useEffect, useState } from 'react';
import { X, Info, Sparkles, Binary, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { NumberInsights } from '../types/calculator';

interface NumberInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  numberValue: number | string;
}

export const NumberInsightsModal: React.FC<NumberInsightsModalProps> = ({
  isOpen,
  onClose,
  numberValue,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NumberInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && numberValue !== undefined && numberValue !== '' && numberValue !== 'Error') {
      fetchInsights();
    }
  }, [isOpen, numberValue]);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/number-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numberValue }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned ${res.status}`);
      }

      const json: NumberInsights = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to load number insights.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base sm:text-lg">
                Number Theory & Scientific Insights
              </h3>
              <p className="text-xs text-slate-400">
                Mathematical properties, binary representations, & scientific trivia
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

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Selected Value</span>
            <span className="font-mono text-2xl font-bold text-indigo-300">{String(numberValue)}</span>
          </div>

          {loading && (
            <div className="py-10 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-7 h-7 animate-spin text-indigo-400" />
              <p className="text-sm font-medium">Analyzing mathematical properties...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <span className="font-semibold block">Notice</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {data && !loading && (
            <>
              {/* Representations */}
              {data.representations && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Binary className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Radix & Symbolic Representations</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {data.representations.scientific && (
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 block mb-0.5">Scientific</span>
                        <span className="text-cyan-300 font-semibold">{data.representations.scientific}</span>
                      </div>
                    )}
                    {data.representations.fraction && (
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 block mb-0.5">Fraction</span>
                        <span className="text-amber-300 font-semibold">{data.representations.fraction}</span>
                      </div>
                    )}
                    {data.representations.binary && (
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 block mb-0.5">Binary (Base 2)</span>
                        <span className="text-slate-200 font-semibold truncate block">{data.representations.binary}</span>
                      </div>
                    )}
                    {data.representations.hexadecimal && (
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 block mb-0.5">Hex (Base 16)</span>
                        <span className="text-slate-200 font-semibold block">{data.representations.hexadecimal}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mathematical Properties */}
              {data.properties && data.properties.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Key Number Properties
                  </h4>
                  <div className="space-y-1.5">
                    {data.properties.map((prop, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center gap-2 text-xs sm:text-sm text-slate-200"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{prop}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scientific & Physics Trivia */}
              {data.scientificTrivia && (
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs sm:text-sm text-indigo-200">
                  <div className="flex items-center gap-1.5 font-semibold text-indigo-300 mb-1">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Scientific Connections & Trivia</span>
                  </div>
                  <p>{data.scientificTrivia}</p>
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
