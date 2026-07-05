import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  Clock, 
  HelpCircle, 
  Moon, 
  Sun, 
  Info, 
  Delete, 
  Sparkles, 
  Globe, 
  Maximize2, 
  Minimize2,
  Check,
  Copy,
  Terminal,
  Bookmark,
  Contrast
} from 'lucide-react';
import { CalculatorMode, AngleMode, HistoryItem, Theme } from './types';
import { evaluateExpression, formatResult } from './utils/parser';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';
import { HistoryPanel } from './components/HistoryPanel';
import { UnitConverter } from './components/UnitConverter';

export default function App() {
  // State Initialization from localStorage or defaults
  const [expression, setExpression] = useState<string>(() => {
    return localStorage.getItem('calc_expression') || '';
  });
  const [result, setResult] = useState<string>('');
  const [previewResult, setPreviewResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('calc_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [mode, setMode] = useState<CalculatorMode>(() => {
    return (localStorage.getItem('calc_mode') as CalculatorMode) || 'standard';
  });
  
  const [angleMode, setAngleMode] = useState<AngleMode>(() => {
    return (localStorage.getItem('calc_angle_mode') as AngleMode) || 'deg';
  });
  
  const [memory, setMemory] = useState<number>(() => {
    const saved = localStorage.getItem('calc_memory');
    return saved ? parseFloat(saved) : 0;
  });

  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('calc_theme') as Theme) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('calc_theme', theme);
  }, [theme]);

  // Synced storage updates
  useEffect(() => {
    localStorage.setItem('calc_expression', expression);
  }, [expression]);

  useEffect(() => {
    localStorage.setItem('calc_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('calc_mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('calc_angle_mode', angleMode);
  }, [angleMode]);

  useEffect(() => {
    localStorage.setItem('calc_memory', memory.toString());
  }, [memory]);

  // Real-time background evaluation
  useEffect(() => {
    if (!expression || expression.trim() === '') {
      setPreviewResult('');
      setError(null);
      return;
    }

    // Don't show preview if the expression is just a raw number
    if (/^\d+(\.\d+)?$/.test(expression.trim())) {
      setPreviewResult('');
      setError(null);
      return;
    }

    // Try evaluating in the background
    try {
      // If ends with an operator, evaluate the prefix
      let sanitizedExpr = expression;
      const lastChar = expression.slice(-1);
      if (['+', '−', '×', '÷', '^', '%'].includes(lastChar)) {
        sanitizedExpr = expression.slice(0, -1);
      }

      // Check parentheses balance to prevent half-finished expression evaluation errors
      let openParenCount = (sanitizedExpr.match(/\(/g) || []).length;
      let closeParenCount = (sanitizedExpr.match(/\)/g) || []).length;
      while (openParenCount > closeParenCount) {
        sanitizedExpr += ')';
        closeParenCount++;
      }

      const evalVal = evaluateExpression(sanitizedExpr, angleMode);
      setPreviewResult(formatResult(evalVal));
      setError(null);
    } catch {
      // Fail silently in real-time preview to avoid flashing errors while user is typing
      setPreviewResult('');
    }
  }, [expression, angleMode]);

  // Handle all inputs
  const handleInput = (val: string) => {
    setError(null);

    // If there's an existing result and user starts typing numbers, start fresh.
    // If they type an operator, append to the result!
    const isNewDigit = /^[0-9πe(]$/.test(val) || val.startsWith('sin') || val.startsWith('cos') || val.startsWith('tan') || val.startsWith('asin') || val.startsWith('acos') || val.startsWith('atan') || val.startsWith('ln') || val.startsWith('log') || val.startsWith('sqrt') || val.startsWith('cbrt') || val.startsWith('abs') || val.startsWith('exp');
    
    let currentExpression = expression;
    if (result && !error) {
      if (isNewDigit) {
        currentExpression = '';
      } else if (['+', '−', '×', '÷', '^', '%'].includes(val)) {
        currentExpression = result;
      }
      setResult('');
    }

    // Memory operations
    if (val === 'MC') {
      setMemory(0);
      return;
    }
    if (val === 'MR') {
      if (memory !== 0) {
        const memStr = formatResult(memory);
        setExpression(currentExpression + memStr);
      }
      return;
    }
    if (val === 'M+') {
      try {
        const target = result || expression;
        if (!target) return;
        const evalVal = evaluateExpression(target, angleMode);
        setMemory(prev => prev + evalVal);
        triggerToast('Added to Memory');
      } catch (err: any) {
        setError(err.message || 'Calculation error');
      }
      return;
    }
    if (val === 'M-') {
      try {
        const target = result || expression;
        if (!target) return;
        const evalVal = evaluateExpression(target, angleMode);
        setMemory(prev => prev - evalVal);
        triggerToast('Subtracted from Memory');
      } catch (err: any) {
        setError(err.message || 'Calculation error');
      }
      return;
    }

    // Rad / Deg toggle action
    if (val === 'ANGLE') {
      setAngleMode(prev => prev === 'deg' ? 'rad' : 'deg');
      return;
    }

    // Clear operation
    if (val === 'C') {
      setExpression('');
      setResult('');
      setPreviewResult('');
      setError(null);
      return;
    }

    // Backspace operation
    if (val === 'BACKSPACE') {
      if (currentExpression.length === 0) return;

      // Smart backspace for functions (e.g. backspace "sin(" removes the entire word "sin(")
      const functionList = [
        'sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(', 
        'ln(', 'log(', 'sqrt(', 'cbrt(', 'abs(', 'exp('
      ];
      
      let matchedFunction = '';
      for (const func of functionList) {
        if (currentExpression.endsWith(func)) {
          matchedFunction = func;
          break;
        }
      }

      if (matchedFunction) {
        setExpression(currentExpression.slice(0, -matchedFunction.length));
      } else {
        setExpression(currentExpression.slice(0, -1));
      }
      return;
    }

    // Decimal placement safety
    if (val === '.') {
      // Find the last token in the expression
      const lastToken = currentExpression.split(/[\+\−\×\÷\^%\(\)]/).pop() || '';
      if (lastToken.includes('.')) {
        return; // Prevent double decimals in a single number block
      }
      setExpression(currentExpression + '.');
      return;
    }

    // Negation toggle (+/-)
    if (val === '+/-') {
      if (currentExpression === '') return;
      
      // If there's an active result, negate that result
      if (result) {
        if (result.startsWith('-')) {
          setResult(result.slice(1));
        } else {
          setResult('-' + result);
        }
        return;
      }

      // Otherwise, negate the last number segment or wrap with parenthesis
      const tokens = currentExpression.split(/([\+\−\×\÷\^%()])/);
      const lastToken = tokens[tokens.length - 1];
      
      if (/^\d+(\.\d+)?$/.test(lastToken)) {
        // Negate a simple trailing number
        tokens[tokens.length - 1] = `(-${lastToken})`;
        setExpression(tokens.join(''));
      } else if (currentExpression.startsWith('(-') && currentExpression.endsWith(')')) {
        // Strip parenthesized negation if applied to whole
        setExpression(currentExpression.slice(2, -1));
      } else {
        // Wrap entire expression with negation parenthesization
        setExpression(`(-(${currentExpression}))`);
      }
      return;
    }

    // Equals evaluation
    if (val === '=') {
      if (!currentExpression || currentExpression.trim() === '') return;
      
      try {
        const evalVal = evaluateExpression(currentExpression, angleMode);
        const formatted = formatResult(evalVal);
        
        setResult(formatted);
        setError(null);
        
        // Save to History
        const newItem: HistoryItem = {
          id: Math.random().toString(36).substring(2, 9),
          expression: currentExpression,
          result: formatted,
          timestamp: Date.now(),
        };
        setHistory(prev => [newItem, ...prev].slice(0, 50)); // Cap at 50 items
      } catch (err: any) {
        setError(err.message || 'Syntax Error');
        setResult('');
      }
      return;
    }

    // Smart operator replacement:
    // If last char is an operator and we enter another operator, swap them.
    const operators = ['+', '−', '×', '÷', '^', '%'];
    const lastChar = currentExpression.slice(-1);
    
    if (operators.includes(val)) {
      if (currentExpression === '' && val !== '−') {
        // Prepend 0 if starting with an operator other than minus
        setExpression('0' + val);
        return;
      }
      if (operators.includes(lastChar)) {
        // Replace last operator
        setExpression(currentExpression.slice(0, -1) + val);
        return;
      }
    }

    // Standard append
    setExpression(currentExpression + val);
  };

  // Toast message simulation helper
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Keyboard support listener
  useEffect(() => {
    if (mode === 'converter') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser default search or scroll shortcuts for mapped keys
      const key = e.key;
      
      if (key === 'Enter') {
        e.preventDefault();
        handleInput('=');
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleInput('BACKSPACE');
      } else if (key === 'Escape') {
        e.preventDefault();
        handleInput('C');
      } else if (key === '*') {
        e.preventDefault();
        handleInput('×');
      } else if (key === '/') {
        e.preventDefault();
        handleInput('÷');
      } else if (key === '-') {
        e.preventDefault();
        handleInput('−');
      } else if ('0123456789+.%^()'.includes(key)) {
        e.preventDefault();
        handleInput(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [expression, result, angleMode, memory, mode]);

  // Copy full result to clipboard
  const copyToClipboard = () => {
    const valueToCopy = result || expression || '0';
    navigator.clipboard.writeText(valueToCopy);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const isLight = theme === 'light';
  const isHC = theme === 'high-contrast';

  const rootClass = isHC
    ? 'min-h-screen bg-black text-white flex flex-col justify-between p-4 md:p-6 lg:p-8 antialiased font-sans selection:bg-white selection:text-black relative'
    : isLight
    ? 'min-h-screen bg-zinc-100 text-zinc-800 flex flex-col justify-between p-4 md:p-6 lg:p-8 antialiased font-sans selection:bg-emerald-100 selection:text-emerald-800 relative'
    : 'min-h-screen bg-zinc-900 text-zinc-100 flex flex-col justify-between p-4 md:p-6 lg:p-8 antialiased font-sans selection:bg-emerald-500/25 selection:text-emerald-300 relative';

  const headerBarClass = isHC
    ? 'flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-white pb-4'
    : isLight
    ? 'flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-200 pb-4'
    : 'flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800/80 pb-4';

  const brandingTitleClass = `text-lg font-bold font-mono tracking-tight ${
    isHC ? 'text-white' : isLight ? 'text-zinc-900' : 'text-zinc-100'
  }`;

  const versionBadgeClass = `text-[10px] font-mono px-1.5 py-0.5 rounded border ${
    isHC
      ? 'bg-black text-white border-white'
      : isLight
      ? 'bg-zinc-200 text-zinc-600 border-zinc-300'
      : 'bg-zinc-800 text-zinc-400 border-zinc-700/50'
  }`;

  const brandingSubClass = `text-[11px] font-mono ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`;

  const modeSelectorClass = isHC
    ? 'bg-black p-1 rounded-xl border-2 border-white flex items-center gap-1'
    : isLight
    ? 'bg-zinc-200/60 p-1 rounded-xl border border-zinc-200/80 flex items-center gap-1'
    : 'bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 flex items-center gap-1';

  const modeBtnClass = (modeVal: CalculatorMode, activeColor: string) => {
    const isActive = mode === modeVal;
    if (isActive) {
      if (isHC) return 'px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white text-black border border-white shadow-sm';
      if (isLight) return `px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white border border-zinc-200 shadow-sm ${activeColor}`;
      return `px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-zinc-800 border border-zinc-700/50 shadow-sm ${activeColor}`;
    } else {
      if (isHC) return 'px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-white hover:underline';
      if (isLight) return 'px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-zinc-500 hover:text-zinc-850';
      return 'px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-zinc-500 hover:text-zinc-300';
    }
  };

  const helpBtnClass = `p-2 rounded-xl border transition-colors ${
    isHC
      ? 'text-white border-white hover:bg-zinc-900'
      : isLight
      ? 'text-zinc-400 border-transparent hover:text-zinc-700 hover:bg-zinc-200/50 hover:border-zinc-300'
      : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-800/50 hover:border-zinc-800'
  }`;

  const mainPlateClass = `lg:col-span-8 flex flex-col gap-5 rounded-3xl p-5 md:p-6 relative overflow-hidden border ${
    isHC
      ? 'bg-black border-2 border-white shadow-none'
      : isLight
      ? 'bg-white border-zinc-200 shadow-md'
      : 'bg-zinc-900 border-zinc-800/80 shadow-2xl'
  }`;

  const footerClass = `mt-8 border-t w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono z-10 pt-4 ${
    isHC ? 'border-t-2 border-white text-white' : isLight ? 'border-zinc-200 text-zinc-500' : 'border-zinc-800/50 text-zinc-500'
  }`;

  const footerBadgeClass = `flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md border ${
    isHC
      ? 'text-white bg-black border-2 border-white'
      : isLight
      ? 'text-zinc-500 bg-zinc-50 border-zinc-200'
      : 'text-zinc-650 bg-zinc-950 px-2 py-1 border border-zinc-900'
  }`;

  return (
    <div id="calculator-root-container" className={rootClass}>
      
      {/* Decorative ambient blobs */}
      {!isHC && (
        <>
          <div className={`absolute top-1/4 left-1/4 w-72 h-72 rounded-full filter blur-3xl pointer-events-none ${
            isLight ? 'bg-emerald-500/2' : 'bg-emerald-500/5'
          }`} />
          <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full filter blur-3xl pointer-events-none ${
            isLight ? 'bg-indigo-500/2' : 'bg-indigo-500/5'
          }`} />
        </>
      )}

      {/* Main Content Layout Block */}
      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-center gap-6 z-10">
        
        {/* Top bar with Branding, Mode Switches, Status */}
        <div id="calculator-header-bar" className={headerBarClass}>
          
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isHC 
                ? 'bg-white border-2 border-black shadow-none' 
                : 'bg-gradient-to-br from-emerald-500 to-indigo-600 shadow-lg shadow-emerald-950/20'
            }`}>
              <Calculator className={`w-5 h-5 stroke-[2.5] ${isHC ? 'text-black' : 'text-zinc-950'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={brandingTitleClass}>Calculator</h1>
                <span className={versionBadgeClass}>
                  v2.0
                </span>
              </div>
              <p className={brandingSubClass}>Workspace Laboratory Precision Tool</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
            {/* Theme Selector Tab */}
            <div className={`p-1 rounded-xl border flex items-center gap-1 ${
              isHC
                ? 'bg-black border-2 border-white'
                : isLight
                ? 'bg-zinc-200/60 border-zinc-200'
                : 'bg-zinc-950 border-zinc-800/80'
            }`}>
              <button
                id="theme-btn-light"
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  theme === 'light'
                    ? 'bg-white text-emerald-600 shadow-sm border border-zinc-200'
                    : isHC
                    ? 'text-white hover:bg-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                id="theme-btn-dark"
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-zinc-850 text-emerald-400 border border-zinc-700/50 shadow-sm'
                    : isHC
                    ? 'text-white hover:bg-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Dark Theme"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                id="theme-btn-hc"
                onClick={() => setTheme('high-contrast')}
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  theme === 'high-contrast'
                    ? 'bg-white text-black font-black border border-white shadow-sm'
                    : isLight
                    ? 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-150'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40'
                }`}
                title="High Contrast Theme"
              >
                <Contrast className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mode Selector Tab */}
            <div className={modeSelectorClass}>
              <button
                id="tab-mode-standard"
                onClick={() => setMode('standard')}
                className={modeBtnClass('standard', 'text-emerald-500')}
              >
                Standard
              </button>
              <button
                id="tab-mode-scientific"
                onClick={() => setMode('scientific')}
                className={modeBtnClass('scientific', 'text-indigo-400 lg:text-indigo-500')}
              >
                Scientific
              </button>
              <button
                id="tab-mode-converter"
                onClick={() => setMode('converter')}
                className={modeBtnClass('converter', 'text-amber-500')}
              >
                Converter
              </button>
            </div>

            {/* Help & Info Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowKeyboardHelp(true)}
                className={helpBtnClass}
                title="Keyboard Shortcuts"
              >
                <Terminal className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowHistoryModal(true)}
                className={`lg:hidden ${helpBtnClass}`}
                title="View History Log"
              >
                <Clock className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Central Work Grid */}
        <div id="calculator-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Calculator Plate (Display + Keypad) */}
          <div className={mainPlateClass}>
            {/* Embedded lighting accent */}
            {!isHC && (
              <div className={`absolute top-0 right-0 w-48 h-48 rounded-full filter blur-3xl pointer-events-none ${
                isLight ? 'bg-emerald-500/3' : 'bg-emerald-500/10'
              }`} />
            )}

            {mode === 'converter' ? (
              <UnitConverter theme={theme} />
            ) : (
              <>
                <Display 
                  expression={expression}
                  result={result}
                  previewResult={previewResult}
                  angleMode={angleMode}
                  memory={memory}
                  error={error}
                  onCopy={copyToClipboard}
                  theme={theme}
                />

                <Keypad 
                  mode={mode}
                  onKeyPress={handleInput}
                  theme={theme}
                />
              </>
            )}
          </div>

          {/* Desktop Persistent History Panel */}
          <div className="hidden lg:block lg:col-span-4 h-full min-h-[400px]">
            <HistoryPanel 
              history={history}
              theme={theme}
              onSelectExpression={(expr) => {
                setExpression(expr);
                setResult('');
                setError(null);
                triggerToast('Loaded expression');
              }}
              onSelectResult={(res) => {
                setExpression(prev => prev + res);
                setResult('');
                setError(null);
                triggerToast('Appended result');
              }}
              onClearHistory={() => {
                setHistory([]);
                triggerToast('History Cleared');
              }}
              onRemoveItem={(id) => {
                setHistory(prev => prev.filter(item => item.id !== id));
                triggerToast('Item removed');
              }}
            />
          </div>
        </div>

      </main>

      {/* Footer bar */}
      <footer className={footerClass}>
        <div>
          <span>Keyboard active. Type operators and numbers freely.</span>
        </div>
        <div className={footerBadgeClass}>
          <Info className="w-3.5 h-3.5" />
          <span>Local storage active. State is persisted offline.</span>
        </div>
      </footer>

      {/* Dynamic Popups/Modals/Toasts */}
      <AnimatePresence>
        {/* Temporary Notification Toast */}
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-xs px-3.5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </motion.div>
        )}

        {/* Copy Success Toast */}
        {copiedNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-zinc-950 font-mono text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 font-bold"
          >
            <Check className="w-4 h-4" />
            <span>Copied to clipboard</span>
          </motion.div>
        )}

        {/* Mobile History Slide-up Sheet */}
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden flex items-end justify-center">
            {/* Backdrop click closer */}
            <div className="absolute inset-0" onClick={() => setShowHistoryModal(false)} />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`relative w-full max-w-lg rounded-t-3xl p-5 z-50 max-h-[85vh] flex flex-col border-t ${
                isHC
                  ? 'bg-black border-white border-2 border-b-0'
                  : isLight
                  ? 'bg-white border-zinc-200 shadow-2xl'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              {/* Drag bar decoration */}
              <div className={`w-12 h-1 rounded-full mx-auto mb-4 ${
                isHC ? 'bg-white' : isLight ? 'bg-zinc-350' : 'bg-zinc-700'
              }`} />
              
              <div className="overflow-y-auto flex-1">
                <HistoryPanel 
                  history={history}
                  theme={theme}
                  onSelectExpression={(expr) => {
                    setExpression(expr);
                    setResult('');
                    setError(null);
                    setShowHistoryModal(false);
                    triggerToast('Loaded expression');
                  }}
                  onSelectResult={(res) => {
                    setExpression(prev => prev + res);
                    setResult('');
                    setError(null);
                    setShowHistoryModal(false);
                    triggerToast('Appended result');
                  }}
                  onClearHistory={() => {
                    setHistory([]);
                    setShowHistoryModal(false);
                    triggerToast('History Cleared');
                  }}
                  onRemoveItem={(id) => {
                    setHistory(prev => prev.filter(item => item.id !== id));
                    triggerToast('Item removed');
                  }}
                />
              </div>

              <button
                onClick={() => setShowHistoryModal(false)}
                className={`mt-4 w-full py-3 rounded-xl font-mono text-xs font-semibold border ${
                  isHC
                    ? 'bg-black text-white border-white hover:bg-zinc-950 hover:underline'
                    : isLight
                    ? 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-700'
                    : 'bg-zinc-850 border-zinc-700/60 hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                Close History
              </button>
            </motion.div>
          </div>
        )}

        {/* Keyboard Help Modal */}
        {showKeyboardHelp && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setShowKeyboardHelp(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative w-full max-w-md rounded-3xl p-6 z-50 shadow-2xl border ${
                isHC
                  ? 'bg-black border-2 border-white'
                  : isLight
                  ? 'bg-white border-zinc-200'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <h3 className={`text-base font-bold font-mono flex items-center gap-2 border-b pb-3 mb-4 ${
                isHC
                  ? 'text-white border-white'
                  : isLight
                  ? 'text-zinc-900 border-zinc-200'
                  : 'text-zinc-100 border-zinc-800'
              }`}>
                <Terminal className={`w-4.5 h-4.5 ${isHC ? 'text-white' : 'text-indigo-400'}`} />
                <span>Physical Keyboard Shortcuts</span>
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <p className={`leading-relaxed mb-4 ${
                  isHC ? 'text-white' : isLight ? 'text-zinc-500' : 'text-zinc-400'
                }`}>
                  Type directly on your desktop or laptop keyboard. The following mapping guides are loaded:
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Digits', key: '0 - 9' },
                    { label: 'Calculate', key: 'Enter / =' },
                    { label: 'Add / Sub', key: '+ or -' },
                    { label: 'Multiply', key: '*' },
                    { label: 'Divide', key: '/' },
                    { label: 'Exponent', key: '^' },
                    { label: 'Backspace', key: 'Backspace' },
                    { label: 'Clear All', key: 'Escape' },
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        isHC
                          ? 'bg-black border-2 border-white'
                          : isLight
                          ? 'bg-zinc-50 border-zinc-200'
                          : 'bg-zinc-950 border border-zinc-800/80'
                      }`}
                    >
                      <span className={isHC ? 'text-white font-bold' : 'text-zinc-500'}>{item.label}</span>
                      <kbd className={`px-1.5 py-0.5 rounded border text-[10px] font-mono font-bold ${
                        isHC
                          ? 'bg-white text-black border-white'
                          : isLight
                          ? 'bg-zinc-200 text-zinc-800 border-zinc-300'
                          : 'bg-zinc-800 text-zinc-350 border-zinc-700'
                      }`}>{item.key}</kbd>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowKeyboardHelp(false)}
                className={`mt-6 w-full py-3 rounded-xl font-mono text-xs font-bold transition-all duration-150 border ${
                  isHC
                    ? 'bg-white text-black border-white hover:bg-zinc-100'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent'
                }`}
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
