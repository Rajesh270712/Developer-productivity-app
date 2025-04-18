import React from 'react';

interface TextAreaProps {
  id: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  maxLength?: number;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  rows = 4,
  maxLength,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  fullWidth = true,
  className = '',
}) => {
  // Base styles
  const baseTextAreaStyles = `
    block rounded-md border-gray-300 shadow-sm
    focus:border-blue-500 focus:ring-blue-500
    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
    ${readOnly ? 'bg-gray-50 cursor-default' : ''}
  `;

  // Character counter
  const showCharCounter = maxLength !== undefined;
  const charCount = value?.length || 0;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="block mb-1 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        className={baseTextAreaStyles}
      />
      
      <div className="flex justify-between mt-1">
        {(error || helperText) && (
          <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}
        
        {showCharCounter && (
          <p className={`text-sm text-gray-500 ${!error && !helperText ? 'ml-auto' : ''}`}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export default TextArea;