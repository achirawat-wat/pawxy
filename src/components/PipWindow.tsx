'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CatFace } from './CatFace';
import { CatFaceState } from './CatFace/types';
import { Maximize2, Pause, Play, Check, PenLine, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useIdleTimerManager } from '@/hooks/useIdleTimerManager';

interface PipWindowProps {
  activeTask?: string;
  onComplete?: () => void;
  onClose?: () => void;
  children?: React.ReactNode;
  isGlobal?: boolean;
}

export function PipWindow({ activeTask, onComplete, onClose, children, isGlobal = false }: PipWindowProps) {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const pipContainer = useRef<HTMLDivElement | null>(null);
  const { globalCatState: catState, setGlobalCatState: setCatState, tasks, addTask, dayStartTime, registerPipTrigger, afkEnabled } = useStore();
  const [showCapture, setShowCapture] = useState(false);
  const [captureText, setCaptureText] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [showReschedule, setShowReschedule] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [isUiIdle, setIsUiIdle] = useState(false); // UI hover fade
  const [isAfkPaused, setIsAfkPaused] = useState(false);
  const [pipScale, setPipScale] = useState(1);

  // Register global PiP trigger
  useEffect(() => {
    if (isGlobal) {
      registerPipTrigger(requestPip);
    }
  }, [isGlobal, registerPipTrigger]);

  // Inactivity fade logic
  useEffect(() => {
    if (!pipWindow) return;

    let idleTimeout: NodeJS.Timeout;
    
    const resetIdle = () => {
      setIsUiIdle(false);
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => setIsUiIdle(true), 20000); // 20 seconds
    };

    // Attach to pipWindow's document
    pipWindow.document.addEventListener('mousemove', resetIdle);
    pipWindow.document.addEventListener('keydown', resetIdle);
    pipWindow.document.addEventListener('click', resetIdle);

    // Initial trigger
    resetIdle();

    return () => {
      pipWindow.document.removeEventListener('mousemove', resetIdle);
      pipWindow.document.removeEventListener('keydown', resetIdle);
      pipWindow.document.removeEventListener('click', resetIdle);
      clearTimeout(idleTimeout);
    };
  }, [pipWindow]);

  // Responsive scaling logic
  useEffect(() => {
    if (!pipWindow) return;
    
    const handleResize = () => {
      // Base design width
      const BASE_WIDTH = 340;
      const w = pipWindow.innerWidth;
      
      // Scale based purely on width to fit the window perfectly horizontally
      // (The height is small enough that it will comfortably fit)
      const scale = w / BASE_WIDTH;
      setPipScale(Math.max(1, scale));
    };

    pipWindow.addEventListener('resize', handleResize);
    // Initial calculation
    handleResize();

    return () => pipWindow.removeEventListener('resize', handleResize);
  }, [pipWindow]);

  // Calculate next task and durations based on the scheduled timeline
  const scheduledTasks = tasks.filter(t => t.status === 'scheduled');
  const inboxTasks = tasks.filter(t => t.status === 'inbox');
  
  // Prefer scheduled, but fallback to inbox if nothing is scheduled
  const computedActiveTaskObj = scheduledTasks.length > 0 
    ? scheduledTasks[0] 
    : (inboxTasks.length > 0 ? inboxTasks[0] : null);
  
  const activeSubtask = computedActiveTaskObj?.subtasks?.find(st => !st.completed);
  const computedActiveTask = activeTask || (
    activeSubtask 
      ? `${computedActiveTaskObj!.title} › ${activeSubtask.title}`
      : (computedActiveTaskObj ? computedActiveTaskObj.title : "No Active Task")
  );
  
  const computedOnComplete = onComplete || (() => {});

  let currentTaskTime = new Date(dayStartTime || Date.now());
  let nextTaskTitle = "";
  let nextTaskTime = "";
  let activeTaskEndTime = 0;

  for (let i = 0; i < scheduledTasks.length; i++) {
    const task = scheduledTasks[i];
    if (task.title === computedActiveTask) {
       currentTaskTime = new Date(currentTaskTime.getTime() + task.durationMinutes * 60000);
       activeTaskEndTime = currentTaskTime.getTime();
       if (i + 1 < scheduledTasks.length) {
         nextTaskTitle = scheduledTasks[i+1].title;
         nextTaskTime = currentTaskTime.toLocaleTimeString('en-US', { 
           timeZone: 'Asia/Bangkok', 
           hour: '2-digit', 
           minute: '2-digit', 
           hour12: false 
         });
       }
       break;
    } else {
       currentTaskTime = new Date(currentTaskTime.getTime() + task.durationMinutes * 60000);
    }
  }

  const activeTaskObj = computedActiveTaskObj;
  
  // Default to 0 instead of 45 if no task exists
  const durationSeconds = activeSubtask
     ? Math.max(0, activeSubtask.durationMinutes * 60 - (activeSubtask.timeSpentSeconds || 0))
     : (activeTaskObj 
        ? Math.max(0, activeTaskObj.durationMinutes * 60 - (activeTaskObj.timeSpentSeconds || 0)) 
        : 0);
  
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isOvertime, setIsOvertime] = useState(false);
  const endTimeRef = useRef<number | null>(null);

  const targetObj = activeSubtask || activeTaskObj;
  const targetDuration = targetObj ? targetObj.durationMinutes : 0;
  const targetId = targetObj ? targetObj.id : null;

  // AFK Auto-Pause Logic
  const onAfkIdle = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      setIsAfkPaused(true);
      endTimeRef.current = null;
      if (activeTaskObj) {
        const timeSpent = (activeSubtask ? activeSubtask.durationMinutes : activeTaskObj.durationMinutes) * 60 - timeLeft;
        if (activeSubtask) {
          useStore.getState().updateSubTask(activeTaskObj.id, activeSubtask.id, { timeSpentSeconds: timeSpent });
        } else {
          useStore.getState().updateTask(activeTaskObj.id, { timeSpentSeconds: timeSpent });
        }
      }
    }
  }, [isRunning, activeTaskObj, activeSubtask, timeLeft]);

  const onAfkActive = useCallback(() => {
    if (isAfkPaused) {
      setIsRunning(true);
      setIsAfkPaused(false);
      endTimeRef.current = Date.now() + timeLeft * 1000;
    }
  }, [isAfkPaused, activeTaskObj, timeLeft]);

  useIdleTimerManager(afkEnabled, onAfkIdle, onAfkActive);

  // Initialize or reset timer only when the active task/subtask changes
  useEffect(() => {
    if (targetObj) {
      const remaining = targetObj.durationMinutes * 60 - (targetObj.timeSpentSeconds || 0);
      setTimeLeft(remaining);
      if (remaining < 0) {
        setIsOvertime(true);
      } else {
        setIsOvertime(false);
      }
      if (isRunning) {
        endTimeRef.current = Date.now() + remaining * 1000;
      }
    } else {
      setTimeLeft(0);
      setIsOvertime(false);
      endTimeRef.current = null;
      setIsRunning(false);
    }
  }, [targetId]); 

  // Handle Play/Pause and calculate from real time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && pipWindow && !showReschedule && !showCapture) {
      interval = setInterval(() => {
        if (endTimeRef.current) {
          const remaining = Math.floor((endTimeRef.current - Date.now()) / 1000);
          
          if (remaining <= 0 && !isOvertime) {
            setTimeLeft(0);
            setIsRunning(false);
            
            // Sync exact final time to store to prevent desync jumps
            if (activeTaskObj) {
              if (activeSubtask) {
                useStore.getState().updateSubTask(activeTaskObj.id, activeSubtask.id, { timeSpentSeconds: activeSubtask.durationMinutes * 60 });
              } else {
                useStore.getState().updateTask(activeTaskObj.id, { timeSpentSeconds: activeTaskObj.durationMinutes * 60 });
              }
            }
          } else {
            setTimeLeft(remaining);
            
            // Sync to store every 5 seconds to reduce re-renders
            if (Math.abs(remaining) % 5 === 0 && activeTaskObj) {
              if (activeSubtask) {
                const newTimeSpent = activeSubtask.durationMinutes * 60 - remaining;
                useStore.getState().updateSubTask(activeTaskObj.id, activeSubtask.id, { timeSpentSeconds: newTimeSpent });
              } else {
                const newTimeSpent = activeTaskObj.durationMinutes * 60 - remaining;
                useStore.getState().updateTask(activeTaskObj.id, { timeSpentSeconds: newTimeSpent });
              }
            }
          }
        }
      }, 500); 
    }
    return () => clearInterval(interval);
  }, [isRunning, pipWindow, showReschedule, showCapture, activeTaskObj, activeSubtask, isOvertime]);



  // Update global store for Control Room UI
  useEffect(() => {
    useStore.getState().setPipState({
      isPipActive: !!pipWindow,
      pipIsRunning: isRunning,
      pipTimeLeft: timeLeft,
      pipIsAfkPaused: isAfkPaused
    });
  }, [pipWindow, isRunning, timeLeft, isAfkPaused]);

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      endTimeRef.current = null;
      if (activeTaskObj) {
        if (activeSubtask) {
          useStore.getState().updateSubTask(activeTaskObj.id, activeSubtask.id, { timeSpentSeconds: activeSubtask.durationMinutes * 60 - timeLeft });
        } else {
          useStore.getState().updateTask(activeTaskObj.id, { timeSpentSeconds: activeTaskObj.durationMinutes * 60 - timeLeft });
        }
      }
    } else {
      setIsRunning(true);
      endTimeRef.current = Date.now() + timeLeft * 1000;
    }
  };

  const toggleTimerRef = useRef(toggleTimer);
  useEffect(() => {
    toggleTimerRef.current = toggleTimer;
  }, [toggleTimer]);

  useEffect(() => {
    useStore.getState().registerPipToggle(() => {
      if (toggleTimerRef.current) {
        toggleTimerRef.current();
      }
    });
  }, []);

  const adjustTime = (minutes: number) => {
    if (!activeTaskObj) return;
    if (activeSubtask) {
      const newDuration = Math.max(1, activeSubtask.durationMinutes + minutes);
      useStore.getState().updateSubTask(activeTaskObj.id, activeSubtask.id, { durationMinutes: newDuration });
    } else {
      const newDuration = Math.max(1, activeTaskObj.durationMinutes + minutes);
      useStore.getState().updateTask(activeTaskObj.id, { durationMinutes: newDuration });
    }
    
    // Adjust local remaining time and ref
    const addedSeconds = minutes * 60;
    setTimeLeft(prev => {
      const newTime = prev + addedSeconds;
      if (endTimeRef.current) {
        endTimeRef.current = Date.now() + newTime * 1000;
      }
      if (newTime >= 0) {
        setIsOvertime(false);
      }
      return newTime;
    });
  };

  const formatTimeLeft = (seconds: number) => {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const m = Math.floor(absSeconds / 60);
    const s = absSeconds % 60;
    return `${isNegative ? '+' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const requestPip = async () => {
    // @ts-ignore
    if (!('documentPictureInPicture' in window)) {
      alert('Document PiP is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      // @ts-ignore
      const pip = await window.documentPictureInPicture.requestWindow({
        width: 320,
        height: 100,
      });

      // Initial window requested


      // Copy styles
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = document.createElement('style');
          style.textContent = cssRules;
          pip.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.media = styleSheet.media.mediaText;
          link.href = styleSheet.href!;
          pip.document.head.appendChild(link);
        }
      });

      // Reset default margins/paddings on PiP document to prevent height overflow
      const resetStyle = pip.document.createElement('style');
      resetStyle.textContent = `
        *, *::before, *::after { box-sizing: border-box; }
        html {
          margin: 0 !important;
          padding: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          overflow: hidden !important;
        }
        #pip-root {
          display: inline-flex !important;
        }
      `;
      pip.document.head.appendChild(resetStyle);

      const container = pip.document.createElement('div');
      container.id = 'pip-root';
      
      // Use Tailwind classes to apply the primary background color and text color to the full body
      pip.document.body.className = "bg-primary text-text-main font-sans antialiased";
      pip.document.body.style.cssText = "margin:0;padding:0;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;";
      pip.document.body.appendChild(container);
      pipContainer.current = container;
      setPipWindow(pip);

      pip.addEventListener('pagehide', () => {
        setPipWindow(null);
        if (onClose) onClose();
      });

      pip.addEventListener('keydown', (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          setShowCapture(prev => !prev);
        }
        if (e.key === 'Escape') {
          setShowCapture(false);
        }
      });

    } catch (error) {
      console.error('Failed to open PiP:', error);
    }
  };

  const submitCapture = (type: 'do_now' | 'queue' | 'note') => {
    if (!captureText.trim()) return;
    
    setCatState('thinking');
    
    if (type === 'do_now') {
       const store = useStore.getState();
       store.addTask(captureText, 'scheduled', 15);
       const scheduledTasks = store.tasks.filter(t => t.status === 'scheduled');
       // The new task is added at the end of all tasks. 
       // reorderTasks logic in store moves the task at the given status-relative index to the new index.
       // The new task is currently at scheduledTasks.length. (addTask adds, so the new length is scheduledTasks.length + 1)
       // Wait, `addTask` doesn't return the new task, and reorderTasks uses current state.
       // It's safer to just let reorderTasks handle it. The newly added task is at the end of scheduled tasks.
       store.reorderTasks('scheduled', scheduledTasks.length, 0); 
       
       setShowReschedule(true);
       setShowCapture(false);
       setTimeout(() => setCatState('idle'), 1500);
    } else if (type === 'queue') {
       useStore.getState().addTask(captureText, 'inbox');
       setShowReschedule(true);
       setShowCapture(false);
       setTimeout(() => setCatState('idle'), 1500);
    } else {
       if (activeTaskObj) {
         useStore.getState().addNote(activeTaskObj.id, captureText);
       }
       setTimeout(() => {
         setCatState('celebration');
         setCaptureText('');
         setShowCapture(false);
         setTimeout(() => setCatState('idle'), 1500);
       }, 800);
    }
  };

  const handleComplete = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    
    setCatState('celebration');
    
    setTimeout(() => {
      if (activeTaskObj) {
        const nextSub = activeTaskObj.subtasks?.find(st => !st.completed);
        if (nextSub) {
          // Complete the subtask
          useStore.getState().updateSubTask(activeTaskObj.id, nextSub.id, { completed: true });
          
          // Check if that was the last subtask
          const remainingSubs = activeTaskObj.subtasks?.filter(st => st.id !== nextSub.id && !st.completed) || [];
          if (remainingSubs.length === 0) {
             useStore.getState().completeTask(activeTaskObj.id);
             computedOnComplete();
             if (activeTaskObj.notes && activeTaskObj.notes.length > 0) {
               window.dispatchEvent(new CustomEvent('triggerAiNoteFollowup', { detail: { taskId: activeTaskObj.id, title: activeTaskObj.title, notes: activeTaskObj.notes } }));
             }
          }
        } else {
          useStore.getState().completeTask(activeTaskObj.id);
          computedOnComplete();
          if (activeTaskObj.notes && activeTaskObj.notes.length > 0) {
            window.dispatchEvent(new CustomEvent('triggerAiNoteFollowup', { detail: { taskId: activeTaskObj.id, title: activeTaskObj.title, notes: activeTaskObj.notes } }));
          }
        }
      }
      setCatState('idle');
      // Auto-play the next task immediately
      setIsRunning(true);
    }, 1500);
  };

  const fadeClass = `transition-opacity duration-1000 ${isUiIdle && !showCapture && !showReschedule ? 'opacity-20' : 'opacity-100'}`;

  if (!isMounted) return null;
  if (isGlobal && !pipWindow) return null;

  const isCurrentBreak = activeTaskObj?.type === 'break' || activeSubtask?.type === 'break';

  return (
    <>
      {children ? (
        <div onClick={() => !pipWindow && requestPip()}>
          {children}
        </div>
      ) : (
        !isGlobal && (
          <button 
            onClick={requestPip} 
            disabled={!!pipWindow}
            className="px-6 py-3 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors shadow-soft flex items-center justify-center w-full max-w-sm"
          >
            <Maximize2 size={18} className="mr-2" />
            {pipWindow ? 'Focus Mode Active (PiP)' : 'Start Focus Mode (PiP)'}
          </button>
        )
      )}

      {pipWindow && pipContainer.current &&
        createPortal(
          <div style={{ zoom: pipScale }}>
            <div className="relative inline-flex flex-row items-center gap-3 p-3 select-none text-text-main box-border">
              
              {/* Left: Meowmy (Cat) */}
              <div className="w-14 h-14 flex items-center justify-center bg-gray-50/80 rounded-xl border border-gray-100 flex-shrink-0 overflow-hidden shadow-sm">
                <CatFace state={catState} size={56} className="transition-all duration-300" />
              </div>

            {/* Middle: Separator */}
            <div className="w-[1px] h-8 bg-gray-200/80 flex-shrink-0" />

            {/* Right: Controls & Info */}
            <div className="flex flex-col gap-0.5">
              <div className={`flex flex-col ${fadeClass}`}>
                <span className={`text-[8px] font-bold uppercase tracking-wider truncate max-w-[180px] ${isAfkPaused ? 'text-indigo-500 animate-pulse' : isCurrentBreak ? 'text-blue-400' : 'text-gray-400'}`}>
                  {isAfkPaused ? "AWAY (AUTO-PAUSED) 🌙" : isCurrentBreak ? "BREAK TIME ☕" : (activeSubtask && activeTaskObj ? activeTaskObj.title : "CURRENT FOCUS")}
                </span>
                <h1 className={`text-[11px] font-semibold leading-tight truncate max-w-[180px] ${isAfkPaused ? 'text-indigo-900 opacity-60' : isCurrentBreak ? 'text-blue-900' : 'text-black'}`}>
                  {isCurrentBreak ? (activeSubtask ? activeSubtask.title : 'Time to recharge') : (activeSubtask ? activeSubtask.title : computedActiveTask)}
                </h1>
                {nextTaskTitle && !isAfkPaused && (
                  <p className="text-[9px] text-gray-400 font-medium truncate max-w-[180px]">
                    Next: {nextTaskTitle} • {nextTaskTime}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-1.5">
                <div className={`text-sm tabular-nums tracking-tight leading-none flex items-center gap-1 ${
                    timeLeft === 0 && !isOvertime ? 'text-red-500 font-bold animate-pulse' : 
                    !isRunning ? 'text-orange-500 font-medium' : 
                    isCurrentBreak ? 'text-blue-600 font-medium' : 'text-black font-light'
                  }`}
                >
                  {!isRunning && timeLeft > 0 && <Pause size={10} className="text-orange-500" />}
                  {timeLeft === 0 && !isOvertime ? "00:00" : formatTimeLeft(timeLeft)}
                </div>
                {timeLeft === 0 && !isOvertime && (
                  <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1 py-0.5 rounded ml-1 animate-pulse">TIME UP!</span>
                )}
                
                {timeLeft === 0 && !isOvertime ? (
                  <div className={`flex items-center gap-1.5 ml-2 ${fadeClass}`}>
                    <button 
                      className="px-2 py-1 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold text-[9px] transition-colors shadow-sm flex items-center"
                      onClick={() => {
                        setIsOvertime(true);
                        setIsRunning(true);
                        endTimeRef.current = Date.now();
                        setCatState('idle');
                      }}
                    >
                      + Continue
                    </button>
                    <button 
                      className="px-2.5 py-1 rounded-full bg-black hover:bg-gray-800 text-white font-semibold text-[9px] transition-colors shadow-sm flex items-center"
                      onClick={handleComplete}
                    >
                      <Check size={10} className="mr-0.5" /> Done
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={`flex items-center gap-0.5 ${fadeClass}`}>
                      <button onClick={() => adjustTime(-5)} className="text-[8px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-500 px-1 py-0.5 rounded transition-colors">-5m</button>
                      <button onClick={() => adjustTime(5)} className="text-[8px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-500 px-1 py-0.5 rounded transition-colors">+5m</button>
                    </div>
                    <div className={`flex items-center gap-1 ${fadeClass}`}>
                      <button 
                        className="p-1 rounded-full bg-secondary hover:bg-gray-200 text-black transition-colors border border-gray-100 flex-shrink-0"
                        onClick={() => setShowCapture(true)}
                        title="Capture"
                      >
                        <PenLine size={11} />
                      </button>
                      <button 
                        className="p-1 rounded-full bg-secondary hover:bg-gray-200 text-black transition-colors border border-gray-100 flex-shrink-0"
                        onClick={toggleTimer}
                        title={isRunning ? "Pause" : "Play"}
                      >
                        {isRunning ? <Pause size={11} /> : <Play size={11} />}
                      </button>
                      <button 
                        className={`px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 active:scale-95 flex-shrink-0 ${isCurrentBreak ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-black hover:bg-gray-800 text-white'}`}
                        onClick={handleComplete}
                      >
                        <Check size={10} className="shrink-0" />
                        <span className="font-semibold text-[9px]">{isCurrentBreak ? 'Skip' : 'Done'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Universal Capture Overlay */}
            {showCapture && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col justify-center px-4 animate-in fade-in duration-200">
                <button 
                  onClick={() => setShowCapture(false)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                  title="Close (Esc)"
                >
                  <X size={12} />
                </button>
                <input 
                  autoFocus
                  type="text"
                  placeholder="Capture thought..."
                  className="w-full bg-transparent border-b-2 border-black outline-none text-sm text-black placeholder:text-gray-400 pb-1 font-medium mb-3"
                  value={captureText}
                  onChange={e => {
                     setCaptureText(e.target.value);
                     if (catState !== 'typing' && catState !== 'thinking' && catState !== 'celebration') {
                        setCatState('typing');
                     }
                  }}
                  onBlur={() => {
                     if (catState === 'typing') setCatState('idle'); // Fallback in case they stop typing
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') submitCapture('queue');
                  }}
                />
                <div className="flex w-full space-x-1.5">
                  <button onClick={() => submitCapture('do_now')} className="flex-1 py-1.5 text-[9px] font-bold rounded bg-indigo-500 hover:bg-indigo-600 text-white transition-transform active:scale-95 shadow-soft border border-indigo-600">
                    ⚡ Now
                  </button>
                  <button onClick={() => submitCapture('queue')} className="flex-1 py-1.5 text-[9px] font-bold rounded bg-black hover:bg-gray-800 text-white transition-transform active:scale-95 shadow-soft">
                    + Queue
                  </button>
                  <button onClick={() => submitCapture('note')} className="flex-1 py-1.5 text-[9px] font-semibold rounded bg-white text-black border border-gray-200 hover:border-black transition-all active:scale-95 shadow-softer">
                    Note
                  </button>
                </div>
              </div>
            )}

            {/* Reschedule Overlay */}
            {showReschedule && (
              <div className="absolute inset-0 bg-primary z-40 flex flex-col justify-center items-center p-4 animate-in fade-in duration-200">
                <h2 className="text-xs font-bold text-black mb-1">Captured!</h2>
                <p className="text-[10px] text-gray-500 mb-3 text-center truncate w-full">{captureText}</p>
                <button 
                  className="px-6 py-1.5 bg-black text-white rounded-full text-xs font-semibold shadow-soft transition-transform active:scale-95"
                  onClick={() => { setShowReschedule(false); setCaptureText(''); }}
                >
                  OK
                </button>
              </div>
            )}
          </div>
          </div>,
          pipContainer.current
        )
      }
    </>
  );
}
