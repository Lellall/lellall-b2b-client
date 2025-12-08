import React from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { PaidInvoice } from '@/redux/api/vendor-invoices/vendor-invoices.api';
import { usePermissions } from '@/hooks/usePermissions';
import Modal from '@/components/modal/modal';

interface PaidInvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: PaidInvoice;
  onMarkPaid?: () => void;
}

const PaidInvoiceDetailsModal: React.FC<PaidInvoiceDetailsModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onMarkPaid,
}) => {
  const { canUpdate } = usePermissions();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: invoice.currency || 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Paid Invoice Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Invoice Number</label>
              <p className="text-base font-semibold text-gray-900">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-base font-semibold text-gray-900">{invoice.status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Vendor</label>
              <p className="text-base text-gray-900">{invoice.vendor?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Invoice Date</label>
              <p className="text-base text-gray-900">{format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}</p>
            </div>
            {invoice.dueDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">Due Date</label>
                <p className="text-base text-gray-900">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Total Amount</label>
              <p className="text-base font-semibold text-gray-900">{formatCurrency(invoice.totalAmount)}</p>
            </div>
          </div>

          {/* Invoice Items */}
          {invoice.invoiceItems && invoice.invoiceItems.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500 mb-3 block">Invoice Items</label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Quantity</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Unit Price</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.invoiceItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.itemName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.description || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {invoice.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-base text-gray-900 mt-1">{invoice.description}</p>
            </div>
          )}

          {invoice.notes && (
            <div>
              <label className="text-sm font-medium text-gray-500">Notes</label>
              <p className="text-base text-gray-900 mt-1">{invoice.notes}</p>
            </div>
          )}

          {invoice.paidAt && (
            <div>
              <label className="text-sm font-medium text-gray-500">Payment Details</label>
              <div className="mt-1 space-y-1">
                <p className="text-base text-gray-900">Paid on: {format(new Date(invoice.paidAt), 'MMM dd, yyyy')}</p>
                {invoice.paymentMethod && <p className="text-base text-gray-900">Method: {invoice.paymentMethod}</p>}
                {invoice.paymentReference && <p className="text-base text-gray-900">Reference: {invoice.paymentReference}</p>}
              </div>
            </div>
          )}

          {invoice.pdfUrl && (
            <div>
              <label className="text-sm font-medium text-gray-500">Invoice PDF</label>
              <div className="mt-2">
                <a
                  href={invoice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View PDF
                </a>
              </div>
            </div>
          )}

          {/* Actions */}
          {canUpdate && invoice.status !== 'PAID' && onMarkPaid && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onMarkPaid}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Paid
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PaidInvoiceDetailsModal;

