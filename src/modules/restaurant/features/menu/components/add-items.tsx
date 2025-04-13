import React, { useState } from 'react';
import { useGetInventoryQuery } from '@/redux/api/inventory/inventory.api';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetMenusQuery, useAddMenuItemMutation } from '@/redux/api/menu/menu.api';
import { toast } from 'react-toastify';
import { ColorRing } from 'react-loader-spinner'; // Import the loader

type FormData = {
    name: string;
    description: string;
    price: string;
    inventoryItems: { inventoryId: string; quantity: number }[];
    menuId: string;
    subdomain: string;
};

const MenuItemForm = ({ setModalOpen }) => {
    const { subdomain } = useSelector(selectAuth);
    const [step, setStep] = useState(1);
    const primaryColor = '#05431E';
    const { data: menus, isLoading: isMenusLoading } = useGetMenusQuery({ subdomain });
    const [addMenuItem, { isLoading: isSubmitting, error }] = useAddMenuItemMutation();

    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        defaultValues: {
            name: '',
            description: '',
            price: '',
            inventoryItems: [],
            menuId: ''
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "inventoryItems"
    });

    const { data: inventoryData, isLoading: isInventoryLoading, isError } = useGetInventoryQuery({
        subdomain: subdomain,
        page: 1,
        limit: 100
    });

    const menuOptions = menus?.map(item => ({
        value: item.id,
        label: item.name
    })) || [];
    const inventoryOptions = inventoryData?.map(item => ({
        value: item.id,
        label: item.productName
    })) || [];

    const onSubmit = async (data: FormData) => {
        try {
            const response = await addMenuItem({
                subdomain,
                menuId: data.menuId,
                data: {
                    name: data.name,
                    description: data.description,
                    price: parseFloat(data.price),
                    inventoryItems: data.inventoryItems.map(item => ({
                        inventoryId: item.inventoryId,
                        quantity: item.quantity
                    }))
                }
            }).unwrap();
            setModalOpen(false);
            toast.success('Menu item added successfully!');
            console.log('Menu item added:', response);
            reset();
            setStep(1);
        } catch (err) {
            console.error('Failed to add menu item:', err);
        }
    };
    
    const nextStep = () => setStep(2);
    const prevStep = () => setStep(1);

    // Show loader when either menus or inventory data is loading
    if (isMenusLoading || isInventoryLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <ColorRing
                    height="80"
                    width="80"
                    radius="9"
                    color={primaryColor}
                    ariaLabel="three-dots-loading"
                    visible={true}
                />
            </div>
        );
    }

    return (
        <div className="max-w-2xl min-h-[400px] mx-auto p-4 bg-white rounded-xl">
            <div className="flex">
                {/* Stepper Sidebar */}
                <div className="w-1/4 pr-4 border-r border-gray-200">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 1 ? 'text-white' : 'bg-gray-200 text-gray-600'}`}
                                style={{ backgroundColor: step === 1 ? primaryColor : undefined }}
                            >
                                1
                            </div>
                            <div>
                                <p className={`text-xs font-medium ${step === 1 ? 'text-[#05431E]' : 'text-gray-600'}`}>
                                    Basic Info
                                </p>
                                <p className="text-[10px] text-gray-500">Name, desc, price</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 2 ? 'text-white' : 'bg-gray-200 text-gray-600'}`}
                                style={{ backgroundColor: step === 2 ? primaryColor : undefined }}
                            >
                                2
                            </div>
                            <div>
                                <p className={`text-xs font-medium ${step === 2 ? 'text-[#05431E]' : 'text-gray-600'}`}>
                                    Inventory
                                </p>
                                <p className="text-[10px] text-gray-500">Add items</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="w-3/4 pl-4">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xs font-semibold text-gray-900">
                                Create Menu Item - Step {step}
                            </h2>
                        </div>

                        {step === 1 && (
                            <div className="space-y-4">
                                <Controller
                                    name="name"
                                    control={control}
                                    rules={{ required: 'Menu item name is required' }}
                                    render={({ field }) => (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Item Name</label>
                                            <input
                                                {...field}
                                                placeholder="e.g., Grilled Chicken"
                                                className={`w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                            />
                                            {errors.name && <p className="mt-1 text-[10px] text-red-500">{errors.name.message}</p>}
                                        </div>
                                    )}
                                />
                                <Controller
                                    name='menuId'
                                    control={control}
                                    rules={{ required: 'Menu is required' }}
                                    render={({ field: inventoryField }) => (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Select Menu</label>
                                            <select
                                                {...inventoryField}
                                                className="flex-1 w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 bg-white border-gray-300 transition-colors duration-200"
                                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                            >
                                                <option value="" className="text-xs text-gray-100">Select Menu</option>
                                                {menuOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                />
                                <Controller
                                    name="description"
                                    control={control}
                                    rules={{ required: 'Description is required' }}
                                    render={({ field }) => (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                            <textarea
                                                {...field}
                                                placeholder="e.g., Juicy grilled chicken breast"
                                                rows={2}
                                                className={`w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
                                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                            />
                                            {errors.description && <p className="mt-1 text-[10px] text-red-500">{errors.description.message}</p>}
                                        </div>
                                    )}
                                />
                                <Controller
                                    name="price"
                                    control={control}
                                    rules={{ required: 'Price is required', pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Enter a valid price' } }}
                                    render={({ field }) => (
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Price (N)</label>
                                            <input
                                                {...field}
                                                type="number"
                                                step="0.01"
                                                placeholder="e.g., 12.99"
                                                className={`w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${errors.price ? 'border-red-400' : 'border-gray-300'}`}
                                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                            />
                                            {errors.price && <p className="mt-1 text-[10px] text-red-500">{errors.price.message}</p>}
                                        </div>
                                    )}
                                />
                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="px-4 py-1.5 text-sm text-white rounded-md hover:bg-[#043818] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
                                        style={{ backgroundColor: primaryColor, '--tw-ring-color': primaryColor } as React.CSSProperties}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Inventory Items</label>
                                    {isError && <p className="text-xs text-red-500">Error loading items</p>}
                                    <div className="space-y-2 mb-3 max-h-72 overflow-y-auto pr-1">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                                                <Controller
                                                    name={`inventoryItems.${index}.inventoryId`}
                                                    control={control}
                                                    rules={{ required: 'Item is required' }}
                                                    defaultValue={field.inventoryId || ''}
                                                    render={({ field: inventoryField }) => (
                                                        <select
                                                            {...inventoryField}
                                                            className="flex-1 px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 bg-white border-gray-300 transition-colors duration-200"
                                                            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                        >
                                                            <option value="">Select item</option>
                                                            {inventoryOptions.map(option => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                />
                                                <Controller
                                                    name={`inventoryItems.${index}.quantity`}
                                                    control={control}
                                                    rules={{ required: 'Qty required', min: { value: 0.1, message: 'Min 0.1' } }}
                                                    defaultValue={field.quantity || 0.5}
                                                    render={({ field: quantityField }) => (
                                                        <input
                                                            {...quantityField}
                                                            type="number"
                                                            step="0.1"
                                                            placeholder="Qty"
                                                            className="w-16 px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 border-gray-300 transition-colors duration-200"
                                                            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                                        />
                                                    )}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="text-red-500 hover:text-red-600 transition-colors text-sm"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => append({ inventoryId: '', quantity: 0.5 })}
                                        className="flex items-center gap-1 px-3 py-1 text-sm border rounded-md hover:bg-gray-50 transition-colors"
                                        style={{ color: primaryColor, borderColor: primaryColor }}
                                    >
                                        <span>+</span> Add Item
                                    </button>
                                    {errors.inventoryItems && (
                                        <p className="mt-1 text-[10px] text-red-500">
                                            {errors.inventoryItems.message || 'Add at least one item'}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-6 flex justify-between">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
                                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`px-4 py-1.5 text-sm text-white rounded-md hover:bg-[#043818] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        style={{ backgroundColor: primaryColor, '--tw-ring-color': primaryColor } as React.CSSProperties}
                                    >
                                        {isSubmitting ? (
                                            <ColorRing
                                                height="20"
                                                width="20"
                                                radius="9"
                                                color="#ffffff"
                                                ariaLabel="three-dots-loading"
                                                visible={true}
                                            />
                                        ) : 'Create'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MenuItemForm;