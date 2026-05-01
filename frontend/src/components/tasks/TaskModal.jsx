import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Send, Trash2, Calendar, User, Flag, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { tasksApi } from '@/api/tasks';
import { usersApi } from '@/api/users';
import useAuthStore from '@/store/authStore';

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const statusVariant = { todo: 'secondary', in_progress: 'info', done: 'success' };
const priorityVariant = { low: 'info', medium: 'warning', high: 'danger' };

export default function TaskModal({ task, open, onClose, projectMembers = [], projectId, defaultStatus }) {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const isNew = !task;

  const [form, setForm] = useState({
    title: '', description: '', status: defaultStatus || 'todo',
    priority: 'medium', dueDate: '', assignee: '', tags: '',
  });
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
        assignee: task.assignee?._id || task.assignee || '',
        tags: task.tags?.join(', ') || '',
      });
    } else {
      setForm({ title: '', description: '', status: defaultStatus || 'todo', priority: 'medium', dueDate: '', assignee: '', tags: '' });
    }
  }, [task, defaultStatus]);

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll().then(r => r.data.data.users),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => isNew
      ? tasksApi.create({ ...data, projectId })
      : tasksApi.update(task._id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['project'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(isNew ? 'Task created' : 'Task updated');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save task'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.delete(task._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['project'] });
      toast.success('Task deleted');
      onClose();
    },
  });

  const commentMutation = useMutation({
    mutationFn: (text) => tasksApi.addComment(task._id, { text }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setComment('');
      toast.success('Comment added');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    const data = {
      ...form,
      dueDate: form.dueDate || null,
      assignee: form.assignee || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    saveMutation.mutate(data);
  };

  const members = projectMembers.length > 0 ? projectMembers : (usersData || []);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="max-w-2xl" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{isNew ? 'Create Task' : 'Edit Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Task title..."
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              placeholder="Add a description..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="mt-1"
              >
                {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                className="mt-1"
              >
                {priorityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="due">Due Date</Label>
              <Input
                id="due"
                type="date"
                value={form.dueDate}
                onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Assignee</Label>
              <Select
                value={form.assignee}
                onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))}
                className="mt-1"
              >
                <option value="">Unassigned</option>
                {members.map(m => {
                  const u = m.user || m;
                  return <option key={u._id} value={u._id}>{u.name}</option>;
                })}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags <span className="text-muted-foreground">(comma-separated)</span></Label>
            <Input
              id="tags"
              placeholder="bug, feature, urgent..."
              value={form.tags}
              onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
              className="mt-1"
            />
          </div>

          <DialogFooter className="!p-0 !pt-2">
            <div className="flex items-center gap-2 w-full">
              {!isNew && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
              <div className="flex-1" />
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : isNew ? 'Create Task' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </form>

        {/* Comments section for existing tasks */}
        {!isNew && task && (
          <>
            <Separator />
            <div className="p-6 pt-4 space-y-4">
              <h4 className="text-sm font-semibold">Comments ({task.comments?.length || 0})</h4>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {task.comments?.map((c, i) => (
                  <div key={i} className="flex gap-3">
                    <Avatar className="h-7 w-7 flex-shrink-0">
                      <AvatarImage src={c.user?.avatar} />
                      <AvatarFallback className="text-[10px]">
                        {c.user?.name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{c.user?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(c.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{c.text}</p>
                    </div>
                  </div>
                ))}
                {!task.comments?.length && (
                  <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && comment.trim()) {
                      e.preventDefault();
                      commentMutation.mutate(comment.trim());
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={() => comment.trim() && commentMutation.mutate(comment.trim())}
                  disabled={!comment.trim() || commentMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
