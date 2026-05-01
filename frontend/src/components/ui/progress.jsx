import { cn } from '@/lib/utils';

const Progress = ({ className, value, ...props }) => (
  <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)} {...props}>
    <div
      className="h-full bg-primary transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
    />
  </div>
);

export { Progress };
