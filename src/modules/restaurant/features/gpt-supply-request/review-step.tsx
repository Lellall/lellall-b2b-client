// src/components/ReviewStep.tsx
import React, { useState } from 'react';
import { Button, Input } from './modal-styles';
import { useUpdateParsedItemsMutation, ParsedItem } from '@/redux/api/gpt-supply-request/gpt-supply.api';
import { ArrowLeft, ArrowRight } from 'iconsax-react';


interface ReviewStepProps {
    items: ParsedItem[];
    onUpdate: (items: ParsedItem[]) => void;
    onBack: () => void;
    supplyRequestId: string;
    subdomain: string;
    userId: string;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
    items,
    onUpdate,
    onBack,
    supplyRequestId,
    subdomain,
    userId,
}) => {
    const [editedItems, setEditedItems] = useState<ParsedItem[]>(items);
    const [updateParsedItems, { isLoading }] = useUpdateParsedItemsMutation();

    const handleChange = (index: number, field: keyof ParsedItem, value: string | number) => {
        const newItems = [...editedItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setEditedItems(newItems);
    };

    const handleSubmit = async () => {
        try {
            await updateParsedItems({
                subdomain,
                gptSupplyRequestId: supplyRequestId,
                data: { parsedJson: editedItems, userId },
            }).unwrap();
            onUpdate(editedItems);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-gray-900">Review Parsed Items</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-900">Product</th>
                            <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-900">Quantity</th>
                            <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-900">Unit Price</th>
                            <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-900">Unit</th>
                            <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-900">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {editedItems.map((item, index) => (
                            <tr key={index} className="border-t border-gray-200">
                                <td className="px-3 py-1.5">
                                    <Input
                                        value={item.productName}
                                        onChange={(e) => handleChange(index, 'productName', e.target.value)}
                                    />
                                </td>
                                <td className="px-3 py-1.5">
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleChange(index, 'quantity', Number(e.target.value))}
                                    />
                                </td>
                                <td className="px-3 py-1.5">
                                    <Input
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) => handleChange(index, 'unitPrice', Number(e.target.value))}
                                    />
                                </td>
                                <td className="px-3 py-1.5">
                                    <Input
                                        value={item.unitOfMeasurement}
                                        onChange={(e) => handleChange(index, 'unitOfMeasurement', e.target.value)}
                                    />
                                </td>
                                <td className="px-3 py-1.5">
                                    <Input
                                        value={item.notes || ''}
                                        onChange={(e) => handleChange(index, 'notes', e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between gap-2">
                <Button onClick={onBack}>
                    <ArrowLeft size={16} />
                    Back
                </Button>
                <Button disabled={isLoading} onClick={handleSubmit} primary>
                    {isLoading ? 'Updating...' : 'Next'}
                    <ArrowRight size={16} />
                </Button>
            </div>
        </div>
    );
};

export default ReviewStep;