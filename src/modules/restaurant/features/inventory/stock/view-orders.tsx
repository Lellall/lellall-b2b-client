// src/pages/KitchenView.tsx
import { StyledButton } from '@/components/button/button-lellall';
import { Add, Filter, ArrowSquareDown, ArrowSquareUp } from 'iconsax-react';
import SearchBar from '@/components/search-bar/search-bar';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetOrdersQuery, useUpdateOrdersMutation } from '@/redux/api/order/order.api';
import { ColorRing } from 'react-loader-spinner';
import { useState } from 'react';

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

  const renderTableView = () => (
    <div className="bg-white rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-[#05431E] text-white">
          <tr>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider">Order #</th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider">Date</th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider">Time</th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider">Items</th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider">Subtotal</th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider">Status</th>
            <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-gray-900">{order.id.substring(0, 6)}</td>
              <td className="px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-gray-900">{new Date(order.createdAt).toDateString()}</td>
              <td className="px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-gray-900">{new Date(order.createdAt).toLocaleTimeString()}</td>
              <td className="px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-gray-900">
                <span
                  className="block truncate max-w-[100px] sm:max-w-[200px]"
                  title={order.orderItems.map((item) => `${item.menuItem.name} (x${item.quantity})`).join(', ')}
                >
                  {order.orderItems.map((item) => `${item.menuItem.name} (x${item.quantity})`).join(', ')}
                </span>
              </td>
              <td className="px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-gray-900">
                ₦{order.orderItems.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0).toLocaleString()}
              </td>
              <td className="px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm text-gray-900">{order.status}</td>
              <td className="px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                  className="border rounded-md p-1 text-[10px] sm:text-xs w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-[#05431E]"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PREPARING">In Process</option>
                  <option value="SERVED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ColorRing
          visible={true}
          height="80"
          width="80"
          ariaLabel="color-ring-loading"
          wrapperStyle={{}}
          wrapperClass=""
          colors={['#05431E', '#05431E', '#05431E', '#05431E', '#05431E']}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">
        Error fetching orders: {JSON.stringify(error)}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-full inline-block">
            <Add size={32} className="w-8 h-8 sm:w-12 sm:h-12 opacity-50" color="#05431E" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">No Orders Yet</h2>
            <p className="text-[10px] sm:text-sm text-gray-600 mt-2 max-w-[300px] sm:max-w-md">
              It looks like there are no orders to display right now. When new orders come in, they'll appear here automatically.
            </p>
          </div>
          <StyledButton
            background="#05431E"
            color="#fff"
            width={{ base: '160px', sm: '200px' }}
            style={{ padding: '10px 20px' }}
            variant="solid"
            className="text-xs sm:text-sm"
          >
            Refresh Orders
          </StyledButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <SearchBar
              placeholder="Search Items"
              width="300px"
              height="42px"
              border="1px solid #fff"
              borderRadius="10px"
              backgroundColor="#ffffff"
              shadow={false}
              fontSize="11px"
              color="#444"
              inputPadding="10px"
              placeholderColor="#bbb"
              iconColor="#ccc"
              iconSize={15}
            />
            <StyledButton
              style={{ padding: '8px 12px', fontWeight: 300 }}
              background="#fff"
              color="#000"
              width={{ base: '120px', sm: '120px' }}
              variant="outline"
              className="flex items-center justify-center gap-1 text-xs sm:text-sm"
            >
              <Filter size={16} className="w-4 h-4 sm:w-5 sm:h-5 mr-1" color="#000" /> Filters
            </StyledButton>
          </div>
        </div>

        {/* Orders Display */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg p-3 sm:p-4 flex flex-col hover:bg-gray-50 transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm font-semibold text-gray-800">
                    #{order.id.substring(0, 6)}
                  </span>
                  <span
                    className={`text-[10px] sm:text-xs px-2 py-1 rounded-full ${
                      order.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.status === 'PREPARING'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'SERVED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-600 mb-2">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                <div className="text-xs sm:text-sm text-gray-900">
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="flex items-center text-[#05431E] hover:underline mb-1 focus:outline-none text-[10px] sm:text-sm"
                    aria-label={expandedOrders.includes(order.id) ? 'Hide order items' : 'Show order items'}
                  >
                    {expandedOrders.includes(order.id) ? (
                      <>
                        Hide Items <ArrowSquareUp size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Show Items <ArrowSquareDown size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                      </>
                    )}
                  </button>
                  {expandedOrders.includes(order.id) ? (
                    <ul className="list-disc pl-4 text-[10px] sm:text-sm">
                      {order.orderItems.map((item, index) => (
                        <li key={index} className="truncate" title={item.menuItem.name}>
                          {item.menuItem.name} (x{item.quantity})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p
                      className="truncate text-[10px] sm:text-sm"
                      title={order.orderItems.map((item) => `${item.menuItem.name} (x${item.quantity})`).join(', ')}
                    >
                      {order.orderItems.map((item) => `${item.menuItem.name} (x${item.quantity})`).join(', ')}
                    </p>
                  )}
                </div>
                <div className="mt-3 sm:mt-4">
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">
                    ₦{order.orderItems.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0).toLocaleString()}
                  </p>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    className="mt-2 w-full border rounded-md p-1 text-[10px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#05431E]"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PREPARING">In Process</option>
                    <option value="SERVED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          renderTableView()
        )}
      </div>
    </div>
  );
};

export default KitchenView;