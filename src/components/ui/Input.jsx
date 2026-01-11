import { twMerge } from 'tailwind-merge';

export function Input({ className, label, error, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-xs font-medium text-gray-400">{label}</label>}
      <input
        className={twMerge(
          'w-full rounded-lg border border-gray-800 bg-bg-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan disabled:opacity-50',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
