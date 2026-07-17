'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { CatFace } from './CatFace';
import { Loader2, MoonStar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AiDailyReviewModal() {
  const { globalCatState, setGlobalCatState, tasks, dailyStats, endDay } = useStore();
  const [summary, setSummary] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  
  // Calculate stats
  const completedTasks = tasks.filter(t => t.status === 'completed' && t.type === 'task').length;
  const focusSeconds = tasks.filter(t => t.type === 'task').reduce((acc, t) => acc + t.timeSpentSeconds, 0);
  const breakSeconds = tasks.filter(t => t.type === 'break').reduce((acc, t) => acc + t.timeSpentSeconds, 0);
  const afkSeconds = dailyStats.afkSeconds;
  
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  useEffect(() => {
    const handleTrigger = async () => {
      setIsOpen(true);
      setIsGenerating(true);
      setGlobalCatState('thinking');
      
      try {
        const res = await fetch('/api/daily-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ focusSeconds, breakSeconds, afkSeconds, tasksCount: completedTasks })
        });
        
        const data = await res.json();
        setSummary(data.summary);
        setGlobalCatState('celebration');
      } catch (e) {
        console.error("Error generating daily review", e);
        setSummary("Great job today! Rest up and see you tomorrow.");
        setGlobalCatState('idle');
      } finally {
        setIsGenerating(false);
      }
    };
    
    window.addEventListener('triggerAiDailyReview', handleTrigger);
    return () => window.removeEventListener('triggerAiDailyReview', handleTrigger);
  }, [focusSeconds, breakSeconds, afkSeconds, completedTasks, setGlobalCatState]);

  if (!isOpen) return null;

  const handleEndDay = () => {
    endDay(summary || undefined);
    setIsOpen(false);
    setSummary(null);
    setGlobalCatState('idle');
    router.push('/');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in slide-in-from-bottom-8 duration-500 overflow-hidden">
        
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none" />
        
        <div className="relative flex flex-col items-center mb-6">
          <CatFace state={globalCatState} size={100} className="mb-4 drop-shadow-lg" />
          <h2 className="text-2xl font-bold text-gray-900 text-center tracking-tight">Daily Review</h2>
        </div>

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 size={32} className="animate-spin text-indigo-400 mb-4" />
            <p className="text-sm text-gray-500 font-medium">Meowmy is analyzing your day...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-indigo-50 border border-indigo-100/50 rounded-2xl p-5 mb-6 shadow-inner">
              <p className="text-[15px] text-indigo-950 text-center leading-relaxed font-medium">
                "{summary}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center border border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Focus Time</span>
                <span className="text-lg font-bold text-gray-800">{formatTime(focusSeconds)}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center border border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Tasks Done</span>
                <span className="text-lg font-bold text-gray-800">{completedTasks}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center border border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Break Time</span>
                <span className="text-lg font-bold text-gray-800">{formatTime(breakSeconds)}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center border border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">AFK Time</span>
                <span className="text-lg font-bold text-gray-800">{formatTime(afkSeconds)}</span>
              </div>
            </div>

            <button 
              onClick={handleEndDay}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-xl text-sm flex items-center justify-center transition-transform active:scale-95 shadow-md"
            >
              <MoonStar size={18} className="mr-2" />
              Archive & End Day
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full mt-2 bg-transparent hover:bg-gray-50 text-gray-400 font-medium py-3 rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
