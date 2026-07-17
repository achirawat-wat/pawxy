import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TaskStatus = 'inbox' | 'scheduled' | 'completed';

export interface SubTask {
  id: string;
  type?: 'task' | 'break';
  title: string;
  durationMinutes: number;
  timeSpentSeconds: number;
  completed: boolean;
}

export interface Task {
  id: string;
  type: 'task' | 'break';
  title: string;
  status: TaskStatus;
  durationMinutes: number;
  timeSpentSeconds: number;
  notes: string[];
  subtasks?: SubTask[];
}

interface AppState {
  goal: string;
  dayStartTime: number | null;
  tasks: Task[];
  setGoal: (goal: string) => void;
  startDayTime: (time: number) => void;
  clearTasks: () => void;
  addTask: (title: string, status?: TaskStatus, durationMinutes?: number) => void;
  addBreak: (durationMinutes: number, insertAtIndex?: number) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addNote: (taskId: string, note: string) => void;
  completeTask: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus, newIndex: number) => void;
  deleteTask: (taskId: string) => void;
  reorderTasks: (status: TaskStatus, startIndex: number, endIndex: number) => void;
  breakdownTask: (taskId: string) => void;
  addSubTask: (taskId: string, title: string, durationMinutes: number, type?: 'task' | 'break') => void;
  updateSubTask: (taskId: string, subtaskId: string, updates: Partial<SubTask>) => void;
  deleteSubTask: (taskId: string, subtaskId: string) => void;
  reorderSubTasks: (taskId: string, startIndex: number, endIndex: number) => void;
  pipTrigger: (() => void) | null;
  registerPipTrigger: (fn: () => void) => void;
  triggerPip: () => void;
  
  // PiP Global State for Control Room
  isPipActive: boolean;
  pipIsRunning: boolean;
  pipTimeLeft: number;
  pipIsAfkPaused: boolean;
  setPipState: (state: Partial<{ isPipActive: boolean; pipIsRunning: boolean; pipTimeLeft: number; pipIsAfkPaused: boolean }>) => void;
  pipToggleTimer: (() => void) | null;
  registerPipToggle: (fn: () => void) => void;
  
  // AFK Settings
  afkEnabled: boolean;
  setAfkEnabled: (enabled: boolean) => void;

  // Global Cat Mascot State
  globalCatState: import('@/components/CatFace/types').CatFaceState;
  setGlobalCatState: (state: import('@/components/CatFace/types').CatFaceState) => void;
  
  // AI Clarification State
  clarificationPrompt: { 
    taskId: string, 
    taskTitle: string, 
    durationMinutes: number, 
    title: string, 
    description: string,
    fields: Array<{
      id: string;
      type: 'options' | 'slider' | 'text';
      label: string;
      options?: string[];
      min?: number;
      max?: number;
    }>
  } | null;
  setClarificationPrompt: (prompt: any) => void;

  // History and Daily Stats
  taskHistory: { date: string, tasks: Task[], summary?: string, metrics: { afkSeconds: number, breakSeconds: number, focusSeconds: number } }[];
  dailyStats: { afkSeconds: number };
  addAfkTime: (seconds: number) => void;
  endDay: (summary?: string) => void;
}

