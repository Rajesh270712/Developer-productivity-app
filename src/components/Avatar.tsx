import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  name?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User',
  size = 'md',
  name,
  status,
  className = '',
}) => {
  // Size variants
  const sizeVariants = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  // Status colors
  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-amber-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400',
  };

  // Get initials from name
  const getInitials = () => {
    if (!name) return '?';
    
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeVariants[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizeVariants[size]} rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium`}
        >
          {getInitials()}
        </div>
      )}

      {status && (
        <span className={`absolute bottom-0 right-0 block rounded-full ${statusColors[status]} ring-2 ring-white w-2.5 h-2.5`} />
      )}
    </div>
  );
};

export default Avatar;