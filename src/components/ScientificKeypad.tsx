import React from 'react';

interface KeypadProps {
  onInsert: (value: string) => void;
  onClear: () => void;
  onEvaluate: () => void;
  onNegate: () => void;
  onMemoryAction: (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => void;
  isInverse: boolean;
  isHyp: boolean;
}

export const ScientificKeypad: React.FC<KeypadProps> = ({
  onInsert,
  onClear,
  onEvaluate,
  onNegate,
  onMemoryAction,
  isInverse,
  isHyp,
}) => {
  // Determine trigonometric button labels & insert payloads
  const getTrigDetails = (base: 'sin' | 'cos' | 'tan') => {
    let prefix: string = base;
    if (isHyp) prefix = `${base}h`;
    if (isInverse) prefix = `a${prefix}`;

    let label: string = base;
    if (isHyp && isInverse) {
      label = `${base}h⁻¹`;
    } else if (isInverse) {
      label = `${base}⁻¹`;
    } else if (isHyp) {
      label = `${base}h`;
    }

    return { label, payload: `${prefix}(` };
  };

  const sinDetails = getTrigDetails('sin');
  const cosDetails = getTrigDetails('cos');
  const tanDetails = getTrigDetails('tan');

  return (
    <div className="flex flex-col gap-3">
      {/* Memory Operation Ribbon */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        <button
          onClick={() => onMemoryAction('MC')}
          className="py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
        >
          MC
        </button>
        <button
          onClick={() => onMemoryAction('MR')}
          className="py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
        >
          MR
        </button>
        <button
          onClick={() => onMemoryAction('M+')}
          className="py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-indigo-400 hover:text-indigo-300 hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
        >
          M+
        </button>
        <button
          onClick={() => onMemoryAction('M-')}
          className="py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-indigo-400 hover:text-indigo-300 hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
        >
          M-
        </button>
        <button
          onClick={() => onMemoryAction('MS')}
          className="py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
        >
          MS
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Scientific Functions Grid (5 cols on md:col-span-5) */}
        <div className="md:col-span-6 grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2">
          {/* Row 1 */}
          <button
            onClick={() => onInsert(sinDetails.payload)}
            className="btn-sci"
          >
            {sinDetails.label}
          </button>
          <button
            onClick={() => onInsert(cosDetails.payload)}
            className="btn-sci"
          >
            {cosDetails.label}
          </button>
          <button
            onClick={() => onInsert(tanDetails.payload)}
            className="btn-sci"
          >
            {tanDetails.label}
          </button>
          <button
            onClick={() => onInsert('π')}
            className="btn-sci text-amber-300"
          >
            π
          </button>
          <button
            onClick={() => onInsert('e')}
            className="btn-sci text-amber-300 hidden sm:block"
          >
            e
          </button>

          {/* Row 2 */}
          <button
            onClick={() => onInsert(isInverse ? 'exp(' : 'ln(')}
            className="btn-sci"
          >
            {isInverse ? 'eˣ' : 'ln'}
          </button>
          <button
            onClick={() => onInsert(isInverse ? '10^(' : 'log(')}
            className="btn-sci"
          >
            {isInverse ? '10ˣ' : 'log'}
          </button>
          <button
            onClick={() => onInsert(isInverse ? '^3' : '^2')}
            className="btn-sci"
          >
            {isInverse ? 'x³' : 'x²'}
          </button>
          <button
            onClick={() => onInsert('^')}
            className="btn-sci"
          >
            xʸ
          </button>
          <button
            onClick={() => onInsert(isInverse ? '∛(' : '√(')}
            className="btn-sci hidden sm:block"
          >
            {isInverse ? '∛' : '√'}
          </button>

          {/* Row 3 */}
          <button
            onClick={() => onInsert('^(-1)')}
            className="btn-sci"
          >
            1/x
          </button>
          <button
            onClick={() => onInsert('abs(')}
            className="btn-sci"
          >
            |x|
          </button>
          <button
            onClick={() => onInsert('!')}
            className="btn-sci"
          >
            x!
          </button>
          <button
            onClick={() => onInsert('(')}
            className="btn-sci text-emerald-400 font-bold"
          >
            (
          </button>
          <button
            onClick={() => onInsert(')')}
            className="btn-sci text-emerald-400 font-bold hidden sm:block"
          >
            )
          </button>

          {/* Row 4 (additional scientific items) */}
          <button
            onClick={() => onInsert('cbrt(')}
            className="btn-sci sm:hidden"
          >
            ∛
          </button>
          <button
            onClick={() => onInsert('e')}
            className="btn-sci text-amber-300 sm:hidden"
          >
            e
          </button>
          <button
            onClick={() => onInsert(')')}
            className="btn-sci text-emerald-400 font-bold sm:hidden"
          >
            )
          </button>
        </div>

        {/* Primary Keypad (7 cols on md:col-span-6 / standard numbers) */}
        <div className="md:col-span-6 grid grid-cols-4 gap-1.5 sm:gap-2">
          {/* Row 1 */}
          <button
            onClick={onClear}
            className="py-3.5 sm:py-4 rounded-xl font-semibold text-sm sm:text-base bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-all cursor-pointer active:scale-95"
          >
            C
          </button>
          <button
            onClick={onNegate}
            className="btn-primary-fn"
          >
            ±
          </button>
          <button
            onClick={() => onInsert('%')}
            className="btn-primary-fn"
          >
            %
          </button>
          <button
            onClick={() => onInsert('÷')}
            className="btn-op"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => onInsert('7')}
            className="btn-num"
          >
            7
          </button>
          <button
            onClick={() => onInsert('8')}
            className="btn-num"
          >
            8
          </button>
          <button
            onClick={() => onInsert('9')}
            className="btn-num"
          >
            9
          </button>
          <button
            onClick={() => onInsert('×')}
            className="btn-op"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => onInsert('4')}
            className="btn-num"
          >
            4
          </button>
          <button
            onClick={() => onInsert('5')}
            className="btn-num"
          >
            5
          </button>
          <button
            onClick={() => onInsert('6')}
            className="btn-num"
          >
            6
          </button>
          <button
            onClick={() => onInsert('−')}
            className="btn-op"
          >
            −
          </button>

          {/* Row 4 */}
          <button
            onClick={() => onInsert('1')}
            className="btn-num"
          >
            1
          </button>
          <button
            onClick={() => onInsert('2')}
            className="btn-num"
          >
            2
          </button>
          <button
            onClick={() => onInsert('3')}
            className="btn-num"
          >
            3
          </button>
          <button
            onClick={() => onInsert('+')}
            className="btn-op"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => onInsert('0')}
            className="btn-num"
          >
            0
          </button>
          <button
            onClick={() => onInsert('.')}
            className="btn-num font-bold text-lg"
          >
            .
          </button>
          <button
            onClick={() => {
              const rand = Math.round(Math.random() * 1000) / 1000;
              onInsert(String(rand));
            }}
            className="py-3.5 sm:py-4 rounded-xl font-medium text-xs sm:text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer active:scale-95"
            title="Random number (0 to 1)"
          >
            Rand
          </button>
          <button
            onClick={onEvaluate}
            className="py-3.5 sm:py-4 rounded-xl font-bold text-lg sm:text-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 transition-all cursor-pointer active:scale-95"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};
