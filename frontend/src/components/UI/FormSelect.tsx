import React from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
}

export const FormSelect: React.FC<Props> = ({ label, options, ...props }) => {
  return (
    <div className="group">
      <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
        {label}
      </label>
      <div className="relative">
        <select
          {...props}
          className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};