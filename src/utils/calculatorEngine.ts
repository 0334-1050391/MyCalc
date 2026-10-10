import { create, all } from 'mathjs';
import { AngleMode } from '../types/calculator';

// Initialize mathjs instance
const math = create(all);

// Clean floating point artifacts (e.g. 1.2246467991473532e-16 -> 0, 0.49999999999999994 -> 0.5)
export function cleanFloat(val: number): number {
  if (Math.abs(val) < 1e-13) return 0;
  // Snap to 12 decimal places to eliminate IEEE 754 precision quirks
  const rounded = Number(Math.round(Number(val + 'e+12')) + 'e-12');
  return rounded;
}

// Convert degrees to radians and radians to degrees
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

export function evaluateExpression(rawExpr: string, angleMode: AngleMode): { result: string; numericValue?: number; error?: string } {
  if (!rawExpr || rawExpr.trim() === '') {
    return { result: '0', numericValue: 0 };
  }

  try {
    // 1. Normalize characters
    let expr = rawExpr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'pi')
      .replace(/√\(/g, 'sqrt(')
      .replace(/∛\(/g, 'cbrt(')
      .replace(/(\d+)%/g, '($1/100)')
      .replace(/%/g, '/100');

    // Handle implicit multiplication like 2pi or 5(3+2) or 4sqrt(9)
    expr = expr
      .replace(/(\d)\s*(pi|e|sqrt|cbrt|sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|ln|log)\b/g, '$1 * $2')
      .replace(/\)\s*(\d|\(|pi|e|sqrt|sin|cos|tan)/g, ') * $1')
      .replace(/(\d)\s*\(/g, '$1 * (');

    // Create execution scope with degree-aware trig functions
    const scope = {
      pi: Math.PI,
      e: Math.E,
      sin: (x: number) => cleanFloat(angleMode === 'DEG' ? Math.sin(toRad(x)) : Math.sin(x)),
      cos: (x: number) => cleanFloat(angleMode === 'DEG' ? Math.cos(toRad(x)) : Math.cos(x)),
      tan: (x: number) => {
        if (angleMode === 'DEG' && Math.abs(x % 180) === 90) {
          throw new Error('Undefined (tan of 90°)');
        }
        return cleanFloat(angleMode === 'DEG' ? Math.tan(toRad(x)) : Math.tan(x));
      },
      asin: (x: number) => {
        if (x < -1 || x > 1) throw new Error('Input out of domain [-1, 1]');
        const rad = Math.asin(x);
        return cleanFloat(angleMode === 'DEG' ? toDeg(rad) : rad);
      },
      acos: (x: number) => {
        if (x < -1 || x > 1) throw new Error('Input out of domain [-1, 1]');
        const rad = Math.acos(x);
        return cleanFloat(angleMode === 'DEG' ? toDeg(rad) : rad);
      },
      atan: (x: number) => {
        const rad = Math.atan(x);
        return cleanFloat(angleMode === 'DEG' ? toDeg(rad) : rad);
      },
      sinh: (x: number) => cleanFloat(Math.sinh(x)),
      cosh: (x: number) => cleanFloat(Math.cosh(x)),
      tanh: (x: number) => cleanFloat(Math.tanh(x)),
      asinh: (x: number) => cleanFloat(Math.asinh(x)),
      acosh: (x: number) => cleanFloat(Math.acosh(x)),
      atanh: (x: number) => cleanFloat(Math.atanh(x)),
      ln: (x: number) => {
        if (x <= 0) throw new Error('Input must be > 0');
        return cleanFloat(Math.log(x));
      },
      log: (x: number) => {
        if (x <= 0) throw new Error('Input must be > 0');
        return cleanFloat(Math.log10(x));
      },
      log10: (x: number) => {
        if (x <= 0) throw new Error('Input must be > 0');
        return cleanFloat(Math.log10(x));
      },
      log2: (x: number) => {
        if (x <= 0) throw new Error('Input must be > 0');
        return cleanFloat(Math.log2(x));
      },
      sqrt: (x: number) => {
        if (x < 0) throw new Error('Square root of negative number');
        return cleanFloat(Math.sqrt(x));
      },
      cbrt: (x: number) => cleanFloat(Math.cbrt(x)),
      fact: (x: number) => {
        if (x < 0 || !Number.isInteger(x)) throw new Error('Factorial requires non-negative integer');
        if (x > 170) throw new Error('Result exceeds maximum number');
        let res = 1;
        for (let i = 2; i <= x; i++) res *= i;
        return res;
      },
    };

    const evaluated = math.evaluate(expr, scope);

    if (evaluated === undefined || evaluated === null) {
      return { result: '0', numericValue: 0 };
    }

    // Handle complex numbers if any
    if (typeof evaluated === 'object' && 're' in evaluated && 'im' in evaluated) {
      const re = cleanFloat(evaluated.re);
      const im = cleanFloat(evaluated.im);
      if (im === 0) return { result: String(re), numericValue: re };
      return { result: `${re} + ${im}i` };
    }

    if (typeof evaluated === 'number') {
      if (isNaN(evaluated)) return { result: 'Error', error: 'Not a Number' };
      if (!isFinite(evaluated)) return { result: 'Infinity', error: 'Division by zero or overflow' };

      const clean = cleanFloat(evaluated);
      return {
        result: formatNumber(clean),
        numericValue: clean,
      };
    }

    return { result: String(evaluated) };
  } catch (err: any) {
    return {
      result: 'Error',
      error: err.message || 'Syntax error',
    };
  }
}

// Format number nicely with maximum 10 decimal precision without scientific explosion
export function formatNumber(num: number): string {
  if (Math.abs(num) === 0) return '0';
  if (Math.abs(num) >= 1e14 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return num.toExponential(6).replace('e+', 'e');
  }

  // Check if integer
  if (Number.isInteger(num)) {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  // Format decimal
  const parts = num.toString().split('.');
  const integerPart = Number(parts[0]).toLocaleString('en-US');
  let decimalPart = parts[1] || '';
  if (decimalPart.length > 8) {
    decimalPart = decimalPart.slice(0, 8).replace(/0+$/, '');
  }

  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
}

// Quick helper to insert brackets or functions properly
export function wrapWithFunction(currentExpr: string, funcName: string): string {
  if (!currentExpr || currentExpr === '0') {
    return `${funcName}(`;
  }
  return `${currentExpr}${funcName}(`;
}
