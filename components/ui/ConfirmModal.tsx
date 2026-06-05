"use client";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isPending?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  isPending = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div className="relative z-10 dream-card max-w-sm w-full p-6 space-y-4">
        <h2 className="font-sans text-lg font-bold text-dream-bright">{title}</h2>
        <p className="font-sans text-sm text-dream-muted leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end pt-1">
          <button
            onClick={onClose}
            disabled={isPending}
            className="font-sans text-sm text-dream-muted hover:text-dream-text px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="font-sans text-sm font-semibold text-white bg-red-500/80 hover:bg-red-500 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {isPending ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
