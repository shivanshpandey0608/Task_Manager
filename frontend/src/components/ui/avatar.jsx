import { cn } from '@/lib/utils';

const Avatar = ({ className, ...props }) => (
  <div className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...props} />
);

const AvatarImage = ({ className, src, alt, ...props }) => (
  src ? <img src={src} alt={alt} className={cn('aspect-square h-full w-full object-cover', className)} {...props} /> : null
);

const AvatarFallback = ({ className, children, ...props }) => (
  <div className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium', className)} {...props}>
    {children}
  </div>
);

export { Avatar, AvatarImage, AvatarFallback };