// Initial mock data
const initialTasks: Task[] = [];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      goal: '',
      dayStartTime: null,
      tasks: initialTasks,
      afkEnabled: false,
      setAfkEnabled: (enabled) => set({ afkEnabled: enabled }),
      
      taskHistory: [],
      dailyStats: { afkSeconds: 0 },
      addAfkTime: (seconds) => set((state) => ({ 
        dailyStats: { ...state.dailyStats, afkSeconds: state.dailyStats.afkSeconds + seconds } 
      })),
      
      endDay: (summary) => set((state) => {
        const archiveTasks = state.tasks.filter(t => t.status !== 'inbox');
        const inboxTasks = state.tasks.filter(t => t.status === 'inbox');
        
        const breakSeconds = archiveTasks.filter(t => t.type === 'break').reduce((acc, t) => acc + t.timeSpentSeconds, 0);
        const focusSeconds = archiveTasks.filter(t => t.type === 'task').reduce((acc, t) => acc + t.timeSpentSeconds, 0);
        
        const newHistoryEntry = {
          date: new Date().toISOString(),
          tasks: archiveTasks,
          summary,
          metrics: {
            afkSeconds: state.dailyStats.afkSeconds,
            breakSeconds,
            focusSeconds
          }
        };
        return {
          taskHistory: [...state.taskHistory, newHistoryEntry],
          tasks: inboxTasks, // Keep Inbox tasks for tomorrow!
          dailyStats: { afkSeconds: 0 },
          dayStartTime: null,
          goal: ''
        };
      }),

      globalCatState: 'idle',
      setGlobalCatState: (state) => set({ globalCatState: state }),
      
      clarificationPrompt: null,
      setClarificationPrompt: (prompt) => set({ clarificationPrompt: prompt }),
      
      pipTrigger: null,
      registerPipTrigger: (fn) => set({ pipTrigger: fn }),
      triggerPip: () => set((state) => {
        if (state.pipTrigger) state.pipTrigger();
        return state;
      }),

      isPipActive: false,
      pipIsRunning: false,
      pipTimeLeft: 0,
      pipIsAfkPaused: false,
      setPipState: (stateUpdate) => set((state) => ({ ...state, ...stateUpdate })),
      pipToggleTimer: null,
      registerPipToggle: (fn) => set({ pipToggleTimer: fn }),
      
      setGoal: (goal) => set({ goal }),
      startDayTime: (time) => set({ dayStartTime: time }),
      
      clearTasks: () => set({ tasks: [] }),
      
      addTask: (title, status = 'inbox', durationMinutes = 60) => set((state) => ({
        tasks: [...state.tasks, { 
          id: Date.now().toString(),
          type: 'task',
          title, 
          status, 
          durationMinutes,
          timeSpentSeconds: 0,
          notes: [] 
        }]
      })),

      addBreak: (durationMinutes, insertAtIndex) => set((state) => {
        const breakTask: Task = {
          id: `break-${Date.now()}`,
          type: 'break',
          title: `Break (${durationMinutes}m)`,
          status: 'scheduled',
          durationMinutes,
          timeSpentSeconds: 0,
          notes: []
        };
        
        if (typeof insertAtIndex === 'number') {
          // Find the exact index in the scheduled tasks and map back to global array
          const scheduledTasks = state.tasks.filter(t => t.status === 'scheduled');
          scheduledTasks.splice(insertAtIndex, 0, breakTask);
          const otherTasks = state.tasks.filter(t => t.status !== 'scheduled');
          return { tasks: [...otherTasks, ...scheduledTasks] };
        }
        
        return { tasks: [...state.tasks, breakTask] };
      }),

      updateTask: (taskId, updates) => set((state) => {
        return {
          tasks: state.tasks.map(t => {
            if (t.id !== taskId) return t;
            
            // If durationMinutes is updated and task has subtasks, scale subtasks additively (average distribution)
            if (updates.durationMinutes !== undefined && updates.durationMinutes !== t.durationMinutes && t.subtasks && t.subtasks.length > 0) {
              const diff = updates.durationMinutes - t.durationMinutes;
              const avgDiff = Math.round(diff / t.subtasks.length);
              
              let remainingDiff = diff;
              const currentSubtasks = t.subtasks; // Create local const to preserve type narrowing
              const scaledSubtasks = currentSubtasks.map((sub, index) => {
                const isLast = index === currentSubtasks.length - 1;
                const intendedAdd = isLast ? remainingDiff : avgDiff;
                
                let newDuration = sub.durationMinutes + intendedAdd;
                if (newDuration < 1) newDuration = 1; // Prevent negative or zero duration
                
                const actualAdd = newDuration - sub.durationMinutes;
                remainingDiff -= actualAdd;
                
                return {
                  ...sub,
                  durationMinutes: newDuration
                };
              });

              return { ...t, ...updates, subtasks: scaledSubtasks };
            }
            
            return { ...t, ...updates };
          })
        };
      }),

      addNote: (taskId, note) => set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, notes: [...t.notes, note] } : t)
      })),

      completeTask: (taskId) => set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'completed' as TaskStatus } : t)
      })),
      
      moveTask: (taskId, newStatus, newIndex) => set((state) => {
        const taskIndex = state.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return state;

        const targetTask = state.tasks[taskIndex];
        const movedTask = { ...targetTask, status: newStatus };
        
        const taskList = state.tasks.filter(t => t.id !== taskId);
        const otherTasks = taskList.filter(t => t.status !== newStatus);
        const targetStatusTasks = taskList.filter(t => t.status === newStatus);
        
        targetStatusTasks.splice(newIndex, 0, movedTask);
        
        return { tasks: [...otherTasks, ...targetStatusTasks] };
      }),

      reorderTasks: (status, startIndex, endIndex) => set((state) => {
        const taskList = [...state.tasks];
        const targetStatusTasks = taskList.filter(t => t.status === status);
        const otherTasks = taskList.filter(t => t.status !== status);

        const [movedTask] = targetStatusTasks.splice(startIndex, 1);
        targetStatusTasks.splice(endIndex, 0, movedTask);

        return { tasks: [...otherTasks, ...targetStatusTasks] };
      }),

      deleteTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== taskId)
      })),

      breakdownTask: (taskId) => set((state) => {
        const taskIndex = state.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return state;
        
        const parent = state.tasks[taskIndex];
        const titleLower = parent.title.toLowerCase();
        const duration = parent.durationMinutes;
        
        let subtaskTemplates = [
          { title: "Prep & Set up", ratio: 0.25 },
          { title: "Core Work", ratio: 0.50 },
          { title: "Polish & Review", ratio: 0.25 }
        ];
        
        if (titleLower.includes("presentation") || titleLower.includes("slide") || titleLower.includes("report") || titleLower.includes("paper")) {
          subtaskTemplates = [
            { title: "Research & Outline", ratio: 0.30 },
            { title: "Create Content & Slides", ratio: 0.50 },
            { title: "Review & Rehearse", ratio: 0.20 }
          ];
        } else if (titleLower.includes("code") || titleLower.includes("build") || titleLower.includes("develop") || titleLower.includes("app") || titleLower.includes("feature")) {
          subtaskTemplates = [
            { title: "Design & Setup", ratio: 0.20 },
            { title: "Write Code", ratio: 0.60 },
            { title: "Test & Debug", ratio: 0.20 }
          ];
        } else if (titleLower.includes("design") || titleLower.includes("ui") || titleLower.includes("ux") || titleLower.includes("art")) {
          subtaskTemplates = [
            { title: "Inspiration & Sketches", ratio: 0.20 },
            { title: "High-fidelity Mockups", ratio: 0.60 },
            { title: "Prototype & Feedback", ratio: 0.20 }
          ];
        } else {
          subtaskTemplates = [
            { title: "Preparation", ratio: 0.25 },
            { title: "Core Execution", ratio: 0.50 },
            { title: "Polish & Review", ratio: 0.25 }
          ];
        }
        
        const d1 = Math.round(duration * subtaskTemplates[0].ratio);
        const d2 = Math.round(duration * subtaskTemplates[1].ratio);
        const d3 = Math.max(1, duration - d1 - d2);
        
        const subtaskDurations = [d1, d2, d3];
        
        const newSubtasks: SubTask[] = subtaskTemplates.map((template, idx) => ({
          id: `${parent.id}-sub-${idx}`,
          type: 'task',
          title: template.title,
          durationMinutes: subtaskDurations[idx],
          timeSpentSeconds: 0,
          completed: false
        }));
        
        return {
          tasks: state.tasks.map(t => t.id === taskId ? {
            ...t,
            subtasks: newSubtasks
          } : t)
        };
      }),

      addSubTask: (taskId, title, durationMinutes, type = 'task') => set((state) => {
        return {
          tasks: state.tasks.map(t => {
            if (t.id !== taskId) return t;
            const newSubTask: SubTask = {
              id: `${taskId}-sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type,
              title,
              durationMinutes,
              timeSpentSeconds: 0,
              completed: false
            };
            const currentSubtasks = t.subtasks || [];
            const newSubtasks = [...currentSubtasks, newSubTask];
            const newTotalDuration = newSubtasks.reduce((sum, st) => sum + st.durationMinutes, 0);
            return {
              ...t,
              subtasks: newSubtasks,
              durationMinutes: newTotalDuration
            };
          })
        };
      }),

      updateSubTask: (taskId, subtaskId, updates) => set((state) => {
        return {
          tasks: state.tasks.map(t => {
            if (t.id !== taskId) return t;
            const newSubtasks = t.subtasks?.map(st => st.id === subtaskId ? { ...st, ...updates } : st) || [];
            const newTotalDuration = newSubtasks.reduce((sum, st) => sum + st.durationMinutes, 0);
            const newTotalTimeSpent = newSubtasks.reduce((sum, st) => sum + st.timeSpentSeconds, 0);
            return {
              ...t,
              subtasks: newSubtasks,
              durationMinutes: newTotalDuration,
              timeSpentSeconds: newTotalTimeSpent
            };
          })
        };
      }),

      deleteSubTask: (taskId, subtaskId) => set((state) => {
        return {
          tasks: state.tasks.map(t => {
            if (t.id !== taskId) return t;
            const newSubtasks = t.subtasks?.filter(st => st.id !== subtaskId) || [];
            const newTotalDuration = newSubtasks.reduce((sum, st) => sum + st.durationMinutes, 0);
            return {
              ...t,
              subtasks: newSubtasks.length > 0 ? newSubtasks : undefined,
              durationMinutes: newSubtasks.length > 0 ? newTotalDuration : t.durationMinutes
            };
          })
        };
      }),

      reorderSubTasks: (taskId, startIndex, endIndex) => set((state) => {
        return {
          tasks: state.tasks.map(t => {
            if (t.id !== taskId || !t.subtasks) return t;
            const newSubtasks = Array.from(t.subtasks);
            const [moved] = newSubtasks.splice(startIndex, 1);
            newSubtasks.splice(endIndex, 0, moved);
            return {
              ...t,
              subtasks: newSubtasks
            };
          })
        };
      }),


    }),
    {
      name: 'pawxy-storage',
      partialize: (state) => ({
        goal: state.goal,
        dayStartTime: state.dayStartTime,
        tasks: state.tasks,
        taskHistory: state.taskHistory,
        dailyStats: state.dailyStats
      }),
    }
  )
);
