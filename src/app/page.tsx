'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CatFace } from '@/components/CatFace';
import { CatFaceState } from '@/components/CatFace/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { X, Clock, Sparkles } from 'lucide-react';
import { AiClarificationModal } from '@/components/AiClarificationModal';

export default function ZenPrompt() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const { globalCatState: catState, setGlobalCatState: setCatState } = useStore();
  const [isMounted, setIsMounted] = useState(false);
  const [breakingDownTaskId, setBreakingDownTaskId] = useState<string | null>(null);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const sleepTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const wakingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const sleepDurationRef = useRef<number>(20000);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (catState === 'idle') {
      sleepTimeoutRef.current = setTimeout(() => {
        setCatState('sleeping');
      }, sleepDurationRef.current);
      // Reset back to normal 20s for future idles
      sleepDurationRef.current = 20000;
    }
    return () => clearTimeout(sleepTimeoutRef.current);
  }, [catState]);
  
  const { tasks, addTask, updateTask, deleteTask, startDayTime, addSubTask, updateSubTask, deleteSubTask, goal, setClarificationPrompt } = useStore();
  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  const handleBreakdown = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setBreakingDownTaskId(taskId);
    setCatState('thinking');
    clearTimeout(typingTimeoutRef.current);
    
    try {
      const res = await fetch('/api/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle: task.title, durationMinutes: task.durationMinutes, goal })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate breakdown');
      
      if (data.type === 'clarification_needed' && data.clarification) {
        setClarificationPrompt({
          taskId,
          taskTitle: task.title,
          durationMinutes: task.durationMinutes,
          title: data.clarification.title,
          description: data.clarification.description,
          fields: data.clarification.fields
        });
        // Intentionally NOT setting catState to idle here, so it stays thinking while modal is open
      } else if (data.type === 'subtasks' && data.subtasks && Array.isArray(data.subtasks)) {
        for (const sub of data.subtasks) {
          addSubTask(taskId, sub.title, sub.durationMinutes);
        }
        setCatState('aha');
        setTimeout(() => setCatState('idle'), 1500);
      }
    } catch (e: any) {
      alert("AI Breakdown Error: " + e.message);
      setCatState('idle');
    } finally {
      setBreakingDownTaskId(null);
    }
  };

  if (!isMounted) return null;

  const handleCatClick = () => {
    if (catState === 'sleeping') {
      sleepDurationRef.current = 5000; // Sleep faster when poked
      setCatState('waking');
      clearTimeout(wakingTimeoutRef.current);
      wakingTimeoutRef.current = setTimeout(() => {
        setCatState('idle'); // Back to idle (with ear twitch/eye scratch)
      }, 3500); // 3.5s of waking animation
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (catState === 'thinking' || catState === 'aha' || breakingDownTaskId) return;

    if (catState === 'sleeping') {
      setCatState('waking');
      clearTimeout(wakingTimeoutRef.current);
      wakingTimeoutRef.current = setTimeout(() => {
        setCatState('typing');
      }, 1000); // Only wait 1s for waking before typing for smoothness
    } else if (catState !== 'typing' && catState !== 'waking') {
      setCatState('typing');
    }

    clearTimeout(typingTimeoutRef.current);
    // Always wait 2 seconds after typing stops before going to idle
    typingTimeoutRef.current = setTimeout(() => {
      setCatState('idle');
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim().length > 0) {
      addTask(inputValue.trim(), 'inbox', 60);
      setInputValue('');
      setCatState('idle');
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const startDay = () => {
    startDayTime(Date.now());
    tasks.forEach(t => {
      if (t.status === 'inbox') {
        updateTask(t.id, { status: 'scheduled' });
      }
    });
    router.push('/control-room');
  };

  return (
    <div className="flex-1 flex flex-col items-center min-h-screen pt-32 p-8 bg-primary text-text-main relative">
      <AiClarificationModal />
      <div className="flex flex-col items-center w-full max-w-3xl">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
           className="flex flex-col items-center"
        >
          <div onClick={handleCatClick} className={catState === 'sleeping' ? "cursor-pointer" : ""}>
            <CatFace state={catState} size={160} className="mb-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-light tracking-tight text-black mb-10 text-center">
            What's on your mind today?
          </h1>
        </motion.div>
        
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
           className="w-full flex flex-col items-center relative z-10"
        >
          <input 
            type="text"
            className="w-full max-w-2xl bg-white border border-gray-200 rounded-full px-8 py-4 text-base sm:text-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-left shadow-soft placeholder:text-gray-300 font-light tracking-tight"
            placeholder="Type a task and press Enter..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          
          <AnimatePresence>
          {pendingTasks.length > 0 ? (
            <motion.div 
               initial={{ opacity: 0, y: 20, height: 0 }}
               animate={{ opacity: 1, y: 0, height: 'auto' }}
               exit={{ opacity: 0, y: -20, height: 0 }}
               transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
               className="w-full max-w-xl mt-8 overflow-hidden"
            >
              <div className="bg-secondary rounded-3xl p-8 border border-gray-100 shadow-softer">
                <h3 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-[0.2em] text-center">Brain Dump</h3>
                <ul className="space-y-3 mb-8 max-h-[350px] overflow-y-auto pr-1">
                  <AnimatePresence>
                    {pendingTasks.map((task) => {
                      const remainingMinutes = Math.max(0, Math.ceil((task.durationMinutes * 60 - task.timeSpentSeconds) / 60));
                      const hasSubtasks = !!task.subtasks?.length;
                      return (
                        <div key={task.id} className="space-y-2">
                          <motion.li 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className={`flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm transition-all duration-300 ${breakingDownTaskId === task.id ? 'opacity-50 scale-98 border-amber-200 bg-amber-50/20' : ''} ${hasSubtasks ? 'border-l-4 border-l-black font-semibold' : ''}`}
                          >
                            <div className="flex items-center text-black font-medium flex-1 mr-4 min-w-0">
                              <div className={`w-1.5 h-1.5 rounded-full mr-4 shrink-0 ${hasSubtasks ? 'bg-black' : 'bg-gray-300'}`}></div>
                              <span className="truncate">{breakingDownTaskId === task.id ? "Meowmy is breaking down task..." : task.title}</span>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
                              <button 
                                onClick={() => handleBreakdown(task.id)}
                                disabled={breakingDownTaskId !== null || hasSubtasks}
                                className="text-gray-300 hover:text-amber-500 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all p-1 flex items-center justify-center"
                                title={hasSubtasks ? "Already broken down" : "AI Breakdown (✨)"}
                              >
                                <Sparkles size={15} className={breakingDownTaskId === task.id ? "animate-spin text-amber-500" : hasSubtasks ? "text-amber-400" : ""} />
                              </button>
                              <div className="flex items-center bg-gray-50 rounded-lg px-2 border border-gray-100 focus-within:border-gray-300 transition-colors">
                                <Clock size={12} className="text-gray-400 mr-1.5" />
                                <input 
                                   type="number"
                                   disabled={breakingDownTaskId === task.id}
                                   className="w-10 bg-transparent text-xs font-mono py-1.5 outline-none text-right disabled:opacity-70"
                                   value={remainingMinutes || ''}
                                   onChange={(e) => {
                                     const val = parseInt(e.target.value);
                                     const spentMinutes = Math.floor(task.timeSpentSeconds / 60);
                                     updateTask(task.id, { durationMinutes: isNaN(val) ? spentMinutes : val + spentMinutes });
                                   }}
                                />
                                <span className="text-[10px] text-gray-400 ml-1">m</span>
                              </div>
                              <button 
                                onClick={() => deleteTask(task.id)} 
                                disabled={breakingDownTaskId === task.id}
                                className="text-gray-300 hover:text-red-400 transition-colors p-1 disabled:opacity-30"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </motion.li>
                          
                          {/* Subtasks rendering */}
                          {hasSubtasks && (
                            <div className="pl-6 space-y-2 border-l border-gray-200 ml-5 pb-2">
                              <AnimatePresence>
                                {task.subtasks?.map((subtask) => (
                                  <motion.div 
                                    key={subtask.id}
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="flex items-center justify-between bg-white/70 px-4 py-2 rounded-xl border border-gray-100 shadow-sm"
                                  >
                                    <div className="flex items-center text-gray-700 text-sm flex-1 mr-4 min-w-0">
                                      <div className="w-1 h-1 rounded-full bg-gray-400 mr-3 shrink-0"></div>
                                      <span className="truncate">{subtask.title}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 shrink-0">
                                      <div className="flex items-center bg-gray-50/50 rounded-lg px-2 border border-gray-100 focus-within:border-gray-300 transition-colors">
                                        <Clock size={11} className="text-gray-400 mr-1.5" />
                                        <input 
                                           type="number"
                                           className="w-8 bg-transparent text-xs font-mono py-1 outline-none text-right"
                                           value={subtask.durationMinutes}
                                           onChange={(e) => updateSubTask(task.id, subtask.id, { durationMinutes: parseInt(e.target.value) || 0 })}
                                        />
                                        <span className="text-[10px] text-gray-400 ml-1">m</span>
                                      </div>
                                      <button onClick={() => deleteSubTask(task.id, subtask.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1">
                                        <X size={14} />
                                      </button>
                                    </div>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </AnimatePresence>
                </ul>
                
                <button 
                  onClick={startDay}
                  className="w-full bg-black hover:bg-gray-900 text-white rounded-full py-4 flex items-center justify-center font-semibold transition-transform active:scale-95 shadow-soft"
                >
                  Go to Control Room
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              whileHover={{ opacity: 1 }}
              onClick={startDay}
              className="mt-6 text-sm text-gray-500 hover:text-black transition-colors font-medium flex items-center"
            >
              Go to Control Room &rarr;
            </motion.button>
          )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
