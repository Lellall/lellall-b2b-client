import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Modal from '@/components/modal/modal';
import { StyledButton } from '@/components/button/button-lellall';
import Input from '@/components/input/input';
import { useCreateBranchMutation, useUpdateBranchMutation } from '@/redux/api/branches/branches.api';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';

const schema = yup.object({
  name: yup.string().required('Branch name is required'),
  subdomain: yup.string()
    .required('Subdomain is required')
    .matches(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens')
    .min(3, 'Subdomain must be at least 3 characters'),
  address: yup.string().required('Address is required'),
});

interface AddBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: string;
  branchToEdit?: any;
}

const AddBranchModal: React.FC<AddBranchModalProps> = ({ isOpen, onClose, parentId, branchToEdit }) => {
  const { user } = useSelector(selectAuth);
  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();
  
  const isEditMode = !!branchToEdit;
  const isLoading = isCreating || isUpdating;
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      subdomain: '',
      address: '',
    },
  });

  // Update form values when editing
  useEffect(() => {
    if (branchToEdit) {
      reset({
        name: branchToEdit.name || '',
        subdomain: branchToEdit.subdomain || '',
        address: branchToEdit.address || '',
      });
    } else {
      reset({
        name: '',
        subdomain: '',
        address: '',
      });
    }
  }, [branchToEdit, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (isEditMode && branchToEdit) {
        console.log('Updating branch with data:', {
          id: branchToEdit.id,
          data: {
            name: data.name,
            subdomain: data.subdomain,
            address: data.address,
          }
        });
        await updateBranch({
          id: branchToEdit.id,
          data: {
            name: data.name,
            subdomain: data.subdomain,
            address: data.address,
          },
        }).unwrap();
      } else {
        console.log('Creating branch with data:', {
          ...data,
          ownerId: user?.id || '',
          parentId: parentId,
        });
        await createBranch({
          ...data,
          ownerId: user?.id || '',
          parentId: parentId,
        }).unwrap();
      }
      
      reset();
      onClose();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} branch:`, error);
      console.error('Error details:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-card p-6 rounded-lg w-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {isEditMode ? 'Edit Branch' : 'Add New Branch'}
          </h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-muted-foreground transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Branch Name"
                placeholder="Enter branch name"
                error={errors.name?.message}
                width="100%"
              />
            )}
          />

          <Controller
            name="subdomain"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Subdomain"
                placeholder="e.g., green-fork-wuse"
                error={errors.subdomain?.message}
                width="100%"
              />
            )}
          />

          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Address"
                placeholder="Enter branch address"
                error={errors.address?.message}
                width="100%"
              />
            )}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <StyledButton
              type="button"
              onClick={handleClose}
              background="#f3f4f6"
              color="#374151"
              width="100px"
              variant="outline"
            >
              Cancel
            </StyledButton>
            <StyledButton
              type="submit"
              background="hsl(var(--active))"
              color="hsl(var(--secondary))"
              width="100px"
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Branch' : 'Create Branch')}
            </StyledButton>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddBranchModal;
