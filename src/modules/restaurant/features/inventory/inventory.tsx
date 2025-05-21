import { useGetInventoryQuery, useGetInventoryStatsORQuery, useLazyDownloadInventoryExportQuery } from "@/redux/api/inventory/inventory.api";
import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/api/auth/auth.slice";
import Table from "@/components/ui/table";
import { format } from "date-fns";
import { moneyFormatter } from "@/utils/moneyFormatter";
import SearchBar from '@/components/search-bar/search-bar';
import { StyledButton } from '@/components/button/button-lellall';
import { Add, ExportCircle } from 'iconsax-react';
import { theme } from '@/theme/theme';
import { toast } from "react-toastify";
import { ColorRing } from 'react-loader-spinner';
import NewSupplyRequestWizard from "./request-supply";
import ResupplyRequestWizard from "./resupply-items";
import BulkUpdateModal from "./components/bulk-update-inventory-wizard";
import { useState, useMemo, useEffect, memo } from "react";
import { useBulkUpdateInventoryMutation } from "@/redux/api/inventory/inventory.api";
import ReactPaginate from 'react-paginate'; // Import react-paginate

// Optional: Add CSS for react-paginate (can be customized)
const paginationStyles = `
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 24px;
    padding: 12px;
    list-style: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    flex-wrap: wrap; /* Allow wrapping on small screens */
  }
  .pagination li {
    display: inline-flex;
    align-items: center;
  }
  .pagination li a {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0 12px;
    border-radius: 8px;
    cursor: pointer;
    color: #2d3748;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    text-decoration: none;
  }
  .pagination li a:hover:not(.disabled) {
    background: #f7fafc;
    border-color: ${theme.colors.active};
    color: ${theme.colors.active};
    transform: translateY(-1px);
  }
  .pagination li.active a {
    background: ${theme.colors.active};
    color: #ffffff;
    border-color: ${theme.colors.active};
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .pagination li.disabled a {
    color: #a0aec0;
    cursor: not-allowed;
    background: #f7fafc;
    border-color: #e2e8f0;
    opacity: 0.6;
  }
  .pagination li.break a {
    border: none;
    background: transparent;
    cursor: default;
    font-size: 14px;
    color: #2d3748;
  }
  .pagination li.previous a, .pagination li.next a {
    font-weight: 600;
    padding: 0 16px;
    gap: 8px;
  }
  .pagination li.previous a::before, .pagination li.next a::after {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border: 2px solid currentColor;
    border-top: none;
    border-right: none;
    transition: transform 0.2s ease;
  }
  .pagination li.previous a::before {
    transform: rotate(45deg);
    margin-right: 4px;
  }
  .pagination li.next a::after {
    transform: rotate(-135deg);
    margin-left: 4px;
  }
  .pagination li.previous a:hover::before, .pagination li.next a:hover::after {
    transform: translateX(2px) rotate(-135deg); /* Smooth arrow animation */
  }
  .pagination li.previous a:hover::before {
    transform: translateX(-2px) rotate(45deg);
  }
  @media (max-width: 640px) {
    .pagination {
      gap: 6px;
      padding: 8px;
    }
    .pagination li a {
      min-width: 32px;
      height: 32px;
      font-size: 12px;
      padding: 0 8px;
    }
    .pagination li.previous a, .pagination li.next a {
      padding: 0 12px;
    }
  }
`;

