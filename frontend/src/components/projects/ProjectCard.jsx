import { useNavigate } from 'react-router-dom';
import { Users, CheckSquare, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const statusVariant = { active: 'success', completed: 'info', archived: 'secondary' };

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const progress = project.taskCount > 0
    ? Math.round((project.completedCount / project.taskCount) * 100)
    : 0;

  const allMembers = [
    { user: project.owner, role: 'admin' },
    ...project.members,
  ];

  return (
    <Card
      className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
      onClick={() => navigate(`/projects/${project._id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
              style={{ backgroundColor: project.color || '#6366f1' }}
            />
            <div>
              <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-1">
                {project.name}
              </CardTitle>
              {project.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{project.description}</p>
              )}
            </div>
          </div>
          <Badge variant={statusVariant[project.status] || 'secondary'} className="flex-shrink-0 capitalize">
            {project.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1">
              <CheckSquare className="h-3 w-3" />
              {project.completedCount}/{project.taskCount} tasks
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {allMembers.slice(0, 4).map((m, i) => {
              const u = m.user || m;
              const initials = u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
              return (
                <Avatar key={i} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={u.avatar} alt={u.name} />
                  <AvatarFallback className="text-[9px] bg-primary/20 text-primary">{initials}</AvatarFallback>
                </Avatar>
              );
            })}
            {allMembers.length > 4 && (
              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] text-muted-foreground">
                +{allMembers.length - 4}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(project.updatedAt), 'MMM d')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
