import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = ({ open, onClose, children }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.(); }}
    >
      {children}
    </div>
  );
};

const DialogContent = ({ className, children, onClose, ...props }) => (
  <div
    className={cn(
      'relative bg-background rounded-lg shadow-xl border w-full max-w-lg max-h-[90vh] overflow-y-auto',
      className
    )}
    onClick={(e) => e.stopPropagation()}
    {...props}
  >
    {onClose && (
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring z-10"
      >
        <X className="h-4 w-4" />
      </button>
    )}
    {children}
  </div>
);

const DialogHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 p-6 pb-0', className)} {...props} />
);

const DialogTitle = ({ className, ...props }) => (
  <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
);

const DialogDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
);

const DialogFooter = ({ className, ...props }) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4', className)} {...props} />
);

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
