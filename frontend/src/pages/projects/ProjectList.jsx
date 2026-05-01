import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, LayoutGrid, List, FolderKanban, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectsApi } from '@/api/projects';
import ProjectCard from '@/components/projects/ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import EmptyState from '@/components/common/EmptyState';
import { CardSkeleton } from '@/components/common/PageLoader';
import { useNavigate } from 'react-router-dom';

const PROJECT_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#0ea5e9'];

function ProjectForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="p-6 pt-4 space-y-4">
      <div>
        <Label htmlFor="pname">Project Name *</Label>
        <Input
          id="pname"
          placeholder="e.g. Website Redesign"
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="pdesc">Description</Label>
        <Textarea
          id="pdesc"
          placeholder="What is this project about?"
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          className="mt-1"
          rows={3}
        />
      </div>
      <div>
        <Label>Color</Label>
        <div className="flex gap-2 mt-2 flex-wrap">
          {PROJECT_COLORS.map(c => (
            <button
              key={c}
              type="button"
              className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-foreground scale-110' : 'hover:scale-110'}`}
              style={{ backgroundColor: c }}
              onClick={() => setForm(p => ({ ...p, color: c }))}
            />
          ))}
        </div>
      </div>
      <DialogFooter className="!p-0">
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating...' : 'Create Project'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function ProjectList() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll().then(r => r.data.data.projects),
  });

  const createMutation = useMutation({
    mutationFn: (data) => projectsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      setCreateOpen(false);
      toast.success('Project created!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create project'),
  });

  const filtered = (data || []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={search ? 'No projects found' : 'No projects yet'}
          description={search ? 'Try a different search term' : 'Create your first project to start organizing tasks'}
          action={!search && (
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          )}
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => <ProjectCard key={p._id} project={p} />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div
              key={p._id}
              className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-sm hover:border-primary/30 cursor-pointer transition-all"
              onClick={() => navigate(`/projects/${p._id}`)}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color || '#6366f1' }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.name}</p>
                {p.description && <p className="text-xs text-muted-foreground truncate">{p.description}</p>}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0">
                <span>{p.taskCount} tasks</span>
                <span className="capitalize">{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <DialogContent onClose={() => setCreateOpen(false)}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm onSubmit={createMutation.mutate} loading={createMutation.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
