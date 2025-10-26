import React from 'react';
import { CloseCircle, Warning2 } from 'iconsax-react';
import { StyledButton } from '@/components/button/button-lellall';
import { useDeleteBranchMutation, Branch } from '@/redux/api/branches/branches.api';

interface DeleteBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}

const DeleteBranchModal: React.FC<DeleteBranchModalProps> = ({ isOpen, onClose, branch }) => {
  console.log('DeleteBranchModal render - isOpen:', isOpen, 'branch:', branch);
  
  const [deleteBranch, { isLoading }] = useDeleteBranchMutation();

  const handleDelete = async () => {
    if (!branch) {
      console.error('No branch selected for deletion');
      return;
    }

    try {
      await deleteBranch(branch.id).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to delete branch:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-red-600">Delete Branch</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <CloseCircle size="20" color="#666" />
          </button>
        </div>

        <div className="flex items-start gap-3 mb-6">
          <div className="flex-shrink-0">
            <Warning2 size="24" color="#dc2626" />
          </div>
          <div>
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete <strong>{branch?.name || 'this branch'}</strong>?
            </p>
            <p className="text-sm text-gray-500">
              This action cannot be undone. All data associated with this branch will be permanently removed.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <StyledButton
            type="button"
            onClick={onClose}
            background="#f3f4f6"
            color="#374151"
            width="100%"
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </StyledButton>
          <StyledButton
            type="button"
            onClick={handleDelete}
            background="#dc2626"
            color="#ffffff"
            width="100%"
            disabled={isLoading || !branch}
          >
            {isLoading ? 'Deleting...' : 'Delete Branch'}
          </StyledButton>
        </div>
      </div>
    </div>
  );
};

export default DeleteBranchModal;
