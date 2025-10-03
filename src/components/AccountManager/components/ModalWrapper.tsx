import { X } from "lucide-react";

interface ModalWrapperProps {
  onClose: () => void;
  children: React.ReactNode;
}

export function ModalWrapper({ onClose, children }: ModalWrapperProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 neet-prep-font"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="card-neet max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
            Profile Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-neet-primary-600 hover:bg-neet-primary-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neet-primary-500"
            aria-label="Close profile settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
