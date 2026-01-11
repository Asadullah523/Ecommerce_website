import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Core Button UI component with variety of sizing and visual variants
 */
export function Button({ className, variant = 'primary', size = 'md', children, ...props }) {
  const variants = {
    primary: 'bg-white text-bg-900 hover:bg-gray-200',
    secondary: 'bg-bg-700 text-white hover:bg-bg-800 border border-gray-700',
    accent: 'bg-accent-cyan text-white hover:bg-accent-cyan/90 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]',
    outline: 'border border-gray-600 text-gray-300 hover:border-white hover:text-white',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
    success: 'bg-green-500 text-white hover:bg-green-600 shadow-[0_0_15px_-3px_rgba(34,197,94,0.4)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  };

  return (
    <button
      className={twMerge(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
