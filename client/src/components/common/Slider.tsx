import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
  description?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  disabled = false,
  className = '',
  description,
}) => {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs font-medium">
        <label className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          {label}
        </label>
        <span className="font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold">
          {Number.isInteger(value) ? value : value.toFixed(2)} {unit}
        </span>
      </div>

      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          aria-label={`${label} (${unit})`}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, var(--color-border, #cbd5e1) ${percentage}%, var(--color-border, #cbd5e1) 100%)`,
          }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono">
        <span>
          {min} {unit}
        </span>
        {description && <span className="truncate max-w-[140px] text-slate-600 dark:text-slate-400">{description}</span>}
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  );
};
