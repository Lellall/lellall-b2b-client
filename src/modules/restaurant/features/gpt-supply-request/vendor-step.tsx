// src/components/VendorStep.tsx
import React, { useState } from 'react';
import { Button } from './modal-styles';
import { useGetVendorsQuery } from '@/redux/api/vendors/vendors.api';
import { useSendToVendorsMutation } from '@/redux/api/gpt-supply-request/gpt-supply.api';
import { ArrowLeft, Send } from 'iconsax-react';

interface VendorStepProps {
    supplyRequestId: string;
    subdomain: string;
    userId: string;
    onSuccess: () => void;
    onBack: () => void;
}

const VendorStep: React.FC<VendorStepProps> = ({
    supplyRequestId,
    subdomain,
    userId,
    onSuccess,
    onBack,
}) => {
    const { data: vendors, isLoading: vendorsLoading } = useGetVendorsQuery({ subdomain });
    const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
    const [sendToVendors, { isLoading: sendLoading }] = useSendToVendorsMutation();

    const handleVendorToggle = (vendorId: string) => {
        setSelectedVendorIds((prev) =>
            prev.includes(vendorId) ? prev.filter((id) => id !== vendorId) : [...prev, vendorId]
        );
    };

    const handleSubmit = async () => {
        try {
            await sendToVendors({
                subdomain,
                gptSupplyRequestId: supplyRequestId,
                data: { vendorIds: selectedVendorIds, userId },
            }).unwrap();
            onSuccess();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-gray-900">Select Vendors</h3>
            {vendorsLoading ? (
                <p className="text-gray-500 text-sm">Loading vendors...</p>
            ) : (
                <div className="grid grid-cols-1 gap-1.5">
                    {vendors?.map((vendor) => (
                        <label key={vendor.id} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedVendorIds.includes(vendor.id)}
                                onChange={() => handleVendorToggle(vendor.id)}
                                className="h-4 w-4 rounded border-gray-300 text-[#14532D] focus:ring-0"
                            />
                            <span className="text-sm text-gray-900">{vendor.name}</span>
                        </label>
                    ))}
                </div>
            )}
            <div className="flex justify-between gap-2">
                <Button onClick={onBack}>
                    <ArrowLeft size={16} />
                    Back
                </Button>
                <Button
                    disabled={vendorsLoading || sendLoading || selectedVendorIds.length === 0}
                    onClick={handleSubmit}
                    primary
                >
                    {sendLoading ? 'Sending...' : 'Send to Vendors'}
                    <Send size={16} />
                </Button>
            </div>
        </div>
    );
};

export default VendorStep;