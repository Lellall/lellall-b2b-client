import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetDeletedOrdersQuery, useRestoreOrderMutation } from '@/redux/api/order/order.api';
import ReactPaginate from 'react-paginate';
import { Trash2, User, Clock, Calendar, RotateCcw, AlertCircle } from 'lucide-react';

interface DeletedOrder {
  id: string;
  restaurantId: string;
  status: string;
  paymentType: string;
  discountPercentage?: number;
  discountAmount?: number;
  createdAt: string;
  deletedAt: string;
  deleteReason?: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    menuItem: {
      id: string;
      name: string;
      price: number;
    };
  }>;
  deletedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  waiter?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const DeletedOrders = () => {
  const { subdomain } = useSelector(selectAuth);
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [restoringOrderId, setRestoringOrderId] = useState<string | null>(null);

  const { data, error, isLoading, isFetching } = useGetDeletedOrdersQuery(
    {
      subdomain: subdomain || '',
      page: currentPage + 1,
      limit: 10,
    },
    { skip: !subdomain },
  );

  const [restoreOrder] = useRestoreOrderMutation();

  const deletedOrders = data?.deletedOrders || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handlePageChange = ({ selected }: { selected: number }) => {
    if (selected >= 0 && selected < pagination.totalPages) {
      setCurrentPage(selected);
    }
  };

  const handleRestore = async (orderId: string) => {
    if (!subdomain) return;
    setRestoringOrderId(orderId);
    try {
      await restoreOrder({ subdomain, orderId }).unwrap();
      setRestoringOrderId(null);
    } catch (err) {
      console.error('Failed to restore order:', err);
      setRestoringOrderId(null);
    }
  };

  const calculateTotal = (order: DeletedOrder) => {
    const subtotal = order.orderItems.reduce(
      (sum, item) => sum + (item.menuItem.price || 0) * (item.quantity || 0),
      0
    );
    const discount = order.discountAmount || 0;
    return subtotal - discount;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 animate-pulse"
        >
          <div className="h-6 bg-gray-200 rounded-lg mb-4 w-24"></div>
          <div className="h-4 bg-gray-200 rounded mb-3 w-32"></div>
          <div className="h-4 bg-gray-200 rounded mb-6 w-20"></div>
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-lg"></div>
        </div>
      ))}
    </div>
  );

  if (isLoading || isFetching) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-800 to-black bg-clip-text text-transparent mb-2">
              Deleted Orders
            </h1>
            <p className="text-gray-600">View soft-deleted orders in the recycle bin</p>
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-red-500 text-lg mb-2">Error loading deleted orders</div>
          <div className="text-gray-600">Please try again later</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .order-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .order-card:hover {
          transform: translateY(-4px);
        }
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 32px;
          padding: 16px;
          list-style: none;
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
          min-width: 40px;
          height: 40px;
          padding: 0 12px;
          border-radius: 12px;
          cursor: pointer;
          color: #6b7280;
          background: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .pagination li a:hover:not(.disabled) {
          background: rgba(6, 95, 70, 0.1);
          color: #065f46;
          transform: translateY(-2px);
        }
        .pagination li.active a {
          background: linear-gradient(135deg, #065f46 0%, #000000 100%);
          color: #ffffff;
          font-weight: 600;
        }
        .pagination li.previous a, .pagination li.next a {
          font-weight: 600;
          padding: 0 16px;
          background: linear-gradient(135deg, #065f46 0%, #000000 100%);
          color: #ffffff;
        }
        .pagination li.previous a:hover:not(.disabled), .pagination li.next a:hover:not(.disabled) {
          background: linear-gradient(135deg, #047857 0%, #111827 100%);
          transform: translateY(-2px);
        }
        .pagination li.disabled a {
          color: #d1d5db;
          cursor: not-allowed;
          opacity: 0.5;
        }
        .pagination li.break a {
          background: transparent;
          cursor: default;
          color: #6b7280;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-800 to-black">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-800 to-black bg-clip-text text-transparent">
                Deleted Orders
              </h1>
              <p className="text-gray-600 mt-1">Recycle Bin - {pagination.total} deleted order{pagination.total !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {deletedOrders.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-800 to-black inline-block mb-4">
              <Trash2 className="w-12 h-12 text-white mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No deleted orders</h3>
            <p className="text-gray-600">The recycle bin is empty</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deletedOrders.map((order, index) => (
                <div
                  key={order.id}
                  className="order-card bg-white rounded-2xl p-6 animate-slide-up"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 250, 251, 0.9) 100%)',
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-1">Order ID</div>
                      <div className="text-lg font-bold text-gray-900">#{order.id.substring(0, 8)}</div>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-800 to-black text-white text-xs font-semibold">
                      {order.status}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-800 to-black">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <span>Created: {formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-800 to-black">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <span>Deleted: {formatDate(order.deletedAt)}</span>
                    </div>
                    {order.deletedBy && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-800 to-black">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span>
                          Deleted by: {order.deletedBy.firstName} {order.deletedBy.lastName}
                        </span>
                      </div>
                    )}
                  </div>

                  {order.deleteReason && (
                    <div className="mb-4 p-3.5 rounded-lg bg-gradient-to-r from-green-50 to-gray-100 border-l-4 border-green-800">
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-800 to-black mt-0.5">
                          <AlertCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-gray-800 mb-1.5 uppercase tracking-wide">Reason for Deletion</div>
                          <div className="text-sm text-gray-700 leading-relaxed">{order.deleteReason}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="flex items-center justify-between w-full text-left group"
                    >
                      <span className="text-sm font-semibold text-gray-700">
                        {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-green-700 group-hover:text-green-800 transition-colors">
                        {expandedOrders.includes(order.id) ? 'Hide' : 'Show'} details
                      </span>
                    </button>
                    {expandedOrders.includes(order.id) && (
                      <div className="mt-3 space-y-2 animate-fade-in">
                        {order.orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center py-2 px-3 rounded-lg bg-gray-50"
                          >
                            <span className="text-sm text-gray-700">{item.menuItem.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">x{item.quantity}</span>
                              <span className="text-sm font-semibold text-gray-900">
                                ₦{(item.menuItem.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment Type</span>
                      <span className="font-semibold text-gray-900">{order.paymentType}</span>
                    </div>
                    {order.discountPercentage && order.discountPercentage > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount ({order.discountPercentage}%)</span>
                        <span className="font-semibold text-green-600">
                          -₦{(order.discountAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
                      <span className="bg-gradient-to-r from-green-800 to-black bg-clip-text text-transparent">
                        Total
                      </span>
                      <span className="bg-gradient-to-r from-green-800 to-black bg-clip-text text-transparent">
                        ₦{calculateTotal(order).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {order.waiter && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Waiter</div>
                      <div className="text-sm font-medium text-gray-700">
                        {order.waiter.firstName} {order.waiter.lastName}
                      </div>
                    </div>
                  )}

                  {order.createdBy && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Created By</div>
                      <div className="text-sm font-medium text-gray-700">
                        {order.createdBy.firstName} {order.createdBy.lastName}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleRestore(order.id)}
                      disabled={restoringOrderId === order.id}
                      className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-800 to-black text-white font-semibold text-sm hover:from-green-700 hover:to-gray-900 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {restoringOrderId === order.id ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Restoring...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          Restore Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <ReactPaginate
                previousLabel="Previous"
                nextLabel="Next"
                breakLabel="..."
                pageCount={pagination.totalPages}
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
          </>
        )}
      </div>
    </div>
  );
};

export default DeletedOrders;

