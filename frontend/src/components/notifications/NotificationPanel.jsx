import { useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notificationsApi } from '@/api/notifications';

export default function NotificationPanel({ notifications = [], onClose }) {
  const ref = useRef(null);
  const qc = useQueryClient();

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) onClose?.(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

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

  const typeColors = {
    task_assigned: 'bg-blue-500',
    task_updated: 'bg-amber-500',
    task_commented: 'bg-purple-500',
    project_invite: 'bg-emerald-500',
    project_updated: 'bg-slate-500',
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="text-sm font-semibold">Notifications</h3>
        {notifications.some(n => !n.read) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => markAllMutation.mutate()}
          >
            <Check className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n._id}
              className={`flex gap-3 p-3 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${typeColors[n.type] || 'bg-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed">{n.message}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                {!n.read && (
                  <button
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => markReadMutation.mutate(n._id)}
                  >
                    <Check className="h-3 w-3" />
                  </button>
                )}
                <button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => deleteMutation.mutate(n._id)}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
