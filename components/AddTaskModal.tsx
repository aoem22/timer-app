'use client';

import { useState } from 'react';
import { X, Clock, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (title: string, minutes: number) => void;
  onAddBreak: (title: string, minutes: number) => void;
}

type TaskType = 'task' | 'break';

const QUICK_TIMES = [15, 30, 45, 60, 90, 120];

export function AddTaskModal({ isOpen, onClose, onAddTask, onAddBreak }: AddTaskModalProps) {
  const [type, setType] = useState<TaskType>('task');
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState(30);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taskTitle = title.trim() || (type === 'break' ? 'Break' : 'Untitled Task');

    if (type === 'task') {
      onAddTask(taskTitle, minutes);
    } else {
      onAddBreak(taskTitle, minutes);
    }

    setTitle('');
    setMinutes(30);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white border border-gray-200 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add New Block</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          {/* Type selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('task')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all',
                type === 'task'
                  ? 'bg-purple-50 border-purple-400 text-purple-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              )}
            >
              <Clock size={18} />
              Task
            </button>
            <button
              type="button"
              onClick={() => setType('break')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all',
                type === 'break'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              )}
            >
              <Coffee size={18} />
              Break
            </button>
          </div>

          {/* Title input */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              {type === 'task' ? 'Task name' : 'Break label (optional)'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'task' ? 'What are you working on?' : 'e.g., Lunch, Coffee break'}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white transition-colors"
              autoFocus
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Duration</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_TIMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMinutes(t)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-all',
                    minutes === t
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {t >= 60 ? `${t / 60}h` : `${t}m`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                className="w-24 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-center focus:outline-none focus:border-purple-400"
              />
              <span className="text-gray-500">minutes</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={cn(
              'w-full py-3 rounded-xl font-medium transition-all shadow-sm',
              type === 'task'
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            )}
          >
            Add {type === 'task' ? 'Task' : 'Break'}
          </button>
        </form>
      </div>
    </div>
  );
}
