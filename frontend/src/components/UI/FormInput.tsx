import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput: React.FC<Props> = ({ label, className, type, value, error, ...props }) => {

  const displayValue = (type === 'number' && value === 0) ? '' : value;

  return (
    <div className="group">
      <label className={`block text-sm font-medium mb-2 ml-1 transition-colors ${error ? 'text-red-600' : 'text-gray-700'}`}>
        {label}
      </label>

      <input
        {...props}
        type={type}
        value={displayValue}
        className={`w-full px-5 py-3 rounded-2xl border-none transition-all duration-300 
          placeholder-gray-400 
          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          ${className || ''}
          ${error
            ? 'bg-red-50 ring-1 ring-red-500 focus:ring-red-500 text-red-900 placeholder-red-300' // Estilo de Error
            : 'bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:bg-white' // Estilo Normal
          }
        `}
      />

      {/* 2. Aquí se muestra el mensaje debajo */}
      {error && (
        <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium animate-pulse">
          * {error}
        </p>
      )}
    </div>
  );
};