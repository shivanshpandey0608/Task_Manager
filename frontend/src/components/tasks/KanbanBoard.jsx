import { useState } from 'react';
import {
  DndContext, DragOverlay, closestCorners,
  PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const columns = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-400' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-400' },
  { id: 'done', label: 'Done', color: 'bg-emerald-400' },
];

export default function KanbanBoard({ tasks = [], onTaskClick, onAddTask, onTaskMove }) {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const tasksByStatus = columns.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id).sort((a, b) => a.order - b.order);
    return acc;
  }, {});

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find(t => t._id === active.id));
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null);
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find(t => t._id === active.id);
    if (!activeTask) return;

    // Determine target column
    const overTask = tasks.find(t => t._id === over.id);
    const targetStatus = overTask?.status || over.id;

    if (columns.some(c => c.id === targetStatus) && activeTask.status !== targetStatus) {
      onTaskMove?.(activeTask._id, targetStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {columns.map(col => {
          const colTasks = tasksByStatus[col.id] || [];
          return (
            <div
              key={col.id}
              id={col.id}
              className="flex-shrink-0 w-72 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={cn('w-2 h-2 rounded-full', col.color)} />
                <h3 className="font-semibold text-sm">{col.label}</h3>
                <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              <SortableContext
                items={colTasks.map(t => t._id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-1 space-y-2 min-h-[200px] rounded-lg bg-muted/30 p-2">
                  {colTasks.map(task => (
                    <TaskCard key={task._id} task={task} onClick={onTaskClick} />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-xs text-muted-foreground rounded-md border-2 border-dashed border-border">
                      No tasks
                    </div>
                  )}
                </div>
              </SortableContext>

              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => onAddTask?.(col.id)}
              >
                <Plus className="h-4 w-4" />
                Add task
              </Button>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-3 scale-105">
            <TaskCard task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
