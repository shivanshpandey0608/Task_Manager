import { useState } from 'react';
import { Bell, Sun, Moon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useThemeStore from '@/store/themeStore';
import useAuthStore from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/api/notifications';

export default function Navbar({ title }) {
  const { theme, toggle } = useThemeStore();
  const { user } = useAuthStore();
  const [notifOpen, setNotifOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll().then(r => r.data.data),
    refetchInterval: 30000,
  });

  const unread = data?.unreadCount || 0;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur flex items-center px-6 gap-4 sticky top-0 z-30">
      <div className="flex-1">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggle} title="Toggle theme">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Button>
          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} notifications={data?.notifications || []} />}
        </div>

        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback className="text-xs bg-primary/20 text-primary">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
