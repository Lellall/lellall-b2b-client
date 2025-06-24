import React, { useState } from 'react';
import { debounce } from 'lodash';
import SupplyRequestModal from './gpt-supply-request-modal';
import { Add } from 'iconsax-react';
import Table from '@/components/ui/table';
import { useGptGetInventoryQuery, ParsedItem } from '@/redux/api/gpt-supply-request/gpt-supply.api';
import { toast } from 'react-toastify';

const columns = [
    { key: 'productName', label: 'Product Name', className: 'table-cell' },
    { key: 'unitPrice', label: 'Unit Price', className: 'hidden lg:table-cell' },
    { key: 'quantityUsed', label: 'Quantity Used', className: 'hidden lg:table-cell' },
    {
        key: 'unitOfMeasurement',
        label: 'Unit',
        className: 'hidden lg:table-cell',
        render: (item: ParsedItem) => item.unitOfMeasurement?.name || 'N/A',
    },
    { key: 'totalBaseQuantity', label: 'Total Base Quantity', className: 'hidden lg:table-cell' },
    {
        key: 'createdAt',
        label: 'Date Added',
        className: 'hidden lg:table-cell',
        render: (item: ParsedItem) => {
            const date = new Date(item.createdAt);
            return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
        },
    },
    {
        key: 'itemType',
        label: 'Category',
        className: 'table-cell',
        render: (item: ParsedItem) => item.itemType || 'N/A',
    },
];

const SupplyRequests: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<ParsedItem[]>([]);
    const subdomain = 'johnsrestaurant';
    const restaurantId = 'b4868fc6-d1fb-483f-9d95-ce5e967a9844';
    const userId = '68e21501-48c2-4d39-8fe7-312cfa41a3f5';

    const { data: inventory, isLoading, error } = useGptGetInventoryQuery(
        { subdomain, restaurantId },
        { pollingInterval: 0 }
    );
    console.log('inventory:', inventory);

    const handleSelectionChange = debounce((selected: ParsedItem[]) => {
        setSelectedItems(selected);
        if (selected.length > 0) {
            toast.info(`${selected.length} item(s) selected`, { position: 'top-right' });
        }
    }, 300);

    if (isLoading) {
        return <p className="text-sm text-gray-500">Loading inventory...</p>;
    }

    if (error) {
        return <p className="text-sm text-red-600">Error loading inventory. Please try again.</p>;
    }

    // Ensure inventory is an array before passing to Table
    const tableData = inventory || [];
    console.log('tableData:', tableData);

    return (
        <div className="p-2">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold text-gray-900">Supply Requests</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded-md border border-[#14532D] bg-[#14532D] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0F3D24] transition"
                >
                    <Add size={16} />
                    Create Supply Request
                </button>
            </div>
            <div className="">
                <Table
                    selectable={true}
                    bordered={true}
                    columns={columns}
                    data={tableData}
                    onSelectionChange={handleSelectionChange}
                />
            </div>
            <SupplyRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                subdomain={subdomain}
                restaurantId={restaurantId}
                userId={userId}
            />
        </div>
    );
};

export default SupplyRequests;