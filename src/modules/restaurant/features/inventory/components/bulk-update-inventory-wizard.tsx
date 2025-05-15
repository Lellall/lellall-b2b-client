import React, { useState, useEffect, useMemo, memo } from 'react';
import styled, { keyframes } from 'styled-components';
import { StyledButton } from '@/components/button/button-lellall';
import { theme } from '@/theme/theme';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContent = styled.div`
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  padding: 32px;
  border-radius: 16px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  position: relative;
  animation: ${fadeIn} 0.3s ease-out;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: #111827;
  }
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-bottom: 32px;
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 8px;
    overflow: hidden;
    th, td {
      border-bottom: 1px solid #e5e7eb;
      padding: 14px;
      text-align: left;
      font-size: 14px;
    }
    th {
      background: #f1f5f9;
      font-weight: 600;
      color: #1f2937;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.05em;
    }
    td {
      color: #111827;
      background: white;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:hover td {
      background: #f8fafc;
    }
    input, select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      background: white;
      transition: all 0.2s;
      &:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems?: Record<string, any>[];
  onSubmit: (updates: {
    inventoryId: string;
    unitPrice?: number;
    totalBaseQuantity?: number;
    unitOfMeasurement?: string;
  }[]) => void;
}

const BulkUpdateModal: React.FC<BulkUpdateModalProps> = ({ isOpen, onClose, selectedItems = [], onSubmit }) => {
  const [updates, setUpdates] = useState<
    { inventoryId: string; unitPrice?: number; totalBaseQuantity?: number; unitOfMeasurement?: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize updates only when selectedItems change
  useEffect(() => {
    console.log("useEffect triggered with selectedItems:", selectedItems);
    if (selectedItems.length === 0) {
      setUpdates([]);
      console.log("Cleared updates due to empty selectedItems");
      return;
    }
    const newUpdates = selectedItems.map((item, index) => {
      const inventoryId = item.id || `temp-id-${index}`;
      if (!item.id) {
        console.warn(`Item at index ${index} missing id, using fallback: ${inventoryId}`);
      }
      return {
        inventoryId,
        unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 0,
        totalBaseQuantity: typeof item.totalBaseQuantity === 'number' ? item.totalBaseQuantity : 0,
        unitOfMeasurement: item.unitOfMeasurement || 'unit',
      };
    });
    if (
      updates.length !== newUpdates.length ||
      !updates.every((update, i) =>
        update.inventoryId === newUpdates[i].inventoryId &&
        update.unitPrice === newUpdates[i].unitPrice &&
        update.totalBaseQuantity === newUpdates[i].totalBaseQuantity &&
        update.unitOfMeasurement === newUpdates[i].unitOfMeasurement
      )
    ) {
      setUpdates(newUpdates);
      console.log("Initialized updates:", newUpdates);
    }
  }, [selectedItems]);

  // Debounce input changes to prevent rapid state updates
  const handleChange = useMemo(
    () =>
      debounce(
        (
          inventoryId: string,
          field: 'unitPrice' | 'totalBaseQuantity' | 'unitOfMeasurement',
          value: string
        ) => {
          console.log(`handleChange triggered: inventoryId=${inventoryId}, field=${field}, value=${value}`);
          setUpdates((prev) => {
            const newUpdates = prev.map((update) =>
              update.inventoryId === inventoryId
                ? {
                    ...update,
                    [field]: field === 'unitOfMeasurement'
                      ? value
                      : value === ''
                      ? undefined
                      : parseFloat(value),
                  }
                : update
            );
            console.log("Updated state:", newUpdates);
            return newUpdates;
          });
        },
        300
      ),
    []
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log("Submitting updates:", updates);

    if (updates.length === 0) {
      toast.error('No items selected to update');
      setIsSubmitting(false);
      return;
    }

    const hasChanges = updates.some((update) => {
      const original = selectedItems.find(item => item.id === update.inventoryId);
      return (
        (update.unitPrice ?? 0) !== (original?.unitPrice ?? 0) ||
        (update.totalBaseQuantity ?? 0) !== (original?.totalBaseQuantity ?? 0) ||
        update.unitOfMeasurement !== (original?.unitOfMeasurement || 'unit')
      );
    });

    const hasInvalidValues = updates.some(update =>
      (update.unitPrice !== undefined && (isNaN(update.unitPrice) || update.unitPrice < 0)) ||
      (update.totalBaseQuantity !== undefined && (isNaN(update.totalBaseQuantity) || update.totalBaseQuantity < 0)) ||
      !update.unitOfMeasurement || update.unitOfMeasurement.trim() === ''
    );

    if (!hasChanges) {
      toast.error('Please edit at least one field to update');
      setIsSubmitting(false);
      return;
    }

    if (hasInvalidValues) {
      toast.error('Please ensure all fields contain valid positive numbers and a unit is entered');
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(updates);
      toast.success('Items updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update items. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { key: 'productName', label: 'Product Name', render: (value: any) => value || 'N/A' },
    {
      key: 'unitPrice',
      label: 'Unit Price',
      render: (_: any, row: any) => {
        const update = updates.find(update => update.inventoryId === row.id) || {};
        return (
          <input
            type="number"
            value={update.unitPrice ?? ''}
            onChange={(e) => handleChange(row.id, 'unitPrice', e.target.value)}
            min="0"
            step="0.01"
            placeholder="Enter price"
            aria-label="Unit Price"
          />
        );
      },
    },
    {
      key: 'totalBaseQuantity',
      label: 'Quantity',
      render: (_: any, row: any) => {
        const update = updates.find(update => update.inventoryId === row.id) || {};
        return (
          <input
            type="number"
            value={update.totalBaseQuantity ?? ''}
            onChange={(e) => handleChange(row.id, 'totalBaseQuantity', e.target.value)}
            min="0"
            step="1"
            placeholder="Enter quantity"
            aria-label="Total Base Quantity"
          />
        );
      },
    },
    {
      key: 'unitOfMeasurement',
      label: 'Unit',
      render: (_: any, row: any) => {
        const update = updates.find(update => update.inventoryId === row.id) || {};
        return (
          <input
            type="text"
            value={update.unitOfMeasurement || ''}
            onChange={(e) => handleChange(row.id, 'unitOfMeasurement', e.target.value)}
            placeholder="Enter unit"
            aria-label="Unit of Measurement"
          />
        );
      },
    },
    {
      key: 'category',
      label: 'Category',
      render: (value: any) => value || 'N/A',
    },
  ];

  // Memoize table rows to prevent unnecessary re-renders
  const memoizedRows = useMemo(() => {
    return selectedItems.map((item, index) => (
      <tr key={item.id || `row-${index}`}>
        {columns.map((col) => (
          <td key={col.key}>
            {col.render ? col.render(item[col.key], item) : item[col.key] || 'N/A'}
          </td>
        ))}
      </tr>
    ));
  }, [selectedItems, updates]);

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose} aria-label="Close modal">
          ×
        </CloseButton>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Bulk Update {selectedItems.length} Items</h2>
        {selectedItems.length > 0 ? (
          <TableContainer>
            <table>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{memoizedRows}</tbody>
            </table>
          </TableContainer>
        ) : (
          <p className="text-base text-gray-500 mb-8">No items selected. Please select items to update.</p>
        )}
        <ButtonContainer>
          <StyledButton
            onClick={onClose}
            background="#fff"
            color="#1f2937"
            variant="outline"
            className="text-sm px-8 py-2.5 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </StyledButton>
          <StyledButton
            onClick={handleSubmit}
            background={theme.colors.active}
            color={theme.colors.secondary}
            className="text-sm px-8 py-2.5 hover:brightness-110 transition-all"
            disabled={selectedItems.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update'}
          </StyledButton>
        </ButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default memo(BulkUpdateModal);