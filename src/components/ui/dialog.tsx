import React from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => onOpenChange(false)}>
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px]" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export const DialogContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

export const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4">{children}</div>
);

export const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-lg font-bold mb-2">{children}</h3>
); 