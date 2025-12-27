
import React from 'react';
import { Timer, Banknote } from 'lucide-react';

interface TopBarProps {
  score: number;
  timeLeft: number;
}

const TopBar: React.FC<TopBarProps> = ({ score, timeLeft }) => {
  const seconds = Math.max(0, Math.floor(timeLeft));
  const progress = (timeLeft / 120) * 100;

  return (
    <div className="flex items-center gap-3 px-4 h-full">
      {/* Score */}
      <div className="flex items-center gap-2 bg-black/30 px-4 py-1.5 rounded-full border border-white/10 shrink-0">
        <Banknote className="text-yellow-400" size={20} />
        <span className="text-2xl font-black text-yellow-400 tracking-tight leading-none">
          {score.toLocaleString()}<span className="text-xs ml-0.5 font-bold">원</span>
        </span>
      </div>

      {/* Time Bar */}
      <div className="flex-grow h-3 bg-black/40 rounded-full overflow-hidden border border-white/10 shadow-inner mx-2">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${progress < 25 ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Time Label */}
      <div className={`flex items-center gap-2 font-black text-lg px-4 py-1.5 rounded-full min-w-[90px] justify-center shadow-lg shrink-0 ${seconds < 20 ? 'bg-red-600 text-white animate-bounce-small' : 'bg-white/10 text-yellow-200 border border-white/10'}`}>
        <Timer size={18} />
        <span className="leading-none">{seconds}s</span>
      </div>
    </div>
  );
};

export default TopBar;
