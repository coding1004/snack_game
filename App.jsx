import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FOOD_DATA, INITIAL_TABLES, GAME_DURATION, MAX_PATIENCE, PATIENCE_DECAY_RATE } from './constants.js';
import GameBoard from './components/GameBoard.jsx';
import Kitchen from './components/Kitchen.jsx';
import TopBar from './components/TopBar.jsx';
import { Play, RotateCcw, X, Info, Home } from 'lucide-react';

const MAX_TRAY_SLOTS = 5;

const CustomerState = {
  WAITING_TABLE: 'WAITING_TABLE',
  ORDERING: 'ORDERING',
  WAITING_FOOD: 'WAITING_FOOD',
  EATING: 'EATING',
  FINISHED: 'FINISHED',
  LEAVING: 'LEAVING'
};

const App = () => {
  const [gameState, setGameState] = useState('START');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [customers, setCustomers] = useState([]);
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [foodTray, setFoodTray] = useState([]);
  const [showHelp, setShowHelp] = useState(false);

  const gameLoopRef = useRef(undefined);
  const lastUpdateRef = useRef(0);
  const bgmRef = useRef(null);
  const sfxRefs = useRef({});

  useEffect(() => {
    bgmRef.current = new Audio('https://www.chosic.com/wp-content/uploads/2021/04/Kawaii-Adventure.mp3');
    bgmRef.current.loop = true;
    sfxRefs.current = {
      click: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-simple-click-interface-1112.mp3'),
      cook: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-fire-swoosh-burning-2439.mp3'),
      serve: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-magic-notification-ring-2344.mp3'),
      coin: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-coins-handling-1939.mp3'),
      angry: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-unhappy-pop-sound-2359.mp3'),
    };
  }, []);

  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = 0.3;
      if (gameState === 'PLAYING') {
        bgmRef.current.play().catch(() => {});
      } else {
        bgmRef.current.pause();
      }
    }
  }, [gameState]);

  const playSFX = useCallback((key) => {
    if (sfxRefs.current[key]) {
      const audio = sfxRefs.current[key].cloneNode();
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  }, []);

  const spawnCustomer = useCallback(() => {
    const emptyTables = tables.filter(t => !t.isOccupied && !t.needsCleaning);
    if (emptyTables.length === 0 || Math.random() > 0.4) return;
    const randomTable = emptyTables[Math.floor(Math.random() * emptyTables.length)];
    const foodTypes = Object.keys(FOOD_DATA);
    const orderSize = Math.floor(Math.random() * 2) + 1;
    const order = Array.from({ length: orderSize }, () => foodTypes[Math.floor(Math.random() * foodTypes.length)]);
    const newCustomer = {
      id: Math.random().toString(36).substr(2, 9),
      tableId: randomTable.id,
      state: CustomerState.ORDERING,
      order: [...order],
      initialOrder: [...order],
      patience: MAX_PATIENCE,
      spawnTime: Date.now(),
    };
    setCustomers(prev => [...prev, newCustomer]);
    setTables(prev => prev.map(t => t.id === randomTable.id ? { ...t, isOccupied: true, customerId: newCustomer.id } : t));
  }, [tables]);

  const updateGame = useCallback((timestamp) => {
    if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
    const delta = (timestamp - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = timestamp;
    
    setTimeLeft(prev => Math.max(0, prev - delta));
    setCustomers(prev => {
      return prev.map(customer => {
        let newState = customer.state;
        let newPatience = customer.patience;
        if (customer.state === CustomerState.ORDERING || customer.state === CustomerState.WAITING_FOOD) {
          newPatience -= PATIENCE_DECAY_RATE * delta;
        }
        if (newPatience <= 0) {
          newState = CustomerState.LEAVING;
          playSFX('angry');
        }
        if (customer.state === CustomerState.EATING && customer.eatingStartTime) {
          if (Date.now() - customer.eatingStartTime > 5000) newState = CustomerState.FINISHED;
        }
        return { ...customer, state: newState, patience: newPatience };
      }).filter(c => {
        if (c.state === CustomerState.LEAVING) {
          setTables(ts => ts.map(t => t.id === c.tableId ? { ...t, isOccupied: false, customerId: null, needsCleaning: true } : t));
          return false;
        }
        return true;
      });
    });

    if (Math.random() < 0.02) spawnCustomer();

    if (timeLeft <= 0) {
      setGameState('GAMEOVER');
    } else if (gameState === 'PLAYING') {
      gameLoopRef.current = requestAnimationFrame(updateGame);
    }
  }, [spawnCustomer, playSFX, timeLeft, gameState]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      gameLoopRef.current = requestAnimationFrame(updateGame);
    } else {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameState, updateGame]);

  const handleStart = () => {
    playSFX('click');
    setGameState('PLAYING');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCustomers([]);
    setTables(INITIAL_TABLES);
    setFoodTray([]);
  };

  const handleTableClick = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    if (table.needsCleaning) {
      playSFX('coin');
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, needsCleaning: false } : t));
      return;
    }

    const customer = customers.find(c => c.tableId === tableId);
    if (!customer) return;

    if (customer.state === CustomerState.ORDERING) {
      playSFX('click');
      setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, state: CustomerState.WAITING_FOOD } : c));
    } else if (customer.state === CustomerState.WAITING_FOOD && foodTray.length > 0) {
      const matchIndex = foodTray.findIndex(f => customer.order.includes(f));
      if (matchIndex !== -1) {
        const matchedFood = foodTray[matchIndex];
        playSFX('serve');
        
        const newTray = [...foodTray];
        newTray.splice(matchIndex, 1);
        setFoodTray(newTray);

        const newOrder = [...customer.order];
        const orderIdx = newOrder.indexOf(matchedFood);
        newOrder.splice(orderIdx, 1);

        if (newOrder.length === 0) {
          setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, order: [], state: CustomerState.EATING, eatingStartTime: Date.now() } : c));
        } else {
          setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, order: newOrder } : c));
        }
      }
    } else if (customer.state === CustomerState.FINISHED) {
      playSFX('coin');
      const totalPrice = customer.initialOrder.reduce((sum, foodType) => sum + FOOD_DATA[foodType].price, 0);
      const tip = Math.floor(customer.patience * 5);
      setScore(s => s + totalPrice + tip);
      
      setCustomers(prev => prev.filter(c => c.id !== customer.id));
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, isOccupied: false, customerId: null, needsCleaning: true } : t));
    }
  };

  const handleFoodPrepared = (food) => {
    if (foodTray.length < MAX_TRAY_SLOTS) {
      setFoodTray(prev => [...prev, food]);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#2D1B0F] select-none overflow-hidden touch-none">
      <div className="w-full h-full relative flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <header className="p-2 z-30 flex items-center gap-2 h-[56px] bg-[#4a2c2a] shadow-lg border-b-2 border-black/30">
          <div className="flex-grow">
            <TopBar score={score} timeLeft={timeLeft} />
          </div>
        </header>

        {/* Main Body */}
        <div className="flex flex-grow overflow-hidden bg-[#FDF0D5]">
          <main className="flex-grow flex items-center justify-center p-2 relative overflow-hidden game-canvas">
            <GameBoard 
              tables={tables} 
              customers={customers} 
              onTableClick={handleTableClick}
              heldFood={null}
              foodTray={foodTray}
            />
          </main>

          <aside className="w-[280px] bg-[#E6C9A8] border-l-4 border-[#4a2c2a] p-3 flex flex-col gap-3 shadow-[-4px_0_10px_rgba(0,0,0,0.1)]">
            <Kitchen 
              onPrepareFood={(f) => { playSFX('cook'); handleFoodPrepared(f); }} 
              foodTray={foodTray}
              maxSlots={MAX_TRAY_SLOTS}
            />
          </aside>
        </div>

        {/* Start Screen Overlay */}
        {gameState === 'START' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-orange-500 via-red-600 to-yellow-500">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
               <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-white rounded-full mix-blend-overlay animate-pulse"></div>
               <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-yellow-400 rounded-full mix-blend-overlay"></div>
            </div>

            {/* Game Title */}
            <div className="relative z-30 flex flex-col items-center animate-in zoom-in duration-700">
               <div className="flex flex-col items-center mb-6">
                  <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-[0_6px_0_rgba(153,27,27,1)] tracking-tighter">
                    민규의
                  </h1>
                  <h1 className="text-7xl md:text-9xl font-black text-yellow-300 drop-shadow-[0_10px_0_rgba(153,27,27,1)] tracking-tighter mt-1 italic leading-none">
                    분식 전쟁
                  </h1>
               </div>
            </div>
            
            {/* Buttons Container */}
            <div className="relative z-20 w-full max-w-[280px] flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-10 duration-700">
              <button 
                onClick={handleStart} 
                className="w-full bg-white hover:bg-yellow-50 text-red-600 text-2xl font-black py-2.5 rounded-2xl shadow-[0_5px_0_#d1d5db] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 border-[3px] border-white group"
              >
                <Play size={24} className="group-hover:scale-110 transition-transform" /> 영업 시작
              </button>
              
              <button 
                onClick={() => { playSFX('click'); setShowHelp(true); }} 
                className="w-full bg-red-800 hover:bg-red-900 text-white text-2xl font-black py-2.5 rounded-2xl shadow-[0_5px_0_#450a0a] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 border-[3px] border-red-500"
              >
                <Info size={24} /> 게임 방법
              </button>
            </div>
            
            <div className="absolute bottom-4 text-white font-black text-[12px] tracking-[0.2em] drop-shadow-md">Made by 지영잉</div>
          </div>
        )}

        {/* Help Modal */}
        {showHelp && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[100] p-6 backdrop-blur-md">
             <div className="bg-[#FFF4E0] p-6 rounded-[40px] w-full max-w-2xl border-[8px] border-[#4a2c2a] shadow-2xl relative">
                <button 
                  onClick={() => setShowHelp(false)} 
                  className="absolute -top-6 -right-6 bg-red-500 text-white p-3 rounded-full border-4 border-[#4a2c2a] shadow-lg active:scale-90"
                >
                  <X size={24} />
                </button>
                <h3 className="text-4xl font-black text-[#4a2c2a] mb-6 text-center tracking-tighter uppercase">게임 방법</h3>
                
                <div className="grid grid-cols-2 gap-4 text-left">
                   <div className="flex items-center gap-4 bg-white/90 p-4 rounded-2xl border-2 border-blue-100 shadow-sm">
                      <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center text-white font-black text-2xl shrink-0">1</div>
                      <p className="text-lg font-black text-gray-800 leading-tight">손님 <span className="text-blue-600">주문</span> 받기</p>
                   </div>
                   <div className="flex items-center gap-4 bg-white/90 p-4 rounded-2xl border-2 border-orange-100 shadow-sm">
                      <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-2xl shrink-0">2</div>
                      <p className="text-lg font-black text-gray-800 leading-tight">주방 메뉴로 <span className="text-orange-600">요리</span></p>
                   </div>
                   <div className="flex items-center gap-4 bg-white/90 p-4 rounded-2xl border-2 border-green-100 shadow-sm">
                      <div className="w-11 h-11 bg-green-500 rounded-xl flex items-center justify-center text-white font-black text-2xl shrink-0">3</div>
                      <p className="text-lg font-black text-gray-800 leading-tight">완성된 요리 <span className="text-green-600">서빙</span></p>
                   </div>
                   <div className="flex items-center gap-4 bg-white/90 p-4 rounded-2xl border-2 border-red-100 shadow-sm">
                      <div className="w-11 h-11 bg-red-500 rounded-xl flex items-center justify-center text-white font-black text-2xl shrink-0">4</div>
                      <p className="text-lg font-black text-gray-800 leading-tight"><span className="text-red-600">계산 및 청소</span></p>
                   </div>
                </div>

                <button 
                  onClick={() => setShowHelp(false)} 
                  className="w-full mt-6 bg-red-600 text-white text-2xl font-black py-4 rounded-2xl shadow-[0_6px_0_#991B1B] active:translate-y-1 active:shadow-none"
                >
                  가보자고!
                </button>
             </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-[200] p-4 text-center backdrop-blur-xl">
            <h2 className="text-5xl text-white mb-4 font-black tracking-tighter italic">영업 종료!</h2>
            
            <div className="bg-white/5 p-4 rounded-[30px] mb-6 border-4 border-white/10 w-full max-w-[320px] shadow-2xl">
               <p className="text-gray-400 text-lg mb-0.5 font-bold tracking-[0.2em] uppercase">Today's Revenue</p>
               <p className="text-yellow-400 text-5xl font-black drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">{score.toLocaleString()}원</p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-[280px]">
              <button 
                onClick={handleStart} 
                className="w-full flex items-center justify-center gap-3 bg-green-500 text-white text-2xl font-black py-3 rounded-2xl shadow-[0_6px_0_#166534] hover:bg-green-400 active:translate-y-0.5 active:shadow-none transition-all border-[3px] border-white/20"
              >
                <RotateCcw size={26} /> 다시 시작
              </button>
              
              <button 
                onClick={() => { playSFX('click'); setGameState('START'); }} 
                className="w-full flex items-center justify-center gap-3 bg-[#5D3A26] text-white text-2xl font-black py-3 rounded-2xl shadow-[0_6px_0_#2D1B0F] hover:bg-[#724a35] active:translate-y-0.5 active:shadow-none transition-all border-[3px] border-white/10"
              >
                <Home size={26} /> 메인으로
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
export { CustomerState };
