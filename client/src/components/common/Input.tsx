import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  unit?: string;
  error?: string;
  helperText?: string;
  onChange?: (value: string) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  unit,
  error,
  helperText,
  onChange,
  className = '',
  disabled,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-md shadow-sm">
        <input
          id={inputId}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.value)}
          className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-850 transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:opacity-60 font-mono ${
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
          } ${unit ? 'pr-12' : ''}`}
          {...props}
        />
        {unit && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{unit}</span>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-600 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};
