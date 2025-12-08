import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import {
  useMarkVendorInvoicePaidMutation,
  useMarkPaidInvoicePaidMutation,
  VendorInvoice,
  PaidInvoice,
} from '@/redux/api/vendor-invoices/vendor-invoices.api';
import Modal from '@/components/modal/modal';

interface MarkPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: VendorInvoice | PaidInvoice;
  type: 'vendor' | 'paid';
}

const MarkPaidModal: React.FC<MarkPaidModalProps> = ({ isOpen, onClose, invoice, type }) => {
  const { subdomain } = useSelector(selectAuth);
  const [markVendorPaid, { isLoading: isMarkingVendor }] = useMarkVendorInvoicePaidMutation();
  const [markPaidPaid, { isLoading: isMarkingPaid }] = useMarkPaidInvoicePaidMutation();
  const isLoading = isMarkingVendor || isMarkingPaid;

  const [formData, setFormData] = useState({
    paymentMethod: 'BANK_TRANSFER',
    paymentReference: '',
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain) return;

    try {
      if (type === 'vendor') {
        await markVendorPaid({
          subdomain,
          invoiceId: invoice.id,
          data: {
            paymentMethod: formData.paymentMethod,
            paymentReference: formData.paymentReference,
            notes: formData.notes || undefined,
          },
        }).unwrap();
      } else {
        await markPaidPaid({
          subdomain,
          invoiceId: invoice.id,
          data: {
            paymentMethod: formData.paymentMethod,
            paymentReference: formData.paymentReference,
            notes: formData.notes || undefined,
          },
        }).unwrap();
      }
      onClose();
      setFormData({
        paymentMethod: 'BANK_TRANSFER',
        paymentReference: '',
        notes: '',
      });
    } catch (error) {
      console.error('Failed to mark invoice as paid:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Mark Invoice as Paid</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Reference <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="paymentReference"
              value={formData.paymentReference}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
              placeholder="Transaction ID, Cheque Number, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
              placeholder="Additional payment notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Mark as Paid'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default MarkPaidModal;



