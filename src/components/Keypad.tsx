import React from 'react';
import { motion } from 'motion/react';
import { Delete, CornerDownLeft } from 'lucide-react';
import { CalculatorMode, Theme } from '../types';

interface KeypadProps {
  mode: CalculatorMode;
  onKeyPress: (value: string) => void;
  theme: Theme;
}

export const Keypad: React.FC<KeypadProps> = ({ mode, onKeyPress, theme }) => {
  // Common base
  const btnBase = "relative flex items-center justify-center font-mono text-sm md:text-base font-medium rounded-xl transition-all duration-150 h-11 md:h-14 focus:outline-none select-none overflow-hidden active:scale-95 border";

  // Theme checking
  const isLight = theme === 'light';
  const isHC = theme === 'high-contrast';

  // Digit Style Mapping
  const digitStyle = isHC
    ? `${btnBase} bg-black border-white border-2 text-white hover:bg-white hover:text-black hover:font-bold active:scale-90`
    : isLight
    ? `${btnBase} bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 active:bg-zinc-100`
    : `${btnBase} bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700 active:bg-zinc-700`;

  // Operator Style Mapping
  const operatorStyle = isHC
    ? `${btnBase} bg-black border-yellow-400 border-2 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold`
    : isLight
    ? `${btnBase} bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 active:bg-emerald-200 font-semibold`
    : `${btnBase} bg-zinc-800/40 border-zinc-800/50 text-emerald-400 hover:bg-emerald-950/20 hover:border-emerald-900/40 hover:text-emerald-300 active:bg-emerald-950/40`;

  // Equals button Style Mapping
  const equalsStyle = isHC
    ? `${btnBase} bg-emerald-500 border-white border-2 text-black hover:bg-emerald-400 font-black col-span-1`
    : isLight
    ? `${btnBase} bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 hover:border-emerald-400 active:bg-emerald-700 font-bold col-span-1 shadow-md shadow-emerald-100`
    : `${btnBase} bg-emerald-600 border-emerald-500 text-zinc-950 hover:bg-emerald-500 hover:border-emerald-400 active:bg-emerald-700 font-bold col-span-1 shadow-md shadow-emerald-950/20`;

  // Memory Panel buttons Style Mapping
  const memoryStyle = isHC
    ? `${btnBase} bg-black border-cyan-400 border text-cyan-400 font-bold hover:bg-cyan-400 hover:text-black text-xs md:text-xs tracking-wider`
    : isLight
    ? `${btnBase} bg-zinc-100 border-zinc-200 text-amber-600 hover:text-amber-700 hover:bg-zinc-150 text-xs md:text-xs font-semibold tracking-wider`
    : `${btnBase} bg-zinc-950 border-zinc-900 text-amber-500/80 hover:text-amber-400 hover:bg-zinc-900/60 text-xs md:text-xs font-semibold tracking-wider`;

  // Utility (backspace, etc) Style Mapping
  const utilStyle = isHC
    ? `${btnBase} bg-black border-white border text-white hover:bg-white hover:text-black`
    : isLight
    ? `${btnBase} bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200 active:bg-zinc-250`
    : `${btnBase} bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700 active:bg-zinc-600`;

  // Clear Button Style Mapping
  const clearStyle = isHC
    ? `${btnBase} bg-black border-red-500 border-2 text-red-500 hover:bg-red-500 hover:text-white font-bold`
    : isLight
    ? `${btnBase} bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100 active:bg-rose-200`
    : `${btnBase} bg-rose-950/20 border-rose-900/20 text-rose-400 hover:bg-rose-950/35 hover:border-rose-900/40 active:bg-rose-900/40`;

  // Scientific specific functions Style Mapping
  const sciStyle = isHC
    ? `${btnBase} bg-black border-indigo-400 border text-indigo-400 hover:bg-indigo-400 hover:text-black font-bold text-xs md:text-xs`
    : isLight
    ? `${btnBase} bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100 active:bg-indigo-200 text-xs md:text-xs font-semibold`
    : `${btnBase} bg-zinc-950 border-zinc-900/50 text-indigo-400 hover:bg-indigo-950/20 hover:border-indigo-900/30 hover:text-indigo-300 active:bg-indigo-950/40 text-xs md:text-xs font-semibold`;

  return (
    <div id="keypad-layout" className="flex flex-col gap-3">
      {/* Memory Panel: Always visible, subtle sizing */}
      <div id="memory-keypad-row" className="grid grid-cols-4 gap-2">
        <button id="btn-mc" onClick={() => onKeyPress('MC')} className={memoryStyle}>MC</button>
        <button id="btn-mr" onClick={() => onKeyPress('MR')} className={memoryStyle}>MR</button>
        <button id="btn-mplus" onClick={() => onKeyPress('M+')} className={memoryStyle}>M+</button>
        <button id="btn-mminus" onClick={() => onKeyPress('M-')} className={memoryStyle}>M-</button>
      </div>

      {/* Main Grid: Adapts based on mode (standard vs scientific) */}
      <div 
        id="keypad-grid-container" 
        className={`grid gap-2 transition-all duration-300 ${
          mode === 'scientific' 
            ? 'grid-cols-5 md:grid-cols-5' 
            : 'grid-cols-4'
        }`}
      >
        {/* SCIENTIFIC KEYS - Row/Col Placement (Visible only in scientific mode) */}
        {mode === 'scientific' && (
          <>
            {/* Scientific functions column blocks */}
            <button id="btn-sin" onClick={() => onKeyPress('sin(')} className={sciStyle}>sin</button>
            <button id="btn-cos" onClick={() => onKeyPress('cos(')} className={sciStyle}>cos</button>
            <button id="btn-tan" onClick={() => onKeyPress('tan(')} className={sciStyle}>tan</button>
            <button id="btn-deg-toggle" onClick={() => onKeyPress('ANGLE')} className={`${sciStyle} text-amber-500/85 hover:text-amber-400`}>Rad/Deg</button>
            <button id="btn-pi" onClick={() => onKeyPress('π')} className={sciStyle}>π</button>

            <button id="btn-asin" onClick={() => onKeyPress('asin(')} className={sciStyle}>asin</button>
            <button id="btn-acos" onClick={() => onKeyPress('acos(')} className={sciStyle}>acos</button>
            <button id="btn-atan" onClick={() => onKeyPress('atan(')} className={sciStyle}>atan</button>
            <button id="btn-e" onClick={() => onKeyPress('e')} className={sciStyle}>e</button>
            <button id="btn-pow" onClick={() => onKeyPress('^')} className={sciStyle}>xʸ</button>

            <button id="btn-sqrt" onClick={() => onKeyPress('sqrt(')} className={sciStyle}>√</button>
            <button id="btn-cbrt" onClick={() => onKeyPress('cbrt(')} className={sciStyle}>∛</button>
            <button id="btn-abs" onClick={() => onKeyPress('abs(')} className={sciStyle}>abs</button>
            <button id="btn-lparen" onClick={() => onKeyPress('(')} className={sciStyle}>(</button>
            <button id="btn-rparen" onClick={() => onKeyPress(')')} className={sciStyle}>)</button>

            <button id="btn-ln" onClick={() => onKeyPress('ln(')} className={sciStyle}>ln</button>
            <button id="btn-log" onClick={() => onKeyPress('log(')} className={sciStyle}>log</button>
            <button id="btn-exp" onClick={() => onKeyPress('exp(')} className={sciStyle}>eˣ</button>
            <button id="btn-pow10" onClick={() => onKeyPress('10^')} className={sciStyle}>10ˣ</button>
            <button id="btn-sqr" onClick={() => onKeyPress('^2')} className={sciStyle}>x²</button>
          </>
        )}

        {/* STANDARD KEYS */}
        {/* Row 1 */}
        <button id="btn-clear" onClick={() => onKeyPress('C')} className={`${clearStyle} font-bold`}>C</button>
        <button id="btn-backspace" onClick={() => onKeyPress('BACKSPACE')} className={utilStyle} aria-label="Backspace">
          <Delete className="w-4 h-4" />
        </button>
        <button id="btn-mod" onClick={() => onKeyPress('%')} className={operatorStyle}>%</button>
        <button id="btn-div" onClick={() => onKeyPress('÷')} className={operatorStyle}>÷</button>

        {/* Row 2 */}
        <button id="btn-7" onClick={() => onKeyPress('7')} className={digitStyle}>7</button>
        <button id="btn-8" onClick={() => onKeyPress('8')} className={digitStyle}>8</button>
        <button id="btn-9" onClick={() => onKeyPress('9')} className={digitStyle}>9</button>
        <button id="btn-mul" onClick={() => onKeyPress('×')} className={operatorStyle}>×</button>

        {/* Row 3 */}
        <button id="btn-4" onClick={() => onKeyPress('4')} className={digitStyle}>4</button>
        <button id="btn-5" onClick={() => onKeyPress('5')} className={digitStyle}>5</button>
        <button id="btn-6" onClick={() => onKeyPress('6')} className={digitStyle}>6</button>
        <button id="btn-sub" onClick={() => onKeyPress('−')} className={operatorStyle}>−</button>

        {/* Row 4 */}
        <button id="btn-1" onClick={() => onKeyPress('1')} className={digitStyle}>1</button>
        <button id="btn-2" onClick={() => onKeyPress('2')} className={digitStyle}>2</button>
        <button id="btn-3" onClick={() => onKeyPress('3')} className={digitStyle}>3</button>
        <button id="btn-add" onClick={() => onKeyPress('+')} className={operatorStyle}>+</button>

        {/* Row 5 */}
        <button id="btn-neg" onClick={() => onKeyPress('+/-')} className={digitStyle}>+/-</button>
        <button id="btn-0" onClick={() => onKeyPress('0')} className={digitStyle}>0</button>
        <button id="btn-dec" onClick={() => onKeyPress('.')} className={digitStyle}>.</button>
        <button id="btn-eq" onClick={() => onKeyPress('=')} className={equalsStyle} aria-label="Equals">
          <CornerDownLeft className="w-4 h-4 mx-auto" />
        </button>
      </div>
    </div>
  );
};
