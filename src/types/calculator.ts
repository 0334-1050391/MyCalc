export type AngleMode = 'DEG' | 'RAD';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  angleMode: AngleMode;
}

export interface AiProblemSolution {
  title: string;
  solution: string;
  numericValue?: number | null;
  formula?: string;
  summary: string;
  steps: Array<{
    title: string;
    explanation: string;
    mathExpression?: string;
  }>;
  keyConcepts?: string[];
}

export interface AiStepExplanation {
  expression: string;
  result: string;
  summary: string;
  orderOfOperations: string[];
  steps: Array<{
    stepNumber: number;
    description: string;
    subExpression?: string;
    subResult?: string;
  }>;
  verification: string;
}

export interface NumberInsights {
  value: string;
  isInteger: boolean;
  properties: string[];
  representations?: {
    scientific?: string;
    binary?: string;
    hexadecimal?: string;
    fraction?: string;
  };
  scientificTrivia: string;
}

export type CalculatorTab = 'calculator' | 'ai-solver' | 'grapher' | 'converter';
