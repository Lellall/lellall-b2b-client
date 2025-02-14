import React, { useState, useMemo } from "react";

interface TableProps {
    columns: { key: string; label: string; render?: (row: any) => React.ReactNode }[];
    data: Record<string, any>[];
    actions?: (row: Record<string, any>) => React.ReactNode;
    selectable?: boolean;
    bordered?: boolean;
}

const Table: React.FC<TableProps> = ({ columns, data, actions, selectable, bordered = false }) => {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [selectedCols, setSelectedCols] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

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

    const handleColumnSelect = (key: string) => {
        const newSelectedCols = new Set(selectedCols);
        newSelectedCols.has(key) ? newSelectedCols.delete(key) : newSelectedCols.add(key);
        setSelectedCols(newSelectedCols);
    };

    const toggleSelectAll = () => {
        setSelectedRows(selectAll ? new Set() : new Set(data.map((_, index) => index)));
        setSelectAll(!selectAll);
    };

    return (
        <div className={`overflow-x-auto ${bordered ? "border border-gray-100 rounded-lg overflow-hidden" : ""}`}>
            <table className={`min-w-full bg-white shadow-md ${bordered ? "border border-gray-200 rounded-lg overflow-hidden" : ""}`}>
                <thead>
                    <tr className={`${bordered ? "border-b border-gray-200 first:rounded-t-lg" : ""}`}>
                        {selectable && (
                            <th className={`px-4 py-4 text-left text-sm text-gray-700 font-light ${bordered ? "border-r border-gray-200" : ""}`}>
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
                                className={`px-4 py-4 text-left text-sm text-gray-700 font-light cursor-pointer ${bordered ? "border-r border-gray-200" : ""}`}
                                onClick={() => handleSort(col.key)}
                            >
                                {col.label} {sortKey === col.key ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                            </th>
                        ))}
                        {actions && <th className={`px-4 py-4 text-left text-sm text-gray-700 font-light ${bordered ? "border-r border-gray-200" : ""}`}>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, index) => (
                        <tr key={index} className={`transition-colors duration-200 ${bordered ? "border-b border-gray-200 last:rounded-b-lg" : ""} ${index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-100 hover:bg-gray-200"}`}>
                            {selectable && (
                                <td className={`px-4 text-sm py-4 text-gray-900 font-light ${bordered ? "border-r border-gray-200" : ""}`}>
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
                                    className={`px-4 text-sm py-4 text-gray-900 font-light cursor-pointer ${bordered ? "border-r border-gray-200" : ""}`}
                                    onClick={() => handleColumnSelect(col.key)}
                                >
                                    {col.render ? col.render(row) : row[col.key]}
                                </td>
                            ))}
                            {actions && (
                                <td className={`px-4 text-sm py-4 text-gray-900 font-light ${bordered ? "border-r border-gray-200" : ""}`}>
                                    {actions(row, index, openDropdown, setOpenDropdown)}
                                </td>
                            )}
                            {/* {actions && <td className={`px-4 text-sm py-4 text-gray-900 font-light ${bordered ? "border-r border-gray-200" : ""}`}>{actions(row)}</td>} */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// export default Table;
// const Table: React.FC<TableProps> = ({ columns, data, actions, selectable, bordered = false }) => {
//     const [openDropdown, setOpenDropdown] = useState<number | null>(null);

//     return (
//         <div className={`overflow-x-auto ${bordered ? "border border-gray-200 rounded-lg overflow-hidden" : ""}`}>
//             <table className={`min-w-full bg-white shadow-md ${bordered ? "border border-gray-200 rounded-lg overflow-hidden" : ""}`}>
//                 <thead>
//                     <tr className={`${bordered ? "border-b border-gray-200 first:rounded-t-lg" : ""}`}>
//                         {selectable && (
//                             <th className={`px-4 py-4 text-left text-sm text-gray-700 font-light ${bordered ? "border-r border-gray-200" : ""}`}>
//                                 <input
//                                     type="checkbox"
//                                     className="rounded h-4 w-4 accent-green-900 focus:ring-green-500"
//                                 />
//                             </th>
//                         )}
//                         {columns.map((col) => (
//                             <th key={col.key} className={`px-4 py-4 text-left text-sm text-gray-700 font-light cursor-pointer ${bordered ? "border-r border-gray-200" : ""}`}>
//                                 {col.label}
//                             </th>
//                         ))}
//                         {actions && <th className={`px-4 py-4 text-left text-sm text-gray-700 font-light ${bordered ? "border-r border-gray-200" : ""}`}>Actions</th>}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {data.map((row, index) => (
//                         <tr key={index} className={`transition-colors duration-200 ${bordered ? "border-b border-gray-200 last:rounded-b-lg" : ""} ${index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-100 hover:bg-gray-200"}`}>
//                             {selectable && (
//                                 <td className={`px-4 text-sm py-4 text-gray-900 font-light ${bordered ? "border-r border-gray-200" : ""}`}>
//                                     <input type="checkbox" className="h-4 w-4 accent-green-900 focus:ring-green-500" />
//                                 </td>
//                             )}
//                             {columns.map((col) => (
//                                 <td key={col.key} className={`px-4 text-sm py-4 text-gray-900 font-light cursor-pointer ${bordered ? "border-r border-gray-200" : ""}`}>
//                                     {col.render ? col.render(row) : row[col.key]}
//                                 </td>
//                             ))}
//                             {actions && (
//                                 <td className={`px-4 text-sm py-4 text-gray-900 font-light ${bordered ? "border-r border-gray-200" : ""}`}>
//                                     {actions(row, index, openDropdown, setOpenDropdown)}
//                                 </td>
//                             )}
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// };
export default Table;