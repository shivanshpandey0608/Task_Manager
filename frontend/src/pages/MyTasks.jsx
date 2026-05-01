import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Calendar, Flag } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { tasksApi } from '@/api/tasks';
import TaskModal from '@/components/tasks/TaskModal';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EmptyState from '@/components/common/EmptyState';
import { TableSkeleton } from '@/components/common/PageLoader';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const statusVariant = { todo: 'secondary', in_progress: 'info', done: 'success' };
const priorityVariant = { low: 'info', medium: 'warning', high: 'danger' };

export default function MyTasks() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [taskModal, setTaskModal] = useState({ open: false, task: null });
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-tasks', statusFilter, priorityFilter],
    queryFn: () =>
      tasksApi.getAll({
        assignee: 'me',
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
      }).then(r => r.data.data.tasks),
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-36 h-9"
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </Select>
        <Select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="w-36 h-9"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
        <span className="ml-auto text-sm text-muted-foreground">{data?.length || 0} tasks</span>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : !data?.length ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks assigned to you"
          description="Tasks assigned to you will appear here"
        />
      ) : (
        <div className="space-y-2">
          {data.map(task => {
            const overdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
            return (
              <div
                key={task._id}
                className="flex items-center gap-4 p-3.5 rounded-lg border bg-card hover:shadow-sm hover:border-primary/30 cursor-pointer transition-all"
                onClick={() => setTaskModal({ open: true, task })}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: task.project?.color || '#6366f1' }}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium truncate', task.status === 'done' && 'line-through text-muted-foreground')}>
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{task.project?.name}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={statusVariant[task.status]} className="text-xs capitalize hidden sm:flex">
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant={priorityVariant[task.priority]} className="text-xs capitalize">
                    {task.priority}
                  </Badge>
                  {task.dueDate && (
                    <span className={cn('text-xs flex items-center gap-1', overdue ? 'text-destructive' : 'text-muted-foreground')}>
                      <Calendar className="h-3 w-3" />
                      {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskModal
        open={taskModal.open}
        task={taskModal.task}
        projectId={taskModal.task?.project?._id || taskModal.task?.project}
        onClose={() => setTaskModal({ open: false, task: null })}
      />
    </div>
  );
}
