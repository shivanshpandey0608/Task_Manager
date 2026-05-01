import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      {children({ open, setOpen })}
    </div>
  );
};

const DropdownMenuContent = ({ className, children, align = 'end', ...props }) => (
  <div
    className={cn(
      'absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
      align === 'end' ? 'right-0' : 'left-0',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const DropdownMenuItem = ({ className, children, onClick, ...props }) => (
  <div
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
      className
    )}
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
);

const DropdownMenuSeparator = ({ className, ...props }) => (
  <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
);

export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator };
