import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string | ReactNode;
  footer?: ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'normal' | 'large';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  footer,
  className = '',
  padding = 'normal',
  shadow = 'md',
  border = true,
  onClick,
}) => {
  // Padding variants
  const paddingVariants = {
    none: '',
    small: 'p-3',
    normal: 'p-4',
    large: 'p-6',
  };

  // Shadow variants
  const shadowVariants = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
  };

  // Base card styles
  const cardStyles = `
    bg-white 
    rounded-lg 
    ${paddingVariants[padding]} 
    ${shadowVariants[shadow]} 
    ${border ? 'border border-gray-200' : ''} 
    ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''}
    ${className}
  `;

  return (
    <div className={cardStyles} onClick={onClick}>
      {title && (
        <div className="mb-4">
          {typeof title === 'string' ? (
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          ) : (
            title
          )}
        </div>
      )}
      
      <div>{children}</div>
      
      {footer && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;