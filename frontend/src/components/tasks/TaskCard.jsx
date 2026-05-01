import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MessageSquare, AlertCircle, ArrowUp, Minus, ArrowDown } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const priorityConfig = {
  high: { icon: ArrowUp, label: 'High', variant: 'danger' },
  medium: { icon: Minus, label: 'Medium', variant: 'warning' },
  low: { icon: ArrowDown, label: 'Low', variant: 'info' },
};

export default function TaskCard({ task, onClick }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const PriorityIcon = priority.icon;

  const overdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
  const dueToday = task.dueDate && isToday(new Date(task.dueDate));

  const initials = task.assignee?.name
    ? task.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      className={cn(
        'bg-card rounded-lg border border-border p-3.5 cursor-pointer shadow-sm hover:shadow-md hover:border-primary/30 transition-all group',
        isDragging && 'shadow-lg ring-2 ring-primary/50'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium leading-snug line-clamp-2 flex-1">{task.title}</p>
        <Badge variant={priority.variant} className="flex-shrink-0 gap-1">
          <PriorityIcon className="h-3 w-3" />
        </Badge>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
      )}

      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {task.dueDate && (
            <span className={cn(
              'flex items-center gap-1',
              overdue && 'text-destructive',
              dueToday && 'text-amber-500'
            )}>
              {overdue && <AlertCircle className="h-3 w-3" />}
              <Calendar className="h-3 w-3" />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
          {task.comments?.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {task.comments.length}
            </span>
          )}
        </div>

        {task.assignee && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
            <AvatarFallback className="text-[10px] bg-primary/20 text-primary">{initials}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
