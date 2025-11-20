import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetLowStockInventoryWithMenuItemsQuery } from '@/redux/api/inventory/inventory.api';
import { LowStockInventoryWithMenuItems } from '@/redux/api/inventory/inventory.api';
import ReactPaginate from 'react-paginate';
import { Package, ChevronDown, ChevronUp, AlertTriangle, Tag } from 'lucide-react';
import { moneyFormatter } from '@/utils/moneyFormatter';

const LowStockInventory = () => {
  const { subdomain, user } = useSelector(selectAuth);
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Get restaurantId from user
  const restaurantId = user?.ownedRestaurants?.[0]?.id || user?.restaurantId || '';

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(0); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, error, isLoading, isFetching } = useGetLowStockInventoryWithMenuItemsQuery(
    {
      subdomain: subdomain || '',
      restaurantId,
      page: currentPage + 1,
      limit: 10,
      search: debouncedSearch || undefined,
    },
    { skip: !subdomain || !restaurantId },
  );

  const inventoryItems = data?.data || [];
  const pagination = data?.pagination || {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
  };

  const toggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handlePageChange = ({ selected }: { selected: number }) => {
    if (selected >= 0 && selected < pagination.totalPages) {
      setCurrentPage(selected);
    }
  };

  const getStockLevelColor = (stock: number): string => {
    if (stock < 1) return 'bg-red-500';
    if (stock < 2) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getStockLevelText = (stock: number): string => {
    if (stock < 1) return 'Critical';
    if (stock < 2) return 'Very Low';
    return 'Low';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
              Low Stock Inventory
            </h1>
            <p className="text-gray-600">Items below threshold of 3 units</p>
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
          <div className="text-red-500 text-lg mb-2">Error loading low stock inventory</div>
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
        .inventory-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .inventory-card:hover {
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
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-800 to-black bg-clip-text text-transparent">
                Low Stock Inventory
              </h1>
              <p className="text-gray-600 mt-1">
                {pagination.totalCount} item{pagination.totalCount !== 1 ? 's' : ''} below threshold of 3 units
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search by product name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
            />
          </div>
        </div>

        {inventoryItems.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-800 to-black inline-block mb-4">
              <Package className="w-12 h-12 text-white mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No low stock items</h3>
            <p className="text-gray-600">All inventory items are above the threshold</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventoryItems.map((item, index) => (
                <div
                  key={item.id}
                  className="inventory-card bg-white rounded-2xl p-6 animate-slide-up"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 250, 251, 0.9) 100%)',
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Product Name</div>
                      <div className="text-lg font-bold text-gray-900">{item.productName}</div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg ${getStockLevelColor(item.closingStock)} text-white text-xs font-semibold`}>
                      {getStockLevelText(item.closingStock)}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-800 to-black">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <span>
                        Stock: <span className="font-semibold text-gray-900">{item.closingStock}</span> {item.unitOfMeasurement}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-800 to-black">
                        <Tag className="w-4 h-4 text-white" />
                      </div>
                      <span>Category: <span className="font-semibold text-gray-900">{item.category}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-800 to-black">
                        <span className="text-white text-xs font-bold">₦</span>
                      </div>
                      <span>Unit Price: <span className="font-semibold text-gray-900">{moneyFormatter(item.unitPrice)}</span></span>
                    </div>
                  </div>

                  {/* Menu Items Section */}
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="flex items-center justify-between w-full text-left group"
                      aria-expanded={expandedItems.has(item.id)}
                    >
                      <span className="text-sm font-semibold text-gray-700">
                        {item.menuItems.length} menu item{item.menuItems.length !== 1 ? 's' : ''} affected
                      </span>
                      <span className="text-xs text-green-700 group-hover:text-green-800 transition-colors flex items-center gap-1">
                        {expandedItems.has(item.id) ? (
                          <>
                            Hide <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Show <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </span>
                    </button>
                    {expandedItems.has(item.id) && (
                      <div className="mt-3 space-y-2 animate-fade-in">
                        {item.menuItems.length === 0 ? (
                          <div className="text-sm text-gray-500 italic">No menu items use this inventory</div>
                        ) : (
                          item.menuItems.map((menuItem) => (
                            <div
                              key={menuItem.id}
                              className="flex flex-col gap-2 py-2 px-3 rounded-lg bg-gray-50 border-l-4 border-green-800"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-gray-900">{menuItem.name}</div>
                                  <div className="text-xs text-gray-600 mt-1">{menuItem.menuName}</div>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-semibold ${
                                  menuItem.status === 'AVAILABLE' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {menuItem.status}
                                </div>
                              </div>
                              {menuItem.status === 'AVAILABLE' && item.closingStock < 3 && (
                                <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Low inventory may affect availability</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>Uses {menuItem.inventoryQuantity} {item.unitOfMeasurement}</span>
                                <span className="font-semibold text-gray-900">{moneyFormatter(menuItem.price)}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    Added: {formatDate(item.dateAdded)}
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

export default LowStockInventory;

