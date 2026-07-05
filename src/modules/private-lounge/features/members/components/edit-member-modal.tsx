import React, { useState, useEffect } from 'react';
import { X, Edit } from 'lucide-react';
import { useUpdateMemberMutation } from '../../../../../redux/api/private-lounge/members.api';
import { toast } from 'react-toastify';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({ isOpen, onClose, member }) => {
  const [updateMember, { isLoading }] = useUpdateMemberMutation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    primaryPhone: '',
    company: '',
    occupation: '',
    preferredBeverage: '',
    preferredCigar: '',
  });

  useEffect(() => {
    if (member) {
      setFormData({
        fullName: member.fullName || '',
        email: member.email || '',
        primaryPhone: member.primaryPhone || '',
        company: member.company || '',
        occupation: member.occupation || '',
        preferredBeverage: member.preferredBeverage || '',
        preferredCigar: member.preferredCigar || '',
      });
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMember({
        id: member.id,
        data: formData
      }).unwrap();
      toast.success('Member profile updated successfully');
      onClose();
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to update member');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-[70] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Edit className="text-[#05431E]" size={20} />
            Edit Member Profile
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#05431E] focus:ring-[#05431E] outline-none transition-all text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#05431E] focus:ring-[#05431E] outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input 
                type="tel" 
                required
                value={formData.primaryPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryPhone: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#05431E] focus:ring-[#05431E] outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input 
                type="text" 
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#05431E] focus:ring-[#05431E] outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
              <input 
                type="text" 
                value={formData.occupation}
                onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#05431E] focus:ring-[#05431E] outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Beverage</label>
              <input 
                type="text" 
                value={formData.preferredBeverage}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredBeverage: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#05431E] focus:ring-[#05431E] outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Cigar</label>
              <input 
                type="text" 
                value={formData.preferredCigar}
                onChange={(e) => setFormData(prev => ({ ...prev, preferredCigar: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#05431E] focus:ring-[#05431E] outline-none transition-all text-sm"
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#05431E] hover:bg-[#042f15] rounded-xl transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
