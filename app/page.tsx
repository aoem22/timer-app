'use client';

import { useState } from 'react';
import { Timer } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useTimer } from '@/hooks/useTimer';
import { TimeBlockList } from '@/components/TimeBlockList';
import { AddTaskModal } from '@/components/AddTaskModal';
import { Controls } from '@/components/Controls';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
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
  } = useTasks();

  useTimer({
    tasks: state.tasks,
    activeTaskId: state.activeTaskId,
    onTick: tick,
    onComplete: completeTask,
  });

  const dayStartTime = new Date(state.dayStartTime);

  return (
    <main className="min-h-screen py-8 px-4" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Timer size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Time Blocks</h1>
            <p className="text-sm text-gray-500">Plan your day, block by block</p>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6">
          <Controls
            dayStartTime={dayStartTime}
            tasks={state.tasks}
            onSetStartTime={setStartTime}
            onOpenAddModal={() => setIsModalOpen(true)}
          />
        </div>

        {/* Time blocks list */}
        <TimeBlockList
          tasks={state.tasks}
          dayStartTime={dayStartTime}
          onReorder={reorderTasks}
          onStart={startTask}
          onPause={pauseTask}
          onResume={resumeTask}
          onExtend={extendTask}
          onRemove={removeTask}
          onUpdateTime={(id, minutes) => updateTask(id, { allocatedMinutes: minutes })}
        />

        {/* Add task modal */}
        <AddTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddTask={addTask}
          onAddBreak={addBreak}
        />
      </div>
    </main>
  );
}
