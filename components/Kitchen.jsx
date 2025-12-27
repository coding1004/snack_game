import React, { useState } from 'react';
import { FOOD_DATA } from '../constants.js';
import { ChefHat, ListOrdered, Banknote, Clock } from 'lucide-react';

const Kitchen = ({ onPrepareFood, foodTray, maxSlots }) => {
  const [cooking, setCooking] = useState({
    'TTEOKBOKKI': 0,
    'KIMBAP': 0,
    'RAMEN': 0,
    'TWIGIM': 0,
    'SODA': 0,
  });

  const startCooking = (foodType) => {
    if (cooking[foodType] > 0 || foodTray.length >= maxSlots) return;
    const foodInfo = FOOD_DATA[foodType];
    setCooking(prev => ({ ...prev, [foodType]: 1 }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setCooking(prev => ({ ...prev, [foodType]: progress }));
      if (progress >= 100) {
        clearInterval(interval);
        setCooking(prev => ({ ...prev, [foodType]: 0 }));
        onPrepareFood(foodType);
      }
    }, (foodInfo.cookTime * 1000) / 5);
  };

  return (
    <div className="flex flex-col h-full gap-3 overflow-hidden">
      <div className="flex items-center gap-2 border-b-4 border-black/10 pb-3">
        <ChefHat size={24} className="text-[#4a2c2a]" />
        <span className="font-black text-lg text-[#4a2c2a] tracking-tight uppercase">주방장 민규</span>
      </div>

      <div className="flex flex-col gap-2.5 flex-grow overflow-y-auto pr-1 scrollbar-hide">
        {Object.keys(FOOD_DATA).map((type) => {
          const food = FOOD_DATA[type];
          const isCooking = cooking[type] > 0;
          const isTrayFull = foodTray.length >= maxSlots;
          
          return (
            <button
              key={type}
              onClick={() => startCooking(type)}
              disabled={isCooking || isTrayFull}
              className={`
                relative flex items-center gap-3 p-2.5 rounded-2xl border-4 transition-all h-[64px]
                ${isCooking ? 'bg-yellow-100 border-yellow-500' : 'bg-white border-[#4a2c2a] shadow-md'}
                ${isTrayFull ? 'opacity-40 grayscale cursor-not-allowed' : 'active:scale-90 active:shadow-none shadow-[0_5px_0_#4a2c2a] hover:bg-yellow-50'}
              `}
            >
              {isCooking && (
                <div className="absolute inset-0 bg-yellow-400/20 overflow-hidden rounded-xl">
                   <div className="h-full bg-yellow-500/40 transition-all duration-200" style={{ width: `${cooking[type]}%` }}></div>
                </div>
              )}
              <span className="text-3xl z-10 drop-shadow-md shrink-0">{food.emoji}</span>
              <div className="flex flex-col items-start z-10 overflow-hidden flex-grow leading-none">
                <div className="flex justify-between w-full items-center">
                  <span className="text-[13px] font-black text-black tracking-tighter">{food.name}</span>
                  <div className="flex items-center gap-1 text-gray-500 shrink-0">
                     <Clock size={10} />
                     <span className="text-[10px] font-bold">{food.cookTime}s</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#4a2c2a] mt-1">
                  <Banknote size={12} className="text-green-600" />
                  <span className="text-xs font-black text-red-700">{food.price.toLocaleString()}원</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-2 border-t-4 border-black/10 pt-3">
        <div className="flex items-center justify-between px-1">
           <div className="flex items-center gap-2">
              <ListOrdered size={20} className="text-[#4a2c2a]" />
              <span className="text-xs font-black text-[#4a2c2a] uppercase tracking-wider">서빙대</span>
           </div>
           <span className="text-xs font-black text-white bg-[#4a2c2a] px-3 py-1 rounded-full">{foodTray.length}/{maxSlots}</span>
        </div>
        
        <div className="bg-black/5 rounded-2xl p-2 border-4 border-[#4a2c2a]/20 grid grid-cols-5 gap-2 min-h-[56px] shadow-inner">
           {Array.from({ length: maxSlots }).map((_, i) => {
              const foodType = foodTray[i];
              return (
                <div key={i} className={`
                  aspect-square rounded-xl border-2 flex items-center justify-center text-2xl transition-all
                  ${foodType ? 'bg-white border-[#4a2c2a] shadow-md animate-bounce-small' : 'bg-transparent border-[#4a2c2a]/10'}
                `}>
                   {foodType ? FOOD_DATA[foodType].emoji : ''}
                </div>
              );
           })}
        </div>
      </div>
    </div>
  );
};

export default Kitchen;
