import React, { useState, useMemo } from "react";

interface TableProps {
  columns: { key: string; label: string; render?: (value: any, row: any) => React.ReactNode }[];
  data: Record<string, any>[];
  selectable?: boolean;
  bordered?: boolean;
}

const Table: React.FC<TableProps> = ({ columns, data, selectable, bordered = false }) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const handleSort = (key: string) => {
    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(newOrder);
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [data, sortKey, sortOrder]);

  const handleRowSelect = (index: number) => {
    const newSelectedRows = new Set(selectedRows);
    newSelectedRows.has(index) ? newSelectedRows.delete(index) : newSelectedRows.add(index);
    setSelectedRows(newSelectedRows);
  };

  const toggleSelectAll = () => {
    setSelectedRows(selectAll ? new Set() : new Set(data.map((_, index) => index)));
    setSelectAll(!selectAll);
  };

  // Empty state rendering
  if (sortedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-lg">
        <svg
          className="w-16 h-16 text-gray-400 mb-4"
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 13h-2m-2 0H7"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-700">No Staff Found</h3>
        <p className="text-sm text-gray-500 text-center mt-2">
          It looks like there are no staff members yet. Click "Add Staff" to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <table className={`w-full bg-white ${bordered ? "border border-gray-200 rounded-lg" : ""} table-auto`}>
        <thead>
          <tr className={`${bordered ? "border-b border-gray-200 first:rounded-t-lg" : ""}`}>
            {selectable && (
              <th className={`px-4 py-4 text-left text-sm text-gray-700 font-light w-12 ${bordered ? "border-r border-gray-200" : ""}`}>
                <input
                  type="checkbox"
                  className="rounded h-4 w-4 accent-green-900 focus:ring-green-500"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-4 text-left text-sm text-gray-700 font-light ${col.key === "actions" ? "w-20" : "min-w-[120px]"} ${bordered ? "border-r border-gray-200" : ""}`}
                onClick={() => col.key !== "actions" && handleSort(col.key)} // Disable sorting on actions
              >
                {col.label} {sortKey === col.key && col.key !== "actions" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr 
              key={row.id || index}
              className={`transition-colors duration-200 ${bordered ? "border-b border-gray-200 last:rounded-b-lg" : ""} ${index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-100 hover:bg-gray-200"}`}
            >
              {selectable && (
                <td className={`px-4 text-sm py-4 text-gray-900 font-light w-12 ${bordered ? "border-r border-gray-200" : ""}`}>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-green-900 focus:ring-green-500"
                    checked={selectedRows.has(index)}
                    onChange={() => handleRowSelect(index)}
                  />
                </td>
              )}
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 text-sm py-4 text-gray-900 font-light ${col.key === "actions" ? "w-20" : "min-w-[120px] truncate"} ${bordered ? "border-r border-gray-200" : ""} relative`}
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;