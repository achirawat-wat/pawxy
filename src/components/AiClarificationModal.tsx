'use client';

import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function AiClarificationModal() {
  const { clarificationPrompt, setClarificationPrompt, addSubTask, setGlobalCatState, goal } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (clarificationPrompt?.fields) {
      const initial: Record<string, any> = {};
      clarificationPrompt.fields.forEach(f => {
        if (f.type === 'slider') initial[f.id] = f.min || 1;
        else if (f.type === 'text') initial[f.id] = '';
        else if (f.type === 'options') initial[f.id] = f.options?.[0] || '';
      });
      setFormData(initial);
    }
  }, [clarificationPrompt]);

  if (!clarificationPrompt) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGlobalCatState('thinking');
    
    // Compile answers into a single string for AI context
    const contextStr = clarificationPrompt.fields.map(f => `${f.label}: ${formData[f.id]}`).join(' | ');

    try {
      const res = await fetch('/api/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          taskTitle: clarificationPrompt.taskTitle, 
          durationMinutes: clarificationPrompt.durationMinutes, 
          goal,
          clarificationContext: contextStr 
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate breakdown');
      
      if (data.subtasks && Array.isArray(data.subtasks)) {
        for (const sub of data.subtasks) {
          addSubTask(clarificationPrompt.taskId, sub.title, sub.durationMinutes);
        }
      }
      setGlobalCatState('aha');
    } catch (e: any) {
      alert("AI Breakdown Error: " + e.message);
      setGlobalCatState('idle');
    } finally {
      setIsLoading(false);
      setClarificationPrompt(null);
      setTimeout(() => setGlobalCatState('idle'), 1500);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-secondary rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col relative border border-gray-100"
        >
          <div className="bg-white p-6 flex flex-col items-center justify-center relative border-b border-gray-100">
            <button 
              onClick={() => { setClarificationPrompt(null); setGlobalCatState('idle'); }}
              disabled={isLoading}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 hover:text-black rounded-full transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 shadow-sm mb-4">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-medium text-center text-black mb-2 tracking-tight">{clarificationPrompt.title}</h3>
            <p className="text-sm text-gray-500 text-center font-light leading-relaxed">
              {clarificationPrompt.description}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 flex flex-col space-y-6 relative">
            
            {clarificationPrompt.fields?.map((field) => (
              <div key={field.id} className="flex flex-col space-y-3">
                <label className="text-sm font-medium text-gray-800">{field.label}</label>
                
                {field.type === 'slider' && (
                  <div className="flex flex-col space-y-2">
                    <input 
                      type="range" 
                      min={field.min || 1} 
                      max={field.max || 10} 
                      value={formData[field.id] || field.min || 1}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                      className="w-full accent-black"
                      disabled={isLoading}
                    />
                    <div className="flex justify-between text-xs text-gray-400 font-mono">
                      <span>{field.min || 1}</span>
                      <span className="text-black font-bold text-sm bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">{formData[field.id]}</span>
                      <span>{field.max || 10}</span>
                    </div>
                  </div>
                )}

                {field.type === 'text' && (
                  <input 
                    type="text"
                    value={formData[field.id] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-300 disabled:opacity-50"
                    placeholder="..."
                    disabled={isLoading}
                  />
                )}

                {field.type === 'options' && (
                  <div className="flex flex-col space-y-2">
                    {field.options?.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, [field.id]: opt }))}
                        disabled={isLoading}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all disabled:opacity-50 ${formData[field.id] === opt ? 'border-black bg-black text-white shadow-md' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-md disabled:opacity-50 mt-4"
            >
              Continue
            </button>
            
            {isLoading && (
              <div className="absolute inset-0 bg-secondary/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-b-3xl">
                <Loader2 size={32} className="text-amber-500 animate-spin mb-3" />
                <p className="text-sm font-medium text-black animate-pulse">Thinking...</p>
              </div>
            )}
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
