import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
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
  width: 95%;
  max-width: 1200px;
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
    border-spacing: 0 8px;
    border-radius: 8px;
    overflow: hidden;
    th, td {
      border-bottom: 1px solid #e5e7eb;
      padding: 16px 20px;
      text-align: left;
      font-size: 14px;
      min-width: 120px;
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
      max-width: 150px;
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

interface UpdateItem {
  inventoryId: string;
  unitPrice?: number;
  totalBaseQuantity?: number;
  unitOfMeasurement?: string;
  openingStock?: number;
  closingStock?: number;
  quantityUsed?: number;
}

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems?: {
    id: string;
    productName: string;
    unitPrice: number;
    totalBaseQuantity: number;
    unitOfMeasurement: string;
    openingStock: number;
    closingStock: number;
    quantityUsed: number;
    category: string;
  }[];
  onSubmit: (updates: UpdateItem[]) => void;
}

const BulkUpdateModal: React.FC<BulkUpdateModalProps> = ({ isOpen, onClose, selectedItems = [], onSubmit }) => {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize updates
  useEffect(() => {
    if (selectedItems.length === 0) {
      setUpdates([]);
      return;
    }
    const newUpdates = selectedItems.map((item) => ({
      inventoryId: item.id,
      unitPrice: item.unitPrice,
      totalBaseQuantity: item.totalBaseQuantity,
      unitOfMeasurement: item.unitOfMeasurement,
      openingStock: item.openingStock,
      closingStock: item.closingStock,
      quantityUsed: item.quantityUsed,
    }));
    setUpdates(newUpdates);
  }, [selectedItems]);

  // Debounced input change handler
  const handleChange = useCallback(
    debounce(
      (inventoryId: string, field: keyof UpdateItem, value: string) => {
        setUpdates((prev) =>
          prev.map((update) =>
            update.inventoryId === inventoryId
              ? {
                  ...update,
                  [field]:
                    field === 'unitOfMeasurement'
                      ? value
                      : value === ''
                      ? undefined
                      : field === 'quantityUsed' || field === 'openingStock' || field === 'totalBaseQuantity'
                      ? parseInt(value, 10)
                      : parseFloat(value),
                }
              : update
          )
        );
      },
      200
    ),
    []
  );

  // Handle submit with validation
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    if (updates.length === 0) {
      toast.error('No items selected to update');
      setIsSubmitting(false);
      return;
    }

    console.log('Updates:', updates); // Debug log to inspect updates array

    const hasChanges = updates.some((update) => {
      const original = selectedItems.find((item) => item.id === update.inventoryId);
      console.log('Update vs Original:', { update, original }); // Debug log to compare
      return (
        (update.unitPrice ?? 0) !== (original?.unitPrice ?? 0) ||
        (update.totalBaseQuantity ?? 0) !== (original?.totalBaseQuantity ?? 0) ||
        ((update.unitOfMeasurement ?? original?.unitOfMeasurement) || 'unit') !==
          ((original?.unitOfMeasurement) || 'unit') ||
        (update.openingStock ?? 0) !== (original?.openingStock ?? 0) ||
        (update.closingStock ?? 0) !== (original?.closingStock ?? 0) ||
        (update.quantityUsed ?? 0) !== (original?.quantityUsed ?? 0)
      );
    });

    const hasInvalidValues = updates.some(
      (update) =>
        (update.unitPrice !== undefined && (isNaN(update.unitPrice) || update.unitPrice < 0)) ||
        (update.totalBaseQuantity !== undefined && (isNaN(update.totalBaseQuantity) || update.totalBaseQuantity < 0)) ||
        (update.openingStock !== undefined && (isNaN(update.openingStock) || update.openingStock < 0)) ||
        (update.closingStock !== undefined && (isNaN(update.closingStock) || update.closingStock < 0)) ||
        (update.quantityUsed !== undefined && (isNaN(update.quantityUsed) || update.quantityUsed < 0)) ||
        !update.unitOfMeasurement ||
        update.unitOfMeasurement.trim() === ''
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
  }, [updates, selectedItems, onSubmit, onClose]);

  // Table columns
  const columns = useMemo(
    () => [
      { key: 'productName', label: 'Product Name', render: (value: any) => value || 'N/A' },
      {
        key: 'unitPrice',
        label: 'Unit Price',
        render: (_: any, row: any) => {
          const update = updates.find((u) => u.inventoryId === row.id) || {};
          return (
            <input
              type="number"
              value={update.unitPrice !== undefined ? update.unitPrice : ''}
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
          const update = updates.find((u) => u.inventoryId === row.id) || {};
          return (
            <input
              type="number"
              value={update.totalBaseQuantity !== undefined ? update.totalBaseQuantity : ''}
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
          const update = updates.find((u) => u.inventoryId === row.id) || {};
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
        key: 'openingStock',
        label: 'Opening Stock',
        render: (_: any, row: any) => {
          const update = updates.find((u) => u.inventoryId === row.id) || {};
          return (
            <input
              type="number"
              value={update.openingStock !== undefined ? update.openingStock : ''}
              onChange={(e) => handleChange(row.id, 'openingStock', e.target.value)}
              min="0"
              step="1"
              placeholder="Enter opening stock"
              aria-label="Opening Stock"
            />
          );
        },
      },
      {
        key: 'closingStock',
        label: 'Closing Stock',
        render: (_: any, row: any) => {
          const update = updates.find((u) => u.inventoryId === row.id) || {};
          return (
            <input
              type="number"
              value={update.closingStock !== undefined ? update.closingStock : ''}
              onChange={(e) => handleChange(row.id, 'closingStock', e.target.value)}
              min="0"
              step="0.01"
              placeholder="Enter closing stock"
              aria-label="Closing Stock"
            />
          );
        },
      },
      {
        key: 'quantityUsed',
        label: 'Quantity Used',
        render: (_: any, row: any) => {
          const update = updates.find((u) => u.inventoryId === row.id) || {};
          return (
            <input
              type="number"
              value={update.quantityUsed !== undefined ? update.quantityUsed : ''}
              onChange={(e) => handleChange(row.id, 'quantityUsed', e.target.value)}
              min="0"
              step="1"
              placeholder="Enter quantity used"
              aria-label="Quantity Used"
            />
          );
        },
      },
      {
        key: 'category',
        label: 'Category',
        render: (value: any) => value || 'N/A',
      },
    ],
    [handleChange, updates]
  );

  // Memoized table rows
  const memoizedRows = useMemo(
    () =>
      selectedItems.map((item) => (
        <tr key={item.id}>
          {columns.map((col) => (
            <td key={col.key}>
              {col.render ? col.render(item[col.key], item) : item[col.key] || 'N/A'}
            </td>
          ))}
        </tr>
      )),
    [selectedItems, columns]
  );

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