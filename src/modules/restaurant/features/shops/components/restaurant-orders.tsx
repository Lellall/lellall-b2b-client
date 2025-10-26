import { useState } from "react";
import NavigationTabs, { Tab } from "@/components/ui/navigation-tab";
import DateRangePicker from "@/components/ui/date-range";
import StatusDropdown from "@/components/ui/drop-down-btn";
import { StyledButton } from "@/components/button/button-lellall";
import { theme } from "@/theme/theme";
import Table from "@/components/ui/table";
import { useGetOrdersByRestaurantQuery } from "@/redux/api/order/order.api";
import { ColorRing } from 'react-loader-spinner';
import ReactPaginate from 'react-paginate';

// Pagination styles from InventoryComponent
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
    flex-wrap: wrap; /* Allow wrapping on small screens */
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
    transform: translateX(2px) rotate(-135deg); /* Smooth arrow animation */
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

interface RestaurantOrdersProps {
  restaurantId: string;
}

const RestaurantOrders = ({ restaurantId }: RestaurantOrdersProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedRange, setSelectedRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = useGetOrdersByRestaurantQuery({
    restaurantId,
    page: currentPage,
    limit: pageSize,
    status: selectedStatus || undefined,
  });

  const statuses = ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"];

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    // Map tab names to status values
    const statusMap: { [key: string]: string } = {
      "all": "",
      "pending": "PENDING",
      "confirmed": "CONFIRMED", 
      "delivered": "DELIVERED"
    };
    
    const newStatus = statusMap[tabName] || "";
    setSelectedStatus(newStatus);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  const handleDateChange = (range: { startDate: Date; endDate: Date }) => {
    setSelectedRange(range);
    console.log("Selected Date Range:", range);
  };

  const tabs: Tab[] = [
    { name: "All Orders", active: activeTab === "all" },
    { name: "Pending", active: activeTab === "pending" },
    { name: "Confirmed", active: activeTab === "confirmed" },
    { name: "Delivered", active: activeTab === "delivered" },
  ];

  const columns = [
    { 
      key: "customerName", 
      label: "Waiter",
      render: (value: any, row: any) => (
        <div>
          <div className="font-medium">{value || `${row.waiter?.firstName || ''} ${row.waiter?.lastName || ''}`.trim() || "N/A"}</div>
          <div className="text-xs text-gray-500">{row.waiter?.email || ""}</div>
        </div>
      )
    },
    { 
      key: "createdAt", 
      label: "Order Date",
      render: (value: any) => (
        <span>{value ? new Date(value).toLocaleDateString() : "N/A"}</span>
      )
    },
    { 
      key: "status", 
      label: "Status",
      render: (value: any) => {
        const getStatusColor = (status: string) => {
          switch (status?.toUpperCase()) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
            case 'PREPARING': return 'bg-orange-100 text-orange-800';
            case 'READY': return 'bg-green-100 text-green-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
          }
        };
        
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(value)}`}>
            {value || "N/A"}
          </span>
        );
      }
    },
    { 
      key: "total", 
      label: "Total Amount",
      render: (value: any, row: any) => {
        // Calculate total from orderItems if total is not provided
        const calculatedTotal = value || row.orderItems?.reduce((sum: number, item: any) => {
          return sum + (item.menuItem?.price || 0) * (item.quantity || 0);
        }, 0) || 0;
        
        return (
          <span className="font-medium">₦{calculatedTotal.toLocaleString()}</span>
        );
      }
    },
    { 
      key: "paymentType", 
      label: "Payment Method",
      render: (value: any) => (
        <span className="capitalize">{value || "N/A"}</span>
      )
    },
  ];

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected + 1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ColorRing
          visible={true}
          height="80"
          width="80"
          ariaLabel="color-ring-loading"
          wrapperStyle={{}}
          wrapperClass="color-ring-wrapper"
          colors={[theme.colors.active, theme.colors.active, theme.colors.active, theme.colors.active, theme.colors.active]}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load orders. Please try again.</p>
        <button 
          onClick={() => refetch()} 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="">
      <style>{paginationStyles}</style>
      <div className="">
        <div>
          <div className="flex justify-between">
            <div className="w-full flex">
              {/* <NavigationTabs tabs={tabs} onTabChange={handleTabChange} /> */}
              {/* Current Filter Indicator */}
              {selectedStatus && (
                <div className="ml-4 flex items-center">
                  <span className="text-sm text-gray-600">Filtered by:</span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {selectedStatus}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedStatus("");
                      setActiveTab("all");
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="flex ">
                {/* <DateRangePicker onChange={handleDateChange} initialRange={selectedRange} /> */}
                <div className="">
                  <StatusDropdown 
                    options={statuses} 
                    onSelect={handleStatusChange} 
                    initialStatus={selectedStatus || "All"} 
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <StyledButton
                background={theme.colors.active}
                color={theme.colors.secondary}
                width='150px'
                variant="outline"
                type="submit"
              >
                Generate Reports
              </StyledButton>
            </div>
          </div>
          
          <div className="mt-5">
            {!ordersData?.orders || ordersData.orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg">
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="text-base sm:text-lg font-medium text-gray-700">
                  {selectedStatus ? `No ${selectedStatus.toLowerCase()} orders found` : "No orders found"}
                </h3>
                <p className="text-[10px] sm:text-sm text-gray-500 text-center mt-2 max-w-xs sm:max-w-md">
                  {selectedStatus 
                    ? `There are no ${selectedStatus.toLowerCase()} orders for this restaurant. Try selecting a different filter.`
                    : "This restaurant doesn't have any orders yet."
                  }
                </p>
                {selectedStatus && (
                  <button
                    onClick={() => {
                      setSelectedStatus("");
                      setActiveTab("all");
                    }}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    View All Orders
                  </button>
                )}
              </div>
            ) : (
              <Table columns={columns} data={ordersData?.orders} />
            )}
            
        {ordersData?.meta && (
          <ReactPaginate
            pageCount={ordersData.meta.totalPages || 1}
            onPageChange={handlePageChange}
            containerClassName={'pagination'}
            previousLinkClassName={'pagination__link'}
            nextLinkClassName={'pagination__link'}
            disabledClassName={'disabled'}
            activeClassName={'active'}
            pageClassName={'page-item'}
            pageLinkClassName={'page-link'}
            forcePage={currentPage - 1}
          />
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantOrders;
