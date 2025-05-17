import Table from '@/components/ui/table';
import { useGetStockSheetQuery, useGetStockSheetStatsQuery, useLazyDownloadStockSheetExportQuery } from '@/redux/api/inventory/inventory.api';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import SearchBar from '@/components/search-bar/search-bar';
import { StyledButton } from '@/components/button/button-lellall';
import { Filter, ExportCircle } from 'iconsax-react';
import { theme } from '@/theme/theme';
import { format } from 'date-fns';
import { ColorRing } from 'react-loader-spinner';
import { moneyFormatter } from '@/utils/moneyFormatter';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import ReactPaginate from 'react-paginate';

// Modern pagination styles (same as InventoryComponent)
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

const StockSheet = () => {
  const columns = [
    { key: 'productName', label: 'Name', className: 'table-cell' },
    { key: 'openingStock', label: 'O/Stock', className: 'hidden lg:table-cell' },
    { key: 'added', label: 'Added', className: 'hidden lg:table-cell' },
    { key: 'quantityUsed', label: 'Qty Used', className: 'hidden lg:table-cell' },
    { key: 'closingStock', label: 'C/Stock', className: 'table-cell' },
    { key: 'unitPrice', label: 'Price', className: 'hidden lg:table-cell' },
    { key: 'grandTotal', label: 'Total', className: 'hidden lg:table-cell' },
    { key: 'unitOfMeasurement', label: 'Unit', className: 'hidden lg:table-cell' },
  ];

  const { subdomain } = useSelector(selectAuth);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: stockSheetData, error, isLoading, refetch: refetchStockSheet } = useGetStockSheetQuery(
    { subdomain, date: selectedDate, page, limit },
    { refetchOnMountOrArgChange: true, skip: !subdomain }
  );
  const { data: stats, refetch: refetchStats } = useGetStockSheetStatsQuery(
    { subdomain, date: selectedDate },
    { refetchOnMountOrArgChange: true, skip: !subdomain }
  );
  const [triggerStockSheetDownload, { isFetching: isFetchingStockSheet }] = useLazyDownloadStockSheetExportQuery();

  useEffect(() => {
    refetchStockSheet();
    refetchStats();
  }, [selectedDate, page, refetchStockSheet, refetchStats]);

  const handleStockSheetDownload = async () => {
    if (!subdomain) {
      toast.error('Subdomain not found', { position: 'top-right' });
      return;
    }
    try {
      await triggerStockSheetDownload({ subdomain, format: 'csv', date: selectedDate }).unwrap();
      toast.success('Stock sheet downloaded successfully', { position: 'top-right' });
    } catch (error) {
      console.error('Stock sheet download failed:', error);
      toast.error('Failed to download stock sheet', { position: 'top-right' });
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setPage(1); // Reset page to 1 when date changes
  };

  const handlePageChange = ({ selected }) => {
    setPage(selected + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const round = (value) => (value !== undefined ? parseFloat(value).toFixed(2) : '-');

  const tableData = useMemo(() => {
    const items = stockSheetData?.data || [];
    return items.map((item) => ({
      ...item,
      openingStock: round(item.openingStock),
      added: round(item.added),
      quantityUsed: round(item.quantityUsed),
      closingStock: round(item.closingStock),
      unitPrice: moneyFormatter(item.unitPrice),
      grandTotal: round(item.grandTotal),
    }));
  }, [stockSheetData]);

  if (isLoading) {
    return (
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
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-500 text-sm">
        Error loading stock sheet: {JSON.stringify(error)}
      </div>
    );
  }

  const today = format(new Date(selectedDate), 'PPP');

  const statColors = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-yellow-100 text-yellow-700',
    'bg-purple-100 text-purple-700',
    'bg-red-100 text-red-700',
  ];

  const statsData = [
    { label: 'Total Stock Value', value: stats?.totalStockValue ?? '-' },
    { label: 'Total Added Stock', value: round(stats?.totalAddedStock) },
    { label: 'Total Quantity Used', value: round(stats?.totalQuantityUsed) },
    { label: 'Average Daily Usage', value: `${round(stats?.averageDailyUsage)}%` },
    { label: 'Low Stock Items', value: stats?.lowStockItems ?? '-' },
  ];

  return (
    <div className="min-h-screen p-2 sm:p-4 bg-gray-100">
      <style>{paginationStyles}</style>
      <div className="w-full sm:max-w-7xl mx-auto space-y-4">
        {/* Stock Summary Section */}
        <div className="bg-white rounded-xl p-2 sm:p-4 overflow-hidden box-border max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 sm:pb-4 gap-2">
            <h2 className="text-base sm:text-xl font-semibold text-gray-900">Stock Summary</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="p-2 text-xs sm:text-sm text-gray-700 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              />
              <p className="text-xs sm:text-sm text-gray-500">As of {today}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
            {statsData.map((item, index) => (
              <div
                key={index}
                className={`p-2 sm:p-3 rounded-lg text-center font-medium max-w-full ${statColors[index % statColors.length]} hover:bg-gray-50`}
              >
                <p className="text-xs sm:text-sm truncate">{item.label}</p>
                <p className="text-sm sm:text-lg font-bold truncate">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <SearchBar
              placeholder="Find your favorite items..."
              borderRadius="12px"
              iconColor="#000"
              iconSize={15}
              shadow={false}
            />
          </div>
          <StyledButton
            style={{ padding: '6px 10px', fontWeight: 300 }}
            background={theme.colors.active}
            color={theme.colors.secondary}
            width={{ base: '100%', sm: '150px' }}
            variant="outline"
            onClick={handleStockSheetDownload}
            disabled={isFetchingStockSheet}
            className={`flex items-center justify-center gap-1 text-xs sm:text-sm ${isFetchingStockSheet ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
            aria-label="Export stock sheet as CSV"
          >
            <ExportCircle size={14} className="w-3 h-3 sm:w-4 sm:h-4 mr-1" color="#fff" />
            {isFetchingStockSheet ? 'Downloading...' : 'Export Sheet (CSV)'}
          </StyledButton>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto w-full">
          <Table selectable columns={columns} data={tableData} />
        </div>

        {/* Pagination Section */}
        {stockSheetData?.pagination && (
          <ReactPaginate
            previousLabel={<span>Previous</span>}
            nextLabel={<span>Next</span>}
            breakLabel={'...'}
            pageCount={stockSheetData.pagination.totalPages || 1}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageChange}
            containerClassName={'pagination'}
            pageClassName={'page-item'}
            pageLinkClassName={'page-link'}
            previousClassName={'previous'}
            nextClassName={'next'}
            breakClassName={'break'}
            activeClassName={'active'}
            disabledClassName={'disabled'}
            forcePage={page - 1}
            aria-label="Stock Sheet Pagination"
          />
        )}
      </div>
    </div>
  );
};

export default StockSheet;