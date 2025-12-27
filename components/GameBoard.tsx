
import React from 'react';
import { Table, Customer, CustomerState, FoodType } from '../types';
import { FOOD_DATA } from '../constants';
import { Trash2, HandCoins } from 'lucide-react';

interface GameBoardProps {
  tables: Table[];
  customers: Customer[];
  onTableClick: (id: number) => void;
  heldFood: FoodType | null;
  foodTray: FoodType[];
}

const GameBoard: React.FC<GameBoardProps> = ({ tables, customers, onTableClick, foodTray }) => {
  return (
    <div className="grid grid-cols-3 gap-x-8 gap-y-16 w-full max-w-[700px] px-4 pt-10">
      {tables.map((table) => {
        const customer = customers.find(c => c.tableId === table.id);
        const hasMatchingFood = customer?.state === CustomerState.WAITING_FOOD && 
                                foodTray.some(f => customer.order.includes(f));
        
        return (
          <div 
            key={table.id} 
            className="relative flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
            onClick={() => onTableClick(table.id)}
          >
            {/* Table Surface */}
            <div className={`
              w-24 h-12 rounded-[14px] flex items-center justify-center transition-all border-[3px] shadow-md
              ${table.needsCleaning 
                ? 'bg-gray-200 border-gray-400 shadow-[0_4px_0_rgb(156,163,175)]' 
                : 'bg-red-600 border-white/30 shadow-[0_4px_0_rgb(153,27,27)]'}
              ${hasMatchingFood ? 'ring-4 ring-yellow-300 ring-offset-2 animate-pulse scale-110' : ''}
              relative z-10
            `}>
                <div className="flex items-center justify-center w-full h-full">
                  {table.needsCleaning && (
                    <div className="flex items-center gap-1 animate-bounce-small px-1">
                        <Trash2 size={16} className="text-gray-600" />
                        <span className="text-gray-700 font-black text-[9px] whitespace-nowrap">청소</span>
                    </div>
                  )}
                  
                  {customer?.state === CustomerState.EATING && (
                    <div className="flex items-center gap-1 px-1">
                        <div className="text-base animate-bounce-small">😋</div>
                        <span className="text-white font-black text-[9px] uppercase tracking-tighter whitespace-nowrap">얌얌</span>
                    </div>
                  )}
                  
                  {customer?.state === CustomerState.FINISHED && (
                    <div className="flex items-center gap-1 animate-pulse px-1">
                        <HandCoins size={18} className="text-yellow-300 drop-shadow-[0_1px_0_rgba(0,0,0,0.4)]" />
                        <span className="text-white font-black text-[10px] animate-bounce whitespace-nowrap">계산!</span>
                    </div>
                  )}

                  {!table.needsCleaning && !customer && (
                    <div className="w-full h-full opacity-20 flex items-center justify-center">
                      <div className="w-10 h-1.5 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
            </div>

            {/* Customer UI */}
            {customer && (
              <div className="absolute -top-12 z-20 flex flex-col items-center w-full">
                {/* Patience Bar */}
                {(customer.state === CustomerState.ORDERING || customer.state === CustomerState.WAITING_FOOD) && (
                  <div className="w-12 h-1.5 bg-black/40 rounded-full mb-1 border border-black/50 overflow-hidden shadow-inner">
                    <div 
                      className={`h-full transition-all duration-300 ${customer.patience < 35 ? 'bg-red-500' : 'bg-green-400'}`} 
                      style={{ width: `${customer.patience}%` }}
                    ></div>
                  </div>
                )}

                <div className="relative">
                  {/* Ordering Bubble */}
                  {customer.state === CustomerState.ORDERING && (
                    <div className="absolute -right-8 -top-4 bg-white px-2 py-1 rounded-xl border-2 border-blue-500 shadow-lg animate-bounce-small z-30 flex items-center">
                      <span className="text-[10px] font-black text-blue-700 whitespace-nowrap">주문!</span>
                      <div className="absolute -bottom-1.5 left-2 w-3 h-3 bg-white border-b-2 border-r-2 border-blue-500 rotate-45"></div>
                    </div>
                  )}

                  {/* Food Waiting Bubble */}
                  {customer.state === CustomerState.WAITING_FOOD && (
                    <div className="absolute -right-12 -top-10 bg-white p-1.5 rounded-xl border-2 border-orange-600 shadow-xl flex flex-col items-center z-30 min-w-[50px]">
                      <div className="flex gap-0.5 mb-0.5">
                        {customer.order.map((o, idx) => (
                           <span key={idx} className="text-lg drop-shadow-sm">{FOOD_DATA[o].emoji}</span>
                        ))}
                      </div>
                      <span className="text-[8px] font-black text-orange-700 leading-none">배고파요!</span>
                      <div className="absolute -bottom-1.5 left-2 w-3 h-3 bg-white border-b-2 border-r-2 border-orange-600 rotate-45"></div>
                    </div>
                  )}

                  {/* Character Avatar */}
                  <div className={`
                    w-11 h-11 bg-pink-100 rounded-full border-2 border-[#5D3A26] flex items-center justify-center text-2xl shadow-md transition-all
                    ${customer.patience < 35 ? 'grayscale brightness-75 bg-red-100 ring-2 ring-red-500 ring-offset-1' : ''}
                  `}>
                    {customer.patience < 35 ? '😡' : (customer.state === CustomerState.EATING ? '😋' : '😀')}
                  </div>
                </div>
              </div>
            )}
            
            {/* Table Number Label */}
            <div className="mt-2 bg-[#5D3A26]/80 px-3 py-0.5 rounded-full text-white font-black text-[9px] border border-white/20 tracking-widest shadow-sm">
              T-{table.id}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GameBoard;
