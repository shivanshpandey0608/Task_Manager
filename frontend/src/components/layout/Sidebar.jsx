import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Bell,
  Settings, LogOut, ChevronLeft, Menu, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/my-tasks', icon: CheckSquare, label: 'My Tasks' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-border', collapsed ? 'justify-center' : 'gap-3')}>
        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="font-bold text-lg tracking-tight">TaskFlow</span>}
        <Button
          variant="ghost"
          size="icon"
          className={cn('ml-auto h-7 w-7', collapsed && 'hidden')}
          onClick={onToggle}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Toggle when collapsed */}
      {collapsed && (
        <Button variant="ghost" size="icon" className="mx-auto mt-2 h-7 w-7" onClick={onToggle}>
          <Menu className="h-4 w-4" />
        </Button>
      )}

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                collapsed && 'justify-center px-2'
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom user section */}
      <div className={cn('border-t border-border p-3', collapsed ? 'flex flex-col items-center gap-2' : '')}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-1 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-xs bg-primary/20 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <div className={cn('flex gap-1', collapsed ? 'flex-col' : 'mt-1')}>
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'sm'}
            className={cn('text-muted-foreground', !collapsed && 'flex-1 justify-start gap-2')}
            onClick={() => navigate('/settings')}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
            {!collapsed && 'Settings'}
          </Button>
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'sm'}
            className={cn('text-muted-foreground hover:text-destructive', !collapsed && 'flex-1 justify-start gap-2')}
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && 'Logout'}
          </Button>
        </div>
      </div>
    </aside>
  );
}
