import React from 'react';
import { History, Trash2, ArrowUpRight, Sparkles, Download } from 'lucide-react';
import { HistoryItem } from '../types/calculator';

interface HistoryTapeProps {
  history: HistoryItem[];
  onSelectResult: (val: string) => void;
  onSelectExpression: (expr: string) => void;
  onExplainAI: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryTape: React.FC<HistoryTapeProps> = ({
  history,
  onSelectResult,
  onSelectExpression,
  onExplainAI,
  onClearHistory,
}) => {
  const exportHistory = () => {
    if (history.length === 0) return;
    const content = history
      .map(
        (h) =>
          `[${new Date(h.timestamp).toLocaleTimeString()}] (${h.angleMode}) ${h.expression} = ${h.result}`
      )
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OmniCalc_History_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col h-full max-h-[620px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          <h3 className="font-semibold text-white text-sm sm:text-base">
            Calculation Tape
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {history.length}
          </span>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={exportHistory}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
              title="Export History (.txt)"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClearHistory}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
              title="Clear all history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {history.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs text-center px-4">
            <History className="w-8 h-8 stroke-[1.5] mb-2 opacity-50" />
            <p>No calculations yet.</p>
            <p className="text-slate-600 mt-1">Calculations and arithmetic operations will appear on this tape.</p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all group flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                  {item.angleMode}
                </span>
              </div>

              {/* Expression */}
              <button
                onClick={() => onSelectExpression(item.expression)}
                className="text-left font-mono text-xs sm:text-sm text-slate-300 hover:text-indigo-300 transition-colors cursor-pointer truncate"
                title="Click to load expression into editor"
              >
                {item.expression}
              </button>

              {/* Result & Actions */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-850">
                <button
                  onClick={() => onSelectResult(item.result)}
                  className="font-mono text-base sm:text-lg font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1 group/res"
                  title="Click to insert result into calculation"
                >
                  <span>= {item.result}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover/res:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => onExplainAI(item)}
                  className="p-1 rounded text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all cursor-pointer text-xs flex items-center gap-1"
                  title="Explain steps with AI"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
