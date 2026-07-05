import React, { useState } from 'react';
import { X, Wine } from 'lucide-react';
import { useAddBottleMutation } from '../../../../../redux/api/private-lounge/bottles.api';
import { toast } from 'react-toastify';

interface AddBottleModalProps {
  isOpen: boolean;
  onClose: () => void;
  membershipId: string;
  loungeId: string;
}

export const AddBottleModal: React.FC<AddBottleModalProps> = ({ isOpen, onClose, membershipId, loungeId }) => {
  const [addBottle, { isLoading }] = useAddBottleMutation();
  const [formData, setFormData] = useState({
    bottleName: '',
    type: 'Cognac',
    totalVolumeMl: '750',
    remainingVolumeMl: '750',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBottle({
        membershipId,
        data: {
          bottleName: formData.bottleName,
          type: formData.type,
          totalVolumeMl: parseInt(formData.totalVolumeMl, 10),
          remainingVolumeMl: parseInt(formData.remainingVolumeMl, 10),
          loungeId
        }
      }).unwrap();
      toast.success('Bottle added to inventory');
      setFormData({ bottleName: '', type: 'Cognac', totalVolumeMl: '750', remainingVolumeMl: '750' });
      onClose();
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to add bottle');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-[70] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Wine className="text-[#05431E]" size={20} />
            Add New Bottle
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bottle Name</label>
            <input 
              type="text" 
              required
              value={formData.bottleName}
              onChange={(e) => setFormData(prev => ({ ...prev, bottleName: e.target.value }))}
              placeholder="e.g. Hennessy XO"
              className="w-full border-gray-200 rounded-xl focus:border-[#05431E] focus:ring-[#05431E] text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full border-gray-200 rounded-xl focus:border-[#05431E] focus:ring-[#05431E] text-sm"
            >
              <option>Cognac</option>
              <option>Scotch Whisky</option>
              <option>Champagne</option>
              <option>Single Malt</option>
              <option>Tequila</option>
              <option>Vodka</option>
              <option>Gin</option>
              <option>Rum</option>
              <option>Other</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Volume (ml)</label>
              <input 
                type="number" 
                required
                min="100"
                value={formData.totalVolumeMl}
                onChange={(e) => setFormData(prev => ({ ...prev, totalVolumeMl: e.target.value }))}
                className="w-full border-gray-200 rounded-xl focus:border-[#05431E] focus:ring-[#05431E] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remaining (ml)</label>
              <input 
                type="number" 
                required
                min="0"
                max={formData.totalVolumeMl}
                value={formData.remainingVolumeMl}
                onChange={(e) => setFormData(prev => ({ ...prev, remainingVolumeMl: e.target.value }))}
                className="w-full border-gray-200 rounded-xl focus:border-[#05431E] focus:ring-[#05431E] text-sm"
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
              {isLoading ? 'Adding...' : 'Add Bottle'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
