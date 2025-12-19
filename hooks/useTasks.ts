'use client';

import { useReducer, useEffect, useCallback } from 'react';
import { Task, TimerState, TaskAction } from '@/lib/types';
import { generateId } from '@/lib/utils';

const STORAGE_KEY = 'timer-app-state';

function getInitialState(): TimerState {
  return {
    tasks: [],
    activeTaskId: null,
    dayStartTime: new Date().toISOString(),
  };
}

function timerReducer(state: TimerState, action: TaskAction): TimerState {
  switch (action.type) {
    case 'ADD_TASK': {
      const newTask: Task = {
        id: generateId(),
        type: 'task',
        title: action.payload.title,
        allocatedMinutes: action.payload.allocatedMinutes,
        remainingSeconds: action.payload.allocatedMinutes * 60,
        status: 'pending',
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }

    case 'ADD_BREAK': {
      const newBreak: Task = {
        id: generateId(),
        type: 'break',
        title: action.payload.title || 'Break',
        allocatedMinutes: action.payload.allocatedMinutes,
        remainingSeconds: action.payload.allocatedMinutes * 60,
        status: 'pending',
      };
      return { ...state, tasks: [...state.tasks, newBreak] };
    }

    case 'REMOVE_TASK': {
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
        activeTaskId: state.activeTaskId === action.payload ? null : state.activeTaskId,
      };
    }

    case 'UPDATE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? {
                ...t,
                ...action.payload.updates,
                remainingSeconds:
                  action.payload.updates.allocatedMinutes !== undefined
                    ? action.payload.updates.allocatedMinutes * 60
                    : t.remainingSeconds,
              }
            : t
        ),
      };
    }

    case 'REORDER_TASKS': {
      return { ...state, tasks: action.payload };
    }

    case 'START_TASK': {
      return {
        ...state,
        activeTaskId: action.payload,
        tasks: state.tasks.map((t) =>
          t.id === action.payload
            ? { ...t, status: 'running' }
            : t.status === 'running'
            ? { ...t, status: 'paused' }
            : t
        ),
      };
    }

    case 'PAUSE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === state.activeTaskId ? { ...t, status: 'paused' } : t
        ),
      };
    }

    case 'RESUME_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === state.activeTaskId ? { ...t, status: 'running' } : t
        ),
      };
    }

    case 'TICK': {
      const activeTask = state.tasks.find((t) => t.id === state.activeTaskId);
      if (!activeTask || activeTask.status !== 'running') return state;

      const newRemaining = activeTask.remainingSeconds - 1;
      if (newRemaining <= 0) {
        // Task complete, move to next
        const currentIndex = state.tasks.findIndex((t) => t.id === state.activeTaskId);
        const nextTask = state.tasks[currentIndex + 1];
        return {
          ...state,
          activeTaskId: nextTask?.id || null,
          tasks: state.tasks.map((t, i) =>
            t.id === state.activeTaskId
              ? { ...t, remainingSeconds: 0, status: 'completed' }
              : i === currentIndex + 1
              ? { ...t, status: 'running' }
              : t
          ),
        };
      }

      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === state.activeTaskId ? { ...t, remainingSeconds: newRemaining } : t
        ),
      };
    }

    case 'EXTEND_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? {
                ...t,
                allocatedMinutes: t.allocatedMinutes + action.payload.minutes,
                remainingSeconds: t.remainingSeconds + action.payload.minutes * 60,
              }
            : t
        ),
      };
    }

    case 'COMPLETE_TASK': {
      const currentIndex = state.tasks.findIndex((t) => t.id === state.activeTaskId);
      const nextTask = state.tasks[currentIndex + 1];
      return {
        ...state,
        activeTaskId: nextTask?.id || null,
        tasks: state.tasks.map((t, i) =>
          t.id === state.activeTaskId
            ? { ...t, remainingSeconds: 0, status: 'completed' }
            : i === currentIndex + 1
            ? { ...t, status: 'running' }
            : t
        ),
      };
    }

    case 'SET_START_TIME': {
      return { ...state, dayStartTime: action.payload };
    }

    case 'LOAD_STATE': {
      return action.payload;
    }

    default:
      return state;
  }
}

export function useTasks() {
  const [state, dispatch] = useReducer(timerReducer, getInitialState());

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as TimerState;
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } catch (e) {
        console.error('Failed to load state:', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addTask = useCallback((title: string, allocatedMinutes: number) => {
    dispatch({ type: 'ADD_TASK', payload: { type: 'task', title, allocatedMinutes } });
  }, []);

  const addBreak = useCallback((title: string, allocatedMinutes: number) => {
    dispatch({ type: 'ADD_BREAK', payload: { title, allocatedMinutes } });
  }, []);

  const removeTask = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TASK', payload: id });
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  }, []);

  const reorderTasks = useCallback((tasks: Task[]) => {
    dispatch({ type: 'REORDER_TASKS', payload: tasks });
  }, []);

  const startTask = useCallback((id: string) => {
    dispatch({ type: 'START_TASK', payload: id });
  }, []);

  const pauseTask = useCallback(() => {
    dispatch({ type: 'PAUSE_TASK' });
  }, []);

  const resumeTask = useCallback(() => {
    dispatch({ type: 'RESUME_TASK' });
  }, []);

  const tick = useCallback(() => {
    dispatch({ type: 'TICK' });
  }, []);

  const extendTask = useCallback((id: string, minutes: number = 15) => {
    dispatch({ type: 'EXTEND_TASK', payload: { id, minutes } });
  }, []);

  const completeTask = useCallback(() => {
    dispatch({ type: 'COMPLETE_TASK' });
  }, []);

  const setStartTime = useCallback((time: Date) => {
    dispatch({ type: 'SET_START_TIME', payload: time.toISOString() });
  }, []);

  return {
    state,
    addTask,
    addBreak,
    removeTask,
    updateTask,
    reorderTasks,
    startTask,
    pauseTask,
    resumeTask,
    tick,
    extendTask,
    completeTask,
    setStartTime,
  };
}
