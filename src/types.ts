export type CalculatorMode = 'standard' | 'scientific' | 'converter';

export type AngleMode = 'rad' | 'deg';

export type Theme = 'dark' | 'light' | 'high-contrast';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface CalculatorState {
  displayValue: string; // The active input or expression displayed
  resultValue: string;  // The calculated result (or empty if in-progress)
  expression: string;   // The underlying math expression for evaluation
  history: HistoryItem[];
  mode: CalculatorMode;
  angleMode: AngleMode;
  memory: number;
}
