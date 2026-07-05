import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check } from 'lucide-react';
import { AngleMode, Theme } from '../types';

interface DisplayProps {
  expression: string;
  result: string;
  previewResult: string;
  angleMode: AngleMode;
  memory: number;
  error: string | null;
  onCopy: () => void;
  theme: Theme;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  result,
  previewResult,
  angleMode,
  memory,
  error,
  onCopy,
  theme,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Theme configuration helper
  const isLight = theme === 'light';
  const isHC = theme === 'high-contrast';

  // Styles map
  const containerClass = isHC
    ? 'relative w-full rounded-2xl bg-black p-6 border-2 border-white flex flex-col justify-between overflow-hidden'
    : isLight
    ? 'relative w-full rounded-2xl bg-zinc-50 p-6 border border-zinc-200 shadow-sm flex flex-col justify-between overflow-hidden'
    : 'relative w-full rounded-2xl bg-zinc-950 p-6 shadow-inner border border-zinc-800 flex flex-col justify-between overflow-hidden';

  const glowClass = isHC
    ? 'absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/55 to-transparent'
    : isLight
    ? 'absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent'
    : 'absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent';

  const indicatorAngleClass = angleMode === 'deg'
    ? isHC
      ? 'bg-white text-black font-bold px-1.5 py-0.5 rounded border border-white'
      : isLight
      ? 'bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded border border-emerald-200'
      : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
    : isHC
    ? 'text-white/60 px-1.5 py-0.5'
    : isLight
    ? 'text-zinc-400 px-1.5 py-0.5'
    : 'text-zinc-600 px-1.5 py-0.5';

  const memoryBadgeClass = isHC
    ? 'px-1.5 py-0.5 rounded bg-black border border-white text-white font-bold animate-pulse'
    : isLight
    ? 'px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold animate-pulse'
    : 'px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-900/40 font-semibold animate-pulse';

  const copyBtnClass = `p-1.5 rounded-lg border transition-all duration-200 ${
    copied
      ? isHC
        ? 'bg-white text-black border-white'
        : isLight
        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
        : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
      : isHC
      ? 'text-white border-transparent hover:border-white'
      : isLight
      ? 'text-zinc-500 border-transparent hover:text-zinc-800 hover:bg-zinc-150'
      : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-900'
  } disabled:opacity-30 disabled:cursor-not-allowed`;

  const exprClass = `w-full text-lg md:text-xl font-medium font-mono min-h-[28px] overflow-x-auto whitespace-nowrap scrollbar-none select-all scroll-smooth ${
    isHC ? 'text-white font-bold' : isLight ? 'text-zinc-600' : 'text-zinc-400'
  }`;

  const exprPlaceholderClass = isHC ? 'text-zinc-600' : isLight ? 'text-zinc-300' : 'text-zinc-700';

  const resultTextClass = `text-3xl md:text-4xl font-bold font-mono tracking-tight ${
    isHC ? 'text-white font-black' : isLight ? 'text-zinc-900' : 'text-zinc-100'
  }`;

  const previewTextClass = `text-2xl font-mono ${
    isHC ? 'text-white/70 font-bold' : isLight ? 'text-zinc-400' : 'text-zinc-300'
  }`;

  const errorClass = `font-mono text-sm tracking-wide px-3 py-1 rounded-md border ${
    isHC
      ? 'text-white bg-black border-2 border-white'
      : isLight
      ? 'text-rose-600 bg-rose-50 border border-rose-200'
      : 'text-rose-500 bg-rose-950/20 border border-rose-900/30'
  }`;

  return (
    <div id="calculator-display-container" className={containerClass}>
      {/* Glow highlight */}
      <div className={glowClass} />
      
      {/* Top Indicators Row */}
      <div id="display-indicators" className={`flex items-center justify-between text-xs font-mono tracking-wider ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
        <div className="flex gap-2.5 items-center">
          <span className={`px-1.5 py-0.5 rounded transition-colors duration-200 ${indicatorAngleClass}`}>
            {angleMode.toUpperCase()}
          </span>
          {memory !== 0 && (
            <span className={memoryBadgeClass}>
              M
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            disabled={!result && !expression}
            className={copyBtnClass}
            title="Copy Expression / Result"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Expression / Output Display */}
      <div className="flex flex-col items-end justify-end mt-6 min-h-[90px] text-right break-all">
        {/* Expression string */}
        <div className={exprClass}>
          {expression || <span className={exprPlaceholderClass}>0</span>}
        </div>

        {/* Dynamic preview or exact answer */}
        <div className="w-full mt-2 min-h-[44px] flex items-center justify-end overflow-hidden">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={errorClass}
              >
                {error}
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, type: 'spring', damping: 15 }}
                className={resultTextClass}
              >
                {result}
              </motion.div>
            ) : previewResult ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLight ? 0.6 : 0.4 }}
                exit={{ opacity: 0 }}
                className={previewTextClass}
              >
                = {previewResult}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
