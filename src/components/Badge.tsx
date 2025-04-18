import React from 'react';

interface BadgeProps {
  text: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

const Badge: React.FC<BadgeProps> = ({ 
  text, 
  color = 'default',
  size = 'md' 
}) => {
  // Color variants
  const colorVariants = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-purple-100 text-purple-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-teal-100 text-teal-800',
    default: 'bg-gray-100 text-gray-800'
  };

  // Size variants
  const sizeVariants = {
    sm: 'text-xs px-2 py-0.5 rounded',
    md: 'text-sm px-2.5 py-0.5 rounded',
    lg: 'text-base px-3 py-1 rounded-md'
  };

  return (
    <span className={`inline-block font-medium ${colorVariants[color]} ${sizeVariants[size]}`}>
      {text}
    </span>
  );
};

export default Badge;