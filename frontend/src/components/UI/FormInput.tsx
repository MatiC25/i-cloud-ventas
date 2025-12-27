import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FormInput: React.FC<Props> = ({ label, className, type, value, ...props }) => {
  
  const displayValue = (type === 'number' && value === 0) ? '' : value;

  return (
    <div className="group">
      <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
        {label}
      </label>
      <input
        {...props}
        type={type}
        value={displayValue}
        className={`w-full px-5 py-3 rounded-2xl bg-gray-50 border-none 
          focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-300 
          placeholder-gray-400 
          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          ${className || ''}`}
      />
    </div>
  );
};