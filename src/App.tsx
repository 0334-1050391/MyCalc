import React, { useState, useEffect, useCallback } from 'react';
import {
  Calculator as CalcIcon,
  Sparkles,
  LineChart,
  ArrowRightLeft,
  Volume2,
  VolumeX,
  History,
  Zap,
} from 'lucide-react';
import { AngleMode, HistoryItem, CalculatorTab } from './types/calculator';
import { evaluateExpression } from './utils/calculatorEngine';
import { CalculatorDisplay } from './components/CalculatorDisplay';
import { ScientificKeypad } from './components/ScientificKeypad';
import { HistoryTape } from './components/HistoryTape';
import { AiProblemSolver } from './components/AiProblemSolver';
import { FunctionGrapher } from './components/FunctionGrapher';
import { UnitConverter } from './components/UnitConverter';
import { AiStepExplanationModal } from './components/AiStepExplanationModal';
import { NumberInsightsModal } from './components/NumberInsightsModal';

export default function App() {
  const [expression, setExpression] = useState<string>('');
  const [previewResult, setPreviewResult] = useState<string>('0');
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);
  const [numericValue, setNumericValue] = useState<number | undefined>(0);
  const [angleMode, setAngleMode] = useState<AngleMode>(() => {
    return (localStorage.getItem('omni_angle_mode') as AngleMode) || 'DEG';
  });
  const [isInverse, setIsInverse] = useState<boolean>(false);
  const [isHyp, setIsHyp] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('omni_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<CalculatorTab>('calculator');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState<boolean>(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState<boolean>(false);

  // Play subtle haptic/audio click using Web Audio API
  const playClickSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // Audio autoplay policy fallback
    }
  }, [soundEnabled]);

  // Persist angle mode and history
  useEffect(() => {
    localStorage.setItem('omni_angle_mode', angleMode);
  }, [angleMode]);

  useEffect(() => {
    localStorage.setItem('omni_history', JSON.stringify(history.slice(0, 50)));
  }, [history]);

  // Real-time evaluation effect whenever expression or angleMode changes
  useEffect(() => {
    if (!expression || expression.trim() === '') {
      setPreviewResult('0');
      setNumericValue(0);
      return;
    }

    const { result, numericValue: numVal, error } = evaluateExpression(expression, angleMode);
    if (!error) {
      setPreviewResult(result);
      setNumericValue(numVal);
    }
  }, [expression, angleMode]);

  // Handle inserting characters/tokens
  const handleInsert = (value: string) => {
    playClickSound();
    if (hasEvaluated) {
      // If user starts typing an operator right after evaluation, chain the previous result
      const isOperator = ['+', '−', '×', '÷', '^', '%'].includes(value);
      if (isOperator) {
        setExpression(previewResult + value);
      } else {
        setExpression(value);
      }
      setHasEvaluated(false);
    } else {
      setExpression((prev) => prev + value);
    }
  };

  // Handle clearing
  const handleClear = () => {
    playClickSound();
    setExpression('');
    setPreviewResult('0');
    setNumericValue(0);
    setHasEvaluated(false);
  };

  // Handle single backspace
  const handleBackspace = () => {
    playClickSound();
    if (hasEvaluated) {
      handleClear();
      return;
    }
    setExpression((prev) => {
      if (prev.length <= 1) return '';
      return prev.slice(0, -1);
    });
  };

  // Negate current expression / number
  const handleNegate = () => {
    playClickSound();
    if (!expression) {
      setExpression('-');
      return;
    }
    if (expression.startsWith('-(') && expression.endsWith(')')) {
      setExpression(expression.slice(2, -1));
    } else if (expression.startsWith('-')) {
      setExpression(expression.slice(1));
    } else {
      setExpression(`-(${expression})`);
    }
  };

  // Execute full evaluation (=)
  const handleEvaluate = () => {
    playClickSound();
    if (!expression || expression.trim() === '') return;

    const { result, numericValue: numVal, error } = evaluateExpression(expression, angleMode);
    if (error) {
      setPreviewResult(error);
      setHasEvaluated(true);
      return;
    }

    setPreviewResult(result);
    setNumericValue(numVal);
    setHasEvaluated(true);

    // Save to history ledger
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      expression,
      result,
      timestamp: Date.now(),
      angleMode,
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  // Memory actions
  const handleMemoryAction = (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    playClickSound();
    const currentNum = numericValue ?? (parseFloat(previewResult) || 0);

    switch (action) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        handleInsert(String(memory));
        break;
      case 'M+':
        setMemory((prev) => prev + currentNum);
        break;
      case 'M-':
        setMemory((prev) => prev - currentNum);
        break;
      case 'MS':
        setMemory(currentNum);
        break;
    }
  };

  // Keyboard handler for physical typing
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEvaluate();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClear();
    }
  };

  // Loading result back from AI solver or converter
  const handleSendToCalculator = (val: string) => {
    setActiveTab('calculator');
    setExpression(val);
    setHasEvaluated(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Application Header */}
      <header className="border-b border-slate-850 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <CalcIcon className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-white">
                  OmniCalc AI
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Scientific
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Precision Arithmetic & AI Mathematical Reasoning
              </p>
            </div>
          </div>

          {/* Quick Header Utilities */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title={soundEnabled ? 'Mute click audio' : 'Enable click audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
            </button>

            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-mono">
              <button
                onClick={() => setAngleMode('DEG')}
                className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  angleMode === 'DEG'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                DEG
              </button>
              <button
                onClick={() => setAngleMode('RAD')}
                className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  angleMode === 'RAD'
                    ? 'bg-indigo-500 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                RAD
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1.5">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <CalcIcon className="w-4 h-4 text-emerald-400" />
            <span>Scientific Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-solver')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ai-solver'
                ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>AI Problem Solver</span>
          </button>

          <button
            onClick={() => setActiveTab('grapher')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'grapher'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <LineChart className="w-4 h-4 text-cyan-400" />
            <span>Function Grapher</span>
          </button>

          <button
            onClick={() => setActiveTab('converter')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'converter'
                ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-amber-400" />
            <span>Unit Converter</span>
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* TAB 1: Scientific Calculator */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Calculator Column */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <CalculatorDisplay
                expression={expression}
                previewResult={previewResult}
                hasEvaluated={hasEvaluated}
                angleMode={angleMode}
                onToggleAngleMode={() => setAngleMode((m) => (m === 'DEG' ? 'RAD' : 'DEG'))}
                isInverse={isInverse}
                onToggleInverse={() => setIsInverse((inv) => !inv)}
                isHyp={isHyp}
                onToggleHyp={() => setIsHyp((h) => !h)}
                memory={memory}
                onClear={handleClear}
                onBackspace={handleBackspace}
                onExplainAI={() => setIsExplainModalOpen(true)}
                onShowInsights={() => setIsInsightsModalOpen(true)}
                onExpressionChange={(val) => {
                  setExpression(val);
                  setHasEvaluated(false);
                }}
                onKeyDown={handleKeyDown}
              />

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl">
                <ScientificKeypad
                  onInsert={handleInsert}
                  onClear={handleClear}
                  onEvaluate={handleEvaluate}
                  onNegate={handleNegate}
                  onMemoryAction={handleMemoryAction}
                  isInverse={isInverse}
                  isHyp={isHyp}
                />
              </div>
            </div>

            {/* Tape History Column */}
            <div className="lg:col-span-4 h-full">
              <HistoryTape
                history={history}
                onSelectResult={(res) => {
                  handleInsert(res);
                }}
                onSelectExpression={(expr) => {
                  setExpression(expr);
                  setHasEvaluated(false);
                }}
                onExplainAI={(item) => {
                  setExpression(item.expression);
                  setPreviewResult(item.result);
                  setIsExplainModalOpen(true);
                }}
                onClearHistory={() => setHistory([])}
              />
            </div>
          </div>
        )}

        {/* TAB 2: AI Problem Solver */}
        {activeTab === 'ai-solver' && (
          <AiProblemSolver
            angleMode={angleMode}
            onSendToCalculator={handleSendToCalculator}
          />
        )}

        {/* TAB 3: Function Grapher */}
        {activeTab === 'grapher' && <FunctionGrapher angleMode={angleMode} />}

        {/* TAB 4: Unit Converter */}
        {activeTab === 'converter' && (
          <UnitConverter onSendToCalculator={handleSendToCalculator} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>High-precision IEEE 754 float engine & trigonometric normalizer</span>
          </div>
          <div>
            Powered by Gemini 3.8 & MathJS · Client-side offline evaluation + AI STEM reasoning
          </div>
        </div>
      </footer>

      {/* AI Explanation Modal */}
      <AiStepExplanationModal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        expression={expression || previewResult}
        result={previewResult}
        angleMode={angleMode}
      />

      {/* Number Insights Modal */}
      <NumberInsightsModal
        isOpen={isInsightsModalOpen}
        onClose={() => setIsInsightsModalOpen(false)}
        numberValue={numericValue ?? previewResult}
      />
    </div>
  );
}
