import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Receipt as Btn } from 'iconsax-react';
import { useGetDailySalesRevenueQuery, useGetDailySoldItemsQuery, useLazyDownloadDailySoldItemsCsvQuery, useGetPaymentTypeSummaryQuery } from '@/redux/api/order/order.api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { Money, Card, Bank, Wallet2, WalletRemove } from "iconsax-react";

// Custom CSS for react-datepicker to match flat design with primary color
const datePickerStyles = `
  .react-datepicker {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    font-family: 'Inter', sans-serif;
  }
  .react-datepicker__header {
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    border-radius: 8px 8px 0 0;
    padding: 12px;
  }
  .react-datepicker__current-month,
  .react-datepicker__day-name {
    color: #1f2937;
    font-weight: 600;
  }
  .react-datepicker__day {
    color: #374151;
    border-radius: 6px;
    padding: 8px;
  }
  .react-datepicker__day:hover {
    background: #e5e7eb;
  }
  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background: #0E5D37;
    color: #ffffff;
    border-radius: 6px;
  }
  .react-datepicker__triangle {
    display: none;
  }
  .react-datepicker-popper {
    z-index: 50;
  }
`;

const DailySalesDashboard: React.FC<{ subdomain: string }> = ({ subdomain }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [bgColor, setBgColor] = useState('#ffffff'); // Default white background
  const [selectedStartDate, setSelectedStartDate] = useState<Date>(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [inputStartTime, setInputStartTime] = useState<string>('');
  const [inputEndTime, setInputEndTime] = useState<string>('');
  const [queryStartTime, setQueryStartTime] = useState<string | undefined>(undefined);
  const [queryEndTime, setQueryEndTime] = useState<string | undefined>(undefined);

  const reactToPrintFn = useReactToPrint({ contentRef: componentRef });

  // Calculate luminance to determine if the background is light or dark
  const getLuminance = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  // Determine font color based on background luminance
  const fontColor = getLuminance(bgColor) > 0.5 ? '#000000' : '#ffffff';

  // Format dates as YYYY-MM-DD without any modifications
  const formattedStartDate = selectedStartDate && !isNaN(selectedStartDate.getTime())
    ? `${selectedStartDate.getFullYear()}-${String(selectedStartDate.getMonth() + 1).padStart(2, '0')}-${String(selectedStartDate.getDate()).padStart(2, '0')}`
    : new Date().toISOString().split('T')[0];

  const formattedEndDate = selectedEndDate && !isNaN(selectedEndDate.getTime())
    ? `${selectedEndDate.getFullYear()}-${String(selectedEndDate.getMonth() + 1).padStart(2, '0')}-${String(selectedEndDate.getDate()).padStart(2, '0')}`
    : undefined;

  // Query for daily sold items
  const { data: soldItemsData, isLoading: isItemsLoading, error: itemsError } = useGetDailySoldItemsQuery(
    {
      subdomain,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      startTime: queryStartTime,
      endTime: queryEndTime,
    },
    {
      skip:
        !formattedStartDate ||
        (queryStartTime && !queryEndTime) ||
        (!queryStartTime && queryEndTime) ||
        (selectedEndDate && selectedEndDate < selectedStartDate) ||
        isNaN(new Date(formattedStartDate).getTime()),
    },
  );


  const { data: paymentTypeData, isLoading: isPaymentTypeLoading, error: paymentTypeError } = useGetPaymentTypeSummaryQuery(
    {
      subdomain,
      startDate: formattedStartDate,
    },
    {
      skip: !formattedStartDate || isNaN(new Date(formattedStartDate).getTime()),
    },
  );
  /**
   * Sum up specific currency fields from an object
   * @param data - Object containing currency string fields
   * @param keys - Keys in the object to sum
   * @param formatted - If true, returns formatted Naira string
   */
  function sumCurrencyFields<T extends Record<string, string>>(
    data: T,
    keys: (keyof T)[],
    formatted = false
  ): number | string {
    const total = keys.reduce((sum, key) => {
      const num = parseFloat((data[key] || "").toString().replace(/[₦,]/g, "")) || 0;
      return sum + num;
    }, 0);

    return formatted
      ? `₦${total.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
      : total;
  }


  // Prepare data for grand total calculation
  const apiData = {
    totalRevenue: soldItemsData?.totalRevenue || '₦0',
    totalServiceFee: soldItemsData?.totalServiceFee || '₦0',
    totalVatTax: soldItemsData?.totalVatTax || '₦0',
  };

  // Calculate grand total using sumCurrencyFields
  const grandTotal = sumCurrencyFields(apiData, ['totalRevenue', 'totalServiceFee', 'totalVatTax'], true);
  // Query for daily sales revenue
  const { data: revenueData, isLoading: isRevenueLoading, error: revenueError } = useGetDailySalesRevenueQuery(
    {
      subdomain,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      startTime: queryStartTime,
      endTime: queryEndTime,
    },
    {
      skip:
        !formattedStartDate ||
        (queryStartTime && !queryEndTime) ||
        (!queryStartTime && queryEndTime) ||
        (selectedEndDate && selectedEndDate < selectedStartDate) ||
        isNaN(new Date(formattedStartDate).getTime()),
    },
  );

  // Lazy query for CSV download
  const [triggerCsvDownload] = useLazyDownloadDailySoldItemsCsvQuery();

  const handleDownloadCsv = () => {
    if (!formattedStartDate || isNaN(new Date(formattedStartDate).getTime())) {
      toast.error('Please select a valid start date', { position: 'top-right' });
      return;
    }
    if (selectedEndDate && selectedEndDate < selectedStartDate) {
      toast.error('End date cannot be before start date', { position: 'top-right' });
      return;
    }
    triggerCsvDownload({
      subdomain,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      startTime: queryStartTime,
      endTime: queryEndTime,
    });
  };

  // Validate and apply time range
  const handleApplyTimeRange = () => {
    if (inputStartTime === '' && inputEndTime === '') {
      setQueryStartTime(undefined);
      setQueryEndTime(undefined);
      toast.success('Time range cleared', { position: 'top-right' });
      return;
    }

    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(inputStartTime) || !timeRegex.test(inputEndTime)) {
      toast.error('Invalid time format. Use HH:mm (e.g., 13:00)', { position: 'top-right' });
      return;
    }

    if (inputStartTime && !inputEndTime) {
      toast.error('Please provide an end time', { position: 'top-right' });
      return;
    }
    if (!inputStartTime && inputEndTime) {
      toast.error('Please provide a start time', { position: 'top-right' });
      return;
    }

    setQueryStartTime(inputStartTime);
    setQueryEndTime(inputEndTime);
    toast.success('Time range applied', { position: 'top-right' });
  };

  return (
    <>
      <style>
        {`
          ${datePickerStyles}
          @media print {
            .no-print {
              display: none !important;
            }
            @page {
              margin: 0;
              size: auto;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .print-container {
              width: 100vw !important;
              min-height: 100vh !important;
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box;
              overflow: hidden;
            }
            .print-container * {
              color: ${fontColor} !important;
            }
            .print-container table thead tr {
              background-color: ${getLuminance(bgColor) > 0.5 ? '#e5e7eb' : '#4b5563'} !important;
            }
            .print-container table tbody tr.even:bg-gray-50 {
              background-color: ${getLuminance(bgColor) > 0.5 ? '#f9fafb' : '#6b7280'} !important;
            }
            .print-container table tbody tr:hover {
              background-color: ${getLuminance(bgColor) > 0.5 ? '#e5e7eb' : '#4b5563'} !important;
            }
            .print-container .bg-gray-50 {
              background-color: ${getLuminance(bgColor) > 0.5 ? '#f9fafb' : '#6b7280'} !important;
            }
            .print-container .border-gray-200 {
              border-color: ${fontColor} !important;
            }
            .print-container .text-[#0E5D37] {
              color: ${fontColor} !important;
            }
          }
        `}
      </style>
      <div className="bg-white p-6 rounded-xl">
        <div className="flex items-center gap-2 mb-4 no-print">
          <button
            onClick={reactToPrintFn}
            className="flex text-[10px] sm:text-xs text-[#05431E] hover:underline focus:outline-none"
          >
            <Btn size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Print Sales
          </button>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-8 h-8 border-none cursor-pointer"
            title="Choose background color"
          />
        </div>
        <div
          ref={componentRef}
          className="invisible h-0 w-0 overflow-hidden print:visible print:w-full print-container"
          style={{ backgroundColor: bgColor }}
        >
          <div className="min-h-[100vh] w-full p-6 box-border">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-xl font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Daily Sales Dashboard - {subdomain}
                </h1>
                <p className="text-sm">
                  {formattedStartDate}
                  {formattedEndDate && formattedEndDate !== formattedStartDate ? ` to ${formattedEndDate}` : ''}{' '}
                  {queryStartTime && queryEndTime ? `(${queryStartTime}-${queryEndTime})` : '(Full Day)'}
                </p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 gap-6">
                {/* Daily Sales Revenue Card */}
                <div className="rounded-xl p-6">
                  <h2 className="text-base font-semibold mb-4">
                    Sales Revenue
                  </h2>
                  {isRevenueLoading ? (
                    <p className="text-sm">Loading...</p>
                  ) : revenueError ? (
                    <p className="text-sm">Error loading revenue: {revenueError.message || 'Unknown error'}</p>
                  ) : (
                    <p className="text-4xl font-bold">{revenueData?.revenue || '₦0'}</p>
                  )}
                </div>

                {/* Daily Sold Items Card */}
                <div className="rounded-xl p-6">
                  <h2 className="text-base font-semibold mb-4">
                    Sold Items
                  </h2>
                  {isItemsLoading ? (
                    <p className="text-sm">Loading...</p>
                  ) : itemsError ? (
                    <p className="text-sm">Error loading sold items: {itemsError.message || 'Unknown error'}</p>
                  ) : soldItemsData?.items.length === 0 ? (
                    <p className="text-sm">No items sold in this time range</p>
                  ) : (
                    <div className="space-y-6">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs border-b border-gray-200">
                              <th className="py-3 px-4 text-left">Name</th>
                              <th className="py-3 px-4 text-right">Quantity</th>
                              <th className="py-3 px-4 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {soldItemsData?.items.map((item, index) => (
                              <tr
                                key={index}
                                className="border-b border-gray-200 even:bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <td className="py-3 px-4 truncate max-w-[150px] sm:max-w-[200px]">
                                  {item.name}
                                </td>
                                <td className="py-3 px-4 text-right">{item.quantity}</td>
                                <td className="py-3 px-4 text-right">{item.total}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {/* Totals Section */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-semibold mb-3">Totals</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm">Total Items Sold</p>
                            <p className="text-lg font-bold">{soldItemsData?.totalItemsSold || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm">Total Revenue</p>
                            <p className="text-lg font-bold">{soldItemsData?.totalRevenue || '₦0'}</p>
                          </div>
                          <div>
                            <p className="text-sm">Total VAT Tax</p>
                            <p className="text-lg font-bold">{soldItemsData?.totalVatTax || '₦0'}</p>
                          </div>
                          <div>
                            <p className="text-sm">Total Service Fee</p>
                            <p className="text-lg font-bold">{soldItemsData?.totalServiceFee || '₦0'}</p>
                          </div>
                          <div>
                            <p className="text-sm">Grand Total</p>
                            <p className="text-lg font-bold">{grandTotal}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Original UI */}
        <div className="max-w-7xl mx-auto">
          {/* Header and Date/Time Pickers */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">Date:</label>
                <DatePicker
                  selected={selectedStartDate}
                  onChange={(date: Date | null) => {
                    if (!date || isNaN(date.getTime())) {
                      toast.error('Please select a valid start date', { position: 'top-right' });
                      return;
                    }
                    setSelectedStartDate(date);
                    if (selectedEndDate && date && selectedEndDate < date) {
                      setSelectedEndDate(null);
                      toast.info('End date reset as it was before the new start date', { position: 'top-right' });
                    }
                  }}
                  dateFormat="yyyy-MM-dd"
                  className="p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E5D37] bg-white transition-colors w-40"
                  wrapperClassName="w-40"
                  popperClassName="z-50"
                />
              </div>
              {/* <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">End Date:</label>
                <DatePicker
                  selected={selectedEndDate}
                  onChange={(date: Date | null) => {
                    if (!date || isNaN(date.getTime())) {
                      setSelectedEndDate(null);
                      toast.info('End date cleared', { position: 'top-right' });
                      return;
                    }
                    if (date < selectedStartDate) {
                      toast.error('End date cannot be before start date', { position: 'top-right' });
                      return;
                    }
                    setSelectedEndDate(date);
                  }}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Optional"
                  className="p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E5D37] bg-white transition-colors w-40"
                  wrapperClassName="w-40"
                  popperClassName="z-50"
                  isClearable
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">Start Time:</label>
                <input
                  type="text"
                  value={inputStartTime}
                  onChange={(e) => setInputStartTime(e.target.value)}
                  placeholder="HH:mm"
                  className="p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E5D37] bg-white transition-colors w-20"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">End Time:</label>
                <input
                  type="text"
                  value={inputEndTime}
                  onChange={(e) => setInputEndTime(e.target.value)}
                  placeholder="HH:mm"
                  className="p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E5D37] bg-white transition-colors w-20"
                />
              </div>
              <button
                onClick={handleApplyTimeRange}
                className="bg-[#0E5D37] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#0A4B2A] transition-colors"
              >
                Apply Time
              </button> */}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Sales Revenue Card */}


            <div className="">
              {/* Daily Sales Revenue Card */}
              <div className="bg-white rounded-2xl p-8 hover:bg-gray-50 transition-colors">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Sales Revenue
                  </h2>
                  <span className="text-sm text-gray-500">
                    {formattedStartDate}
                    {formattedEndDate && formattedEndDate !== formattedStartDate
                      ? ` → ${formattedEndDate}`
                      : ""}{" "}
                    {queryStartTime && queryEndTime
                      ? `(${queryStartTime}-${queryEndTime})`
                      : "(Full Day)"}
                  </span>
                </div>

                {/* Main Revenue */}
                {isRevenueLoading ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <svg
                      className="animate-spin h-5 w-5 text-[#0E5D37]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 
               0 0 5.373 0 12h4zm2 5.291A7.962 
               7.962 0 014 12H0c0 3.042 1.135 
               5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Loading...
                  </div>
                ) : revenueError ? (
                  <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                    Error loading revenue: {revenueError.message || "Unknown error"}
                  </p>
                ) : (
                  <p className="text-5xl font-bold text-[#0E5D37] mb-12 tracking-tight">
                    {revenueData?.revenue || "₦0"}
                  </p>
                )}

                {/* Payment Breakdown */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-6">
                    Payment Breakdown
                  </h3>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-12">
                    {paymentTypeData?.summary?.map((item, index) => {
                      const Icon =
                        item.paymentType === "CASH"
                          ? Money
                          : item.paymentType === "CARD"
                            ? Card
                            : item.paymentType === "TRANSFER"
                              ? Bank
                              : item.paymentType === "ONLINE"
                                ? Wallet2
                                : WalletRemove; // fallback for null/unknown

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Icon size="18" color="#0E5D37" variant="Bulk" />
                            <p className="text-sm font-medium text-gray-700">
                              {item.paymentType || "Unknown"}
                            </p>
                          </div>
                          <p className="text-2xl font-bold text-[#0E5D37] leading-tight">
                            {item.orderCount}
                          </p>
                          <p className="text-lg font-semibold text-[#0E5D37]">
                            ₦{item.totalRevenue?.toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>


            {/* Daily Sold Items Card */}
            <div className="bg-white rounded-xl p-6 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-gray-900">
                  Sold Items for {formattedStartDate}
                  {formattedEndDate && formattedEndDate !== formattedStartDate ? ` to ${formattedEndDate}` : ''}{' '}
                  {queryStartTime && queryEndTime ? `(${queryStartTime}-${queryEndTime})` : '(Full Day)'}
                </h2>
                <button
                  onClick={handleDownloadCsv}
                  className="bg-[#0E5D37] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#0A4B2A] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isItemsLoading || !soldItemsData?.items.length}
                >
                  Download CSV
                </button>
              </div>
              {isItemsLoading ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <svg className="animate-spin h-5 w-5 text-[#0E5D37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </div>
              ) : itemsError ? (
                <p className="text-red-600 bg-red-50 p-2 rounded-lg text-sm">Error loading sold items: {itemsError.message || 'Unknown error'}</p>
              ) : soldItemsData?.items.length === 0 ? (
                <p className="text-gray-500 text-sm">No items sold in this time range</p>
              ) : (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 font-semibold text-xs border-b border-gray-200">
                          <th className="py-3 px-4 text-left">Name</th>
                          <th className="py-3 px-4 text-right">Quantity</th>
                          <th className="py-3 px-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {soldItemsData?.items.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-200 even:bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <td className="py-3 px-4 text-gray-700 truncate max-w-[150px] sm:max-w-[200px]">
                              {item.name}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-700">{item.quantity}</td>
                            <td className="py-3 px-4 text-right text-gray-700">{item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Totals Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Totals</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Items Sold</p>
                        <p className="text-lg font-bold text-[#0E5D37]">{soldItemsData?.totalItemsSold || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-lg font-bold text-[#0E5D37]">{soldItemsData?.totalRevenue || '₦0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Discounts(₦)</p>
                        <p className="text-lg font-bold text-[#0E5D37]">{soldItemsData?.totalDiscountAmount || '₦0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total VAT Tax</p>
                        <p className="text-lg font-bold text-[#0E5D37]">{soldItemsData?.totalVatTax || '₦0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Service Fee</p>
                        <p className="text-lg font-bold text-[#0E5D37]">{soldItemsData?.totalServiceFee || '₦0'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Grand Total</p>
                        <p className="text-lg font-bold text-[#0E5D37]">{grandTotal}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DailySalesDashboard;