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
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

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

  const { data = [], error, isLoading, refetch: refetchStockSheet } = useGetStockSheetQuery(
    { subdomain, date: selectedDate },
    { refetchOnMountOrArgChange: true }
  );
  const { data: stats, refetch: refetchStats } = useGetStockSheetStatsQuery(
    { subdomain, date: selectedDate },
    { refetchOnMountOrArgChange: true }
  );
  const [triggerStockSheetDownload, { isFetching: isFetchingStockSheet }] = useLazyDownloadStockSheetExportQuery();

  useEffect(() => {
    refetchStockSheet();
    refetchStats();
  }, [selectedDate, refetchStockSheet, refetchStats]);

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
  };

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

  const round = (value) => (value !== undefined ? parseFloat(value).toFixed(2) : '-');

  const statsData = [
    { label: 'Total Stock Value', value: stats?.totalStockValue ?? '-' },
    { label: 'Total Added Stock', value: round(stats?.totalAddedStock) },
    { label: 'Total Quantity Used', value: round(stats?.totalQuantityUsed) },
    { label: 'Average Daily Usage', value: `${round(stats?.averageDailyUsage)}%` },
    { label: 'Low Stock Items', value: stats?.lowStockItems ?? '-' },
  ];

  const tableData = data.map((item) => ({
    ...item,
    openingStock: round(item.openingStock),
    added: round(item.added),
    quantityUsed: round(item.quantityUsed),
    closingStock: round(item.closingStock),
    unitPrice: moneyFormatter(item.unitPrice),
    grandTotal: round(item.grandTotal),
  }));

  return (
    <div className="min-h-screen p-2 sm:p-4 bg-gray-100">
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
              placeholder="Search Items"
              width={{ base: '100%', sm: '200px', md: '300px' }}
              height="36px"
              border="none"
              borderRadius="8px"
              backgroundColor="#ffffff"
              shadow={false}
              fontSize={{ base: '10px', sm: '11px' }}
              color="#444"
              inputPadding="6px"
              placeholderColor="#bbb"
              iconColor="#ccc"
              iconSize={14}
            />
            <StyledButton
              style={{ padding: '6px 10px', fontWeight: 300 }}
              background="#fff"
              color="#000"
              width={{ base: '100px', sm: '120px' }}
              variant="outline"
              className="flex items-center justify-center gap-1 text-xs sm:text-sm"
              aria-label="Filter stock items"
            >
              <Filter size={14} className="w-3 h-3 sm:w-4 sm:h-4 mr-1" color="#000" /> Filters
            </StyledButton>
          </div>
          <StyledButton
            style={{ padding: '6px 10px', fontWeight: 300 }}
            background={theme.colors.active}
            color={theme.colors.secondary}
            width={{ base: '100%', sm: '150px' }}
            variant="outline"
            onClick={handleStockSheetDownload}
            disabled={isFetchingStockSheet}
            className={`flex items-center justify-center gap-1 text-xs sm:text-sm ${
              isFetchingStockSheet ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
            }`}
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
      </div>
    </div>
  );
};

export default StockSheet;