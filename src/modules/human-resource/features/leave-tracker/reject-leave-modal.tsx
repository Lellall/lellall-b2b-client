import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface RejectLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const RejectLeaveModal: React.FC<RejectLeaveModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    if (rejectionReason.trim().length < 10) {
      setError('Reason must be at least 10 characters');
      return;
    }

    onConfirm(rejectionReason.trim());
    setRejectionReason('');
    setError('');
  };

  const handleClose = () => {
    setRejectionReason('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Reject Leave Request</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-800">
            Are you sure you want to reject this leave request? Please provide a reason for the rejection.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (error) setError('');
              }}
              rows={4}
              placeholder="Please provide a detailed reason for rejecting this leave request..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none ${
                error ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {error && (
              <p className="mt-1 text-xs text-red-600">{error}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {rejectionReason.length}/500 characters (minimum 10 characters)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Reject Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectLeaveModal;



