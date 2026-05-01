import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/my-tasks': 'My Tasks',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const title = Object.entries(pageTitles).find(([key]) =>
    location.pathname.startsWith(key)
  )?.[1] || 'TaskFlow';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
