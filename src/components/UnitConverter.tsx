import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeftRight, 
  Scale, 
  Ruler, 
  Thermometer, 
  Copy, 
  Check, 
  ChevronDown, 
  Sparkles,
  Delete
} from 'lucide-react';
import { Theme } from '../types';

interface Unit {
  value: string;
  label: string;
  symbol: string;
}

type Category = 'length' | 'weight' | 'temperature';

const CATEGORIES: { id: Category; label: string; icon: any; colorClass: string; borderClass: string }[] = [
  { 
    id: 'length', 
    label: 'Length', 
    icon: Ruler, 
    colorClass: 'text-emerald-400 bg-emerald-950/40', 
    borderClass: 'border-emerald-900/30' 
  },
  { 
    id: 'weight', 
    label: 'Weight & Mass', 
    icon: Scale, 
    colorClass: 'text-indigo-400 bg-indigo-950/40', 
    borderClass: 'border-indigo-900/30' 
  },
  { 
    id: 'temperature', 
    label: 'Temperature', 
    icon: Thermometer, 
    colorClass: 'text-amber-400 bg-amber-950/40', 
    borderClass: 'border-amber-900/30' 
  },
];

const LENGTH_UNITS: Unit[] = [
  { value: 'm', label: 'Meters', symbol: 'm' },
  { value: 'km', label: 'Kilometers', symbol: 'km' },
  { value: 'cm', label: 'Centimeters', symbol: 'cm' },
  { value: 'mm', label: 'Millimeters', symbol: 'mm' },
  { value: 'mi', label: 'Miles', symbol: 'mi' },
  { value: 'yd', label: 'Yards', symbol: 'yd' },
  { value: 'ft', label: 'Feet', symbol: 'ft' },
  { value: 'in', label: 'Inches', symbol: 'in' },
];

const WEIGHT_UNITS: Unit[] = [
  { value: 'kg', label: 'Kilograms', symbol: 'kg' },
  { value: 'g', label: 'Grams', symbol: 'g' },
  { value: 'lb', label: 'Pounds', symbol: 'lb' },
  { value: 'oz', label: 'Ounces', symbol: 'oz' },
  { value: 't', label: 'Metric Tons', symbol: 't' },
];

const TEMP_UNITS: Unit[] = [
  { value: 'C', label: 'Celsius', symbol: '°C' },
  { value: 'F', label: 'Fahrenheit', symbol: '°F' },
  { value: 'K', label: 'Kelvin', symbol: 'K' },
];

const LENGTH_FACTORS: Record<string, number> = {
  m: 1,
  km: 1000,
  cm: 0.01,
  mm: 0.001,
  mi: 1609.344,
  yd: 0.9144,
  ft: 0.3048,
  in: 0.0254,
};

const WEIGHT_FACTORS: Record<string, number> = {
  kg: 1,
  g: 0.001,
  lb: 0.45359237,
  oz: 0.028349523125,
  t: 1000,
};

interface UnitConverterProps {
  theme: Theme;
}

