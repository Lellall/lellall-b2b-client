import React, { useState, useEffect } from 'react';
import { CloseCircle } from 'iconsax-react';
import { StyledButton } from '@/components/button/button-lellall';
import { useUpdateBranchMutation, Branch } from '@/redux/api/branches/branches.api';

interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}

const EditBranchModal: React.FC<EditBranchModalProps> = ({ isOpen, onClose, branch }) => {
  console.log('EditBranchModal render - isOpen:', isOpen, 'branch:', branch);
  
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    address: '',
  });

  const [updateBranch, { isLoading }] = useUpdateBranchMutation();

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name,
        subdomain: branch.subdomain,
        address: branch.address,
      });
    }
  }, [branch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branch) {
      console.error('No branch selected for editing');
      return;
    }

    try {
      await updateBranch({
        id: branch.id,
        data: formData,
      }).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to update branch:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Edit Branch</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <CloseCircle size="20" color="#666" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Branch Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter branch name"
            />
          </div>

          <div>
            <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-1">
              Subdomain
            </label>
            <input
              type="text"
              id="subdomain"
              name="subdomain"
              value={formData.subdomain}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter subdomain"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter address"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <StyledButton
              type="button"
              onClick={onClose}
              background="#f3f4f6"
              color="#374151"
              width="100%"
              variant="outline"
            >
              Cancel
            </StyledButton>
            <StyledButton
              type="submit"
              background="hsl(var(--active))"
              color="hsl(var(--secondary))"
              width="100%"
              disabled={isLoading || !branch}
            >
              {isLoading ? 'Updating...' : 'Update Branch'}
            </StyledButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBranchModal;
