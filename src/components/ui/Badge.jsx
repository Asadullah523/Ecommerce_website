import { twMerge } from 'tailwind-merge';

export function Badge({ variant = 'default', className, ...props }) {
  const variants = {
    default: 'bg-gray-800 text-gray-300',
    success: 'bg-green-500/10 text-green-400 border border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    accent: 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20',
    outline: 'border border-gray-700 text-gray-400',
  };

  return (
    <span
      className={twMerge(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
