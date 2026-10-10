import React, { useState } from 'react';
import { ArrowRightLeft, Calculator } from 'lucide-react';

interface UnitConverterProps {
  onSendToCalculator: (val: string) => void;
}

type UnitCategory = 'length' | 'mass' | 'temperature' | 'speed' | 'volume' | 'energy' | 'angle';

interface UnitDef {
  name: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

const UNIT_DATA: Record<UnitCategory, { label: string; units: Record<string, UnitDef> }> = {
  length: {
    label: 'Length & Distance',
    units: {
      m: { name: 'Meters', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
      km: { name: 'Kilometers', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      cm: { name: 'Centimeters', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      mm: { name: 'Millimeters', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      mi: { name: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      ft: { name: 'Feet', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      in: { name: 'Inches', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      ly: { name: 'Light Years', symbol: 'ly', toBase: (v) => v * 9.461e15, fromBase: (v) => v / 9.461e15 },
    },
  },
  mass: {
    label: 'Mass & Weight',
    units: {
      kg: { name: 'Kilograms', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
      g: { name: 'Grams', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      mg: { name: 'Milligrams', symbol: 'mg', toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
      lb: { name: 'Pounds', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
      oz: { name: 'Ounces', symbol: 'oz', toBase: (v) => v * 0.0283495231, fromBase: (v) => v / 0.0283495231 },
      tonne: { name: 'Metric Tonnes', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    },
  },
  temperature: {
    label: 'Temperature',
    units: {
      c: { name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
      f: { name: 'Fahrenheit', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      k: { name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    },
  },
  speed: {
    label: 'Velocity & Speed',
    units: {
      mps: { name: 'Meters / sec', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v },
      kph: { name: 'Kilometers / hr', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      mph: { name: 'Miles / hr', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      knot: { name: 'Knots', symbol: 'kn', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
      c: { name: 'Speed of Light', symbol: 'c', toBase: (v) => v * 299792458, fromBase: (v) => v / 299792458 },
    },
  },
  volume: {
    label: 'Volume',
    units: {
      l: { name: 'Liters', symbol: 'L', toBase: (v) => v, fromBase: (v) => v },
      ml: { name: 'Milliliters', symbol: 'mL', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      m3: { name: 'Cubic Meters', symbol: 'm³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      gal: { name: 'US Gallons', symbol: 'gal', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
      floz: { name: 'Fluid Ounces', symbol: 'fl oz', toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
    },
  },
  energy: {
    label: 'Energy & Work',
    units: {
      j: { name: 'Joules', symbol: 'J', toBase: (v) => v, fromBase: (v) => v },
      kj: { name: 'Kilojoules', symbol: 'kJ', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      cal: { name: 'Calories', symbol: 'cal', toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184 },
      kcal: { name: 'Kilocalories (Food)', symbol: 'kcal', toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
      wh: { name: 'Watt-hours', symbol: 'Wh', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      kwh: { name: 'Kilowatt-hours', symbol: 'kWh', toBase: (v) => v * 3.6e6, fromBase: (v) => v / 3.6e6 },
      ev: { name: 'Electronvolts', symbol: 'eV', toBase: (v) => v * 1.60218e-19, fromBase: (v) => v / 1.60218e-19 },
    },
  },
  angle: {
    label: 'Angles',
    units: {
      deg: { name: 'Degrees', symbol: '°', toBase: (v) => v, fromBase: (v) => v },
      rad: { name: 'Radians', symbol: 'rad', toBase: (v) => (v * 180) / Math.PI, fromBase: (v) => (v * Math.PI) / 180 },
      grad: { name: 'Gradians', symbol: 'grad', toBase: (v) => v * 0.9, fromBase: (v) => v / 0.9 },
    },
  },
};

export const UnitConverter: React.FC<UnitConverterProps> = ({ onSendToCalculator }) => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>('km');
  const [toUnit, setToUnit] = useState<string>('mi');

  const activeCategoryData = UNIT_DATA[category];

  // Calculate conversion
  const numericInput = parseFloat(inputValue);
  let convertedValue = '';

  if (!isNaN(numericInput)) {
    const fromDef = activeCategoryData.units[fromUnit] || Object.values(activeCategoryData.units)[0];
    const toDef = activeCategoryData.units[toUnit] || Object.values(activeCategoryData.units)[1];

    if (fromDef && toDef) {
      const baseVal = fromDef.toBase(numericInput);
      const targetVal = toDef.fromBase(baseVal);
      // Format targetVal cleanly
      if (Math.abs(targetVal) >= 1e9 || (Math.abs(targetVal) < 1e-4 && targetVal !== 0)) {
        convertedValue = targetVal.toExponential(6);
      } else {
        convertedValue = String(Math.round(targetVal * 1e8) / 1e8);
      }
    }
  }

  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    const unitKeys = Object.keys(UNIT_DATA[newCat].units);
    setFromUnit(unitKeys[0]);
    setToUnit(unitKeys[1] || unitKeys[0]);
  };

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-5">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(Object.keys(UNIT_DATA) as UnitCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              category === cat
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {UNIT_DATA[cat].label}
          </button>
        ))}
      </div>

      {/* Main Converter Card */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
        {/* Source Unit */}
        <div className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
          <label className="text-xs font-mono text-slate-400">From</label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-transparent font-mono text-2xl font-bold text-white focus:outline-none"
            placeholder="0"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            {Object.entries(activeCategoryData.units).map(([key, def]) => (
              <option key={key} value={key}>
                {def.name} ({def.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Swap button */}
        <div className="md:col-span-1 flex justify-center">
          <button
            onClick={handleSwap}
            className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Swap Units"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Target Unit */}
        <div className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
          <label className="text-xs font-mono text-slate-400">To</label>
          <div className="w-full font-mono text-2xl font-bold text-emerald-400 truncate select-all">
            {convertedValue || '0'}
          </div>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            {Object.entries(activeCategoryData.units).map(([key, def]) => (
              <option key={key} value={key}>
                {def.name} ({def.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Action */}
      {convertedValue && (
        <div className="flex justify-end pt-1">
          <button
            onClick={() => onSendToCalculator(convertedValue)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Send {convertedValue} to Calculator</span>
          </button>
        </div>
      )}
    </div>
  );
};
