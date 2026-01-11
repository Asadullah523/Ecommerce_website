import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ className, ...props }) {
  return (
    <div
      className={twMerge(
        'rounded-xl border border-gray-800 bg-panel p-4 shadow-xl transition-all hover:border-gray-700',
        className
      )}
      {...props}
    />
  );
}
