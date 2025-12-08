import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGeneratePaidInvoiceMutation, PaidInvoiceItem } from '@/redux/api/vendor-invoices/vendor-invoices.api';
import { useGetVendorsQuery } from '@/redux/api/gpt-supply-request/gpt-supply.api';
import Modal from '@/components/modal/modal';

interface GeneratePaidInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GeneratePaidInvoiceModal: React.FC<GeneratePaidInvoiceModalProps> = ({ isOpen, onClose }) => {
  const { subdomain } = useSelector(selectAuth);
  const [generateInvoice, { isLoading }] = useGeneratePaidInvoiceMutation();
  const { data: vendors } = useGetVendorsQuery({ subdomain: subdomain || '' }, { skip: !subdomain });

  const [formData, setFormData] = useState({
    vendorId: '',
    supplyRequestId: '',
    dueDate: '',
    currency: 'NGN',
    description: '',
    notes: '',
    taxAmount: '',
    items: [{ itemName: '', description: '', quantity: 1, unitPrice: 0 }] as PaidInvoiceItem[],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof PaidInvoiceItem, value: string | number) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].total = Number(newItems[index].quantity) * Number(newItems[index].unitPrice);
      }
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { itemName: '', description: '', quantity: 1, unitPrice: 0, total: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = formData.taxAmount ? parseFloat(formData.taxAmount) : 0;
    return subtotal + tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain) return;

    try {
      await generateInvoice({
        subdomain,
        data: {
          vendorId: formData.vendorId,
          supplyRequestId: formData.supplyRequestId || undefined,
          dueDate: formData.dueDate || undefined,
          currency: formData.currency,
          description: formData.description || undefined,
          notes: formData.notes || undefined,
          taxAmount: formData.taxAmount ? parseFloat(formData.taxAmount) : undefined,
          items: formData.items.map((item) => ({
            itemName: item.itemName,
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            total: Number(item.quantity) * Number(item.unitPrice),
          })),
        },
      }).unwrap();
      onClose();
      setFormData({
        vendorId: '',
        supplyRequestId: '',
        dueDate: '',
        currency: 'NGN',
        description: '',
        notes: '',
        taxAmount: '',
        items: [{ itemName: '', description: '', quantity: 1, unitPrice: 0 }],
      });
    } catch (error) {
      console.error('Failed to generate invoice:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Generate Paid Invoice</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Amount</label>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
            />
          </div>

          {/* Invoice Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Invoice Items</label>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1.5 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={item.itemName}
                      onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      disabled={formData.items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: formData.currency }).format(calculateSubtotal())}</span>
                </div>
                {formData.taxAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: formData.currency }).format(parseFloat(formData.taxAmount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: formData.currency }).format(calculateTotal())}</span>
                </div>
              </div>
            </div>
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
              {isLoading ? 'Generating...' : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default GeneratePaidInvoiceModal;



