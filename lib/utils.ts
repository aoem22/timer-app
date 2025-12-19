import { Task } from './types';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatClockTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getTaskStartTime(
  tasks: Task[],
  taskIndex: number,
  dayStartTime: Date
): Date {
  let accumulatedMinutes = 0;
  for (let i = 0; i < taskIndex; i++) {
    accumulatedMinutes += tasks[i].allocatedMinutes;
  }
  return new Date(dayStartTime.getTime() + accumulatedMinutes * 60 * 1000);
}

export function getTaskEndTime(
  tasks: Task[],
  taskIndex: number,
  dayStartTime: Date
): Date {
  const startTime = getTaskStartTime(tasks, taskIndex, dayStartTime);
  return new Date(startTime.getTime() + tasks[taskIndex].allocatedMinutes * 60 * 1000);
}

export function getTaskTimeRange(
  tasks: Task[],
  taskIndex: number,
  dayStartTime: Date
): string {
  const start = getTaskStartTime(tasks, taskIndex, dayStartTime);
  const end = getTaskEndTime(tasks, taskIndex, dayStartTime);
  return `${formatClockTime(start)} - ${formatClockTime(end)}`;
}

export function getTotalDuration(tasks: Task[]): number {
  return tasks.reduce((sum, task) => sum + task.allocatedMinutes, 0);
}

export function getBlockHeight(minutes: number): number {
  // 4px per minute, minimum 60px for usability
  return Math.max(minutes * 4, 60);
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
