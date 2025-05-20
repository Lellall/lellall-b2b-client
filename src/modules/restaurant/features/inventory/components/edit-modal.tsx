// src/components/EditOrderItemsModal.tsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { theme } from '@/theme/theme';

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
    onConfirm: (items: { orderItemId: string; quantity?: number; menuItemId?: string }[]) => Promise<void>;
    isLoading: boolean;
    order: Order;
}

const EditOrderItemsModal: React.FC<EditOrderItemsModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    order,
}) => {
    const [items, setItems] = useState(
        order.orderItems.map((item) => ({
            orderItemId: item.id,
            quantity: item.quantity,
            menuItemId: item.menuItemId,
        })),
    );

    const handleQuantityChange = (orderItemId: string, value: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.orderItemId === orderItemId
                    ? { ...item, quantity: value === '' ? undefined : Number(value) }
                    : item,
            ),
        );
    };

    // Optional: Add menuItemId change if you have a menu items list
    // const handleMenuItemChange = (orderItemId: string, menuItemId: string) => {
    //   setItems((prev) =>
    //     prev.map((item) =>
    //       item.orderItemId === orderItemId ? { ...item, menuItemId } : item,
    //     ),
    //   );
    // };

    const handleSubmit = async () => {
        try {
            await onConfirm(items);
            onClose();
        } catch (err) {
            console.error('Failed to update order items:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-lg font-semibold mb-4">Edit Order Items</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {order.orderItems.map((orderItem) => {
                        const item = items.find((i) => i.orderItemId === orderItem.id);
                        return (
                            <div key={orderItem.id} className="border-b pb-4">
                                <p className="text-sm font-medium">{orderItem.menuItem.name}</p>
                                <div className="mt-2">
                                    <label className="text-xs text-gray-600">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item?.quantity ?? ''}
                                        onChange={(e) => handleQuantityChange(orderItem.id, e.target.value)}
                                        className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
                                        disabled={isLoading}
                                    />
                                </div>
                                {/* <div className="mt-2">
                  <label className="text-xs text-gray-600">Menu Item</label>
                  <select
                    value={item?.menuItemId}
                    onChange={(e) => handleMenuItemChange(orderItem.id, e.target.value)}
                    className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
                    disabled={isLoading}
                  >
                    <option value={orderItem.menuItemId}>{orderItem.menuItem.name}</option>
                                { </select>
                </div> */}
                            </div>
                        );
                    })}
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