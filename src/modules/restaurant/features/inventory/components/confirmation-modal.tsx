import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/theme/theme';

// Styled components for the modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: left;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 16px;
`;

const ModalText = styled.p`
  font-size: 14px;
  color: #4a5568;
  margin-bottom: 16px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 24px;
  color: #2d3748;

  &:focus {
    outline: none;
    border-color: ${theme.colors.active};
    box-shadow: 0 0 0 3px rgba(5, 67, 30, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: ${(props) =>
        props.variant === 'primary' ? theme.colors.active : '#e2e8f0'};
  color: ${(props) => (props.variant === 'primary' ? '#ffffff' : '#2d3748')};

  &:hover {
    background: ${(props) =>
        props.variant === 'primary' ? '#033619' : '#cbd5e0'};
  }

  &:disabled {
    background: #e2e8f0;
    color: #a0aec0;
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (max-width: 640px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (deleteReason?: string) => void;
    isLoading: boolean;
    orderId: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    orderId,
}) => {
    const [deleteReason, setDeleteReason] = useState('');

    const handleClose = () => {
        setDeleteReason('');
        onClose();
    };

    const handleConfirm = () => {
        onConfirm(deleteReason.trim() || undefined);
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay role="dialog" aria-labelledby="modal-title" aria-modal="true" onClick={handleClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalTitle id="modal-title">Confirm Delete</ModalTitle>
                <ModalText>Are you sure you want to delete order #{orderId.substring(0, 6)}?</ModalText>
                <div>
                    <label htmlFor="deleteReason" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#2d3748', marginBottom: '8px' }}>
                        Reason for deletion (optional)
                    </label>
                    <TextArea
                        id="deleteReason"
                        placeholder="Enter reason for deleting this order..."
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <ModalButtons>
                    <Button onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </ModalButtons>
            </ModalContent>
        </ModalOverlay>
    );
};

export default ConfirmationModal;