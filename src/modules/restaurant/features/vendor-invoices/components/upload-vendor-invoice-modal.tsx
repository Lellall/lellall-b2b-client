import React, { useState, useEffect, useRef } from 'react';
import { X, Upload as UploadIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useUploadVendorInvoiceMutation } from '@/redux/api/vendor-invoices/vendor-invoices.api';
import { useGetVendorsQuery } from '@/redux/api/gpt-supply-request/gpt-supply.api';
import Modal from '@/components/modal/modal';

interface UploadVendorInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadVendorInvoiceModal: React.FC<UploadVendorInvoiceModalProps> = ({ isOpen, onClose }) => {
  const { subdomain } = useSelector(selectAuth);
  const [uploadInvoice, { isLoading }] = useUploadVendorInvoiceMutation();
  const { data: vendors } = useGetVendorsQuery({ subdomain: subdomain || '' }, { skip: !subdomain });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    vendorId: '',
    supplyRequestId: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    totalAmount: '',
    taxAmount: '',
    subtotal: '',
    currency: 'NGN',
    description: '',
    notes: '',
    file: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain) return;

    try {
      // Validate totalAmount is a valid number
      const totalAmountValue = parseFloat(formData.totalAmount);
      if (isNaN(totalAmountValue) || totalAmountValue < 0) {
        alert('Please enter a valid total amount (must be a number >= 0)');
        return;
      }

      const submitData: any = {
        vendorId: formData.vendorId,
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        totalAmount: totalAmountValue,
        currency: formData.currency,
      };

      // Only include optional fields if they have values
      if (formData.supplyRequestId && formData.supplyRequestId.trim() !== '') {
        submitData.supplyRequestId = formData.supplyRequestId;
      }
      if (formData.dueDate && formData.dueDate.trim() !== '') {
        submitData.dueDate = formData.dueDate;
      }
      if (formData.taxAmount && formData.taxAmount.trim() !== '') {
        const taxValue = parseFloat(formData.taxAmount);
        if (!isNaN(taxValue) && taxValue >= 0) {
          submitData.taxAmount = taxValue;
        }
      }
      if (formData.subtotal && formData.subtotal.trim() !== '') {
        const subtotalValue = parseFloat(formData.subtotal);
        if (!isNaN(subtotalValue) && subtotalValue >= 0) {
          submitData.subtotal = subtotalValue;
        }
      }
      if (formData.description && formData.description.trim() !== '') {
        submitData.description = formData.description;
      }
      if (formData.notes && formData.notes.trim() !== '') {
        submitData.notes = formData.notes;
      }
      if (formData.file) {
        submitData.file = formData.file;
      }

      await uploadInvoice({
        subdomain,
        data: submitData,
      }).unwrap();
      onClose();
      setFormData({
        vendorId: '',
        supplyRequestId: '',
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        totalAmount: '',
        taxAmount: '',
        subtotal: '',
        currency: 'NGN',
        description: '',
        notes: '',
        file: null,
      });
    } catch (error) {
      console.error('Failed to upload invoice:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upload Vendor Invoice</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor <span className="text-red-500">*</span>
              </label>
              <select
                name="vendorId"
                value={formData.vendorId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
              >
                <option value="">Select Vendor</option>
                {vendors?.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Amount
              </label>
              <input
                type="number"
                name="taxAmount"
                value={formData.taxAmount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtotal
              </label>
              <input
                type="number"
                name="subtotal"
                value={formData.subtotal}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
              >
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice File (PDF or Image)
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-[#05431E] hover:bg-gray-50 transition-colors"
            >
              <div className="space-y-1 text-center">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <span className="font-medium text-[#05431E] hover:text-[#043020]">
                    Upload a file
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                {formData.file && (
                  <p className="text-sm text-gray-700 mt-2 font-medium">{formData.file.name}</p>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
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
              className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Uploading...' : 'Upload Invoice'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UploadVendorInvoiceModal;

