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
        { key: "productName", label: "Name" },
        { key: "openingStock", label: "O/Stock" },
        { key: "added", label: "Added" },
        { key: "quantityUsed", label: "Quantity Used" },
        { key: "closingStock", label: "C/Stock" },
        { key: "unitPrice", label: "Unit Price" },
        { key: "grandTotal", label: "Grand Total" },
        { key: "unitOfMeasurement", label: "Unit of Measurement" },
    ];

    const { subdomain } = useSelector(selectAuth);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Ensure RTK Query refetches when date changes
    const { data, error, isLoading, refetch: refetchStockSheet } = useGetStockSheetQuery(
        { subdomain, date: selectedDate },
        { refetchOnMountOrArgChange: true }
    );
    const { data: stats, refetch: refetchStats } = useGetStockSheetStatsQuery(
        { subdomain, date: selectedDate },
        { refetchOnMountOrArgChange: true }
    );
    const [triggerStockSheetDownload, { isFetching: isFetchingStockSheet }] = useLazyDownloadStockSheetExportQuery();

    // Refetch data when selectedDate changes
    useEffect(() => {
        refetchStockSheet();
        refetchStats();
    }, [selectedDate, refetchStockSheet, refetchStats]);

    const handleStockSheetDownload = async () => {
        if (!subdomain) {
            toast.error("Subdomain not found", { position: "top-right" });
            return;
        }
        try {
            await triggerStockSheetDownload({
                subdomain,
                format: 'csv',
                date: selectedDate
            }).unwrap();
            toast.success("Stock sheet downloaded successfully", { position: "top-right" });
        } catch (error) {
            console.error("Stock sheet download failed:", error);
            toast.error("Failed to download stock sheet", { position: "top-right" });
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
            <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-500">
                Error loading stock sheet: {JSON.stringify(error)}
            </div>
        );
    }

    const today = format(new Date(selectedDate), "PPP");

    const statColors = [
        "bg-blue-100 text-blue-700",
        "bg-green-100 text-green-700",
        "bg-yellow-100 text-yellow-700",
        "bg-purple-100 text-purple-700",
        "bg-red-100 text-red-700",
    ];

    const round = (value) => (value !== undefined ? parseFloat(value).toFixed(2) : "-");

    const statsData = [
        { label: "Total Stock Value", value: stats?.totalStockValue ?? "-" },
        { label: "Total Added Stock", value: round(stats?.totalAddedStock) },
        { label: "Total Quantity Used", value: round(stats?.totalQuantityUsed) },
        { label: "Average Daily Usage", value: `${round(stats?.averageDailyUsage)}%` },
        { label: "Low Stock Items", value: stats?.lowStockItems ?? "-" },
    ];

    const tableData = data?.map(item => ({
        ...item,
        openingStock: round(item.openingStock),
        added: round(item.added),
        quantityUsed: round(item.quantityUsed),
        closingStock: round(item.closingStock),
        unitPrice: moneyFormatter(item.unitPrice),
        grandTotal: round(item.grandTotal),
    })) ?? [];

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white rounded-xl p-6 w-full">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Stock Summary</h2>
                        <div className="flex items-center gap-4">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="border rounded-md p-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-gray-500 text-sm">As of {today}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
                        {statsData.map((item, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg text-center font-medium ${statColors[index % statColors.length]}`}
                            >
                                <p className="text-sm">{item.label}</p>
                                <p className="text-xl font-bold">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <SearchBar
                            placeholder="Search Items"
                            width="300px"
                            height="42px"
                            border="1px solid #fff"
                            borderRadius="10px"
                            backgroundColor="#ffffff"
                            shadow={false}
                            fontSize="11px"
                            color="#444"
                            inputPadding="10px"
                            placeholderColor="#bbb"
                            iconColor="#ccc"
                            iconSize={15}
                        />
                        <StyledButton
                            style={{ padding: '10px 20px', fontWeight: 300 }}
                            background="#fff"
                            color="#000"
                            width="120px"
                            variant="outline"
                        >
                            <Filter size="20" color="#000" className="mr-1" /> Filters
                        </StyledButton>
                    </div>
                    <StyledButton
                        style={{ padding: '10px 20px', fontWeight: 300 }}
                        background={theme.colors.active}
                        color={theme.colors.secondary}
                        width="150px"
                        variant="outline"
                        onClick={handleStockSheetDownload}
                        disabled={isFetchingStockSheet}
                        className={`px-4 py-2 bg-green-500 text-white rounded ${isFetchingStockSheet ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
                    >
                        <ExportCircle size="20" color="#fff" className="mr-1" />
                        {isFetchingStockSheet ? 'Downloading...' : 'Export Sheet (CSV)'}
                    </StyledButton>
                </div>

                <Table
                    selectable
                    bordered
                    columns={columns}
                    data={tableData}
                />
            </div>
        </div>
    );
};

export default StockSheet;