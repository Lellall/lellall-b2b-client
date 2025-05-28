// src/components/TemplateSupplyRequestWizard.tsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetVendorsQuery } from '@/redux/api/vendors/vendors.api';
import { useGetSupplyRequestTemplatesQuery, useApplySupplyRequestTemplateMutation } from '@/redux/api/inventory/inventory.api';
import { toast } from 'react-toastify';
import { ColorRing } from 'react-loader-spinner';

// Define unit constants matching backend
const CONTAINER_UNITS = [
    'crate', 'ventilatedCrate', 'baleArmCrate', 'basket', 'wickerBasket', 'plasticBasket',
    'box', 'carton', 'foldingBox', 'bag', 'sack', 'plasticBag', 'bottle', 'jar', 'pack',
    'tray', 'bakeryTray', 'meatTray', 'pallet', 'bin', 'tote', 'barrel', 'canister'
];
const BASE_UNITS = [
    'liter', 'milliliter', 'gallon', 'cup', 'gram', 'kilogram', 'ounce', 'pound',
    'piece', 'dozen', 'unit', 'squareMeter'
];

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-medium p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                    ✕
                </button>
                {children}
            </div>
        </div>
    );
};

type TemplateSupplyFormData = {
    supplies: {
        id?: string; // Optional ID for existing template supplies
        isNew?: boolean; // Flag to indicate new supply
        vendorId: string;
        productName: string;
        quantity: number;
        unitOfMeasurement: string;
        unitPrice: number;
        baseUnit: string;
        baseQuantityPerUnit: number;
        requestMethod: 'MANUAL' | 'BULK';
        specialNote?: string;
    }[];
};

interface TemplateSupplyRequestWizardProps {
    isModalOpen: boolean;
    setModalOpen: (open: boolean) => void;
    templateId: string | null;
    inventory?: { productName: string; closingStock: number; unitOfMeasurement: string }[];
}

