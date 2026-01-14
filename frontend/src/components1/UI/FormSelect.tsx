import React from 'react';

interface IOption {
    value: string | number;
    label: string;
}

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: IOption[];
    error?: string; // <--- Nuevo: Para manejar el error
}

export const FormSelect: React.FC<Props> = ({ label, options, className, error, ...props }) => {
    return (
        <div className="group">
            <label className={`block text-sm font-medium mb-2 ml-1 transition-colors ${error ? 'text-red-600' : 'text-gray-700'}`}>
                {label}
            </label>
            
            <div className="relative">
                <select
                    {...props}
                    className={`w-full px-5 py-3 rounded-2xl appearance-none cursor-pointer border-none transition-all duration-300
                        ${className || ''}
                        ${error 
                            ? 'bg-red-50 ring-1 ring-red-500 focus:ring-red-500 text-red-900' 
                            : 'bg-gray-50 focus:ring-2 focus:ring-blue-500/20 focus:bg-white text-gray-700'
                        }
                    `}
                >
                    <option value="">Seleccionar...</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                
                {/* Icono de flecha custom (opcional, para que se vea mejor) */}
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            {/* Mensaje de error */}
            {error && (
                <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium animate-pulse">
                    * {error}
                </p>
            )}
        </div>
    );
};