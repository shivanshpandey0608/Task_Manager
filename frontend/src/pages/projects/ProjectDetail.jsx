import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Settings, Users, Trash2, UserPlus, ArrowLeft,
  LayoutGrid, List, Activity, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { projectsApi } from '@/api/projects';
import { tasksApi } from '@/api/tasks';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import TaskModal from '@/components/tasks/TaskModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { KanbanSkeleton, TableSkeleton } from '@/components/common/PageLoader';
import EmptyState from '@/components/common/EmptyState';
import useAuthStore from '@/store/authStore';

const statusVariant = { todo: 'secondary', in_progress: 'info', done: 'success' };
const priorityVariant = { low: 'info', medium: 'warning', high: 'danger' };

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const [taskModal, setTaskModal] = useState({ open: false, task: null, defaultStatus: 'todo' });
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id).then(r => r.data.data),
    enabled: !!id,
  });

  const { data: activityData } = useQuery({
    queryKey: ['project-activity', id],
    queryFn: () => projectsApi.getActivity(id).then(r => r.data.data.activities),
    enabled: !!id,
  });

  const moveMutation = useMutation({
    mutationFn: ({ taskId, status }) => tasksApi.update(taskId, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', id] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: () => toast.error('Failed to move task'),
  });

  const addMemberMutation = useMutation({
    mutationFn: () => projectsApi.addMember(id, { email: memberEmail, role: memberRole }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', id] });
      setAddMemberOpen(false);
      setMemberEmail('');
      toast.success('Member added!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add member'),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId) => projectsApi.removeMember(id, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', id] });
      toast.success('Member removed');
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => projectsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      navigate('/projects');
      toast.success('Project deleted');
    },
  });

  if (isLoading) return <KanbanSkeleton />;
  if (!data) return null;

  const { project, tasks = [], stats } = data;
  const isOwner = project.owner._id === user?._id;
  const allMembers = [{ user: project.owner, role: 'admin' }, ...project.members];
  const progress = stats?.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const filteredTasks = tasks.filter(t => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-start gap-4 flex-wrap">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
              <h1 className="text-xl font-bold truncate">{project.name}</h1>
              <Badge variant={project.status === 'active' ? 'success' : 'secondary'} className="capitalize">
                {project.status}
              </Badge>
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <Progress value={progress} className="flex-1 h-1.5" />
                <span className="text-xs text-muted-foreground">{progress}%</span>
              </div>
              <span className="text-xs text-muted-foreground">{stats?.done}/{stats?.total} done</span>
              {stats?.overdue > 0 && (
                <span className="text-xs text-destructive">{stats.overdue} overdue</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {allMembers.slice(0, 5).map((m, i) => {
                const u = m.user || m;
                return (
                  <Avatar key={i} className="h-7 w-7 border-2 border-background">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback className="text-[9px] bg-primary/20 text-primary">
                      {u.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                );
              })}
            </div>
            {isOwner && (
              <>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setAddMemberOpen(true)}>
                  <UserPlus className="h-4 w-4" />
                  Add
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm('Delete this project and all its tasks?')) deleteProjectMutation.mutate();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              className="gap-1"
              size="sm"
              onClick={() => setTaskModal({ open: true, task: null, defaultStatus: 'todo' })}
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-muted/30">
        <span className="text-xs text-muted-foreground">Filter:</span>
        <Select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-8 text-xs w-36"
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </Select>
        <Select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="h-8 text-xs w-36"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
        {(statusFilter || priorityFilter) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={() => { setStatusFilter(''); setPriorityFilter(''); }}
          >
            Clear
          </Button>
        )}
        <span className="ml-auto text-xs text-muted-foreground">{filteredTasks.length} tasks</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="board" className="h-full flex flex-col">
          <div className="px-6 pt-3">
            <TabsList>
              <TabsTrigger value="board" className="gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5" />Board
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-1.5">
                <List className="h-3.5 w-3.5" />List
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-1.5">
                <Users className="h-3.5 w-3.5" />Members
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-1.5">
                <Activity className="h-3.5 w-3.5" />Activity
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="board" className="flex-1 overflow-auto p-6 mt-0">
            <KanbanBoard
              tasks={filteredTasks}
              onTaskClick={(task) => setTaskModal({ open: true, task, defaultStatus: task.status })}
              onAddTask={(status) => setTaskModal({ open: true, task: null, defaultStatus: status })}
              onTaskMove={(taskId, status) => moveMutation.mutate({ taskId, status })}
            />
          </TabsContent>

          <TabsContent value="list" className="flex-1 overflow-auto p-6 mt-0">
            {filteredTasks.length === 0 ? (
              <EmptyState
                icon={List}
                title="No tasks yet"
                description="Add your first task to get started"
                action={
                  <Button onClick={() => setTaskModal({ open: true, task: null, defaultStatus: 'todo' })} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Task
                  </Button>
                }
              />
            ) : (
              <div className="space-y-2">
                {filteredTasks.map(task => (
                  <div
                    key={task._id}
                    className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:shadow-sm hover:border-primary/30 cursor-pointer transition-all"
                    onClick={() => setTaskModal({ open: true, task, defaultStatus: task.status })}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={statusVariant[task.status]} className="text-xs capitalize">
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant={priorityVariant[task.priority]} className="text-xs capitalize">
                        {task.priority}
                      </Badge>
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                      {task.assignee && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignee.avatar} />
                          <AvatarFallback className="text-[9px]">{task.assignee.name?.[0]}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="members" className="flex-1 overflow-auto p-6 mt-0">
            <div className="max-w-lg space-y-2">
              {allMembers.map((m, i) => {
                const u = m.user || m;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <Badge variant={m.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                      {m.role}
                    </Badge>
                    {isOwner && m.role !== 'admin' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeMemberMutation.mutate(u._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="flex-1 overflow-auto p-6 mt-0">
            <div className="max-w-lg space-y-1">
              {(activityData || []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
              ) : (
                activityData.map((a, i) => (
                  <div key={i} className="flex gap-3 py-2">
                    <Avatar className="h-7 w-7 flex-shrink-0">
                      <AvatarImage src={a.user?.avatar} />
                      <AvatarFallback className="text-[9px]">{a.user?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{a.user?.name}</span>{' '}
                        <span className="text-muted-foreground">{a.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(a.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Modal */}
      <TaskModal
        open={taskModal.open}
        task={taskModal.task}
        defaultStatus={taskModal.defaultStatus}
        projectId={id}
        projectMembers={allMembers}
        onClose={() => setTaskModal({ open: false, task: null, defaultStatus: 'todo' })}
      />

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onClose={() => setAddMemberOpen(false)}>
        <DialogContent onClose={() => setAddMemberOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-4 space-y-4">
            <div>
              <Label>Email address</Label>
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={memberEmail}
                onChange={e => setMemberEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={memberRole} onChange={e => setMemberRole(e.target.value)} className="mt-1">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={() => addMemberMutation.mutate()}
              disabled={!memberEmail || addMemberMutation.isPending}
            >
              {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
