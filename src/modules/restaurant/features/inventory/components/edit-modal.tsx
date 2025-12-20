import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { theme } from '@/theme/theme';
import Select from "react-select";
import { useGetAllMenuItemsQuery } from '@/redux/api/menu/menu.api';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';

interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  menuItem: {
    id: string;
    name: string;
    price: number;
    status: string;
  };
}

interface Order {
  id: string;
  status: string;
  orderItems: OrderItem[];
}

interface EditOrderItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (items: { orderItemId?: string; menuItemId: string; quantity: number }[]) => Promise<void>;
  isLoading: boolean;
  order: Order;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  status: string;
}

const EditOrderItemsModal: React.FC<EditOrderItemsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  order,
}) => {
  const { subdomain, user } = useSelector(selectAuth);
  const { data: menuItems = [], isLoading: isMenuLoading, error: menuError } = useGetAllMenuItemsQuery({ subdomain });
  
  // Check if user is a MANAGER (managers can only add items, not remove existing ones)
  const isManager = user?.role === 'MANAGER';

  // Initialize state with existing order items
  const [items, setItems] = useState<
    { orderItemId?: string; menuItemId: string; quantity: number }[]
  >(
    order.orderItems.map((item) => ({
      orderItemId: item.id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
    })),
  );

  // State for adding new item
  const [newItem, setNewItem] = useState<{ menuItemId: string; quantity: number }>({
    menuItemId: '',
    quantity: 1,
  });

  // Debug items state changes
  useEffect(() => {
    console.log('Current items state:', items);
  }, [items]);

  // Handle quantity change for existing or new items
  // Managers cannot reduce quantity of existing items (can only increase or keep same)
  const handleQuantityChange = (index: number, value: string) => {
    const currentItem = items[index];
    const originalItem = order.orderItems.find((oi) => oi.id === currentItem.orderItemId);
    const originalQuantity = originalItem?.quantity || 1;
    
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const newQuantity = value === '' ? 1 : Math.max(1, Number(value));
          // If user is a MANAGER and this is an existing item, don't allow reducing below original quantity
          if (isManager && item.orderItemId && newQuantity < originalQuantity) {
            toast.warning(`Cannot reduce quantity. Managers can only add items or increase quantities.`, { position: 'top-right' });
            return { ...item, quantity: originalQuantity };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
    );
  };

  // Handle menu item change for new item
  const handleNewMenuItemChange = (menuItemId: string) => {
    setNewItem((prev) => ({ ...prev, menuItemId }));
  };

  // Handle quantity change for new item
  const handleNewQuantityChange = (value: string) => {
    setNewItem((prev) => ({
      ...prev,
      quantity: value === '' ? 1 : Math.max(1, Number(value)),
    }));
  };

  // Add new item to the list
  const handleAddNewItem = () => {
    if (!newItem.menuItemId) {
      toast.error('Please select a menu item', { position: 'top-right' });
      return;
    }
    if (newItem.quantity < 1) {
      toast.error('Quantity must be at least 1', { position: 'top-right' });
      return;
    }
    // Check for duplicate menuItemId
    if (items.some((item) => item.menuItemId === newItem.menuItemId)) {
      toast.error('This item is already in the order. Update its quantity instead.', { position: 'top-right' });
      return;
    }
    const newItemEntry = {
      menuItemId: newItem.menuItemId,
      quantity: newItem.quantity,
    };
    setItems((prev) => {
      const updatedItems = [...prev, newItemEntry];
      console.log('Added new item:', newItemEntry, 'Updated items:', updatedItems);
      return updatedItems;
    });
    // Reset new item form
    setNewItem({ menuItemId: '', quantity: 1 });
  };

  // Remove an item (existing or newly added)
  // Managers can only remove newly added items (without orderItemId), not existing ones
  const handleRemoveItem = (index: number) => {
    const itemToRemove = items[index];
    
    // If user is a MANAGER and trying to remove an existing item (has orderItemId), prevent it
    if (isManager && itemToRemove.orderItemId) {
      toast.warning('Managers can only add items. Cannot remove existing items from the order.', { position: 'top-right' });
      return;
    }
    
    setItems((prev) => {
      const updatedItems = prev.filter((_, i) => i !== index);
      console.log('Removed item at index:', index, 'Updated items:', updatedItems);
      return updatedItems;
    });
  };

  // Submit changes
  const handleSubmit = async () => {
    try {
      // Prepare payload for API
      const payload = items.map((item) => ({
        orderItemId: item.orderItemId,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      }));
      console.log('Submitting payload:', { items: payload });
      await onConfirm(payload);
      toast.success('Order items updated successfully', { position: 'top-right' });
      onClose();
    } catch (err) {
      console.error('Failed to update order items:', err);
      toast.error('Failed to update order items', { position: 'top-right' });
    }
  };

  if (!isOpen) return null;

  // Handle menu items loading and error states
  if (isMenuLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <p className="text-sm text-gray-600">Loading menu items...</p>
        </div>
      </div>
    );
  }

  if (menuError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <p className="text-sm text-red-600">Error loading menu items</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Filter available menu items (status: AVAILABLE)
  const availableMenuItems = menuItems.filter((item: MenuItem) => item.status === 'AVAILABLE');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold mb-4">Edit Order Items</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {items.map((item, index) => {
            const menuItem = menuItems.find((mi: MenuItem) => mi.id === item.menuItemId);
            // Managers cannot remove existing items (items with orderItemId)
            const canRemove = !isManager || !item.orderItemId;
            // Get original quantity for existing items (for managers)
            const originalItem = item.orderItemId ? order.orderItems.find((oi) => oi.id === item.orderItemId) : null;
            const minQuantity = isManager && item.orderItemId ? (originalItem?.quantity || 1) : 1;
            
            return (
              <div key={item.orderItemId || `new-${index}`} className="border-b pb-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">{menuItem?.name || 'Unknown Item'}</p>
                  {canRemove && (
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-600"
                      aria-label={`Remove ${menuItem?.name || 'item'}`}
                      disabled={isLoading}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                  {!canRemove && (
                    <span className="text-xs text-gray-400 italic">Cannot remove</span>
                  )}
                </div>
                <div className="mt-2">
                  <label className="text-xs text-gray-600">Quantity</label>
                  <input
                    type="number"
                    min={minQuantity}
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
                    disabled={isLoading}
                    title={isManager && item.orderItemId ? "Managers can only increase quantity, not decrease" : ""}
                  />
                  {isManager && item.orderItemId && (
                    <p className="text-xs text-gray-500 mt-1 italic">Can only increase quantity (min: {minQuantity})</p>
                  )}
                </div>
              </div>
            );
          })}
          {/* Add New Item Section */}


          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-2">Add New Item</h3>

            <div className="mb-2">
              <label className="text-xs text-gray-600">Menu Item</label>
              <Select
                value={availableMenuItems.find(item => item.id === newItem.menuItemId) || null}
                onChange={(option) => handleNewMenuItemChange(option?.value || "")}
                options={availableMenuItems.map((menuItem) => ({
                  value: menuItem.id,
                  label: `${menuItem.name} (₦${menuItem.price.toLocaleString()})`
                }))}
                isDisabled={isLoading}
                placeholder="Select an item"
                className="text-sm"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "#ccc",
                    borderRadius: "0.375rem",
                    padding: "2px",
                    boxShadow: "none",
                    "&:hover": { borderColor: "#05431E" }
                  })
                }}
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">Quantity</label>
              <input
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) => handleNewQuantityChange(e.target.value)}
                className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleAddNewItem}
              className="mt-2 w-full bg-[#05431E] text-white rounded-md p-2 text-sm hover:bg-[#04381A] focus:outline-none disabled:bg-gray-400"
              disabled={isLoading || !newItem.menuItemId || newItem.quantity < 1}
            >
              Add Item
            </button>
          </div>

        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !items.every((item) => item.quantity && item.quantity > 0)}
            className={`px-4 py-2 text-sm text-white rounded-md focus:outline-none ${isLoading || !items.every((item) => item.quantity && item.quantity > 0)
                ? 'bg-gray-400'
                : 'bg-[#05431E] hover:bg-[#04381A]'
              }`}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOrderItemsModal;