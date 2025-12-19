'use client';

import { useEffect, useRef } from 'react';
import { Task } from '@/lib/types';
import { useAudio } from './useAudio';

interface UseTimerProps {
  tasks: Task[];
  activeTaskId: string | null;
  onTick: () => void;
  onComplete: () => void;
}

export function useTimer({ tasks, activeTaskId, onTick, onComplete }: UseTimerProps) {
  const { playSound } = useAudio();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastWarningRef = useRef<number | null>(null);
  const hasPlayedStartRef = useRef<string | null>(null);

  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const isRunning = activeTask?.status === 'running';

  useEffect(() => {
    // Play start sound when a new task starts running
    if (activeTask && isRunning && hasPlayedStartRef.current !== activeTask.id) {
      playSound('start');
      hasPlayedStartRef.current = activeTask.id;
      lastWarningRef.current = null;
    }
  }, [activeTask, isRunning, playSound]);

  useEffect(() => {
    if (isRunning && activeTask) {
      intervalRef.current = setInterval(() => {
        const remaining = activeTask.remainingSeconds;

        // Check for warning sounds
        if (remaining === 300 && lastWarningRef.current !== 300) {
          // 5 minutes
          playSound('warning');
          lastWarningRef.current = 300;
        } else if (remaining === 60 && lastWarningRef.current !== 60) {
          // 1 minute
          playSound('urgent');
          lastWarningRef.current = 60;
        } else if (remaining <= 1) {
          // Task complete
          playSound('complete');
          onComplete();
        }

        onTick();
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isRunning, activeTask, onTick, onComplete, playSound]);

  // Reset warning state when task changes
  useEffect(() => {
    if (!activeTaskId) {
      lastWarningRef.current = null;
      hasPlayedStartRef.current = null;
    }
  }, [activeTaskId]);

  return {
    isRunning,
    activeTask,
  };
}
