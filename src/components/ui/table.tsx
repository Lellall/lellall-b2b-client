import React, { useState, useMemo } from "react";

interface TableProps {
    columns: { key: string; label: string; render?: (row: any) => React.ReactNode }[];
    data: Record<string, any>[];
    actions?: (row: Record<string, any>) => React.ReactNode;
    selectable?: boolean;
}

const Table: React.FC<TableProps> = ({ columns, data, actions, selectable }) => {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [selectedCols, setSelectedCols] = useState<Set<string>>(new Set());
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
        if (newSelectedRows.has(index)) {
            newSelectedRows.delete(index);
        } else {
            newSelectedRows.add(index);
        }
        setSelectedRows(newSelectedRows);
    };

    const handleColumnSelect = (key: string) => {
        const newSelectedCols = new Set(selectedCols);
        if (newSelectedCols.has(key)) {
            newSelectedCols.delete(key);
        } else {
            newSelectedCols.add(key);
        }
        setSelectedCols(newSelectedCols);
    };

    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(data.map((_, index) => index)));
        }
        setSelectAll(!selectAll);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead>
                    <tr>
                        {selectable && (
                            <th className="px-4 py-4 text-left text-sm text-gray-700 font-light">
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
                                className={`px-4 py-4 text-left text-sm text-gray-700 font-light cursor-pointer ${
                                    selectedCols.has(col.key) ? "" : ""
                                }`}
                                onClick={() => handleSort(col.key)}
                            >
                                {col.label} {sortKey === col.key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                            </th>
                        ))}
                        {actions && <th className="px-4 py-4 text-left text-sm text-gray-700 font-light">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, index) => (
                        <tr
                            key={index}
                            className={`transition-colors duration-200 ${
                                index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-100 hover:bg-gray-200"
                            }`}
                        >
                            {selectable && (
                                <td className="px-4 text-sm py-4 text-gray-900 font-light">
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
                                    className={`px-4 text-sm py-4 text-gray-900 font-light cursor-pointer ${
                                        selectedCols.has(col.key) ? "" : ""
                                    }`}
                                    onClick={() => handleColumnSelect(col.key)}
                                >
                                    {col.render ? col.render(row) : row[col.key]}
                                </td>
                            ))}
                            {actions && (
                                <td className="px-4 text-sm py-4 text-gray-900 font-light">
                                    {actions(row)}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