const InventoryComponent = () => {
  const { subdomain } = useSelector(selectAuth);
  const [isModalOpen, setModalOpen] = useState(false);
  const [resupplyModalOpen, setResupplyModalOpen] = useState(false);
  const [isBulkUpdateModalOpen, setBulkUpdateModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, any>[]>([]);
  const [page, setPage] = useState(1); // Add page state
  const limit = 10; // Set limit to match API default
  console.log(selectedItems, 'selectedItems')

  const { data, error, isLoading } = useGetInventoryQuery(
    {
      subdomain,
      page,
      limit,
      pollingInterval: 0,
    },
    { skip: !subdomain } // Prevent query if subdomain is missing
  );

  const period = 'monthly';
  const { data: stats } = useGetInventoryStatsORQuery({ subdomain, period });
  const [triggerDownload, { isFetching }] = useLazyDownloadInventoryExportQuery();
  const [bulkUpdateInventory, { isLoading: isBulkUpdating }] = useBulkUpdateInventoryMutation();

  const UnitTag = ({ unit }) => {
    const unitColors = {
      loaves: "bg-blue-500 text-white",
      liters: "bg-yellow-500 text-black",
      bag: "bg-red-500 text-white",
      number: "bg-purple-500 text-white",
      unit: "bg-orange-500 text-white",
      grams: "bg-pink-500 text-white",
      kilograms: "bg-teal-500 text-white",
      pieces: "bg-indigo-500 text-white",
      cartons: "bg-cyan-500 text-white",
      packs: "bg-lime-500 text-black",
      cup: "bg-green-600 text-white",
    };
    return (
      <span className={`px-2 py-1 rounded ${unitColors[unit] || "bg-gray-500 text-white"}`}>
        {unit}
      </span>
    );
  };

  const getProcessedInventory = (data) => {
    const items = data?.data || []; // Access data array from API response
    if (!items.length) {
      console.log("No inventory items available");
      return [];
    }
    const processed = items.map(({ id, unitPrice, openingStock, closingStock, quantityUsed, ...item }) => {
      const inventoryId = id || `temp-id-${Math.random()}`;
      if (!id) {
        console.warn(`Item missing id, using fallback: ${inventoryId}`);
      }
      return {
        ...item,
        id: inventoryId,
        inventoryId,
        unitPrice: unitPrice != null ? moneyFormatter(unitPrice) : '$0.00',
        rawUnitPrice: unitPrice ?? 0,
        category: <CategoryTag category={item.category || 'Miscellaneous'} />,
        rawCategory: item.category || 'Miscellaneous',
        unitOfMeasurement: <UnitTag unit={item.unitOfMeasurement || 'unit'} />,
        rawUnitOfMeasurement: item.unitOfMeasurement || 'unit',
        dateAdded: item.dateAdded ? format(new Date(item.dateAdded), "MMM dd, yyyy") : 'N/A',
        openingStock,
        closingStock,
        quantityUsed
      };
    });
    console.log("Processed inventory:", processed);
    return processed;
  };

  const CategoryTag = ({ category }) => {
    const categoryColors = {
      Supplies: "bg-green-500 text-white",
      Food: "bg-yellow-500 text-black",
      Equipment: "bg-blue-500 text-white",
      Beverages: "bg-red-500 text-white",
      Miscellaneous: "bg-gray-500 text-white",
      Spice: "bg-orange-500 text-white",
      Grain: "bg-brown-500 text-white",
    };
    return (
      <span className={`px-2 py-1 rounded ${categoryColors[category] || "bg-gray-500 text-white"}`}>
        {category}
      </span>
    );
  };

  const processedInventory = useMemo(() => getProcessedInventory(data), [data]);

  useEffect(() => {
    console.log("Inventory data from API:", data);
    console.log("Table props:", {
      selectable: true,
      bordered: true,
      data: processedInventory,
      columnsLength: columns.length,
      selectedItemsLength: selectedItems.length,
    });
  }, [processedInventory, selectedItems]);

  const memoizedSelectedItems = useMemo(() => {
    const items = selectedItems.map((item, index) => ({
      ...item,
      id: item.id || `temp-id-${index}`,
      inventoryId: item.id || `temp-id-${index}`,
    }));
    console.log("Memoized selectedItems:", items);
    return items;
  }, [selectedItems]);

  const handleSelectionChange = (items: Record<string, any>[]) => {
    if (
      items.length !== selectedItems.length ||
      !items.every((item, index) => item.id === selectedItems[index]?.id)
    ) {
      console.log("Table selection changed:", items);
      setSelectedItems(items || []);
    }
  };

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

  const handleBulkUpdate = async (updates: {
    inventoryId: string;
    unitPrice?: number;
    totalBaseQuantity?: number;
    unitOfMeasurement?: string;
  }[]) => {
    try {
      const payload = {
        items: updates.map((update) => {
          const originalItem = memoizedSelectedItems.find((item) => item.id === update.inventoryId);
          return {
            inventoryId: update.inventoryId,
            productName: originalItem?.productName ?? 'Unknown',
            unitPrice: update.unitPrice ?? originalItem?.rawUnitPrice ?? 0,
            unitOfMeasurement: update.unitOfMeasurement ?? originalItem?.rawUnitOfMeasurement || 'unit',
            totalBaseQuantity: update.totalBaseQuantity ?? originalItem?.totalBaseQuantity ?? 0,
            category: 'supplies',
            openingStock: update.openingStock ?? originalItem?.openingStock,
            closingStock:  update.closingStock ?? originalItem?.closingStock,
            quantityUsed:  update.quantityUsed ?? originalItem?.quantityUsed,
          };
        }),
      };
      console.log("Bulk update payload:", payload);
      await bulkUpdateInventory({ subdomain, data: payload }).unwrap();
      toast.success("Inventory updated successfully", { position: "top-right" });
    } catch (error) {
      console.error("Bulk update failed:", error);
      toast.error("Failed to update inventory", { position: "top-right" });
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

  const getRawSelectedItems = (selected) => {
    const rawItems = (selected || []).map(item => ({
      id: item.id,
      inventoryId: item.id,
      productName: item.productName,
      unitPrice: item.rawUnitPrice,
      totalBaseQuantity: item.totalBaseQuantity,
      unitOfMeasurement: item.rawUnitOfMeasurement,
      category: item.rawCategory,
      openingStock: item?.openingStock,
      closingStock: item?.closingStock,
      quantityUsed: item?.quantityUsed,
    }));
    console.log("Raw selected items:", rawItems);
    return rawItems;
  };

  // Handle page change
  const handlePageChange = ({ selected }) => {
    setPage(selected + 1); // react-paginate uses 0-based index, API uses 1-based
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
  if (error) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-500 text-sm">
      Error loading inventory: {JSON.stringify(error)}
    </div>
  );

  return (
    <div className="min-h-screen p-2 sm:p-4 bg-gray-100">
      {/* Inject pagination styles */}
      <style>{paginationStyles}</style>
      <div className="w-full sm:max-w-7xl mx-auto space-y-4">
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <SearchBar
              placeholder="Find your favorite items..."
              borderRadius="12px"
              iconColor="#000"
              iconSize={15}
              shadow={false}
            />
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
              className={`flex items-center justify-center gap-1 text-xs sm:text-sm ${isFetching ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
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
            <StyledButton
              onClick={() => setBulkUpdateModalOpen(true)}
              disabled={selectedItems.length === 0}
              style={{ padding: '6px 10px', fontWeight: 300 }}
              background={theme.colors.active}
              color={theme.colors.secondary}
              width={{ base: '100%', sm: '150px' }}
              variant="outline"
              className={`flex items-center justify-center gap-1 text-xs sm:text-sm ${selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Bulk update inventory"
            >
              <Add size={14} className="w-3 h-3 sm:w-4 sm:h-4 mr-1" color="#fff" /> Bulk Update
            </StyledButton>
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <Table
            selectable={true}
            bordered={true}
            columns={columns}
            data={processedInventory}
            onSelectionChange={handleSelectionChange}
          />
        </div>
        {/* Pagination Controls */}
        {data?.pagination && (
          <ReactPaginate
            previousLabel={'← Previous'}
            nextLabel={'Next →'}
            pageCount={data.pagination.totalPages || 1}
            onPageChange={handlePageChange}
            containerClassName={'pagination'}
            previousLinkClassName={'pagination__link'}
            nextLinkClassName={'pagination__link'}
            disabledClassName={'disabled'}
            activeClassName={'active'}
            pageClassName={'page-item'}
            pageLinkClassName={'page-link'}
            forcePage={page - 1} // Adjust for 0-based index
          />
        )}
        <NewSupplyRequestWizard isModalOpen={isModalOpen} setModalOpen={setModalOpen} />
        <ResupplyRequestWizard isModalOpen={resupplyModalOpen} setModalOpen={setResupplyModalOpen} />
        <BulkUpdateModal
          isOpen={isBulkUpdateModalOpen}
          onClose={() => setBulkUpdateModalOpen(false)}
          selectedItems={getRawSelectedItems(memoizedSelectedItems)}
          onSubmit={handleBulkUpdate}
        />
      </div>
    </div>
  );
};

export default memo(InventoryComponent);