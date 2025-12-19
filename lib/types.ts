export interface Task {
  id: string;
  type: 'task' | 'break';
  title: string;
  allocatedMinutes: number;
  remainingSeconds: number;
  status: 'pending' | 'running' | 'paused' | 'completed';
}

export interface TimerState {
  tasks: Task[];
  activeTaskId: string | null;
  dayStartTime: string; // ISO string for localStorage compatibility
}

export type TaskAction =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'remainingSeconds' | 'status'> }
  | { type: 'ADD_BREAK'; payload: { title: string; allocatedMinutes: number } }
  | { type: 'REMOVE_TASK'; payload: string }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'REORDER_TASKS'; payload: Task[] }
  | { type: 'START_TASK'; payload: string }
  | { type: 'PAUSE_TASK' }
  | { type: 'RESUME_TASK' }
  | { type: 'TICK' }
  | { type: 'EXTEND_TASK'; payload: { id: string; minutes: number } }
  | { type: 'COMPLETE_TASK' }
  | { type: 'SET_START_TIME'; payload: string }
  | { type: 'LOAD_STATE'; payload: TimerState };
