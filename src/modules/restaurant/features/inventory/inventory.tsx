import { useGetInventoryQuery, useGetInventoryStatsORQuery, useLazyDownloadInventoryExportQuery } from "@/redux/api/inventory/inventory.api";
import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/api/auth/auth.slice";
import { Button } from "@/components/ui/button";
import Table from "@/components/ui/table";
import { format } from "date-fns";
import { moneyFormatter } from "@/utils/moneyFormatter";
import StatCard from "./components/stat-card";
import ProductsTable from "./components/products-table";
import { NewOrderDialog } from "./components/add-product-dialog";
import { RequestSupplyDialog } from "./components/request-supply-dialog";
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
    const [newModalOpen, setNewModalOpen] = useState(false);
    const [resupplyModalOpen, setResupplyModalOpen] = useState(false);
    const { data, error, isLoading } = useGetInventoryQuery({
        subdomain,
        page: 1,
        limit: 10,
    });
    console.log(subdomain,'subdomain');
    
    const period = 'monthly'
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
        }
    };

    const columns = [
        { key: "productName", label: "Product Name" },
        { key: "unitPrice", label: "Unit Price" },
        { key: "quantityUsed", label: "Quantity Used" },
        { key: "unitOfMeasurement", label: "Unit" },
        { key: "totalBaseQuantity", label: "Total Base Quantity" },
        { key: "dateAdded", label: "Date Added" },
        { key: "category", label: "Category" },
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

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading inventory</p>;

    return (
        <div>
            <div className="bg-gray-50 mb-5 bg-white rounded-xl p-6 w-full">
                <div className="flex justify-between items-center border-b pb-4">
                    <h2 className="text-2xl font-semibold text-gray-900">Inventory Overview</h2>
                    <p className="text-gray-500 text-sm">As of {today}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-6">
                    {statsData.map((item, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg text-center font-medium ${statColors[index % statColors.length]}`}
                        >
                            <p className="text-sm">{item.label}</p>
                            <p className="text-xl font-bold">{item.value ?? "-"}</p>
                        </div>
                    ))}
                </div>

                {stats?.mostUsedItem && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-sm border-l-4 border-green-500">
                        <p className="text-gray-900 font-medium text-lg">Most Used Item</p>
                        <p className="text-gray-700 text-sm mt-1">
                            {stats.mostUsedItem.productName} - {stats.mostUsedItem.quantityUsed?.toFixed(2)} units
                            <span className="font-semibold"> (N{stats.mostUsedItem.cost?.toFixed(2)})</span>
                        </p>
                    </div>
                )}
            </div>
            <div className="flex my-5 justify-between">
                <div className='flex'>
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
                    <div className='ml-3'>
                        <StyledButton
                            style={{ padding: '20px 15px', fontWeight: 300 }} background={'#fff'} color="#000" width='100px' variant="outline">
                            <Add size="32" color="#000" />  <Filter size="32" color="#000" /> Filters
                        </StyledButton>
                    </div>
                </div>
                <div className="flex">
                    <StyledButton
                        onClick={handleDownload}
                        disabled={isFetching}
                        className={`px-4 py-2 bg-blue-500 text-white rounded ${isFetching ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                            }`}
                        style={{ padding: '20px 15px', fontWeight: 300 }} background={'#fff'} color="#000" width='150px' variant="outline">
                        <ExportCircle size="32" color="#000" />
                        {isFetching ? 'Downloading...' : 'Export (CSV)'}
                    </StyledButton>
                    <div className='ml-3'>
                        <StyledButton
                            onClick={() => setResupplyModalOpen(true)}
                            style={{ padding: '21px 15px', fontWeight: 300 }} background={'blue'} color={theme.colors.secondary} width='150px' variant="outline">
                            <Add size="32" color="#fff" /> Resupply Inventory
                        </StyledButton>
                    </div>
                    <div className='ml-3'>
                        <StyledButton
                            onClick={() => setModalOpen(true)}
                            style={{ padding: '21px 15px', fontWeight: 300 }} background={theme.colors.active} color={theme.colors.secondary} width='150px' variant="outline">
                            <Add size="32" color="#fff" /> Request New Supply
                        </StyledButton>
                    </div>
                </div>
            </div>
            <div className="min-h-screenp-4">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="bg-white rounded-lg">
                        <Table selectable bordered columns={columns} data={getProcessedInventory(data)} />
                    </div>
                </div>
            </div>
            <NewSupplyRequestWizard isModalOpen={isModalOpen} setModalOpen={setModalOpen} />
            <ResupplyRequestWizard isModalOpen={resupplyModalOpen} setModalOpen={setResupplyModalOpen} />
        </div>
    );
};

export default InventoryComponent;