'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { CatFace } from './CatFace';
import { Loader2, Plus, X } from 'lucide-react';

interface NoteFollowupData {
  hasNextStep: boolean;
  suggestedTitle?: string;
  suggestedMinutes?: number;
  reason?: string;
}

export function AiNoteFollowupModal() {
  const { globalCatState, setGlobalCatState, addTask } = useStore();
  const [data, setData] = useState<NoteFollowupData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // Expose a global method to trigger this from anywhere
  useEffect(() => {
    const handleTrigger = (e: CustomEvent) => {
      const { taskId, title, notes } = e.detail;
      if (!notes || notes.length === 0) return;
      
      checkNotesForFollowup(taskId, title, notes);
    };
    
    window.addEventListener('triggerAiNoteFollowup', handleTrigger as EventListener);
    return () => window.removeEventListener('triggerAiNoteFollowup', handleTrigger as EventListener);
  }, []);

  const checkNotesForFollowup = async (taskId: string, title: string, notes: string[]) => {
    try {
      setGlobalCatState('thinking');
      const res = await fetch('/api/extract-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle: title, notes })
      });
      
      const resData = await res.json();
      if (resData.hasNextStep) {
        setData(resData);
        setIsOpen(true);
        setGlobalCatState('celebration');
        setTimeout(() => setGlobalCatState('idle'), 2000);
      } else {
        setGlobalCatState('idle');
      }
    } catch (e) {
      console.error("Error extracting notes:", e);
      setGlobalCatState('idle');
    }
  };

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-in slide-in-from-bottom-8 duration-300">
        
        <div className="flex flex-col items-center mb-4">
          <CatFace state={globalCatState} size={80} className="mb-4 drop-shadow-md" />
          <h2 className="text-lg font-bold text-gray-800 text-center leading-tight mb-2">Meowmy noticed something!</h2>
          <p className="text-xs text-gray-500 text-center px-4 mb-4 leading-relaxed">
            "{data.reason}"
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Suggested Task</p>
          <p className="text-sm font-medium text-black">{data.suggestedTitle}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              {data.suggestedMinutes}m
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button 
            onClick={() => {
              if (data.suggestedTitle) {
                addTask(data.suggestedTitle, 'inbox', data.suggestedMinutes || 15);
              }
              setIsOpen(false);
              setData(null);
            }}
            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center transition-transform active:scale-95"
          >
            <Plus size={16} className="mr-2" />
            Add to Queue
          </button>
          
          <button 
            onClick={() => {
              setIsOpen(false);
              setData(null);
            }}
            className="w-full bg-transparent hover:bg-gray-100 text-gray-500 font-bold py-3 rounded-xl text-sm transition-colors active:bg-gray-200"
          >
            Ignore for now
          </button>
        </div>
      </div>
    </div>
  );
}
