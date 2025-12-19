'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task } from '@/lib/types';
import { getTaskTimeRange } from '@/lib/utils';
import { TimeBlock } from './TimeBlock';

interface TimeBlockListProps {
  tasks: Task[];
  dayStartTime: Date;
  onReorder: (tasks: Task[]) => void;
  onStart: (id: string) => void;
  onPause: () => void;
  onResume: () => void;
  onExtend: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateTime: (id: string, minutes: number) => void;
}

export function TimeBlockList({
  tasks,
  dayStartTime,
  onReorder,
  onStart,
  onPause,
  onResume,
  onExtend,
  onRemove,
  onUpdateTime,
}: TimeBlockListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      onReorder(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <span className="text-3xl">📋</span>
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">No tasks yet</h3>
        <p className="text-gray-500 max-w-xs">
          Add your first task to get started with your timed schedule
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <TimeBlock
              key={task.id}
              task={task}
              timeRange={getTaskTimeRange(tasks, index, dayStartTime)}
              onStart={() => onStart(task.id)}
              onPause={onPause}
              onResume={onResume}
              onExtend={() => onExtend(task.id)}
              onRemove={() => onRemove(task.id)}
              onUpdateTime={(minutes) => onUpdateTime(task.id, minutes)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
