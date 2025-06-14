import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary' }) => {
  const color = variant === 'secondary' ? 'bg-gray-200 text-gray-800' : 'bg-indigo-600 text-white';
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${color}`}>
      {children}
    </span>
  );
}; 