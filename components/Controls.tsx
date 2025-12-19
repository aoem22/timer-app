'use client';

import { useState } from 'react';
import { Clock, Plus, Coffee } from 'lucide-react';
import { formatClockTime, getTotalDuration } from '@/lib/utils';
import { Task } from '@/lib/types';

interface ControlsProps {
  dayStartTime: Date;
  tasks: Task[];
  onSetStartTime: (time: Date) => void;
  onOpenAddModal: () => void;
}

export function Controls({ dayStartTime, tasks, onSetStartTime, onOpenAddModal }: ControlsProps) {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeValue, setTimeValue] = useState('');

  const totalMinutes = getTotalDuration(tasks);
  const endTime = new Date(dayStartTime.getTime() + totalMinutes * 60 * 1000);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeValue(e.target.value);
  };

  const handleTimeSubmit = () => {
    if (timeValue) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      const newDate = new Date();
      newDate.setHours(hours, minutes, 0, 0);
      onSetStartTime(newDate);
    }
    setIsEditingTime(false);
  };

  const handleSetNow = () => {
    onSetStartTime(new Date());
    setIsEditingTime(false);
  };

  return (
    <div className="space-y-4">
      {/* Start time control */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Clock size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Schedule starts at</p>
            {isEditingTime ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="time"
                  value={timeValue}
                  onChange={handleTimeChange}
                  className="px-2 py-1 bg-gray-50 border border-gray-300 rounded text-gray-900"
                  autoFocus
                />
                <button
                  onClick={handleTimeSubmit}
                  className="px-2 py-1 text-sm bg-purple-600 rounded text-white"
                >
                  Set
                </button>
                <button
                  onClick={handleSetNow}
                  className="px-2 py-1 text-sm bg-gray-200 rounded text-gray-700"
                >
                  Now
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  const hours = dayStartTime.getHours().toString().padStart(2, '0');
                  const mins = dayStartTime.getMinutes().toString().padStart(2, '0');
                  setTimeValue(`${hours}:${mins}`);
                  setIsEditingTime(true);
                }}
                className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors"
              >
                {formatClockTime(dayStartTime)}
              </button>
            )}
          </div>
        </div>
        {tasks.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Ends at</p>
            <p className="text-lg font-semibold text-gray-700">{formatClockTime(endTime)}</p>
          </div>
        )}
      </div>

      {/* Add buttons */}
      <div className="flex gap-3">
        <button
          onClick={onOpenAddModal}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          Add Task
        </button>
        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-gray-50 rounded-xl text-gray-700 font-medium transition-colors border border-gray-200 shadow-sm"
        >
          <Coffee size={20} />
          Add Break
        </button>
      </div>

      {/* Summary */}
      {tasks.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 px-1">
          <span>{tasks.length} block{tasks.length !== 1 ? 's' : ''}</span>
          <span>
            Total: {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </span>
        </div>
      )}
    </div>
  );
}
