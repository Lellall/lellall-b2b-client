import React, { useState } from 'react';
import { X, FileText, AlertCircle } from 'lucide-react';
import { PayrollRecord } from '@/redux/api/payroll/payroll.api';

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  payrollItem: PayrollRecord;
  onUpdate: (status: string, notes?: string, paymentReference?: string) => void;
  isUpdating: boolean;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  onClose,
  payrollItem,
  onUpdate,
  isUpdating,
}) => {
  const [status, setStatus] = useState<string>(payrollItem.status);
  const [notes, setNotes] = useState<string>(payrollItem.notes || '');
  const [paymentReference, setPaymentReference] = useState<string>(payrollItem.paymentReference || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(status, notes || undefined, paymentReference || undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-700 bg-green-100';
      case 'PENDING':
        return 'text-yellow-700 bg-yellow-100';
      case 'PROCESSING':
        return 'text-blue-700 bg-blue-100';
      case 'FAILED':
        return 'text-red-700 bg-red-100';
      case 'CANCELLED':
        return 'text-gray-700 bg-gray-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#05431E]" />
              <h2 className="text-xl font-semibold text-gray-900">Update Payroll Status</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3">
            <div className="text-sm text-gray-500">Employee</div>
            <div className="text-base font-medium text-gray-900">{payrollItem.salary.employee.name}</div>
            <div className="text-xs text-gray-400 mt-1">
              Current Status: <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(payrollItem.status)}`}>{payrollItem.status}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
              required
            >
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            {status === 'FAILED' && (
              <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">
                  Marking as failed will require a reason. Please provide notes explaining why the payment failed.
                </p>
              </div>
            )}
          </div>

          {/* Payment Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Reference
            </label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="e.g., TXN123456789"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes {status === 'FAILED' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or reason for status change..."
              rows={4}
              required={status === 'FAILED'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || (status === 'FAILED' && !notes.trim())}
              className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStatusModal;



