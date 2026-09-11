import React from 'react';
import Modal from './modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const Spinner: React.FC = () => (
  <span
    className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
    aria-hidden="true"
  />
);

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
  danger = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm" title={title}>
      <div className="text-sm text-gray-600 mb-6">{message}</div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
            danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#05431E] hover:opacity-90'
          }`}
        >
          {isLoading && <Spinner />}
          {isLoading ? 'Please wait…' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
