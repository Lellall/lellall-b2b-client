import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useVerifyVendorInvoiceMutation, VendorInvoice } from '@/redux/api/vendor-invoices/vendor-invoices.api';
import Modal from '@/components/modal/modal';

interface VerifyInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: VendorInvoice;
}

const VerifyInvoiceModal: React.FC<VerifyInvoiceModalProps> = ({ isOpen, onClose, invoice }) => {
  const { subdomain } = useSelector(selectAuth);
  const [verifyInvoice, { isLoading }] = useVerifyVendorInvoiceMutation();
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain) return;

    try {
      await verifyInvoice({
        subdomain,
        invoiceId: invoice.id,
        data: { notes: notes || undefined },
      }).unwrap();
      onClose();
      setNotes('');
    } catch (error) {
      console.error('Failed to verify invoice:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Verify Invoice</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
              placeholder="Add any notes about the verification..."
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
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Invoice'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default VerifyInvoiceModal;



