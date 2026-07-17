'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, GripVertical, Inbox, Clock, Play, Pause, CheckCircle, Circle, Moon, Wand2, Loader2 } from 'lucide-react';
import { CatFace } from '@/components/CatFace';
import { useState, useEffect, useRef, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useStore, TaskStatus } from '@/lib/store';
import { useIdleTimerManager } from '@/hooks/useIdleTimerManager';



export default function ControlRoom() {
  const router = useRouter();
  const [isDayStarted, setIsDayStarted] = useState(false);
  const { 
    tasks, moveTask, reorderTasks, goal, clearTasks, updateTask, triggerPip, addSubTask, updateSubTask, deleteSubTask, reorderSubTasks,
    isPipActive, pipIsRunning, pipTimeLeft, pipToggleTimer, afkEnabled, setAfkEnabled, pipIsAfkPaused,
    globalCatState, setGlobalCatState
  } = useStore();
  const [isMounted, setIsMounted] = useState(false);


  // Initialize hook purely for permission management in this component
  const { requestPermission } = useIdleTimerManager(false, () => {}, () => {});

  const handleAfkToggle = async () => {
    if (!afkEnabled) {
      const granted = await requestPermission();
      if (!granted) {
        // Just a gentle console note; fallback will be used automatically
        console.log("Idle detection permission denied or unavailable. Using fallback.");
      }
      setAfkEnabled(true);
    } else {
      setAfkEnabled(false);
    }
  };

  const formatTimeLeft = (seconds: number) => {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const m = Math.floor(absSeconds / 60);
    const s = absSeconds % 60;
    return `${isNegative ? '+' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const sleepTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const wakingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const celebrationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const dragTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const sleepDurationRef = useRef<number>(20000);

  const getBaseState = useCallback(() => {
    if (isPipActive) {
       const activeTask = tasks.filter(t => t.status === 'scheduled')[0];
       if (!activeTask) return 'idle';
       
       if (pipIsAfkPaused) return 'brb';
       if (!pipIsRunning) return 'break'; // "stop" state
       if (activeTask.type === 'break') return 'break'; // "break" state
       if (pipTimeLeft <= 60 && pipTimeLeft > 0) return 'urgent';
       return 'focused';
    }
    return 'idle';
  }, [isPipActive, pipIsRunning, pipTimeLeft, pipIsAfkPaused, tasks]);

  useEffect(() => {
     const expectedBase = getBaseState();
     if ((globalCatState === 'idle' || globalCatState === 'sleeping') && expectedBase !== 'idle') {
        if (globalCatState === 'sleeping') {
           setGlobalCatState('waking');
           clearTimeout(wakingTimeoutRef.current);
           wakingTimeoutRef.current = setTimeout(() => setGlobalCatState(expectedBase), 1000);
        } else {
           setGlobalCatState(expectedBase);
        }
     } else if (!['waking', 'typing', 'celebration', 'searching'].includes(globalCatState)) {
        if (globalCatState !== expectedBase && globalCatState !== 'sleeping') {
           setGlobalCatState(expectedBase);
        }
     }
  }, [getBaseState, globalCatState, setGlobalCatState]);

  useEffect(() => {
    if (globalCatState === 'idle') {
      sleepTimeoutRef.current = setTimeout(() => {
        setGlobalCatState('sleeping');
      }, sleepDurationRef.current);
      sleepDurationRef.current = 20000;
    }
    return () => clearTimeout(sleepTimeoutRef.current);
  }, [globalCatState, setGlobalCatState]);

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const scheduledTasks = tasks.filter(t => t.status === 'scheduled');
  const inboxTasks = tasks.filter(t => t.status === 'inbox');

  const completedCount = completedTasks.length + tasks.reduce((acc, t) => acc + (t.subtasks?.filter(s => s.completed).length || 0), 0);
  const prevCompletedCountRef = useRef(completedCount);
  useEffect(() => {
     if (completedCount > prevCompletedCountRef.current) {
        setGlobalCatState('celebration');
        clearTimeout(celebrationTimeoutRef.current);
        celebrationTimeoutRef.current = setTimeout(() => {
           setGlobalCatState(getBaseState());
        }, 3000);
     }
     prevCompletedCountRef.current = completedCount;
  }, [completedCount, getBaseState, setGlobalCatState]);

  const handleCatClick = () => {
    if (globalCatState === 'sleeping') {
      sleepDurationRef.current = 5000;
      setGlobalCatState('waking');
      clearTimeout(wakingTimeoutRef.current);
      wakingTimeoutRef.current = setTimeout(() => {
        setGlobalCatState('idle');
      }, 3500);
    }
  };

  const handleInputChange = useCallback(() => {
    if (globalCatState === 'thinking' || globalCatState === 'aha' || globalCatState === 'celebration') return;

    if (globalCatState === 'sleeping') {
      setGlobalCatState('waking');
      clearTimeout(wakingTimeoutRef.current);
      wakingTimeoutRef.current = setTimeout(() => {
        setGlobalCatState('typing');
      }, 1000);
    } else if (globalCatState !== 'typing' && globalCatState !== 'waking') {
      setGlobalCatState('typing');
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setGlobalCatState(getBaseState());
    }, 2000);
  }, [globalCatState, getBaseState, setGlobalCatState]);

  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
           if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
               handleInputChange();
           }
        }
     };
     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInputChange]);

  useEffect(() => {
     const handleMouseDown = (e: MouseEvent) => {
        if (e.target instanceof HTMLElement && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.closest('.catface-wrapper'))) {
           return;
        }
        
        const currentState = useStore.getState().globalCatState;
        if (!['waking', 'typing', 'celebration', 'searching', 'thinking', 'aha', 'sleeping'].includes(currentState)) {
           useStore.getState().setGlobalCatState('searching');
           clearTimeout(dragTimeoutRef.current);
           dragTimeoutRef.current = setTimeout(() => {
              useStore.getState().setGlobalCatState(getBaseState());
           }, 5000); // 5s look around for clicks too
        }
     };
     window.addEventListener('mousedown', handleMouseDown, true);
     return () => window.removeEventListener('mousedown', handleMouseDown, true);
  }, [getBaseState]);

  const onDragStart = () => {
     const currentState = useStore.getState().globalCatState;
     clearTimeout(dragTimeoutRef.current); // Prevent mousedown from cutting the drag short
     if (currentState === 'sleeping') {
        useStore.getState().setGlobalCatState('waking');
        clearTimeout(wakingTimeoutRef.current);
        wakingTimeoutRef.current = setTimeout(() => {
           useStore.getState().setGlobalCatState('searching');
        }, 1000);
     } else if (!['waking', 'typing', 'celebration'].includes(currentState)) {
        useStore.getState().setGlobalCatState('searching');
     }
  };

  const onDragEnd = (result: DropResult) => {
    clearTimeout(dragTimeoutRef.current);
    dragTimeoutRef.current = setTimeout(() => {
       useStore.getState().setGlobalCatState(getBaseState());
    }, 5000);
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      reorderTasks(source.droppableId as TaskStatus, source.index, destination.index);
    } else {
      moveTask(draggableId, destination.droppableId as TaskStatus, destination.index);
    }
  };

  const totalTrackedTasks = completedTasks.length + scheduledTasks.length;
  const progressPercent = totalTrackedTasks > 0 ? (completedTasks.length / totalTrackedTasks) * 100 : 0;
  
  const activeTaskTitle = scheduledTasks.length > 0 ? scheduledTasks[0].title : "Timeline Focus";

  const { dayStartTime } = useStore();
  
  const completedOffsetMs = completedTasks.reduce((acc, t) => {
    const durationSeconds = t.durationMinutes * 60;
    const actualSeconds = t.timeSpentSeconds;
    return acc + Math.max(durationSeconds, actualSeconds) * 1000;
  }, 0);
  
  const startTime = new Date((dayStartTime || Date.now()) + completedOffsetMs);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      timeZone: 'Asia/Bangkok', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${minutes}m`;
  };

  let currentTaskTimeCalc = new Date(startTime);
  const scheduledTasksWithTime = scheduledTasks.map(task => {
    const taskStart = new Date(currentTaskTimeCalc);
    const remainingSeconds = Math.max(0, task.durationMinutes * 60 - task.timeSpentSeconds);
    currentTaskTimeCalc = new Date(currentTaskTimeCalc.getTime() + remainingSeconds * 1000);
    const taskEnd = currentTaskTimeCalc;
    return { task, taskStart, taskEnd, remainingSeconds };
  });

  if (!isMounted) return null; // Avoid hydration mismatch with DND

  return (
    <div className="min-h-screen bg-secondary text-text-main p-8 pt-12 animate-in fade-in duration-500 relative">
      <div className="max-w-[1400px] w-full mx-auto px-2 sm:px-6 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Context & Mascot */}
        <div className="lg:w-1/3 flex flex-col space-y-6 sticky top-12 h-fit">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-softer flex flex-col items-center">
            <div onClick={handleCatClick} className="cursor-pointer">
              <CatFace state={globalCatState} size={128} className="mb-8 mt-4" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Today's Focus</span>
            <h2 className="text-xl font-medium text-center text-black leading-tight">
              {goal || "Conquer the world"}
            </h2>
            <div className="mt-8 w-full border-t border-gray-100 pt-6">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-xs font-semibold text-gray-500">Timeline</span>
                 <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                    {formatTime(startTime)} - {formatTime(currentTaskTimeCalc)}
                 </span>
               </div>
               <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                 <div 
                   className="bg-black h-full rounded-full transition-all duration-500 ease-out" 
                   style={{ width: `${progressPercent}%` }}
                 ></div>
               </div>
            </div>
          </div>
          
          <button 
             onClick={() => router.push('/')}
             className="w-full py-4 bg-white border border-gray-200 rounded-2xl text-sm font-semibold hover:border-black transition-colors shadow-soft"
          >
            &larr; Back to Brain Dump
          </button>
          
          <button 
             onClick={() => window.dispatchEvent(new CustomEvent('triggerAiDailyReview'))}
             className="w-full py-4 bg-black text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-soft flex items-center justify-center gap-2"
          >
            🌙 End Day & Review
          </button>
        </div>

        {/* Right Column: Kanban/Timeline Boards */}
        <div className="lg:w-2/3">
          <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Inbox Column */}
              <div className="flex flex-col md:col-span-2">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-sm font-bold text-black uppercase tracking-widest flex items-center">
                    <Inbox size={16} className="mr-2 text-gray-400" />
                    Inbox
                  </h3>
                  <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    {inboxTasks.length}
                  </span>
                </div>
                
                <Droppable droppableId="inbox">
                  {(provided, snapshot) => (
                    <div 
                      className={`min-h-[500px] p-4 rounded-2xl transition-colors border ${snapshot.isDraggingOver ? 'bg-white border-gray-300' : 'bg-transparent border-transparent'}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <div className="space-y-3">
                        {inboxTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 bg-white rounded-xl border ${snapshot.isDragging ? 'border-black shadow-lg scale-105' : 'border-gray-200 shadow-sm hover:border-gray-300'} transition-all relative group flex flex-col items-stretch`}
                                style={provided.draggableProps.style}
                              >
                                <div className="flex items-center w-full">
                                  <GripVertical size={16} className="text-gray-300 mr-3 cursor-grab shrink-0" />
                                  <div className="flex-1 overflow-hidden">
                                    <p className="font-medium text-sm truncate">{task.title}</p>
                                  </div>
                                    <div className="flex items-center space-x-2 ml-3 shrink-0">

                                      <button 
                                        onClick={() => updateTask(task.id, { status: 'scheduled' })}
                                        className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                                        title="Quick Schedule"
                                      >
                                        ⚡
                                      </button>
                                    <input 
                                       type="number"
                                       className="w-12 bg-gray-50 text-xs font-mono py-1 px-1.5 rounded outline-none border border-transparent focus:border-gray-300 text-right"
                                       value={task.durationMinutes || ''}
                                       onChange={(e) => {
                                         const val = parseInt(e.target.value);
                                         updateTask(task.id, { durationMinutes: isNaN(val) ? 0 : val });
                                       }}
                                    />
                                    <span className="text-[10px] text-gray-400">m</span>
                                  </div>
                                </div>
                                
                                {task.subtasks && task.subtasks.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-gray-50 pl-6 space-y-1">
                                    {task.subtasks.map((sub, idx) => (
                                      <div key={idx} className="flex justify-between items-center text-xs text-gray-500">
                                        <span className="truncate mr-2">• {sub.title}</span>
                                        <span className="font-mono text-[10px] shrink-0">{sub.durationMinutes}m</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>

              {/* Scheduled Column */}
              <div className="flex flex-col md:col-span-3">
                <div className="flex flex-row flex-wrap items-center justify-between mb-4 px-2 gap-3">
                  <h3 className="text-sm font-bold text-black uppercase tracking-widest flex items-center shrink-0">
                    <Clock size={16} className="mr-2 text-gray-400" />
                    Up Next
                  </h3>
                  <div className="flex flex-wrap space-x-1.5 sm:space-x-2 items-center">
                    <button 
                      onClick={handleAfkToggle}
                      className={`text-[11px] sm:text-xs font-semibold px-2 py-1.5 rounded-full transition-colors flex items-center gap-1 ${afkEnabled ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 shadow-sm' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}
                      title="Auto-pause when away"
                    >
                      <Moon size={12} className={afkEnabled ? 'fill-indigo-700' : ''} />
                      AFK {afkEnabled ? 'ON' : 'OFF'}
                    </button>
                    <button onClick={() => useStore.getState().addBreak(5)} className="text-[11px] sm:text-xs text-blue-500 hover:text-blue-600 font-semibold px-2 flex items-center gap-1 bg-blue-50/50 hover:bg-blue-100/50 py-1.5 rounded-full transition-colors"><span className="text-[10px]">☕</span> +5m Break</button>
                    <div className="w-px h-3 bg-gray-200 shrink-0"></div>
                    <button onClick={clearTasks} className="text-[11px] sm:text-xs text-red-400 hover:text-red-500 font-semibold px-2 py-1.5 hover:bg-red-50/50 rounded-full transition-colors shrink-0">Reset</button>
                    <button 
                      onClick={triggerPip}
                      className="text-[11px] sm:text-xs font-semibold bg-black text-white px-3 sm:px-4 py-1.5 rounded-full shadow-soft hover:bg-gray-800 transition-colors shrink-0"
                    >
                      Start Focus
                    </button>
                  </div>
                </div>

                <Droppable droppableId="scheduled">
                  {(provided, snapshot) => (
                    <div 
                      className={`min-h-[500px] p-6 rounded-2xl border-2 border-dashed transition-colors ${snapshot.isDraggingOver ? 'border-black bg-gray-100/50' : 'border-gray-200 bg-white/50'}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {scheduledTasksWithTime.length === 0 && !snapshot.isDraggingOver && (
                         <div className="h-full flex items-center justify-center text-text-muted text-sm flex-col space-y-2 mt-20">
                            <span>Drag tasks here to plan your day</span>
                         </div>
                      )}
                      
                      <div className="space-y-4">
                        {scheduledTasksWithTime.map(({ task, taskStart, taskEnd, remainingSeconds }, index) => {
                          const isPartiallyDone = task.timeSpentSeconds > 0;
                          return (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`p-5 rounded-xl border ${
                                      snapshot.isDragging 
                                        ? 'border-black shadow-lg scale-105 z-50 bg-white' 
                                        : (index === 0 && isPipActive)
                                          ? (pipIsAfkPaused ? 'border-indigo-300 bg-indigo-50/50 shadow-md ring-1 ring-indigo-400/30' : 'border-blue-400 bg-blue-50/40 shadow-md ring-1 ring-blue-400/20')
                                          : task.type === 'break'
                                            ? 'border-blue-100 bg-blue-50/50 shadow-none'
                                            : 'border-gray-200 bg-white shadow-soft'
                                    } transition-all relative flex flex-col group`}
                                  style={provided.draggableProps.style}
                                >
                                  <div className="flex items-start">
                                    <GripVertical size={16} className={`${task.type === 'break' ? 'text-blue-200' : 'text-gray-300'} mr-4 mt-1 cursor-grab shrink-0`} />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[10px] font-bold ${index === 0 && isPipActive ? (pipIsAfkPaused ? 'text-indigo-600' : 'text-blue-600') : task.type === 'break' ? 'text-blue-400' : 'text-gray-400'} uppercase tracking-widest flex items-center gap-1.5 block`}>
                                          {task.type === 'break' && <span>☕</span>}
                                          {index === 0 && isPipActive ? (
                                            pipIsAfkPaused ? (
                                              <>
                                                <Moon size={10} className="text-indigo-500" />
                                                <span className="text-indigo-600 animate-pulse">AWAY (AUTO-PAUSED)</span>
                                              </>
                                            ) : (
                                              <>
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                                ACTIVE FOCUS
                                              </>
                                            )
                                          ) : task.type === 'break' ? 'BREAK TIME' : (index === 0 ? 'ACTIVE NOW' : `TASK ${index + 1}`)}
                                        </span>
                                        <span className={`text-xs font-mono px-2 py-0.5 rounded font-medium border shrink-0 ${task.type === 'break' ? 'bg-blue-100/50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                          {formatTime(taskStart)} - {formatTime(taskEnd)}
                                        </span>
                                      </div>
                                      <p className={`font-semibold text-base mb-2 ${task.type === 'break' ? 'text-blue-900' : ''}`}>{task.title}</p>
                                      
                                      <div className="flex items-center space-x-2">
                                        <input 
                                          type="number"
                                          disabled={!!task.subtasks?.length}
                                          className={`w-14 text-xs font-mono py-1 px-2 rounded outline-none border focus:border-gray-300 text-right transition-colors disabled:opacity-70 ${task.type === 'break' ? 'bg-blue-100/50 border-blue-100 text-blue-900' : 'bg-gray-50 border-gray-100'}`}
                                          value={task.durationMinutes}
                                          onChange={(e) => updateTask(task.id, { durationMinutes: parseInt(e.target.value) || 0 })}
                                        />
                                        <span className="text-[10px] text-gray-400">m total</span>
                                        
                                        {isPartiallyDone && !(index === 0 && isPipActive) && (
                                          <span className="text-[10px] text-blue-500 font-medium ml-2 px-2 py-0.5 bg-blue-50 rounded-full">
                                            {Math.ceil(remainingSeconds / 60)}m left
                                          </span>
                                        )}
                                        

                                      </div>
                                      
                                      {index === 0 && isPipActive && (
                                        <div className="mt-3 pt-3 border-t border-blue-200/50 flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-blue-800 tracking-wider">LIVE TIMER</span>
                                            <span className={`text-sm font-mono font-bold tabular-nums ${pipTimeLeft === 0 ? 'text-red-500 animate-pulse' : 'text-blue-700'}`}>
                                              {formatTimeLeft(pipTimeLeft)}
                                            </span>
                                          </div>
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); if (pipToggleTimer) pipToggleTimer(); }}
                                            className="w-7 h-7 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-sm cursor-pointer z-10"
                                          >
                                            {pipIsRunning ? <Pause size={12} className="fill-white" /> : <Play size={12} className="fill-white ml-0.5" />}
                                          </button>
                                        </div>
                                      )}

                                      {(task.subtasks && task.subtasks.length > 0) || task.type !== 'break' ? (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                          {task.subtasks && task.subtasks.length > 0 && (
                                            <>
                                              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center">
                                                Subtasks
                                              </h4>
                                              <ul className="space-y-1 mb-2">
                                                {task.subtasks.map((sub, idx) => {
                                                  const isActiveSubtask = index === 0 && isPipActive && sub.id === task.subtasks?.find(st => !st.completed)?.id;
                                                  return (
                                                  <li key={idx} className={`text-xs flex justify-between items-center px-2 py-1 rounded-lg border group transition-colors ${
                                                    isActiveSubtask ? (pipIsAfkPaused ? 'bg-indigo-100/70 border-indigo-300 shadow-sm ring-1 ring-indigo-400/50' : 'bg-blue-100 border-blue-300 shadow-sm ring-1 ring-blue-400/50') :
                                                    sub.completed ? 'bg-gray-100/50 border-transparent text-gray-400 opacity-60' :
                                                    sub.type === 'break' ? 'bg-blue-50/50 border-blue-100/50 text-blue-800' : 'bg-gray-50/50 border-gray-100/50 text-gray-700'
                                                  }`}>
                                                    <div className="flex items-center flex-1 min-w-0 mr-2">
                                                      <div className="flex flex-col mr-1 opacity-0 group-hover:opacity-100 transition-opacity w-3">
                                                        <button onClick={() => idx > 0 && reorderSubTasks(task.id, idx, idx - 1)} className="text-gray-400 hover:text-black leading-none text-[8px] py-0.5">▲</button>
                                                        <button onClick={() => task.subtasks && idx < task.subtasks.length - 1 && reorderSubTasks(task.id, idx, idx + 1)} className="text-gray-400 hover:text-black leading-none text-[8px] py-0.5">▼</button>
                                                      </div>
                                                      <button onClick={() => updateSubTask(task.id, sub.id, { completed: !sub.completed })} className="mr-1.5 shrink-0 hover:scale-110 transition-transform">
                                                        {sub.completed ? <CheckCircle size={14} className="text-green-500" /> : <Circle size={14} className={isActiveSubtask ? (pipIsAfkPaused ? 'text-indigo-500' : 'text-blue-500') : 'text-gray-300 hover:text-gray-400'} />}
                                                      </button>
                                                      <input 
                                                        type="text"
                                                        value={sub.title}
                                                        onChange={(e) => updateSubTask(task.id, sub.id, { title: e.target.value })}
                                                        className={`bg-transparent outline-none flex-1 min-w-0 w-full ${sub.completed ? 'line-through text-gray-400' : isActiveSubtask ? (pipIsAfkPaused ? 'font-bold text-indigo-900' : 'font-bold text-blue-900') : ''}`}
                                                        placeholder="Name..."
                                                      />
                                                    </div>
                                                    <div className="flex items-center space-x-1 shrink-0">
                                                      {isActiveSubtask && (
                                                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse mr-2 ${pipIsAfkPaused ? 'bg-indigo-500' : 'bg-blue-500'}`}></span>
                                                      )}
                                                      <input 
                                                        type="number"
                                                        className="w-12 bg-transparent text-xs font-mono py-1 px-1 outline-none text-right hover:bg-gray-100 rounded focus:bg-white focus:border focus:border-gray-200"
                                                        value={sub.durationMinutes || ''}
                                                        onChange={(e) => {
                                                          const val = parseInt(e.target.value);
                                                          updateSubTask(task.id, sub.id, { durationMinutes: isNaN(val) ? 0 : val });
                                                        }}
                                                      />
                                                      <span className={`text-[9px] font-mono ${isActiveSubtask ? (pipIsAfkPaused ? 'text-indigo-600' : 'text-blue-600') : 'text-gray-400'}`}>m</span>
                                                      <button onClick={() => deleteSubTask(task.id, sub.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1">✕</button>
                                                    </div>
                                                  </li>
                                                )})}
                                              </ul>
                                            </>
                                          )}
                                          
                                          {task.type !== 'break' && (
                                            <div className="flex space-x-2 mt-2">
                                              <button onClick={() => addSubTask(task.id, 'New subtask', 15, 'task')} className="text-[10px] font-semibold text-gray-500 hover:text-black bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded transition-colors border border-gray-100">+ Subtask</button>
                                              <button onClick={() => addSubTask(task.id, 'Short Break', 5, 'break')} className="text-[10px] font-semibold text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors border border-blue-100">+ Break</button>
                                            </div>
                                          )}
                                        </div>
                                      ) : null}

                                      {task.notes && task.notes.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center">
                                            Quick Notes
                                          </h4>
                                          <ul className="space-y-1">
                                            {task.notes.map((note, idx) => (
                                              <li key={idx} className="text-xs text-gray-600 flex items-start">
                                                <span className="text-gray-300 mr-1.5 mt-0.5">•</span>
                                                <span className="leading-tight">{note}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
              </Droppable>
              </div>
            </div>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}
