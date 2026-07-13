import React, { useState } from 'react';
import { X, Plus, Users, User as UserIcon, Phone, Mail } from 'lucide-react';
import { toast } from 'react-toastify';

interface NewWalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const NewWalkInModal: React.FC<NewWalkInModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    adultCount: 1,
    childrenCount: 0,
    notes: '',
  });

  const totalAmount = formData.adultCount * 20000 + formData.childrenCount * 10000;

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error('Guest name is required');
      return;
    }
    
    try {
      await onSubmit(formData);
      toast.success('Walk-in guest registered successfully!');
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        adultCount: 1,
        childrenCount: 0,
        notes: '',
      });
      onClose();
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
          
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Check-In Guest</h2>
              <p className="text-xs text-gray-500 mt-0.5">Register a new walk-in arrival</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
            >
              <X size="20" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <UserIcon size="14" /> Guest Full Name <span className="text-red-500">*</span>
              </label>
              <input 
                required
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all text-sm" 
                placeholder="e.g. Chukwu Eze" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  <Phone size="14" /> Phone Number
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all text-sm" 
                  placeholder="+234..." 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  <Mail size="14" /> Email Address
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all text-sm" 
                  placeholder="guest@email.com" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 mt-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  <Users size="14" /> Adults (₦20k/each)
                </label>
                <input 
                  type="number" 
                  min="1"
                  max="20"
                  name="adultCount"
                  value={formData.adultCount}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                  <Users size="14" /> Children (₦10k/each)
                </label>
                <input 
                  type="number" 
                  min="0"
                  max="20"
                  name="childrenCount"
                  value={formData.childrenCount}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all text-sm" 
                />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex justify-between items-center">
              <span className="text-sm font-semibold text-green-800">Total Check-In Fee</span>
              <span className="text-xl font-bold text-green-900">₦{totalAmount.toLocaleString()}</span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Notes & Conditions
              </label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] outline-none transition-all text-sm resize-none" 
                placeholder="e.g. Paid entry fee, waiting for member to arrive..." 
              />
            </div>
          </form>

          <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              type="button"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              type="button"
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#05431E] hover:bg-[#042f15] transition-colors shadow-sm flex items-center gap-2"
            >
              <Plus size="16" />
              Register Guest
            </button>
          </div>
          
        </div>
      </div>
    </>
  );
};
