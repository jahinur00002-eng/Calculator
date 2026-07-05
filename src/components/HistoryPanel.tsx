import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Copy, RotateCcw, Clock } from 'lucide-react';
import { HistoryItem, Theme } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectExpression: (expression: string) => void;
  onSelectResult: (result: string) => void;
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
  theme: Theme;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelectExpression,
  onSelectResult,
  onClearHistory,
  onRemoveItem,
  theme,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const isLight = theme === 'light';
  const isHC = theme === 'high-contrast';

  // Styles map
  const containerClass = isHC
    ? 'flex flex-col h-full bg-black rounded-2xl border-2 border-white p-4 overflow-hidden'
    : isLight
    ? 'flex flex-col h-full bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 overflow-hidden'
    : 'flex flex-col h-full bg-zinc-950/40 rounded-2xl border border-zinc-800/60 p-4 overflow-hidden';

  const headerBorderClass = isHC ? 'border-b-2 border-white pb-3 mb-3' : 'border-b border-zinc-800/80 pb-3 mb-3';

  const titleClass = `font-mono text-xs font-semibold uppercase tracking-wider ${
    isHC ? 'text-white' : isLight ? 'text-zinc-800' : 'text-zinc-300'
  }`;

  const trashBtnClass = `flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-lg transition-all duration-200 border ${
    isHC
      ? 'text-white border-white hover:bg-white hover:text-black font-bold'
      : isLight
      ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100 hover:border-rose-200'
      : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 border-transparent hover:border-rose-900/30'
  }`;

  const itemContainerClass = `group relative rounded-xl p-3 transition-all duration-200 border ${
    isHC
      ? 'bg-black border-white hover:bg-zinc-900'
      : isLight
      ? 'bg-zinc-50 hover:bg-zinc-100/60 border-zinc-200/50 hover:border-zinc-300/60'
      : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/50 hover:border-zinc-700/50'
  }`;

  const itemExprClass = `font-mono text-sm break-all cursor-pointer transition-colors pr-8 mb-1 leading-relaxed ${
    isHC
      ? 'text-white/90 hover:text-yellow-400 font-bold'
      : isLight
      ? 'text-zinc-600 hover:text-emerald-700'
      : 'text-zinc-400 hover:text-emerald-400'
  }`;

  const itemResultClass = `font-mono text-base font-semibold break-all cursor-pointer transition-colors flex items-center justify-between ${
    isHC
      ? 'text-white hover:text-yellow-400 font-black'
      : isLight
      ? 'text-zinc-900 hover:text-emerald-700'
      : 'text-zinc-100 hover:text-emerald-400'
  }`;

  const actionBoxClass = `absolute right-2 top-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex gap-1 rounded-lg p-0.5 transition-opacity duration-150 shadow-lg border ${
    isHC
      ? 'bg-black border-2 border-white'
      : isLight
      ? 'bg-white border-zinc-200'
      : 'bg-zinc-950/90 border-zinc-800/80'
  }`;

  const actionBtnClass = `p-1 rounded transition-colors ${
    isHC ? 'text-white hover:text-yellow-400' : isLight ? 'text-zinc-500 hover:text-emerald-600' : 'text-zinc-400 hover:text-emerald-400'
  }`;

  const actionBtnCopyClass = (itemId: string) => `p-1 rounded transition-colors ${
    copiedId === itemId
      ? 'text-emerald-400'
      : isHC
      ? 'text-white hover:text-cyan-400'
      : isLight
      ? 'text-zinc-500 hover:text-indigo-600'
      : 'text-zinc-400 hover:text-indigo-400'
  }`;

  const actionBtnDeleteClass = `p-1 rounded transition-colors ${
    isHC ? 'text-white hover:text-red-500' : isLight ? 'text-zinc-500 hover:text-rose-600' : 'text-zinc-400 hover:text-rose-400'
  }`;

  return (
    <div id="history-panel-container" className={containerClass}>
      {/* Header */}
      <div id="history-header" className={headerBorderClass}>
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isHC ? 'text-white' : isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
          <h3 className={titleClass}>Calculation History</h3>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className={trashBtnClass}
            title="Clear All History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* History Items List */}
      <div id="history-list" className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800 pr-1 space-y-2.5 min-h-[160px] max-h-[350px] lg:max-h-[500px]">
        <AnimatePresence initial={false}>
          {history.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 border ${
                isHC ? 'bg-black border-white text-white' : isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-400' : 'bg-zinc-900 border-zinc-800/50 text-zinc-600'
              }`}>
                <Clock className="w-4 h-4" />
              </div>
              <p className={`text-xs font-mono ${isHC ? 'text-white/80' : isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>No calculations recorded</p>
              <p className={`text-[10px] font-mono ${isHC ? 'text-white/60' : isLight ? 'text-zinc-400' : 'text-zinc-600'} mt-1`}>Calculations will appear here</p>
            </motion.div>
          ) : (
            history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className={itemContainerClass}
              >
                {/* Expression */}
                <div 
                  onClick={() => onSelectExpression(item.expression)}
                  className={itemExprClass}
                  title="Load full formula"
                >
                  {item.expression}
                </div>

                {/* Result */}
                <div 
                  onClick={() => onSelectResult(item.result)}
                  className={itemResultClass}
                  title="Load result value"
                >
                  <span>= {item.result}</span>
                  <span className={`text-[10px] font-normal transition-colors font-mono ${isHC ? 'text-white/70' : isLight ? 'text-zinc-400 group-hover:text-zinc-600' : 'text-zinc-600 group-hover:text-zinc-500'}`}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {/* Quick actions panel on hover/focus */}
                <div className={actionBoxClass}>
                  <button
                    onClick={() => onSelectExpression(item.expression)}
                    className={actionBtnClass}
                    title="Reuse Expression"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopy(item.id, item.result)}
                    className={actionBtnCopyClass(item.id)}
                    title="Copy Result"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className={actionBtnDeleteClass}
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