const TemplateSupplyRequestWizard: React.FC<TemplateSupplyRequestWizardProps> = ({
    isModalOpen,
    setModalOpen,
    templateId,
    inventory = [],
}) => {
    const { subdomain } = useSelector(selectAuth);
    const [step, setStep] = useState(1);
    const [expandedItems, setExpandedItems] = useState<number[]>([]);
    const primaryColor = '#05431E';

    const [applyTemplate, { isLoading: isSubmitting }] = useApplySupplyRequestTemplateMutation();
    const { data: vendorData, isLoading: isVendorsLoading } = useGetVendorsQuery({
        subdomain: subdomain,
        page: 1,
        limit: 100,
    });
    const { data: templateData, isLoading: isTemplatesLoading } = useGetSupplyRequestTemplatesQuery({
        subdomain: subdomain,
    });

    const vendorOptions = vendorData?.map((item: { id: any; name: any }) => ({
        value: item.id,
        label: item.name,
    })) || [];

    const { control, handleSubmit, formState: { errors }, reset, getValues, setValue } = useForm<TemplateSupplyFormData>({
        defaultValues: {
            supplies: [],
        },
        mode: 'onChange',
    });

    const { fields: supplyFields, append: appendSupply, remove: removeSupply, update: updateSupply } = useFieldArray({
        control,
        name: 'supplies',
    });

    // Load template data when modal opens
    useEffect(() => {
        if (isModalOpen && templateId && templateData) {
            const selectedTemplate = templateData.find((t: any) => t.id === templateId);
            if (selectedTemplate) {
                const supplies = selectedTemplate.supplies.map((item: any, index: number) => ({
                    id: item.id || `template-${index}`, // Ensure each supply has an ID
                    isNew: false, // Mark as existing
                    vendorId: item.vendorId || '',
                    productName: item.productName || '',
                    quantity: item.quantity || 0,
                    unitOfMeasurement: CONTAINER_UNITS.includes(item.unitOfMeasurement) ? item.unitOfMeasurement : 'crate',
                    unitPrice: item.unitPrice || 0,
                    baseUnit: BASE_UNITS.includes(item.baseUnit) ? item.baseUnit : 'piece',
                    baseQuantityPerUnit: item.baseQuantityPerUnit || 1,
                    requestMethod: item.requestMethod || 'MANUAL',
                    specialNote: item.specialNote || '',
                }));
                setValue('supplies', mergeDuplicateProducts(supplies));
                setStep(1);
            }
        }
    }, [isModalOpen, templateId, templateData, setValue]);

    // Merge duplicate product names by summing quantities
    const mergeDuplicateProducts = (supplies: TemplateSupplyFormData['supplies']) => {
        const grouped: { [key: string]: TemplateSupplyFormData['supplies'][0] } = {};
        supplies.forEach((item) => {
            const key = `${item.productName}-${item.unitOfMeasurement}-${item.baseUnit}`;
            if (grouped[key]) {
                grouped[key].quantity += item.quantity;
                grouped[key].unitPrice = Math.max(grouped[key].unitPrice, item.unitPrice);
                grouped[key].specialNote = item.specialNote || grouped[key].specialNote;
            } else {
                grouped[key] = { ...item };
            }
        });
        return Object.values(grouped);
    };


    const onSubmit = async (data: TemplateSupplyFormData, event?: React.FormEvent) => {
        if (step !== 2) {
            event?.preventDefault();
            return;
        }

        const validSupplies = data.supplies.filter(
            (supply) =>
                supply.vendorId &&
                supply.productName &&
                supply.quantity > 0 &&
                supply.unitOfMeasurement &&
                supply.unitPrice >= 0 &&
                supply.baseUnit &&
                supply.baseQuantityPerUnit > 0
        );

        if (validSupplies.length === 0) {
            toast.error('Please add at least one complete supply request');
            return;
        }

        if (validSupplies.length < data.supplies.length) {
            toast.warn(`${data.supplies.length - validSupplies.length} incomplete supply request(s) were excluded from submission`);
        }

        try {
            const payload = {
                templateId: templateId!, // Ensure templateId is defined
                supplies: validSupplies.map((supply) => ({
                    id: supply.id,
                    isNew: supply.isNew || false,
                    vendorId: supply.vendorId,
                    productName: supply.productName,
                    quantity: supply.quantity,
                    unitOfMeasurement: supply.unitOfMeasurement,
                    unitPrice: supply.unitPrice,
                    baseUnit: supply.baseUnit,
                    baseQuantityPerUnit: supply.baseQuantityPerUnit,
                    requestMethod: supply.requestMethod,
                    specialNote: supply.specialNote,
                })),
            };

            await applyTemplate({ subdomain, data: payload }).unwrap();
            toast.success(`Successfully submitted ${validSupplies.length} supply request${validSupplies.length > 1 ? 's' : ''}!`);
            setModalOpen(false);
            reset();
            setStep(1);
            setExpandedItems([]);
        } catch (err) {
            toast.error('Failed to submit supply requests');
        }
    };

    const handleAddItem = () => {
        appendSupply({
            isNew: true, // Mark as new supply
            vendorId: '',
            productName: '',
            quantity: 0,
            unitOfMeasurement: 'crate',
            unitPrice: 0,
            baseUnit: 'piece',
            baseQuantityPerUnit: 1,
            requestMethod: 'MANUAL',
            specialNote: '',
        });
    };

    const handleUpdateItem = (index: number, updatedItem: TemplateSupplyFormData['supplies'][0]) => {
        const existingIndex = supplyFields.findIndex(
            (field, i) =>
                i !== index &&
                field.productName.toLowerCase() === updatedItem.productName.toLowerCase() &&
                field.unitOfMeasurement === updatedItem.unitOfMeasurement &&
                field.baseUnit === updatedItem.baseUnit
        );

        if (existingIndex !== -1) {
            const existingItem = supplyFields[existingIndex];
            updateSupply(existingIndex, {
                ...existingItem,
                quantity: existingItem.quantity + updatedItem.quantity,
                unitPrice: Math.max(existingItem.unitPrice, updatedItem.unitPrice),
                specialNote: updatedItem.specialNote || existingItem.specialNote,
            });
            removeSupply(index);
            toast.info(`Merged ${updatedItem.productName} with existing item`);
        } else {
            updateSupply(index, updatedItem);
        }
    };

    const applySingleVendor = (vendorId: string) => {
        const updatedSupplies = getValues('supplies').map((supply) => ({ ...supply, vendorId }));
        setValue('supplies', updatedSupplies);
        toast.success('Vendor applied to all supply requests!');
    };

    const nextStep = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const currentSupplies = getValues('supplies');
        const hasValidSupply = currentSupplies.some(
            (supply) =>
                supply.vendorId &&
                supply.productName &&
                supply.quantity > 0 &&
                supply.unitOfMeasurement &&
                supply.unitPrice >= 0 &&
                supply.baseUnit &&
                supply.baseQuantityPerUnit > 0
        );
        if (!hasValidSupply) {
            toast.error('Please fill in at least one complete supply request');
            return;
        }
        setStep(2);
    };

    const prevStep = () => setStep(1);

    const toggleExpand = (index: number) => {
        setExpandedItems((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const totalCost = getValues('supplies').reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    if (isVendorsLoading || isTemplatesLoading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <ColorRing height="80" width="80" radius="9" color={primaryColor} visible={true} />
            </div>
        );
    }

    return (
        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
            <div className="flex h-full flex-1">
                <div className="w-72 bg-gray-50 p-8 flex-shrink-0">
                    <h2 className="text-xl font-light text-gray-800 mb-10 tracking-tight">Apply Supply Template</h2>
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium ${step === 1 ? 'bg-[#05431E]' : 'bg-gray-300'}`}>
                                1
                            </div>
                            <div>
                                <p className={`text-base font-medium ${step === 1 ? 'text-[#05431E]' : 'text-gray-600'}`}>Edit Supplies</p>
                                <p className="text-sm text-gray-500">Modify template items</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium ${step === 2 ? 'bg-[#05431E]' : 'bg-gray-300'}`}>
                                2
                            </div>
                            <div>
                                <p className={`text-base font-medium ${step === 2 ? 'text-[#05431E]' : 'text-gray-600'}`}>Review</p>
                                <p className="text-sm text-gray-500">Confirm submission</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1">
                        {step === 1 && (
                            <div className="flex flex-col flex-1">
                                <div className="space-y-6 flex-1 overflow-y-auto">
                                    <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                                        {supplyFields.map((field, index) => {
                                            const inventoryItem = inventory && inventory.find(
                                                (item) => item.productName.toLowerCase() === field.productName.toLowerCase() &&
                                                    item.unitOfMeasurement === field.baseUnit
                                            );
                                            return (
                                                <div key={field.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Vendor</label>
                                                            <Controller
                                                                name={`supplies.${index}.vendorId`}
                                                                control={control}
                                                                rules={{ required: 'Vendor is required' }}
                                                                render={({ field }) => (
                                                                    <select
                                                                        {...field}
                                                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05431E] transition-all duration-200"
                                                                    >
                                                                        <option value="">Select Vendor</option>
                                                                        {vendorOptions.map((option) => (
                                                                            <option key={option.value} value={option.value}>{option.label}</option>
                                                                        ))}
                                                                    </select>
                                                                )}
                                                            />
                                                            {errors.supplies?.[index]?.vendorId && (
                                                                <p className="text-red-500 text-xs mt-1">{errors.supplies[index].vendorId.message}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Product Name
                                                                {inventoryItem && (
                                                                    <span className="text-gray-500 text-xs ml-2">
                                                                        (Stock: {inventoryItem.closingStock} {inventoryItem.unitOfMeasurement})
                                                                    </span>
                                                                )}
                                                            </label>
                                                            <Controller
                                                                name={`supplies.${index}.productName`}
                                                                control={control}
                                                                rules={{ required: 'Product name is required' }}
                                                                render={({ field }) => (
                                                                    <input
                                                                        {...field}
                                                                        placeholder="Enter product name"
                                                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05431E] transition-all duration-200"
                                                                    />
                                                                )}
                                                            />
                                                            {errors.supplies?.[index]?.productName && (
                                                                <p className="text-red-500 text-xs mt-1">{errors.supplies[index].productName.message}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                                                            <Controller
                                                                name={`supplies.${index}.quantity`}
                                                                control={control}
                                                                rules={{ required: 'Quantity is required', min: { value: 1, message: 'Quantity must be positive' } }}
                                                                render={({ field }) => (
                                                                    <input
                                                                        {...field}
                                                                        type="number"
                                                                        placeholder="0"
                                                                        value={field.value ?? ''}
                                                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : 0)}
                                                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05431E] transition-all duration-200"
                                                                    />
                                                                )}
                                                            />
                                                            {errors.supplies?.[index]?.quantity && (
                                                                <p className="text-red-500 text-xs mt-1">{errors.supplies[index].quantity.message}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Container Unit</label>
                                                            <Controller
                                                                name={`supplies.${index}.unitOfMeasurement`}
                                                                control={control}
                                                                rules={{ required: 'Container unit is required' }}
                                                                render={({ field }) => (
                                                                    <select
                                                                        {...field}
                                                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05431E] transition-all duration-200"
                                                                    >
                                                                        <option value="">Select Container Unit</option>
                                                                        {CONTAINER_UNITS.map((unit) => (
                                                                            <option key={unit} value={unit}>{unit}</option>
                                                                        ))}
                                                                    </select>
                                                                )}
                                                            />
                                                            {errors.supplies?.[index]?.unitOfMeasurement && (
                                                                <p className="text-red-500 text-xs mt-1">{errors.supplies[index].unitOfMeasurement.message}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Base Unit</label>
                                                            <Controller
                                                                name={`supplies.${index}.baseUnit`}
                                                                control={control}
                                                                rules={{ required: 'Base unit is required' }}
                                                                render={({ field }) => (
                                                                    <select
                                                                        {...field}
                                                                        className="w-full px-2 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05431E] transition-all duration-200"
                                                                    >
                                                                        <option value="">Select Base Unit</option>
                                                                        {BASE_UNITS.map((unit) => (
                                                                            <option key={unit} value={unit}>{unit}</option>
                                                                        ))}
                                                                    </select>
                                                                )}
                                                            />
                                                            {errors.supplies?.[index]?.baseUnit && (
                                                                <p className="text-red-500 text-xs mt-2">{errors.supplies[index].baseUnit.message}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Base Qty/Unit</label>
                                                            <Controller
                                                                name={`supplies.${index}.baseQuantityPerUnit`}
                                                                control={control}
                                                                rules={{ required: 'Base quantity per unit is required', min: { value: 1, message: 'Base quantity per unit must be positive' } }}
                                                                render={({ field }) => (
                                                                    <input
                                                                        {...field}
                                                                        type="number"
                                                                        step="0.01"
                                                                        placeholder="1"
                                                                        value={field.value ?? ''}
                                                                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                                                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05431E] transition-all duration-200"
                                                                    />
                                                                )}
                                                            />
                                                            {errors.supplies?.[index]?.baseQuantityPerUnit && (
                                                                <p className="text-red-500 text-xs mt-1">{errors.supplies[index].baseQuantityPerUnit.message}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price (₦)</label>
                                                            <Controller
                                                                name={`supplies.${index}.unitPrice`}
                                                                control={control}
                                                                rules={{ required: 'Unit price is required', min: { value: 0, message: 'Unit price cannot be negative' } }}
                                                                render={({ field }) => (
                                                                    <input
                                                                        {...field}
                                                                        type="number"
                                                                        step="0.01"
                                                                        placeholder="0.00"
                                                                        value={field.value ?? ''}
                                                                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                                                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05431E] transition-all duration-200"
                                                                    />
                                                                )}
                                                            />
                                                            {errors.supplies?.[index]?.unitPrice && (
                                                                <p className="text-red-500 text-xs mt-1">{errors.supplies[index].unitPrice.message}</p>
                                                            )}
                                                        </div>
                                                        <div className="col-span-2">
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Special Note</label>
                                                            <Controller
                                                                name={`supplies.${index}.specialNote`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <input
                                                                        {...field}
                                                                        placeholder="Optional note"
                                                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05431E] transition-all duration-200"
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4">
                                                        <Controller
                                                            name={`supplies.${index}.requestMethod`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={field.value === 'BULK'}
                                                                        onChange={(e) => field.onChange(e.target.checked ? 'BULK' : 'MANUAL')}
                                                                        className="h-4 w-4 text-[#05431E] focus:ring-[#05431E] border-gray-300 rounded"
                                                                    />
                                                                    Bulk Request
                                                                </label>
                                                            )}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSupply(index)}
                                                            className="text-red-500 hover:text-red-600 text-sm font-medium hover:underline"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            type="button"
                                            onClick={handleAddItem}
                                            className="px-4 py-2 text-sm text-[#05431E] border border-[#05431E] rounded-md hover:bg-[#05431E] hover:text-white transition-all duration-200"
                                        >
                                            + Add Item
                                        </button>
                                        <select
                                            onChange={(e) => applySingleVendor(e.target.value)}
                                            className="px-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05431E] transition-all duration-200"
                                        >
                                            <option value="">Apply Vendor to All</option>
                                            {vendorOptions.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-between items-center sticky bottom-0 bg-gradient-to-br from-gray-50 to-gray-100 py-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="px-6 py-2 text-sm text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="px-6 py-2 text-sm text-white bg-[#05431E] rounded-md hover:bg-[#043818] transition-all duration-200"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="flex flex-col flex-1">
                                <div className="space-y-6 flex-1 overflow-y-auto">
                                    <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">Review Your Supply Requests</h3>
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-gray-600">
                                                You have {getValues('supplies').length} supply request(s) to review
                                            </p>
                                            <p className="text-lg font-medium text-[#05431E]">
                                                Total Cost: ₦{totalCost.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    {getValues('supplies').length > 0 ? (
                                        <div className="space-y-4">
                                            {getValues('supplies').map((item, index) => {
                                                const inventoryItem = inventory && inventory.find(
                                                    (inv) => inv.productName.toLowerCase() === item.productName.toLowerCase() &&
                                                        inv.unitOfMeasurement === item.baseUnit
                                                );
                                                return (
                                                    <div
                                                        key={index}
                                                        className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                                                    >
                                                        <div
                                                            className="flex justify-between items-center p-4 cursor-pointer"
                                                            onClick={() => toggleExpand(index)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className={`w-3 h-3 rounded-full ${item.requestMethod === 'BULK' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                                                                <p className="text-lg font-medium text-gray-800">{item.productName}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {vendorOptions.find((v) => v.value === item.vendorId)?.label || 'N/A'}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <p className="text-lg font-semibold text-[#05431E]">
                                                                    ₦{(item.quantity * item.unitPrice).toFixed(2)}
                                                                </p>
                                                                <span className={`transform transition-transform duration-200 ${expandedItems.includes(index) ? 'rotate-180' : ''}`}>
                                                                    ▼
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {expandedItems.includes(index) && (
                                                            <div className="p-4 border-t border-gray-100 bg-gray-50 animate-fade-in">
                                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                                    <p><span className="font-medium text-gray-700">Quantity:</span> {item.quantity} {item.unitOfMeasurement}</p>
                                                                    <p><span className="font-medium text-gray-700">Base Unit:</span> {item.baseQuantityPerUnit} {item.baseUnit}/unit</p>
                                                                    <p><span className="font-medium text-gray-700">Total Base:</span> {(item.quantity * item.baseQuantityPerUnit).toFixed(2)} {item.baseUnit}</p>
                                                                    <p><span className="font-medium text-gray-700">Unit Price:</span> ₦{item.unitPrice.toFixed(2)}</p>
                                                                    <p><span className="font-medium text-gray-700">Method:</span> {item.requestMethod}</p>
                                                                    {inventoryItem && (
                                                                        <p><span className="font-medium text-gray-700">Current Stock:</span> {inventoryItem.closingStock} {inventoryItem.unitOfMeasurement}</p>
                                                                    )}
                                                                    {item.specialNote && (
                                                                        <p className="col-span-2"><span className="font-medium text-gray-700">Note:</span> {item.specialNote}</p>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeSupply(index)}
                                                                    className="mt-4 px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-all duration-200 shadow-sm"
                                                                >
                                                                    Remove Item
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-gray-500 text-lg font-light">No supply requests to review.</p>
                                            <p className="text-gray-400 text-sm mt-2">Please add supplies in Step 1.</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-8 flex justify-between items-center sticky bottom-0 bg-gradient-to-br from-gray-50 to-gray-100 py-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="px-6 py-2 text-sm text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-all duration-200"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || getValues('supplies').length === 0}
                                        className={`px-6 py-2 text-sm text-white rounded-md transition-all duration-200 ${isSubmitting || getValues('supplies').length === 0
                                            ? 'bg-[#05431E] opacity-60 cursor-not-allowed'
                                            : 'bg-[#05431E] hover:bg-[#043818]'
                                            }`}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </Modal>
    );
};

export default TemplateSupplyRequestWizard;