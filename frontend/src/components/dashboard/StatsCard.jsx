import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function StatsCard({ title, value, icon: Icon, description, color, loading }) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value ?? '—'}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          {Icon && (
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', color || 'bg-primary/10')}>
              <Icon className={cn('h-5 w-5', color ? 'text-white' : 'text-primary')} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
