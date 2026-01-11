import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

/**
 * Reusable Confirmation Dialog component
 * Displays a modal with custom title, message, and action buttons for critical user decisions.
 */
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'accent' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-bg-900 border-gray-700 p-6">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-gray-300 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant={confirmVariant} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
}
