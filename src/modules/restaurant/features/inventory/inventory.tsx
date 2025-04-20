import { useGetInventoryQuery, useGetInventoryStatsORQuery, useLazyDownloadInventoryExportQuery } from "@/redux/api/inventory/inventory.api";
import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/api/auth/auth.slice";
import Table from "@/components/ui/table";
import { format } from "date-fns";
import { moneyFormatter } from "@/utils/moneyFormatter";
import SearchBar from '@/components/search-bar/search-bar';
import { StyledButton } from '@/components/button/button-lellall';
import { Add, Filter, ExportCircle } from 'iconsax-react';
import { theme } from '@/theme/theme';
import { toast } from "react-toastify";
import NewSupplyRequestWizard from "./request-supply";
import { useState } from "react";
import ResupplyRequestWizard from "./resupply-items";

const InventoryComponent = () => {
    const { subdomain } = useSelector(selectAuth);
    const [isModalOpen, setModalOpen] = useState(false);
    const [resupplyModalOpen, setResupplyModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Assume sidebar is collapsed by default on tablets
    const { data, error, isLoading } = useGetInventoryQuery({
        subdomain,
        page: 1,
        limit: 10,
    });

    const period = 'monthly';
    const { data: stats } = useGetInventoryStatsORQuery({ subdomain, period });
    const [triggerDownload, { isFetching }] = useLazyDownloadInventoryExportQuery();

    const handleDownload = async () => {
        try {
            await triggerDownload({ subdomain, format: 'csv' }).unwrap();
            toast.success("Inventory export downloaded successfully", {
                position: "top-right",
            });
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download inventory", { position: "top-right" });
        }
    };

    const columns = [
        { key: "productName", label: "Product Name", className: 'table-cell' },
        { key: "unitPrice", label: "Unit Price", className: 'hidden lg:table-cell' },
        { key: "quantityUsed", label: "Quantity Used", className: 'hidden lg:table-cell' },
        { key: "unitOfMeasurement", label: "Unit", className: 'hidden lg:table-cell' },
        { key: "totalBaseQuantity", label: "Total Base Quantity", className: 'hidden lg:table-cell' },
        { key: "dateAdded", label: "Date Added", className: 'hidden lg:table-cell' },
        { key: "category", label: "Category", className: 'table-cell' },
    ];

    const getProcessedInventory = (data) => {
        return data.map(({ unitPrice, openingStock, closingStock, ...item }) => ({
            ...item,
            unitPrice: moneyFormatter(unitPrice),
            category: <CategoryTag category={item.category} />,
            unitOfMeasurement: <UnitTag unit={item.unitOfMeasurement} />,
            dateAdded: format(new Date(item.dateAdded), "MMM dd, yyyy"),
        }));
    };

    const CategoryTag = ({ category }) => {
        const categoryColors = {
            Supplies: "bg-green-500 text-white",
            Food: "bg-yellow-500 text-black",
            Equipment: "bg-blue-500 text-white",
            Beverages: "bg-red-500 text-white",
            Miscellaneous: "bg-gray-500 text-white",
        };

        return (
            <span className={`px-2 py-1 rounded ${categoryColors[category] || "bg-gray-500 text-white"}`}>
                {category}
            </span>
        );
    };

    const UnitTag = ({ unit }) => {
        const unitColors = {
            loaves: "bg-blue-500 text-white",
            liters: "bg-yellow-500 text-black",
            Bag: "bg-red-500 text-white",
            number: "bg-purple-500 text-white",
            unit: "bg-orange-500 text-white",
            grams: "bg-pink-500 text-white",
            kilograms: "bg-teal-500 text-white",
            pieces: "bg-indigo-500 text-white",
            cartons: "bg-cyan-500 text-white",
            packs: "bg-lime-500 text-black",
        };

        return (
            <span className={`px-2 py-1 rounded ${unitColors[unit] || "bg-gray-500 text-white"}`}>
                {unit}
            </span>
        );
    };

    const today = format(new Date(), "PPP");

    const statColors = [
        "bg-blue-100 text-blue-700",
        "bg-green-100 text-green-700",
        "bg-yellow-100 text-yellow-700",
        "bg-purple-100 text-purple-700",
        "bg-red-100 text-red-700",
    ];

    const statsData = [
        { label: "Total Products", value: stats?.totalProducts },
        { label: "Reordered Products", value: stats?.reorderedProducts },
        { label: "Low Stock Items", value: stats?.lowStockItems },
        { label: "Average Daily Usage", value: stats?.averageDailyUsage },
    ];

    if (isLoading) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p>Loading...</p>
        </div>
    );
    if (error) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-500 text-sm">
            Error loading inventory: {JSON.stringify(error)}
        </div>
    );

    return (
        <div className="min-h-screen p-2 sm:p-4 bg-gray-100">
            <div className="w-full sm:max-w-7xl mx-auto space-y-4">
                {/* Overview Card */}
                <div className="bg-white rounded-xl p-2 sm:p-4 overflow-hidden box-border max-w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 sm:pb-4 gap-2">
                        <h2 className="text-base sm:text-xl font-semibold text-gray-900 truncate">Inventory Overview</h2>
                        <p className="text-xs sm:text-sm text-gray-500">As of {today}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                        {statsData.map((item, index) => (
                            <div
                                key={index}
                                className={`p-2 sm:p-3 rounded-lg text-center font-medium max-w-full ${statColors[index % statColors.length]} hover:bg-gray-50 min-w-0`}
                            >
                                <p className="text-xs sm:text-sm truncate">{item.label}</p>
                                <p className="text-sm sm:text-lg font-bold truncate">{item.value ?? "-"}</p>
                            </div>
                        ))}
                    </div>

                    {stats?.mostUsedItem && (
                        <div className="mt-4 p-2 sm:p-3 bg-gray-100 rounded-lg shadow-sm border-l-4 border-green-500">
                            <p className="text-gray-900 font-medium text-sm sm:text-base truncate">Most Used Item</p>
                            <p className="text-gray-700 text-xs sm:text-sm mt-1 break-words">
                                {stats.mostUsedItem?.productName} – Used {stats.mostUsedItem?.quantityUsed}{" "}
                                {stats.mostUsedItem?.unitOfMeasurement}
                            </p>
                        </div>
                    )}
                </div>

                {/* Search and Buttons Section */}
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
                            aria-label="Filter inventory items"
                        >
                            <Add size={14} className="w-3 h-3 sm:w-4 sm:h-4 mr-1" color="#000" />
                            <Filter size={14} className="w-3 h-3 sm:w-4 sm:h-4 mr-1" color="#000" /> Filters
                        </StyledButton>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <StyledButton
                            onClick={handleDownload}
                            disabled={isFetching}
                            style={{ padding: '6px 10px', fontWeight: 300 }}
                            background="#fff"
                            color="#000"
                            width={{ base: '100%', sm: '150px' }}
                            variant="outline"
                            className={`flex items-center justify-center gap-1 text-xs sm:text-sm ${
                                isFetching ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                            }`}
                            aria-label="Export inventory as CSV"
                        >
                            <ExportCircle size={14} className="w-3 h-3 sm:w-4 sm:h-4 mr-1" color="#000" />
                            {isFetching ? 'Downloading...' : 'Export (CSV)'}
                        </StyledButton>
                        <StyledButton
                            onClick={() => setResupplyModalOpen(true)}
                            style={{ padding: '6px 10px', fontWeight: 300 }}
                            background="blue"
                            color={theme.colors.secondary}
                            width={{ base: '100%', sm: '150px' }}
                            variant="outline"
                            className="flex items-center justify-center gap-1 text-xs sm:text-sm"
                            aria-label="Resupply inventory"
                        >
                            <Add size={14} className="w-3 h-3 sm:w-4 sm:h-4 mr-1" color="#fff" /> Resupply Inventory
                        </StyledButton>
                        <StyledButton
                            onClick={() => setModalOpen(true)}
                            style={{ padding: '6px 10px', fontWeight: 300 }}
                            background={theme.colors.active}
                            color={theme.colors.secondary}
                            width={{ base: '100%', sm: '150px' }}
                            variant="outline"
                            className="flex items-center justify-center gap-1 text-xs sm:text-sm"
                            aria-label="Request new supply"
                        >
                            <Add size={14} className="w-3 h-3 sm:w-4 sm:h-4 mr-1" color="#fff" /> Request New Supply
                        </StyledButton>
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto w-full">
                    <Table selectable bordered columns={columns} data={getProcessedInventory(data)} />
                </div>

                <NewSupplyRequestWizard isModalOpen={isModalOpen} setModalOpen={setModalOpen} />
                <ResupplyRequestWizard isModalOpen={resupplyModalOpen} setModalOpen={setResupplyModalOpen} />
            </div>
        </div>
    );
};

export default InventoryComponent;