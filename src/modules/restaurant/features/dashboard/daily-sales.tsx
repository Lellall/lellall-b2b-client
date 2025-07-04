import React, { useState } from 'react';
import { useGetDailySalesRevenueQuery, useGetDailySoldItemsQuery, useLazyDownloadDailySoldItemsCsvQuery } from '@/redux/api/order/order.api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

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
  const [selectedStartDate, setSelectedStartDate] = useState<Date>(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [inputStartTime, setInputStartTime] = useState<string>('');
  const [inputEndTime, setInputEndTime] = useState<string>('');
  const [queryStartTime, setQueryStartTime] = useState<string | undefined>(undefined);
  const [queryEndTime, setQueryEndTime] = useState<string | undefined>(undefined);

  // Format dates as YYYY-MM-DD with validation
  const formattedStartDate = selectedStartDate && !isNaN(selectedStartDate.getTime())
    ? selectedStartDate.toISOString().split('T')[0]
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
      <style>{datePickerStyles}</style>
      <div className="bg-white p-6 rounded-xl">
        <div className="max-w-7xl mx-auto">
          {/* Header and Date/Time Pickers */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">Start Date:</label>
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
              <div className="flex items-center gap-2">
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
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Sales Revenue Card */}
            <div className="bg-white rounded-xl p-6 hover:bg-gray-50 transition-colors">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Sales Revenue for {formattedStartDate}
                {formattedEndDate && formattedEndDate !== formattedStartDate ? ` to ${formattedEndDate}` : ''}{' '}
                {queryStartTime && queryEndTime ? `(${queryStartTime}-${queryEndTime})` : '(Full Day)'}
              </h2>
              {isRevenueLoading ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <svg className="animate-spin h-5 w-5 text-[#0E5D37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </div>
              ) : revenueError ? (
                <p className="text-red-600 bg-red-50 p-2 rounded-lg text-sm">Error loading revenue: {revenueError.message || 'Unknown error'}</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-4xl font-bold text-[#0E5D37]">{revenueData?.revenue || '₦0'}</p>
                </div>
              )}
            </div>

            {/* Daily Sold Items Card */}
            <div className="bg-white  rounded-xl p-6 hover:bg-gray-50 transition-colors">
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
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DailySalesDashboard;