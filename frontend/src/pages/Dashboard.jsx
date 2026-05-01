import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare, Clock, AlertTriangle, Layers,
  ArrowRight, Calendar, Flag
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, isPast } from 'date-fns';
import { tasksApi } from '@/api/tasks';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const STATUS_COLORS = { todo: '#94a3b8', in_progress: '#3b82f6', done: '#10b981' };
const PRIORITY_COLORS = { low: '#3b82f6', medium: '#f59e0b', high: '#ef4444' };

const statusLabel = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
const priorityVariant = { low: 'info', medium: 'warning', high: 'danger' };

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => tasksApi.getDashboard().then(r => r.data.data),
    refetchInterval: 60000,
  });

  const stats = data?.stats;
  const byStatus = (data?.byStatus || []).map(s => ({
    name: statusLabel[s._id] || s._id,
    value: s.count,
    color: STATUS_COLORS[s._id] || '#94a3b8',
  }));
  const byPriority = (data?.byPriority || []).map(p => ({
    name: p._id.charAt(0).toUpperCase() + p._id.slice(1),
    value: p.count,
    color: PRIORITY_COLORS[p._id] || '#94a3b8',
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tasks"
          value={stats?.total}
          icon={Layers}
          color="bg-indigo-100 dark:bg-indigo-900/30"
          loading={isLoading}
        />
        <StatsCard
          title="Completed"
          value={stats?.completed}
          icon={CheckSquare}
          color="bg-emerald-100 dark:bg-emerald-900/30"
          description={stats?.total ? `${Math.round((stats.completed / stats.total) * 100)}% done` : undefined}
          loading={isLoading}
        />
        <StatsCard
          title="In Progress"
          value={stats?.inProgress}
          icon={Clock}
          color="bg-blue-100 dark:bg-blue-900/30"
          loading={isLoading}
        />
        <StatsCard
          title="Overdue"
          value={stats?.overdue}
          icon={AlertTriangle}
          color={stats?.overdue > 0 ? 'bg-red-500' : 'bg-slate-100 dark:bg-slate-800'}
          loading={isLoading}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tasks by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {byStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={byStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {byStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks by Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            {byPriority.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byPriority} barSize={40}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Tasks">
                    {byPriority.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My Tasks + Projects */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">My Tasks</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              onClick={() => navigate('/my-tasks')}
            >
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {data?.myTasks?.length > 0 ? (
              <div className="space-y-2">
                {data.myTasks.map(task => {
                  const overdue = task.dueDate && isPast(new Date(task.dueDate));
                  return (
                    <div
                      key={task._id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/projects/${task.project._id}`)}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: task.project?.color || '#6366f1' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{task.project?.name}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={priorityVariant[task.priority]} className="text-[10px] px-1.5 py-0">
                          <Flag className="h-2.5 w-2.5" />
                        </Badge>
                        {task.dueDate && (
                          <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                            <Calendar className="h-3 w-3" />
                            {format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                No tasks assigned to you
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Projects</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              onClick={() => navigate('/projects')}
            >
              All <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {data?.projects?.length > 0 ? (
              <div className="space-y-3">
                {data.projects.slice(0, 6).map(p => (
                  <div
                    key={p._id}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                    onClick={() => navigate(`/projects/${p._id}`)}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || '#6366f1' }} />
                    <span className="text-sm truncate flex-1">{p.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">No projects yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
