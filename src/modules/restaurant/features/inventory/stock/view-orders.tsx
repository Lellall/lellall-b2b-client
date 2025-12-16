import React, { useState, useRef } from 'react';
import { StyledButton } from '@/components/button/button-lellall';
import { Add, Filter, Receipt } from 'iconsax-react';
import SearchBar from '@/components/search-bar/search-bar';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetOrdersQuery, useUpdateOrdersMutation, useDeleteOrderMutation } from '@/redux/api/order/order.api';
import { useGetBankDetailsQuery } from '@/redux/api/bank-details/bank-details.api';
import { ColorRing } from 'react-loader-spinner';
import Card from '../components/card';
import CombinedReceipt, { CombinedReceiptHandle } from '../components/combined-receipt';
import { theme } from '@/theme/theme';
import ReactPaginate from 'react-paginate';
import { toast } from 'react-toastify';

const KitchenView = () => {
  const { subdomain } = useSelector(selectAuth);
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const combinedReceiptRef = useRef<CombinedReceiptHandle | null>(null);

  const { data, error, isLoading, isFetching } = useGetOrdersQuery(
    {
      subdomain,
      page: currentPage + 1,
      limit: 10,
      status: statusFilter || undefined,
    },
    { skip: !subdomain },
  );
  const [updateOrderStatus] = useUpdateOrdersMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const orders = data?.orders || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };
  
  // Get restaurantId from first order (assuming all orders are from same restaurant)
  const restaurantId = orders.length > 0 ? orders[0].restaurantId : '';
  const { data: bankDetailsData } = useGetBankDetailsQuery(restaurantId, { skip: !restaurantId });
  const bankDetails = bankDetailsData?.bankDetails || null;

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus({ subdomain, orderId, data: { status: newStatus } }).unwrap();
      console.log(`Order ${orderId} updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleDeleteOrder = async (orderId: string, deleteReason?: string) => {
    try {
      await deleteOrder({ subdomain, orderId, deleteReason }).unwrap();
      console.log(`Order ${orderId} deleted successfully`);
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handlePageChange = ({ selected }: { selected: number }) => {
    if (selected >= 0 && selected < meta.totalPages) {
      setCurrentPage(selected);
      console.log('Page changed to:', selected);
    } else {
      console.warn('Invalid page selection:', selected, 'Total pages:', meta.totalPages);
    }
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    setCurrentPage(0);
    setSelectedOrders(new Set()); // Clear selection when filter changes
    console.log('Status filter changed to:', newStatus);
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((order) => order.id)));
    }
  };

  const handlePrintSelectedReceipts = () => {
    if (selectedOrders.size === 0) {
      toast.warning('Please select at least one order to print', { position: 'top-right' });
      return;
    }

    // Trigger print directly
    if (combinedReceiptRef.current) {
      combinedReceiptRef.current.print();
    }
  };

  const renderLoading = () => (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <ColorRing
        height="80"
        width="80"
        radius="9"
        color={theme.colors.active}
        ariaLabel="three-dots-loading"
        visible={true}
      />
    </div>
  );

  const renderError = () => (
    <div className="text-red-500 text-center">
      Error loading orders: {JSON.stringify(error)}
      <button
        className="ml-4 text-blue-500 underline"
        onClick={() => setCurrentPage(0)}
      >
        Return to First Page
      </button>
    </div>
  );

  const renderEmpty = () => <div className="text-center text-gray-500">No orders found</div>;

  const renderContent = () => (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <SearchBar
            placeholder="Find your favorite items..."
            borderRadius="12px"
            iconColor="#000"
            iconSize={15}
            shadow={false}
          />
          <div className="flex items-center gap-2">
            <Filter size={20} color={theme.colors.active} />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="SERVED">Served</option>
              <option value="RESERVED">Reserved</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
        {orders.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="text-sm text-[#05431E] hover:underline focus:outline-none px-2 py-1"
            >
              {selectedOrders.size === orders.length ? 'Deselect All' : 'Select All'}
            </button>
            {selectedOrders.size > 0 && (
              <button
                onClick={handlePrintSelectedReceipts}
                className="flex items-center gap-2 bg-[#05431E] hover:bg-[#04391A] text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E] transition-colors"
              >
                <Receipt size={18} />
                Print Combined Receipt ({selectedOrders.size})
              </button>
            )}
          </div>
        )}
      </div>
      {orders.length === 0 ? (
        renderEmpty()
      ) : viewMode === 'cards' ? (
        <>
          {/* Hidden combined receipt for printing */}
          {selectedOrders.size > 0 && (
            <div className="hidden">
              <CombinedReceipt
                ref={combinedReceiptRef}
                orders={orders.filter((order) => selectedOrders.has(order.id))}
                bankDetails={bankDetails}
                subdomain={subdomain}
              />
            </div>
          )}
          <Card
            orders={orders}
            expandedOrders={expandedOrders}
            toggleExpand={toggleExpand}
            handleStatusUpdate={handleStatusUpdate}
            handleDeleteOrder={handleDeleteOrder}
            subdomain={subdomain}
            selectedOrders={selectedOrders}
            toggleOrderSelection={toggleOrderSelection}
          />
        </>
      ) : (
        renderTableView() // Ensure renderTableView is defined
      )}
      {meta.totalPages > 1 && (
        <ReactPaginate
          previousLabel="Previous"
          nextLabel="Next"
          breakLabel="..."
          pageCount={meta.totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageChange}
          containerClassName="pagination"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="previous"
          nextClassName="next"
          breakClassName="break"
          activeClassName="active"
          disabledClassName="disabled"
          forcePage={currentPage}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <style>{paginationStyles}</style>
      {isLoading || isFetching ? renderLoading() : error ? renderError() : renderContent()}
    </div>
  );
};

const paginationStyles = `
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 24px;
    padding: 12px;
    list-style: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    flex-wrap: wrap;
  }
  .pagination li {
    display: inline-flex;
    align-items: center;
  }
  .pagination li a {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0 12px;
    border-radius: 8px;
    cursor: pointer;
    color: #2d3748;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    text-decoration: none;
  }
  .pagination li a:hover:not(.disabled) {
    background: #f7fafc;
    border-color: ${theme.colors.active};
    color: ${theme.colors.active};
    transform: translateY(-1px);
  }
  .pagination li.active a {
    background: ${theme.colors.active};
    color: #ffffff;
    border-color: ${theme.colors.active};
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .pagination li.disabled a {
    color: #a0aec0;
    cursor: not-allowed;
    background: #f7fafc;
    border-color: #e2e8f0;
    opacity: 0.6;
  }
  .pagination li.break a {
    border: none;
    background: transparent;
    cursor: default;
    font-size: 14px;
    color: #2d3748;
  }
  .pagination li.previous a, .pagination li.next a {
    font-weight: 600;
    padding: 0 16px;
    gap: 8px;
  }
  .pagination li.previous a::before, .pagination li.next a::after {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border: 2px solid currentColor;
    border-top: none;
    border-right: none;
    transition: transform 0.2s ease;
  }
  .pagination li.previous a::before {
    transform: rotate(45deg);
    margin-right: 4px;
  }
  .pagination li.next a::after {
    transform: rotate(-135deg);
    margin-left: 4px;
  }
  .pagination li.previous a:hover::before, .pagination li.next a:hover::after {
    transform: translateX(2px) rotate(-135deg);
  }
  .pagination li.previous a:hover::before {
    transform: translateX(-2px) rotate(45deg);
  }
  @media (max-width: 640px) {
    .pagination {
      gap: 6px;
      padding: 8px;
    }
    .pagination li a {
      min-width: 32px;
      height: 32px;
      font-size: 12px;
      padding: 0 8px;
    }
    .pagination li.previous a, .pagination li.next a {
      padding: 0 12px;
    }
  }
`;

export default KitchenView;