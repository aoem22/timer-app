'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Play, Pause, GripVertical, X, Coffee, Plus } from 'lucide-react';
import { Task } from '@/lib/types';
import { formatTime, getBlockHeight, cn } from '@/lib/utils';

interface TimeBlockProps {
  task: Task;
  timeRange: string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onExtend: () => void;
  onRemove: () => void;
  onUpdateTime: (minutes: number) => void;
}

export function TimeBlock({
  task,
  timeRange,
  onStart,
  onPause,
  onResume,
  onExtend,
  onRemove,
  onUpdateTime,
}: TimeBlockProps) {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editValue, setEditValue] = useState(task.allocatedMinutes.toString());

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    height: getBlockHeight(task.allocatedMinutes),
    minHeight: '80px',
  };

  const isRunning = task.status === 'running';
  const isPaused = task.status === 'paused';
  const isCompleted = task.status === 'completed';
  const isActive = isRunning || isPaused;
  const progress = isActive
    ? ((task.allocatedMinutes * 60 - task.remainingSeconds) / (task.allocatedMinutes * 60)) * 100
    : 0;

  const handleTimeSubmit = () => {
    const newMinutes = parseInt(editValue, 10);
    if (!isNaN(newMinutes) && newMinutes > 0) {
      onUpdateTime(newMinutes);
    }
    setIsEditingTime(false);
  };

  const handlePlayPause = () => {
    if (isRunning) {
      onPause();
    } else if (isPaused) {
      onResume();
    } else {
      onStart();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative rounded-xl border transition-all duration-300 overflow-hidden shadow-sm',
        isDragging && 'opacity-50 z-50 shadow-lg',
        task.type === 'break'
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-white border-gray-200',
        isActive && 'ring-2 ring-purple-400 border-purple-300',
        isCompleted && 'opacity-50 bg-gray-50'
      )}
    >
      {/* Progress bar background */}
      {isActive && (
        <div
          className="absolute inset-0 bg-purple-100 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      )}

      <div className="relative h-full flex flex-col p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="touch-none text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={20} />
            </button>

            {/* Play/Pause button */}
            {!isCompleted && (
              <button
                onClick={handlePlayPause}
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm',
                  isActive
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                )}
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </button>
            )}

            {/* Task info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {task.type === 'break' && <Coffee size={16} className="text-emerald-500" />}
                <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{timeRange}</p>
            </div>
          </div>

          {/* Remove button */}
          {!isActive && (
            <button
              onClick={onRemove}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Timer/Duration display */}
        <div className="mt-auto pt-2">
          {isActive ? (
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-bold text-gray-900">
                {formatTime(task.remainingSeconds)}
              </span>
              <button
                onClick={onExtend}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-colors"
              >
                <Plus size={14} />
                15 min
              </button>
            </div>
          ) : isCompleted ? (
            <span className="text-gray-400">Completed</span>
          ) : isEditingTime ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleTimeSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTimeSubmit()}
                className="w-20 px-2 py-1 bg-gray-50 border border-gray-300 rounded text-gray-900 text-center"
                autoFocus
                min={1}
              />
              <span className="text-gray-500 text-sm">minutes</span>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditValue(task.allocatedMinutes.toString());
                setIsEditingTime(true);
              }}
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              {task.allocatedMinutes} min
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
