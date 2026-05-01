import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Trash2 } from 'lucide-react';
import { notificationsApi } from '@/api/notifications';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';

const typeColors = {
  task_assigned: 'bg-blue-500',
  task_updated: 'bg-amber-500',
  task_commented: 'bg-purple-500',
  project_invite: 'bg-emerald-500',
  project_updated: 'bg-slate-500',
};

export default function Notifications() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll().then(r => r.data.data),
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.notifications || [];
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unread > 0 && <p className="text-sm text-muted-foreground">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            <Check className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {!isLoading && notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! Notifications appear here when tasks are assigned or updated."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n._id}
              className={cn(
                'flex gap-4 p-4 rounded-lg border bg-card transition-colors',
                !n.read && 'bg-primary/5 border-primary/20'
              )}
            >
              <div className={cn('w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0', typeColors[n.type] || 'bg-gray-400')} />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  {n.sender?.name && ` · from ${n.sender.name}`}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!n.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => markReadMutation.mutate(n._id)}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteMutation.mutate(n._id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
