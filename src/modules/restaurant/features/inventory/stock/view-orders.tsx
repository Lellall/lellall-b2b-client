import React, { useState } from 'react';
import { StyledButton } from '@/components/button/button-lellall';
import { Add, Filter } from 'iconsax-react';
import SearchBar from '@/components/search-bar/search-bar';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetOrdersQuery, useUpdateOrdersMutation } from '@/redux/api/order/order.api';
import { ColorRing } from 'react-loader-spinner';
import Card from '../components/card'; // Import the Card component

const KitchenView = () => {
  const { subdomain } = useSelector(selectAuth);
  const { data: orders = [], error, isLoading } = useGetOrdersQuery(subdomain);
  const [updateOrderStatus] = useUpdateOrdersMutation();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus({ subdomain, orderId, data: { status: newStatus } }).unwrap();
      console.log(`Order ${orderId} updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  // ... (rest of the code, including renderTableView, loading, error, and empty states)

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <SearchBar
              placeholder="Find your favorite items..."
              borderRadius="12px"
              iconColor="#000"
              iconSize={15}
              shadow={false}
            />
          </div>
        </div>
        {/* Orders Display */}
        {viewMode === 'cards' ? (
          <Card
            orders={orders}
            expandedOrders={expandedOrders}
            toggleExpand={toggleExpand}
            handleStatusUpdate={handleStatusUpdate}
          />
        ) : (
          renderTableView()
        )}
      </div>
    </div>
  );
};

export default KitchenView;