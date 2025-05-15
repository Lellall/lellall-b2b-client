import React, { useState, useMemo, useEffect, memo } from 'react';
import styled from 'styled-components';
import { debounce } from 'lodash';

interface TableProps {
  columns: { key: string; label: string; render?: (value: any, row: any) => React.ReactNode; className?: string }[];
  data: Record<string, any>[];
  selectable?: boolean;
  bordered?: boolean;
  onSelectionChange?: (selectedRows: Record<string, any>[]) => void;
}

const TableContainer = styled.div<{ bordered?: boolean }>`
  width: 100%;
  overflow-x: auto;
  table {
    width: 100%;
    min-width: 300px;
    @media (min-width: 1024px) {
      min-width: 600px;
    }
    border-collapse: collapse;
    ${({ bordered }) => bordered && `
      border: 1px solid #e5e7eb;
      th, td {
        border: 1px solid #e5e7eb;
      }
    `}
  }
`;

const Table: React.FC<TableProps> = ({ columns, data = [], selectable, bordered, onSelectionChange }) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    console.log("Table props:", { selectable, dataLength: data.length, columns });
  }, [selectable, data, columns]);

  // Memoize selected data to avoid creating new references
  const selectedData = useMemo(() => {
    return data.filter((row) => selectedRows.has(row.id)) || [];
  }, [selectedRows, data]);

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      console.log("Table onSelectionChange:", selectedData);
      onSelectionChange(selectedData);
    }
  }, [selectedData, onSelectionChange]);

  const handleSort = (key: string) => {
    const newOrder = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortOrder(newOrder);
  };

  // Memoize sorted data to prevent unnecessary re-computations
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aValue = a[sortKey] ?? '';
      const bValue = b[sortKey] ?? '';
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortOrder === 'asc' ? (aValue - bValue) : (bValue - aValue);
    });
  }, [data, sortKey, sortOrder]);

  // Debounce row selection to prevent rapid state updates
  const handleRowSelect = useMemo(
    () =>
      debounce((id: string) => {
        const newSelectedRows = new Set(selectedRows);
        newSelectedRows.has(id) ? newSelectedRows.delete(id) : newSelectedRows.add(id);
        setSelectedRows(newSelectedRows);
        console.log("Row selected:", { id, selectedRows: Array.from(newSelectedRows) });
      }, 100),
    [selectedRows]
  );

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((row) => row.id)));
    }
    setSelectAll(!selectAll);
    console.log("Toggle select all:", { selectAll: !selectAll });
  };

  if (sortedData.length === 0) {
    return (
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
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h-2m-2 0H7" />
        </svg>
        <h3 className="text-base sm:text-lg font-medium text-gray-700">No Stock Items Found</h3>
        <p className="text-[10px] sm:text-sm text-gray-500 text-center mt-2 max-w-xs sm:max-w-md">
          It looks like there are no stock items for the selected date. Try adjusting the date or adding new stock.
        </p>
      </div>
    );
  }

  return (
    <TableContainer bordered={bordered} className="relative w-full">
      <table className="w-full bg-white table-auto">
        <thead>
          <tr>
            {selectable && (
              <th className="px-2 sm:px-4 py-2 sm:py-4 text-left text-[10px] sm:text-sm text-gray-700 font-light w-10">
                <input
                  type="checkbox"
                  className="rounded h-3 w-3 sm:h-4 sm:w-4 accent-green-900 focus:ring-green-500"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-2 sm:px-4 py-2 sm:py-4 text-left text-[10px] sm:text-sm text-gray-700 font-light ${col.className || ''} ${
                  col.key === 'actions' ? 'w-20' : 'min-w-[80px] sm:min-w-[120px]'
                }`}
                onClick={() => col.key !== 'actions' && handleSort(col.key)}
              >
                {col.label} {sortKey === col.key && col.key !== 'actions' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr
              key={row.id || `row-${index}`}
              className={`transition-colors duration-200 ${
                index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {selectable && (
                <td className="px-2 sm:px-4 text-[10px] sm:text-sm py-2 sm:py-4 text-gray-900 font-light w-10">
                  <input
                    type="checkbox"
                    className="h-3 w-3 sm:h-4 sm:w-4 accent-green-900 focus:ring-green-500"
                    checked={selectedRows.has(row.id)}
                    onChange={() => handleRowSelect(row.id)}
                  />
                </td>
              )}
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-2 sm:px-4 text-[10px] sm:text-sm py-2 sm:py-4 text-gray-900 font-light ${col.className || ''} ${
                    col.key === 'actions' ? 'w-20' : 'min-w-[80px] sm:min-w-[120px] truncate'
                  }`}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key] || 'N/A'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  );
};

export default memo(Table);