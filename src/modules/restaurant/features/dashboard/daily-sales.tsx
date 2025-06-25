import React, { useState } from 'react';
import { useGetDailySalesRevenueQuery, useGetDailySoldItemsQuery, useLazyDownloadDailySoldItemsCsvQuery } from '@/redux/api/order/order.api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DailySalesDashboard: React.FC = ({ subdomain }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const formattedDate = selectedDate.toISOString().split('T')[0];

  const { data: revenueData, isLoading: isRevenueLoading, error: revenueError } = useGetDailySalesRevenueQuery({
    subdomain,
    date: formattedDate,
  });

  const { data: soldItemsData, isLoading: isItemsLoading, error: itemsError } = useGetDailySoldItemsQuery({
    subdomain,
    date: formattedDate,
  });

  const [triggerCsvDownload] = useLazyDownloadDailySoldItemsCsvQuery();

  const handleDownloadCsv = () => {
    triggerCsvDownload({ subdomain, date: formattedDate });
  };

  return (
    <div className="bg-white p-4 sm:p-4 lg:p-4 mb-4 mt-4 rounded-lg">
      <div className="max-w-7xl mx-auto">
        {/* Header and Date Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center space-x-2">
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              className="p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors duration-200"
              wrapperClassName="w-40"
              popperClassName="z-50"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Sales Revenue Card */}
          <div className="bg-white rounded-xl p-6 transition-all duration-200 hover:border-green-800">
            <h2 className="text-xs text-gray-900 mb-4">Today's Sales Revenue</h2>
            {isRevenueLoading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : revenueError ? (
              <p className="text-red-500 text-sm">Error loading revenue</p>
            ) : (
              <div className="space-y-2">
                <p className="text-3xl font-bold text-green-800">{revenueData?.revenue}</p>
              </div>
            )}
          </div>

          {/* Daily Sold Items Card */}
          <div className="bg-white rounded-xl p-6 transition-all duration-200 hover:border-green-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs text-gray-900">Today's Sold Items</h2>
              <button
                onClick={handleDownloadCsv}
                className="bg-blue-500 text-white text-xs px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                disabled={isItemsLoading || !soldItemsData?.items.length}
              >
                Download CSV
              </button>
            </div>
            {isItemsLoading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : itemsError ? (
              <p className="text-red-500 text-sm">Error loading sold items</p>
            ) : soldItemsData?.items.length === 0 ? (
              <p className="text-gray-500 text-sm">No items sold on this date</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 font-light text-xs border-b border-gray-100">
                      <th className="py-3 px-4 text-left">Name</th>
                      <th className="py-3 px-4 text-right">Quantity</th>
                      <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soldItemsData?.items.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b text-xs border-gray-100 hover:bg-gray-50 transition-colors duration-150"
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
  );
};

export default DailySalesDashboard;