export const UnitConverter: React.FC<UnitConverterProps> = ({ theme }) => {
  const [category, setCategory] = useState<Category>('length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>('');
  const [toUnit, setToUnit] = useState<string>('');
  const [convertedValue, setConvertedValue] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Initialize default units when category changes
  useEffect(() => {
    if (category === 'length') {
      setFromUnit('m');
      setToUnit('ft');
    } else if (category === 'weight') {
      setFromUnit('kg');
      setToUnit('lb');
    } else if (category === 'temperature') {
      setFromUnit('C');
      setToUnit('F');
    }
  }, [category]);

  // Execute unit conversion in real-time
  useEffect(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      setConvertedValue('');
      return;
    }

    let result = 0;

    if (category === 'length') {
      const valueInMeters = num * (LENGTH_FACTORS[fromUnit] || 1);
      result = valueInMeters / (LENGTH_FACTORS[toUnit] || 1);
    } else if (category === 'weight') {
      const valueInKg = num * (WEIGHT_FACTORS[fromUnit] || 1);
      result = valueInKg / (WEIGHT_FACTORS[toUnit] || 1);
    } else if (category === 'temperature') {
      let celsius = 0;
      if (fromUnit === 'C') celsius = num;
      else if (fromUnit === 'F') celsius = ((num - 32) * 5) / 9;
      else if (fromUnit === 'K') celsius = num - 273.15;

      if (toUnit === 'C') result = celsius;
      else if (toUnit === 'F') result = (celsius * 9) / 5 + 32;
      else if (toUnit === 'K') result = celsius + 273.15;
    }

    // Format output nicely (round off float precision issues)
    if (Math.abs(result) < 1e-10) {
      setConvertedValue('0');
    } else {
      const strVal = result.toFixed(8);
      setConvertedValue(parseFloat(strVal).toString());
    }
  }, [inputValue, fromUnit, toUnit, category]);

  const getUnitsForCategory = (): Unit[] => {
    if (category === 'length') return LENGTH_UNITS;
    if (category === 'weight') return WEIGHT_UNITS;
    return TEMP_UNITS;
  };

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleKeyPress = (char: string) => {
    if (char === 'C') {
      setInputValue('0');
      return;
    }
    if (char === 'BACKSPACE') {
      if (inputValue.length <= 1) {
        setInputValue('0');
      } else {
        setInputValue(inputValue.slice(0, -1));
      }
      return;
    }
    if (char === '+/-') {
      if (inputValue.startsWith('-')) {
        setInputValue(inputValue.slice(1));
      } else if (inputValue !== '0') {
        setInputValue('-' + inputValue);
      }
      return;
    }
    if (char === '.') {
      if (!inputValue.includes('.')) {
        setInputValue(inputValue + '.');
      }
      return;
    }

    // Digital clicks
    if (inputValue === '0') {
      setInputValue(char);
    } else {
      setInputValue(inputValue + char);
    }
  };

  // Physical Keyboard Listener specifically focused inside converter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in standard inputs (safety)
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      const key = e.key;
      if ('0123456789.'.includes(key)) {
        e.preventDefault();
        handleKeyPress(key);
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleKeyPress('BACKSPACE');
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        e.preventDefault();
        handleKeyPress('C');
      } else if (key === '-') {
        e.preventDefault();
        handleKeyPress('+/-');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputValue]);

  const handleCopy = () => {
    if (!convertedValue) return;
    const textToCopy = `${inputValue} ${fromUnit} = ${convertedValue} ${toUnit}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLight = theme === 'light';
  const isHC = theme === 'high-contrast';

  // Category Tabs Styles
  const categoriesContainerClass = isHC
    ? 'grid grid-cols-3 gap-2 bg-black p-1.5 rounded-2xl border-2 border-white'
    : isLight
    ? 'grid grid-cols-3 gap-2 bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200'
    : 'grid grid-cols-3 gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800/80';

  const categoryBtnClass = (catId: Category, isSelected: boolean) => {
    if (isSelected) {
      if (isHC) return 'flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-mono font-bold border-2 bg-white text-black border-white';
      if (isLight) return 'flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-mono font-bold border bg-white shadow-sm text-zinc-900 border-zinc-200';
      
      const cat = CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
      return `flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-mono font-bold border ${cat.colorClass} ${cat.borderClass} text-zinc-100`;
    } else {
      if (isHC) return 'flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-mono font-medium transition-all duration-200 border border-transparent text-white hover:border-white';
      if (isLight) return 'flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-mono font-medium transition-all duration-200 border border-transparent text-zinc-500 hover:text-zinc-850 hover:bg-zinc-200/50';
      return 'flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-mono font-medium transition-all duration-200 border border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40';
    }
  };

  // Content Containers Styles
  const visualBoxClass = isHC
    ? 'bg-black rounded-2xl p-5 border-2 border-white flex flex-col gap-4 relative overflow-hidden'
    : isLight
    ? 'bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm flex flex-col gap-4 relative overflow-hidden'
    : 'bg-zinc-950 rounded-2xl p-5 border border-zinc-800 flex flex-col gap-4 relative overflow-hidden';

  const labelClass = `text-[10px] font-mono uppercase tracking-wider ${isHC ? 'text-white font-bold' : isLight ? 'text-zinc-500' : 'text-zinc-500'}`;

  const selectClass = isHC
    ? 'w-full h-12 bg-black hover:bg-zinc-900 text-white font-bold font-mono text-xs rounded-xl px-3.5 border-2 border-white focus:outline-none cursor-pointer appearance-none'
    : isLight
    ? 'w-full h-12 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 font-mono text-xs rounded-xl px-3.5 border border-zinc-200 focus:outline-none focus:border-zinc-300 cursor-pointer appearance-none'
    : 'w-full h-12 bg-zinc-900 hover:bg-zinc-850 text-zinc-100 font-mono text-xs rounded-xl px-3.5 border border-zinc-800 focus:outline-none focus:border-zinc-700 cursor-pointer appearance-none';

  const chevronClass = `w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isHC ? 'text-white' : isLight ? 'text-zinc-500' : 'text-zinc-500'}`;

  const inputDisplayClass = isHC
    ? 'col-span-7 flex items-center justify-end bg-black border-2 border-white rounded-xl px-4 h-12 text-right font-mono font-bold text-lg md:text-xl text-white overflow-x-auto whitespace-nowrap scrollbar-none'
    : isLight
    ? 'col-span-7 flex items-center justify-end bg-zinc-50 border border-zinc-200 rounded-xl px-4 h-12 text-right font-mono font-bold text-lg md:text-xl text-zinc-800 overflow-x-auto whitespace-nowrap scrollbar-none'
    : 'col-span-7 flex items-center justify-end bg-zinc-900 border border-zinc-800 rounded-xl px-4 h-12 text-right font-mono font-bold text-lg md:text-xl text-zinc-200 overflow-x-auto whitespace-nowrap scrollbar-none';

  const outputDisplayClass = isHC
    ? 'col-span-7 flex items-center justify-end bg-black border-2 border-white rounded-xl px-4 h-12 text-right font-mono font-black text-lg md:text-xl text-white overflow-x-auto whitespace-nowrap scrollbar-none'
    : isLight
    ? 'col-span-7 flex items-center justify-end bg-emerald-50/60 border border-emerald-100 rounded-xl px-4 h-12 text-right font-mono font-bold text-lg md:text-xl text-emerald-700 overflow-x-auto whitespace-nowrap scrollbar-none'
    : 'col-span-7 flex items-center justify-end bg-zinc-900/60 border border-zinc-800/40 rounded-xl px-4 h-12 text-right font-mono font-bold text-lg md:text-xl text-emerald-400 overflow-x-auto whitespace-nowrap scrollbar-none';

  const swapBtnClass = isHC
    ? 'p-2.5 rounded-full border-2 bg-black text-white hover:bg-white hover:text-black border-white shadow-md transition-all duration-150 hover:scale-105 active:scale-95'
    : isLight
    ? 'p-2.5 rounded-full border bg-white shadow-sm border-zinc-200 text-emerald-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-150 hover:scale-105 active:scale-95'
    : `p-2.5 rounded-full border bg-zinc-900 shadow-md transition-all duration-150 hover:scale-105 active:scale-95 ${
        category === 'length' 
          ? 'border-emerald-900/50 text-emerald-400 hover:bg-emerald-950/20' 
          : category === 'weight'
          ? 'border-indigo-900/50 text-indigo-400 hover:bg-indigo-950/20'
          : 'border-amber-900/50 text-amber-400 hover:bg-amber-950/20'
      }`;

  const copyFormulaBtnClass = `flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition-all duration-150 ${
    copied 
      ? isHC
        ? 'bg-white text-black border-white'
        : isLight
        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
        : 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400' 
      : isHC
      ? 'bg-black border-2 border-white text-white hover:bg-white hover:text-black'
      : isLight
      ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100 hover:border-zinc-300'
      : 'bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
  } disabled:opacity-30 disabled:cursor-not-allowed`;

  // Keypad Styles
  const keypadContainerClass = isHC
    ? 'bg-black border-2 border-white rounded-2xl p-4 flex flex-col gap-3.5'
    : isLight
    ? 'bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col gap-3.5'
    : 'bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3.5';

  const keypadHeaderClass = isHC
    ? 'flex items-center justify-between border-b-2 border-white pb-2'
    : isLight
    ? 'flex items-center justify-between border-b border-zinc-200 pb-2'
    : 'flex items-center justify-between border-b border-zinc-800 pb-2';

  const activeLabelClass = `text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 ${isHC ? 'text-white' : isLight ? 'text-zinc-500' : 'text-zinc-500'}`;
  const supportedLabelClass = `text-[9px] font-mono ${isHC ? 'text-white/80' : isLight ? 'text-zinc-400' : 'text-zinc-600'}`;

  const numKeyClass = isHC
    ? 'h-11 md:h-12 bg-black border-2 border-white hover:bg-white hover:text-black rounded-xl text-white font-mono text-sm md:text-base font-semibold active:scale-95 transition-all'
    : isLight
    ? 'h-11 md:h-12 bg-white border border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300 rounded-xl text-zinc-800 font-mono text-sm md:text-base font-medium active:scale-95 transition-all'
    : 'h-11 md:h-12 bg-zinc-950 border border-zinc-900 hover:bg-zinc-850 rounded-xl text-zinc-200 font-mono text-sm md:text-base font-semibold active:scale-95 transition-all';

  const clearKeyClass = isHC
    ? 'h-11 md:h-12 col-span-2 bg-black border-2 border-red-500 hover:bg-red-500 hover:text-white text-red-500 rounded-xl font-mono text-xs font-bold active:scale-95 transition-all'
    : isLight
    ? 'h-11 md:h-12 col-span-2 bg-rose-50 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 text-rose-600 rounded-xl font-mono text-xs font-bold active:scale-95 transition-all'
    : 'h-11 md:h-12 col-span-2 bg-rose-950/20 border border-rose-900/20 hover:bg-rose-950/30 text-rose-400 rounded-xl font-mono text-xs font-bold active:scale-95 transition-all';

  const backspaceKeyClass = isHC
    ? 'h-11 md:h-12 bg-black border-2 border-white hover:bg-white hover:text-black text-white rounded-xl flex items-center justify-center active:scale-95 transition-all'
    : isLight
    ? 'h-11 md:h-12 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 hover:border-zinc-300 text-zinc-700 rounded-xl flex items-center justify-center active:scale-95 transition-all'
    : 'h-11 md:h-12 bg-zinc-800 border border-zinc-700/60 hover:bg-zinc-700 text-zinc-300 rounded-xl flex items-center justify-center active:scale-95 transition-all';

  return (
    <div id="unit-converter-panel" className="grid grid-cols-1 md:grid-cols-12 gap-5">
      {/* Left/Main Column: Input, Output and Selector cards */}
      <div className="md:col-span-7 space-y-4">
        {/* Category Selector Tabs */}
        <div id="converter-categories" className={categoriesContainerClass}>
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={categoryBtnClass(cat.id, isSelected)}
              >
                <IconComponent className="w-4 h-4 stroke-[2]" />
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="inline sm:hidden">{cat.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic visual box */}
        <div className={visualBoxClass}>
          {/* Subtle light leak based on category color */}
          {!isHC && (
            <div className={`absolute -top-12 -right-12 w-28 h-28 rounded-full filter blur-2xl opacity-10 ${
              category === 'length' ? 'bg-emerald-500' : category === 'weight' ? 'bg-indigo-500' : 'bg-amber-500'
            }`} />
          )}

          {/* INPUT PORT */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>From Unit</label>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5 relative">
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className={selectClass}
                >
                  {getUnitsForCategory().map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label} ({u.symbol})
                    </option>
                  ))}
                </select>
                <ChevronDown className={chevronClass} />
              </div>

              {/* Numerical Text Display for Input */}
              <div className={inputDisplayClass}>
                {inputValue}
              </div>
            </div>
          </div>

          {/* SWAP CONTROL BUTTON */}
          <div className="flex justify-center -my-2 z-10">
            <button
              onClick={handleSwap}
              className={swapBtnClass}
              title="Swap Units"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 rotate-90 md:rotate-0" />
            </button>
          </div>

          {/* OUTPUT PORT */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>To Unit</label>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5 relative">
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className={selectClass}
                >
                  {getUnitsForCategory().map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label} ({u.symbol})
                    </option>
                  ))}
                </select>
                <ChevronDown className={chevronClass} />
              </div>

              {/* Numerical Output Block */}
              <div className={outputDisplayClass}>
                {convertedValue || '0'}
              </div>
            </div>
          </div>

          {/* Quick Copy Action */}
          <div className="flex justify-end pt-1">
            <button
              onClick={handleCopy}
              disabled={!convertedValue}
              className={copyFormulaBtnClass}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy result formula'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right/Mini Column: Specific numeric keypad for rapid typing */}
      <div className="md:col-span-5">
        <div className={keypadContainerClass}>
          <div className={keypadHeaderClass}>
            <span className={activeLabelClass}>
              <Sparkles className={`w-3 h-3 ${isHC ? 'text-white' : 'text-amber-500'}`} /> Keypad Active
            </span>
            <span className={supportedLabelClass}>Physical Keys supported</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Keypad Digits Grid */}
            <button onClick={() => handleKeyPress('7')} className={numKeyClass}>7</button>
            <button onClick={() => handleKeyPress('8')} className={numKeyClass}>8</button>
            <button onClick={() => handleKeyPress('9')} className={numKeyClass}>9</button>

            <button onClick={() => handleKeyPress('4')} className={numKeyClass}>4</button>
            <button onClick={() => handleKeyPress('5')} className={numKeyClass}>5</button>
            <button onClick={() => handleKeyPress('6')} className={numKeyClass}>6</button>

            <button onClick={() => handleKeyPress('1')} className={numKeyClass}>1</button>
            <button onClick={() => handleKeyPress('2')} className={numKeyClass}>2</button>
            <button onClick={() => handleKeyPress('3')} className={numKeyClass}>3</button>

            <button onClick={() => handleKeyPress('+/-')} className={numKeyClass}>+/-</button>
            <button onClick={() => handleKeyPress('0')} className={numKeyClass}>0</button>
            <button onClick={() => handleKeyPress('.')} className={numKeyClass}>.</button>

            {/* Utility control keys */}
            <button onClick={() => handleKeyPress('C')} className={clearKeyClass}>Clear (C)</button>
            <button onClick={() => handleKeyPress('BACKSPACE')} className={backspaceKeyClass} aria-label="Backspace">
              <Delete className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
