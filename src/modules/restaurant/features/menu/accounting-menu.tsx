import React, { useState, useMemo } from 'react';
import { Calendar, Search, Download, Filter, TrendingUp, BarChart3, CreditCard, FileText, Users, Package, X, Info } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ColorRing } from 'react-loader-spinner';
import { theme } from '@/theme/theme';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { toast } from 'react-toastify';
import {
  useGetSalesBreakdownQuery,
  useGetCategoryBreakdownQuery,
  useGetItemBreakdownQuery,
  useGetPaymentBreakdownQuery,
  useGetSelectedItemsBreakdownMutation,
  useGetStaffBreakdownQuery,
} from '@/redux/api/accounting/accounting.api';
import { useGetAllTagsQuery, useGetAllMenuItemsQuery } from '@/redux/api/menu/menu.api';

const AccountingMenu: React.FC = () => {
  const { subdomain, user } = useSelector(selectAuth);
  const [activeTab, setActiveTab] = useState<'sales' | 'category' | 'item' | 'payment' | 'selected-items' | 'staff'>('sales');
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPaymentTypes, setSelectedPaymentTypes] = useState<string[]>([]);
  const [itemLimit, setItemLimit] = useState<number | undefined>(undefined);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [itemSearchQuery, setItemSearchQuery] = useState<string>('');
  const [selectedItemsData, setSelectedItemsData] = useState<any>(null);
  const [showFilters, setShowFilters] = useState<boolean>(true);

  // Fetch available tags/categories
  const { data: availableTags } = useGetAllTagsQuery({ subdomain: subdomain || '' }, { skip: !subdomain });

  // Fetch all menu items for selection
  const { data: allMenuItems = [] } = useGetAllMenuItemsQuery(
    { subdomain: subdomain || '', search: itemSearchQuery },
    { skip: !subdomain || activeTab !== 'selected-items' }
  );

  // Fetch sales breakdown
  const {
    data: salesData,
    isLoading: isSalesLoading,
    refetch: refetchSales,
  } = useGetSalesBreakdownQuery(
    {
      subdomain: subdomain || '',
      startDate,
      endDate,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      paymentTypes: selectedPaymentTypes.length > 0 ? selectedPaymentTypes : undefined,
    },
    { skip: !subdomain || activeTab !== 'sales' }
  );

  // Fetch category breakdown
  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    refetch: refetchCategory,
  } = useGetCategoryBreakdownQuery(
    {
      subdomain: subdomain || '',
      startDate,
      endDate,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      paymentTypes: selectedPaymentTypes.length > 0 ? selectedPaymentTypes : undefined,
    },
    { skip: !subdomain || activeTab !== 'category' }
  );

  // Fetch item breakdown
  const {
    data: itemData,
    isLoading: isItemLoading,
    refetch: refetchItem,
  } = useGetItemBreakdownQuery(
    {
      subdomain: subdomain || '',
      startDate,
      endDate,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      limit: itemLimit,
    },
    { skip: !subdomain || activeTab !== 'item' }
  );

  // Fetch payment breakdown
  const {
    data: paymentData,
    isLoading: isPaymentLoading,
    refetch: refetchPayment,
  } = useGetPaymentBreakdownQuery(
    {
      subdomain: subdomain || '',
      startDate,
      endDate,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      paymentTypes: selectedPaymentTypes.length > 0 ? selectedPaymentTypes : undefined,
    },
    { skip: !subdomain || activeTab !== 'payment' }
  );

  // Get selected items breakdown mutation
  const [getSelectedItemsBreakdown, { isLoading: isSelectedItemsLoading }] = useGetSelectedItemsBreakdownMutation();

  // Fetch staff breakdown
  const {
    data: staffData,
    isLoading: isStaffLoading,
    refetch: refetchStaff,
  } = useGetStaffBreakdownQuery(
    {
      subdomain: subdomain || '',
      startDate,
      endDate,
      paymentTypes: selectedPaymentTypes.length > 0 ? selectedPaymentTypes : undefined,
    },
    { skip: !subdomain || activeTab !== 'staff' }
  );

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handlePaymentTypeToggle = (paymentType: string) => {
    setSelectedPaymentTypes((prev) =>
      prev.includes(paymentType) ? prev.filter((p) => p !== paymentType) : [...prev, paymentType]
    );
  };

  const handleExport = () => {
    try {
      let headers: string[] = [];
      let rows: any[] = [];
      let filename = '';

      switch (activeTab) {
        case 'sales':
          if (!salesData) {
            toast.error('No sales data available to export');
            return;
          }
          headers = ['Metric', 'Value'];
          rows = [
            ['Restaurant Name', salesData.restaurant.name],
            ['Address', salesData.restaurant.address],
            ['Phone', salesData.restaurant.phone],
            ['Start Date', formatDate(salesData.period.startDate)],
            ['End Date', formatDate(salesData.period.endDate)],
            ['First Order', formatDateTime(salesData.period.firstOrderDate)],
            ['Last Order', formatDateTime(salesData.period.lastOrderDate)],
            ['Grand Total', formatCurrency(salesData.summary.grandTotal)],
            ['Net Sales', formatCurrency(salesData.summary.netSales)],
            ['Number of Customers', salesData.summary.numberOfCustomers],
            ['Average Check', formatCurrency(salesData.summary.averageCheck)],
            ['Sub Total', formatCurrency(salesData.summary.subTotal)],
            ['VAT (7.5%)', formatCurrency(salesData.summary.vat)],
            ['Service Fee', formatCurrency(salesData.summary.serviceFee)],
            ['Discount', formatCurrency(salesData.summary.discount)],
            ['Net Total', formatCurrency(salesData.summary.netTotal)],
          ];
          filename = `sales_breakdown_${startDate}_to_${endDate}.csv`;
          break;

        case 'category':
          if (!categoryData) {
            toast.error('No category data available to export');
            return;
          }
          headers = ['Category', 'Total Revenue', 'Item Count', 'Order Count'];
          rows = categoryData.categories.map((cat: any) => [
            cat.category || 'N/A',
            formatCurrency(cat.totalRevenue),
            cat.itemCount || 0,
            cat.orderCount || 0,
          ]);
          filename = `category_breakdown_${startDate}_to_${endDate}.csv`;
          break;

        case 'item':
          if (!itemData) {
            toast.error('No item data available to export');
            return;
          }
          headers = ['Item Name', 'Category', 'Quantity', 'Average Price', 'Total Revenue', 'Order Count'];
          rows = itemData.items.map((item: any) => [
            item.itemName || 'N/A',
            item.category || 'N/A',
            item.quantity || 0,
            formatCurrency(item.averagePrice),
            formatCurrency(item.totalRevenue),
            item.orderCount || 0,
          ]);
          filename = `item_breakdown_${startDate}_to_${endDate}.csv`;
          break;

        case 'payment':
          if (!paymentData) {
            toast.error('No payment data available to export');
            return;
          }
          headers = ['Payment Type', 'Order Count', 'Subtotal', 'Discount', 'VAT', 'Service Fee', 'Total Revenue'];
          rows = paymentData.breakdown.map((payment: any) => [
            payment.paymentType || 'N/A',
            payment.orderCount || 0,
            formatCurrency(payment.totalSubtotal),
            formatCurrency(payment.totalDiscount),
            formatCurrency(payment.totalVAT),
            formatCurrency(payment.totalServiceFee),
            formatCurrency(payment.totalRevenue),
          ]);
          filename = `payment_breakdown_${startDate}_to_${endDate}.csv`;
          break;

        case 'selected-items':
          if (!selectedItemsData) {
            toast.error('No selected items data available to export');
            return;
          }
          headers = ['Item Name', 'Category', 'Quantity', 'Total Revenue', 'Order Count'];
          rows = selectedItemsData.items.map((item: any) => [
            item.itemName || 'N/A',
            item.category || 'N/A',
            item.quantity || 0,
            formatCurrency(item.totalRevenue),
            item.orderCount || 0,
          ]);
          filename = `selected_items_breakdown_${startDate}_to_${endDate}.csv`;
          break;

        case 'staff':
          if (!staffData) {
            toast.error('No staff data available to export');
            return;
          }
          headers = ['Staff Name', 'Order Count', 'Total Revenue'];
          rows = staffData.staff.map((staff: any) => [
            staff.staffName || 'N/A',
            staff.orderCount || 0,
            formatCurrency(staff.totalRevenue),
          ]);
          filename = `staff_breakdown_${startDate}_to_${endDate}.csv`;
          break;

        default:
          toast.error('No data available to export');
          return;
      }

      // Convert to CSV
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map((cell: any) => {
          // Escape commas and quotes in cell values
          const cellValue = String(cell || '');
          if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')) {
            return `"${cellValue.replace(/"/g, '""')}"`;
          }
          return cellValue;
        }).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }
  };

  const handleItemToggle = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleGetSelectedItemsBreakdown = async () => {
    if (selectedItemIds.length === 0) {
      return;
    }
    try {
      const result = await getSelectedItemsBreakdown({
        subdomain: subdomain || '',
        itemIds: selectedItemIds,
        startDate,
        endDate,
        paymentTypes: selectedPaymentTypes.length > 0 ? selectedPaymentTypes : undefined,
      }).unwrap();
      setSelectedItemsData(result);
    } catch (error) {
      console.error('Failed to fetch selected items breakdown:', error);
    }
  };

  const isLoading = isSalesLoading || isCategoryLoading || isItemLoading || isPaymentLoading || isSelectedItemsLoading || isStaffLoading;

  const paymentTypeOptions = ['CASH', 'TRANSFER', 'CARD', 'ONLINE', 'DELIVERY', 'UNPAID'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#05431E] to-[#0E5D37] rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Menu Analysis & Breakdown</h1>
                <p className="text-sm text-gray-500 mt-1">Comprehensive sales insights and analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium transition-all hover:bg-gray-50 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <button
                onClick={handleExport}
                className="px-5 py-2.5 bg-gradient-to-r from-[#05431E] to-[#0E5D37] hover:from-[#043020] hover:to-[#05431E] text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Modern Filters Section */}
          {showFilters && (
            <div className="bg-white rounded-xl p-6 mb-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#05431E]" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Filters & Date Range</h3>
                </div>
                {(selectedCategories.length > 0 || selectedPaymentTypes.length > 0) && (
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedPaymentTypes([]);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Start Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05431E] focus:ring-offset-1 focus:border-[#05431E] text-sm bg-white hover:bg-gray-50 transition-all"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">End Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05431E] focus:ring-offset-1 focus:border-[#05431E] text-sm bg-white hover:bg-gray-50 transition-all"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                {activeTab === 'item' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Limit Items</label>
                    <input
                      type="number"
                      value={itemLimit || ''}
                      onChange={(e) => setItemLimit(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="All items"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05431E] focus:ring-offset-1 focus:border-[#05431E] text-sm bg-white hover:bg-gray-50 transition-all shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Date Filter Information */}
              <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-l-4 border-[#05431E] rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="p-1.5 bg-[#05431E] rounded-lg">
                      <Info className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 mb-1.5">Date Range Selection</h4>
                    <p className="text-xs text-gray-700 leading-relaxed mb-2">
                      Select your <span className="font-semibold text-[#05431E]">Start Date</span> and <span className="font-semibold text-[#05431E]">End Date</span> to analyze sales, orders, and performance metrics. All data between these dates (inclusive) will be included in your analysis.
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/60 rounded-md border border-emerald-200">
                      <span className="text-xs font-semibold text-[#05431E]">💡</span>
                      <span className="text-xs text-gray-600">
                        <span className="font-semibold">Tip:</span> Use 7-30 days for detailed insights, or months for trend analysis
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              {availableTags && availableTags.length > 0 && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-800 mb-3 uppercase tracking-wide">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleCategoryToggle(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedCategories.includes(tag)
                            ? 'bg-gradient-to-r from-[#05431E] to-[#0E5D37] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Type Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-3 uppercase tracking-wide">Payment Types</label>
                <div className="flex flex-wrap gap-2">
                  {paymentTypeOptions.map((type) => (
                    <button
                      key={type}
                      onClick={() => handlePaymentTypeToggle(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedPaymentTypes.includes(type)
                          ? 'bg-gradient-to-r from-[#05431E] to-[#0E5D37] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modern Tabs */}
        <div className="bg-white rounded-xl overflow-hidden mb-6">
          <div className="border-b border-gray-100">
            <nav className="flex overflow-x-auto scrollbar-hide">
              {[
                { id: 'sales', label: 'Sales Breakdown', icon: FileText },
                { id: 'category', label: 'Category Breakdown', icon: BarChart3 },
                { id: 'item', label: 'Item Breakdown', icon: TrendingUp },
                { id: 'payment', label: 'Payment Breakdown', icon: CreditCard },
                { id: 'selected-items', label: 'Selected Items', icon: Package },
                { id: 'staff', label: 'Staff Breakdown', icon: Users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#05431E] text-[#05431E] bg-green-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <ColorRing
                  height="60"
                  width="60"
                  colors={[theme.colors.active, theme.colors.active, theme.colors.active, theme.colors.active, theme.colors.active]}
                  ariaLabel="loading"
                  visible={true}
                />
              </div>
            ) : (
              <>
                {/* Sales Breakdown Tab */}
                {activeTab === 'sales' && salesData && (
                  <div className="space-y-6">
                    {/* Restaurant Info Card */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{salesData.restaurant.name}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#05431E] rounded-full"></span>
                              {salesData.restaurant.address}
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#05431E] rounded-full"></span>
                              {salesData.restaurant.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Period Info Card */}
                    <div className="bg-[#F8F9FA] p-6">
                      <h4 className="text-sm font-bold text-[#05431E] mb-4 uppercase tracking-wide">Period Overview</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <div className="text-xs font-medium text-green-700 mb-1">Start Date</div>
                          <div className="text-sm font-bold text-[#05431E]">{formatDate(salesData.period.startDate)}</div>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <div className="text-xs font-medium text-green-700 mb-1">End Date</div>
                          <div className="text-sm font-bold text-[#05431E]">{formatDate(salesData.period.endDate)}</div>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <div className="text-xs font-medium text-green-700 mb-1">First Order</div>
                          <div className="text-sm font-bold text-[#05431E]">{formatDateTime(salesData.period.firstOrderDate)}</div>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <div className="text-xs font-medium text-green-700 mb-1">Last Order</div>
                          <div className="text-sm font-bold text-[#05431E]">{formatDateTime(salesData.period.lastOrderDate)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-[#F8F9FA]  p-6 ">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Grand Total</div>
                          <span className="text-xl text-gray-400 font-semibold">₦</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(salesData.summary.grandTotal)}</div>
                      </div>
                      <div className="bg-[#F8F9FA] p-6 ">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-semibold text-[#05431E] uppercase tracking-wide">Net Sales</div>
                          <TrendingUp className="w-5 h-5 text-[#05431E]" />
                        </div>
                        <div className="text-2xl font-bold text-[#05431E]">{formatCurrency(salesData.summary.netSales)}</div>
                      </div>
                      <div className="bg-[#F8F9FA]  p-6 ">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Customers</div>
                          <Users className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{salesData.summary.numberOfCustomers}</div>
                      </div>
                      <div className="bg-[#F8F9FA]  p-6 ">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Check</div>
                          <BarChart3 className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="text-2xl font-bold text-[#05431E]">{formatCurrency(salesData.summary.averageCheck)}</div>
                      </div>
                    </div>

                    {/* Detailed Summary */}
                    <div className="bg-white rounded-xl p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-6">Detailed Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sub Total</div>
                          <div className="text-base font-bold text-gray-900">{formatCurrency(salesData.summary.subTotal)}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">VAT (7.5%)</div>
                          <div className="text-base font-bold text-gray-900">{formatCurrency(salesData.summary.vat)}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Service Fee</div>
                          <div className="text-base font-bold text-gray-900">{formatCurrency(salesData.summary.serviceFee)}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Discount</div>
                          <div className="text-base font-bold text-red-600">{formatCurrency(salesData.summary.discount)}</div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#05431E] uppercase tracking-wide mb-1">Net Total</div>
                          <div className="text-base font-bold text-[#05431E]">{formatCurrency(salesData.summary.netTotal)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Category Breakdown Tab */}
                {activeTab === 'category' && categoryData && (
                  <div className="space-y-6">
                    <div className=" p-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <div className="text-xs font-semibold text-green-700 mb-1">Start Date</div>
                          <div className="text-sm font-bold text-[#05431E]">{formatDate(categoryData.period.startDate)}</div>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <div className="text-xs font-semibold text-green-700 mb-1">End Date</div>
                          <div className="text-sm font-bold text-[#05431E]">{formatDate(categoryData.period.endDate)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-[#05431E] to-[#0E5D37] rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-green-100 uppercase tracking-wide mb-1">Total Revenue</div>
                          <div className="text-3xl font-bold">{formatCurrency(categoryData.total)}</div>
                        </div>
                        <span className="text-4xl text-green-200 opacity-50 font-semibold">₦</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Category</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Total Revenue</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Item Count</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Order Count</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {categoryData.categories.map((cat, index) => (
                              <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <span className="text-sm font-semibold text-gray-900">{cat.category}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm font-bold text-[#05431E]">{formatCurrency(cat.totalRevenue)}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-gray-700">{cat.itemCount}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-gray-700">{cat.orderCount}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Item Breakdown Tab */}
                {activeTab === 'item' && itemData && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/60 rounded-lg p-4">
                          <div className="text-xs font-semibold text-green-700 mb-1">Start Date</div>
                          <div className="text-sm font-bold text-[#05431E]">{formatDate(itemData.period.startDate)}</div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-4">
                          <div className="text-xs font-semibold text-green-700 mb-1">End Date</div>
                          <div className="text-sm font-bold text-[#05431E]">{formatDate(itemData.period.endDate)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white rounded-xl p-6">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Items</div>
                        <div className="text-2xl font-bold text-gray-900">{itemData.summary.totalItems}</div>
                      </div>
                      <div className="bg-white rounded-xl p-6">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Quantity</div>
                        <div className="text-2xl font-bold text-gray-900">{itemData.summary.totalQuantity}</div>
                      </div>
                      <div className="bg-gradient-to-r from-[#05431E] to-[#0E5D37] rounded-xl p-6 text-white">
                        <div className="text-xs font-semibold text-green-100 uppercase tracking-wide mb-2">Total Revenue</div>
                        <div className="text-2xl font-bold">{formatCurrency(itemData.summary.totalRevenue)}</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Item Name</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Category</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Quantity</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Average Price</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Total Revenue</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Order Count</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {itemData.items.map((item) => (
                              <tr key={item.itemId} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <span className="text-sm font-semibold text-gray-900">{item.itemName}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">{item.category}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-gray-700">{item.quantity}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-gray-700">{formatCurrency(item.averagePrice)}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm font-bold text-[#05431E]">{formatCurrency(item.totalRevenue)}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-gray-700">{item.orderCount}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Breakdown Tab */}
                {activeTab === 'payment' && paymentData && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/60 rounded-lg p-4">
                          <div className="text-xs font-semibold text-green-700 mb-1">Start Date</div>
                          <div className="text-sm font-bold text-[#05431E]">{formatDate(paymentData.period.startDate)}</div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-4">
                          <div className="text-xs font-semibold text-green-700 mb-1">End Date</div>
                          <div className="text-sm font-bold text-[#05431E]">{formatDate(paymentData.period.endDate)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-[#05431E] to-[#0E5D37] rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-green-100 uppercase tracking-wide mb-1">Total Revenue</div>
                          <div className="text-3xl font-bold">{formatCurrency(paymentData.totalRevenue)}</div>
                        </div>
                        <CreditCard className="w-10 h-10 text-green-200 opacity-50" />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Payment Type</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Order Count</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Subtotal</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Discount</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">VAT</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Service Fee</th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Total Revenue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {paymentData.breakdown.map((payment, index) => (
                              <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <span className="text-sm font-semibold text-gray-900">{payment.paymentType}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-gray-700">{payment.orderCount}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-gray-700">{formatCurrency(payment.totalSubtotal)}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm font-semibold text-red-600">{formatCurrency(payment.totalDiscount)}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-gray-700">{formatCurrency(payment.totalVAT)}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-gray-700">{formatCurrency(payment.totalServiceFee)}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm font-bold text-[#05431E]">{formatCurrency(payment.totalRevenue)}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Selected Items Breakdown Tab */}
                {activeTab === 'selected-items' && (
                  <div className="space-y-8 px-8 py-10">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-0">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/60 rounded-lg p-4 border-0">
                          <div className="text-xs font-semibold text-green-700 mb-1">Start Date</div>
                          <div className="text-sm font-bold text-[#05431E]">{formatDate(startDate)}</div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-4 border-0">
                          <div className="text-xs font-semibold text-green-700 mb-1">End Date</div>
                          <div className="text-sm font-bold text-[#05431E]">{formatDate(endDate)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Item Selection */}
                    <div className="bg-white rounded-xl p-6 border-0">
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-900 mb-3">Search Items</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={itemSearchQuery}
                            onChange={(e) => setItemSearchQuery(e.target.value)}
                            placeholder="Search menu items..."
                            className="w-full pl-11 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] focus:ring-offset-1 text-sm bg-gray-50 transition-all"
                          />
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-semibold text-gray-900">
                            Select Items
                          </label>
                          {selectedItemIds.length > 0 && (
                            <span className="text-xs font-semibold text-[#05431E] bg-green-50 px-3 py-1 rounded-full">
                              {selectedItemIds.length} selected
                            </span>
                          )}
                        </div>
                        {allMenuItems.length === 0 ? (
                          <div className="text-center py-12 text-gray-500 text-sm">No items found</div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 py-4 px-2">
                            {allMenuItems.map((item: any) => {
                              const generateDarkColorFromId = (id: string) => {
                                if (!id) return 'bg-gray-200';
                                const hash = id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                                const colors = [
                                  'bg-blue-600',
                                  'bg-green-600',
                                  'bg-purple-600',
                                  'bg-red-600',
                                  'bg-yellow-600',
                                  'bg-indigo-600',
                                  'bg-pink-600',
                                  'bg-teal-600',
                                ];
                                return colors[hash % colors.length];
                              };

                              const isSelected = selectedItemIds.includes(item.id);
                              
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => handleItemToggle(item.id)}
                                  className={`p-3 rounded-xl ${generateDarkColorFromId(item.id)} text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:brightness-110 cursor-pointer relative border-0 ${
                                    isSelected ? ' scale-105' : ''
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="absolute -top-2 -right-2 bg-[#05431E] rounded-full p-1.5 shadow-lg">
                                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                  <div className="flex flex-col space-y-1">
                                    <h3 className="text-xs sm:text-sm font-bold truncate">{item.name}</h3>
                                    <p className="text-[10px] sm:text-xs font-medium opacity-90">₦{item.price.toLocaleString()}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleGetSelectedItemsBreakdown}
                          disabled={selectedItemIds.length === 0 || isSelectedItemsLoading}
                          className="px-8 py-3 bg-gradient-to-r from-[#05431E] to-[#0E5D37] hover:from-[#043020] hover:to-[#05431E] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:shadow-none"
                        >
                          {isSelectedItemsLoading ? 'Loading...' : 'Get Breakdown'}
                        </button>
                      </div>
                    </div>

                    {/* Selected Items Results */}
                    {selectedItemsData && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-[#05431E] to-[#0E5D37] rounded-xl p-6 text-white">
                          <div className="grid grid-cols-3 gap-6">
                            <div>
                              <div className="text-xs font-semibold text-green-100 uppercase tracking-wide mb-2">Total Items</div>
                              <div className="text-2xl font-bold">{selectedItemsData.summary.totalItems}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-green-100 uppercase tracking-wide mb-2">Total Quantity</div>
                              <div className="text-2xl font-bold">{selectedItemsData.summary.totalQuantity}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-green-100 uppercase tracking-wide mb-2">Total Revenue</div>
                              <div className="text-2xl font-bold">{formatCurrency(selectedItemsData.summary.totalRevenue)}</div>
                            </div>
                          </div>
                        </div>

                        {selectedItemsData.items.map((item: any) => (
                          <div key={item.itemId} className="bg-white rounded-xl p-6 border-0">
                            <div className="mb-6">
                              <h4 className="text-xl font-bold text-gray-900 mb-3">{item.itemName}</h4>
                              <div className="flex flex-wrap items-center gap-4">
                                <span className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full font-semibold">
                                  {item.category}
                                </span>
                                <span className="text-sm text-gray-600">
                                  <span className="font-semibold">Quantity:</span> {item.quantity}
                                </span>
                                <span className="text-sm text-gray-600">
                                  <span className="font-semibold">Revenue:</span> <span className="text-[#05431E] font-bold">{formatCurrency(item.totalRevenue)}</span>
                                </span>
                                <span className="text-sm text-gray-600">
                                  <span className="font-semibold">Orders:</span> {item.orderCount}
                                </span>
                              </div>
                            </div>

                            {item.orders && item.orders.length > 0 && (
                              <div className="mt-6">
                                <h5 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Order History</h5>
                                <div className="bg-gray-50 rounded-lg overflow-hidden">
                                  <div className="overflow-x-auto">
                                    <table className="w-full">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Order ID</th>
                                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Date</th>
                                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Quantity</th>
                                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Revenue</th>
                                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Waiter</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {item.orders.map((order: any, idx: number) => (
                                          <tr key={idx} className="hover:bg-white transition-colors">
                                            <td className="px-4 py-3">
                                              <span className="text-xs font-mono text-gray-900">{order.orderId}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                              <span className="text-xs text-gray-700">{formatDate(order.date)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                              <span className="text-xs text-gray-700">{order.quantity}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                              <span className="text-xs font-bold text-[#05431E]">{formatCurrency(order.revenue)}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                              <span className="text-xs text-gray-700">{order.waiter?.name || 'N/A'}</span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Staff Breakdown Tab */}
                {activeTab === 'staff' && staffData && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/60 rounded-lg p-4">
                          <div className="text-xs font-semibold text-green-700 mb-1">Start Date</div>
                          <div className="text-sm font-bold text-[#05431E]">{formatDate(staffData.period.startDate)}</div>
                        </div>
                        <div className="bg-white/60 rounded-lg p-4">
                          <div className="text-xs font-semibold text-green-700 mb-1">End Date</div>
                          <div className="text-sm font-bold text-[#05431E]">{formatDate(staffData.period.endDate)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-white rounded-xl p-5">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Staff</div>
                        <div className="text-2xl font-bold text-gray-900">{staffData.summary.totalStaff}</div>
                      </div>
                      <div className="bg-white rounded-xl p-5">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Orders</div>
                        <div className="text-2xl font-bold text-gray-900">{staffData.summary.totalOrders}</div>
                      </div>
                      <div className="bg-white rounded-xl p-5">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items Sold</div>
                        <div className="text-2xl font-bold text-gray-900">{staffData.summary.totalItemsSold}</div>
                      </div>
                      <div className="bg-gradient-to-r from-[#05431E] to-[#0E5D37] rounded-xl p-5 text-white">
                        <div className="text-xs font-semibold text-green-100 uppercase tracking-wide mb-2">Total Revenue</div>
                        <div className="text-2xl font-bold">{formatCurrency(staffData.summary.totalRevenue)}</div>
                      </div>
                      <div className="bg-white rounded-xl p-5">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Avg Order Value</div>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(staffData.summary.averageOrderValue)}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {staffData.staff.map((staffMember) => (
                        <div key={staffMember.staffId} className="bg-white rounded-xl p-6">
                          <div className="mb-6 pb-4 border-b border-gray-100">
                            <h4 className="text-xl font-bold text-gray-900 mb-2">{staffMember.staffName}</h4>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span>{staffMember.staffEmail}</span>
                              {staffMember.employeeId && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                                  ID: {staffMember.employeeId}
                                </span>
                              )}
                              <span className="font-semibold">Orders: {staffMember.orderCount}</span>
                              <span className="font-semibold">Items Sold: {staffMember.itemsSold}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Revenue</div>
                              <div className="text-lg font-bold text-[#05431E]">{formatCurrency(staffMember.totalRevenue)}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Avg Order Value</div>
                              <div className="text-lg font-semibold text-gray-900">{formatCurrency(staffMember.averageOrderValue)}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Subtotal</div>
                              <div className="text-lg font-semibold text-gray-900">{formatCurrency(staffMember.totalSubtotal)}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Discount</div>
                              <div className="text-lg font-semibold text-red-600">{formatCurrency(staffMember.totalDiscount)}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">VAT</div>
                              <div className="text-lg font-semibold text-gray-900">{formatCurrency(staffMember.totalVAT)}</div>
                            </div>
                          </div>

                          {staffMember.orders && staffMember.orders.length > 0 && (
                            <div className="mt-6">
                              <h5 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Order History</h5>
                              <div className="bg-gray-50 rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Order ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Items</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Subtotal</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Discount</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {staffMember.orders.map((order, idx) => (
                                        <tr key={idx} className="hover:bg-white transition-colors">
                                          <td className="px-4 py-3">
                                            <span className="text-xs font-mono text-gray-900">{order.orderId}</span>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className="text-xs text-gray-700">{formatDate(order.date)}</span>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className="text-xs text-gray-700">{order.itemCount}</span>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className="text-xs text-gray-700">{formatCurrency(order.subtotal)}</span>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className="text-xs font-semibold text-red-600">{formatCurrency(order.discount)}</span>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className="text-xs font-bold text-[#05431E]">{formatCurrency(order.total)}</span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Data State */}
                {((activeTab === 'sales' && !salesData) ||
                  (activeTab === 'category' && !categoryData) ||
                  (activeTab === 'item' && !itemData) ||
                  (activeTab === 'payment' && !paymentData) ||
                  (activeTab === 'staff' && !staffData)) && (
                  <div className="text-center py-20">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No data available for the selected period</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingMenu;
