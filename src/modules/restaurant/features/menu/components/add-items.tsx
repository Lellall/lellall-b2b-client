import React, { useState, useEffect } from 'react';
import { useGetInventoryQuery } from '@/redux/api/inventory/inventory.api';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetMenusQuery, useAddMenuItemMutation, useBulkEditMenuItemMutation } from '@/redux/api/menu/menu.api';
import { toast } from 'react-toastify';
import { ColorRing } from 'react-loader-spinner';
import Select from 'react-select'; // Added import

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  menuId: string;
  inventoryItems: { inventoryId: string; quantity: number }[];
};

type FormData = {
  name: string;
  description: string;
  price: number;
  inventoryItems: { inventoryId: string; quantity: number }[];
  menuId: string;
  newMenuId: string;
};

type MenuItemFormProps = {
  setModalOpen: (open: boolean) => void;
  itemToEdit?: MenuItem;
};

const MenuItemForm = ({ setModalOpen, itemToEdit }: MenuItemFormProps) => {
  const { subdomain } = useSelector(selectAuth);
  const [step, setStep] = useState(1);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 640);
  const primaryColor = '#05431E';

  const { data: menus, isLoading: isMenusLoading, error: menusError } = useGetMenusQuery(
    { subdomain },
    { skip: !subdomain }
  );
  const [addMenuItem, { isLoading: isSubmittingAdd, error: submitAddError }] = useAddMenuItemMutation();
  const [bulkEditMenuItem, { isLoading: isSubmittingEdit, error: submitEditError }] = useBulkEditMenuItemMutation();
  const { data: inventoryData, isLoading: isInventoryLoading, error: inventoryError } = useGetInventoryQuery(
    { subdomain, page: 1, limit: 50 },
    { skip: !subdomain }
  );

  const isEditing = !!itemToEdit;

  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    defaultValues: isEditing
      ? {
        name: itemToEdit.name,
        description: itemToEdit.description || '',
        price: itemToEdit.price,
        inventoryItems: itemToEdit.inventoryItems,
        menuId: itemToEdit.menuId,
        newMenuId: itemToEdit.menuId,
      }
      : {
        name: '',
        description: '',
        price: 0,
        inventoryItems: [],
        menuId: '',
        newMenuId: '',
      },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'inventoryItems',
  });

  useEffect(() => {
    if (isEditing && itemToEdit?.menuId) {
      console.log('Editing mode - menuId:', itemToEdit.menuId);
      console.log('Available menuOptions:', menus?.map(item => ({ id: item.id, name: item.name })));
      setValue('menuId', itemToEdit.menuId);
      setValue('newMenuId', itemToEdit.menuId);
    }
  }, [isEditing, itemToEdit, menus, setValue]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuOptions = menus?.map(item => ({
    value: item.id,
    label: item.name,
  })) || [];

  const inventoryOptions = inventoryData?.data.map(item => ({
    value: item.id,
    label: item.productName,
  })) || [];

  const onSubmit = async (data: FormData) => {
    console.log('Form submitted with data:', data);
    if (!subdomain) {
      toast.error('Subdomain not found');
      return;
    }

    try {
      if (isEditing) {
        await bulkEditMenuItem({
          subdomain,
          menuId: data.menuId,
          data: {
            items: [
              {
                menuItemId: itemToEdit.id,
                name: data.name,
                description: data.description,
                price: Number(data.price),
                newMenuId: data.newMenuId || undefined,
                inventoryItems: data.inventoryItems.map(item => ({
                  inventoryId: item.inventoryId,
                  quantity: Number(item.quantity),
                })),
              },
            ],
          },
        }).unwrap();
        toast.success('Menu item updated successfully!');
      } else {
        await addMenuItem({
          subdomain,
          menuId: data.menuId,
          data: {
            name: data.name,
            description: data.description,
            price: Number(data.price),
            inventoryItems: data.inventoryItems.map(item => ({
              inventoryId: item.inventoryId,
              quantity: Number(item.quantity),
            })),
          },
        }).unwrap();
        toast.success('Menu item added successfully!');
      }
      setModalOpen(false);
      reset();
      setStep(1);
    } catch (err) {
      toast.error(isEditing ? 'Failed to update menu item' : 'Failed to add menu item');
      console.error(isEditing ? 'Failed to update menu item:' : 'Failed to add menu item:', err);
    }
  };

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  if (!subdomain) {
    return <div className="text-red-500 text-center p-4">Error: Subdomain not found</div>;
  }

  if (isMenusLoading || isInventoryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <ColorRing height="50" width="50" color={primaryColor} ariaLabel="loading" visible />
      </div>
    );
  }

  if (menusError || inventoryError) {
    return <div className="text-red-500 text-center p-4">Error loading data</div>;
  }

  return (
    <div className={`w-full ${isMobile ? 'max-w-full p-3' : 'max-w-4xl min-h-[400px] mx-auto p-4'} bg-white rounded-xl`}>
      <div className={isMobile ? 'mb-3' : 'flex flex-row'}>
        {isMobile ? (
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {isEditing ? 'Edit Menu Item' : 'Create Menu Item'} - Step {step} of 2
            </h2>
            <div className="flex gap-1 mt-2">
              <div className={`w-4 h-4 rounded-full ${step === 1 ? 'bg-[#05431E]' : 'bg-gray-300'}`}></div>
              <div className={`w-4 h-4 rounded-full ${step === 2 ? 'bg-[#05431E]' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        ) : (
          <div className="w-1/4 pr-4 border-r border-gray-200">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 1 ? 'text-white' : 'bg-gray-200 text-gray-600'
                    }`}
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
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 2 ? 'text-white' : 'bg-gray-200 text-gray-600'
                    }`}
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
        )}
        <div className={isMobile ? '' : 'w-3/4 pl-4'}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {!isMobile && (
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-semibold text-gray-900">
                  {isEditing ? 'Edit Menu Item' : 'Create Menu Item'} - Step {step}
                </h2>
              </div>
            )}
            {step === 1 && (
              <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Menu item name is required' }}
                  render={({ field }) => (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 truncate">Item Name</label>
                      <input
                        {...field}
                        placeholder="e.g., Grilled Chicken"
                        className={`w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${errors.name ? 'border-red-400' : 'border-gray-300'
                          }`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                      />
                      {errors.name && <p className="mt-1 text-[10px] text-red-500">{errors.name.message}</p>}
                    </div>
                  )}
                />
                <Controller
                  name="menuId"
                  control={control}
                  rules={{ required: 'Menu is required' }}
                  render={({ field }) => (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 truncate">
                        {isEditing ? 'Current Menu' : 'Select Menu'}
                      </label>
                      <select
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value)}
                        className="w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 bg-white border-gray-300 transition-colors duration-200"
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        disabled={isEditing}
                      >
                        <option value="" className="text-sm">Select Menu</option>
                        {menuOptions.map(option => (
                          <option key={option.value} value={option.value} className="text-sm">
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.menuId && <p className="mt-1 text-[10px] text-red-500">{errors.menuId.message}</p>}
                    </div>
                  )}
                />
                {isEditing && (
                  <Controller
                    name="newMenuId"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1 truncate">Move to New Menu (Optional)</label>
                        <select
                          {...field}
                          value={field.value || ''}
                          onChange={e => field.onChange(e.target.value)}
                          className="w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 bg-white border-gray-300 transition-colors duration-200"
                          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        >
                          <option value="" className="text-sm">Keep in Current Menu</option>
                          {menuOptions.map(option => (
                            <option key={option.value} value={option.value} className="text-sm">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  />
                )}
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: 'Description is required' }}
                  render={({ field }) => (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 truncate">Description</label>
                      <textarea
                        {...field}
                        placeholder="e.g., Juicy grilled chicken breast"
                        rows={isMobile ? 3 : 2}
                        className={`w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${errors.description ? 'border-red-400' : 'border-gray-300'
                          }`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                      />
                      {errors.description && <p className="mt-1 text-[10px] text-red-500">{errors.description.message}</p>}
                    </div>
                  )}
                />
                <Controller
                  name="price"
                  control={control}
                  rules={{
                    required: 'Price is required',
                    min: { value: 0.01, message: 'Price must be greater than 0' },
                  }}
                  render={({ field }) => (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 truncate">Price (₦)</label>
                      <input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="e.g., 12.99"
                        className={`w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${errors.price ? 'border-red-400' : 'border-gray-300'
                          }`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                      {errors.price && <p className="mt-1 text-[10px] text-red-500">{errors.price.message}</p>}
                    </div>
                  )}
                />
                <div className={isMobile ? 'mt-4 flex justify-end' : 'mt-6 flex justify-end'}>
                  <button
                    type="button"
                    onClick={nextStep}
                    className={`px-4 ${isMobile ? 'py-2' : 'py-1.5'} text-sm text-white rounded-md hover:bg-[#043818] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
                    style={{ backgroundColor: primaryColor, '--tw-ring-color': primaryColor } as React.CSSProperties}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 truncate">Inventory Items</label>
                  {inventoryError && <p className="text-[10px] text-red-500">Error loading items</p>}
                  <div className={`space-y-2 mb-3 ${isMobile ? 'max-h-60' : 'max-h-72'} overflow-y-auto pr-1`}>
                    {fields.map((field, index) => (
                      <div key={field.id} className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center gap-2'} p-2 bg-gray-50 rounded-md border border-gray-200`}>
                        <Controller
                          name={`inventoryItems.${index}.inventoryId`}
                          control={control}
                          rules={{ required: 'Item is required' }}
                          render={({ field }) => {
                            // Debug logs
                            console.log('Field value:', field.value);
                            console.log('Inventory options:', inventoryOptions);

                            // Define option type for TypeScript (if using TypeScript)
                            type OptionType = { value: string; label: string };

                            // Ensure options include placeholder
                            const selectOptions: OptionType[] = [
                              { value: '', label: 'Select item' },
                              ...inventoryOptions,
                            ];

                            // Find the selected option or default to placeholder
                            const selectedValue = selectOptions.find(option => option.value === field.value) || selectOptions[0];

                            return (
                              <div className="relative w-full">
                                <Select
                                  options={selectOptions}
                                  value={selectedValue}
                                  onChange={(selectedOption: OptionType | null) => {
                                    console.log('Selected option:', selectedOption);
                                    field.onChange(selectedOption ? selectedOption.value : '');
                                  }}
                                  placeholder="Select item"
                                  isSearchable
                                  isOptionDisabled={(option) => option.value === ''} // Disable placeholder option
                                  className={`w-full text-sm ${isMobile ? '' : 'flex-1'}`}
                                  styles={{
                                    control: (provided) => ({
                                      ...provided,
                                      borderColor: errors.inventoryItems?.[index]?.inventoryId ? '#f87171' : '#d1d5db',
                                      borderRadius: '0.375rem',
                                      padding: '0.25rem 0.5rem',
                                      fontSize: '0.875rem',
                                      lineHeight: '1.25rem',
                                      boxShadow: 'none',
                                      minHeight: '38px',
                                      width: '100%', // Ensure control takes full width
                                      '&:hover': {
                                        borderColor: errors.inventoryItems?.[index]?.inventoryId ? '#f87171' : '#9ca3af',
                                      },
                                      '&:focus-within': {
                                        borderColor: primaryColor,
                                        boxShadow: `0 0 0 2px ${primaryColor}`,
                                      },
                                    }),
                                    menu: (provided) => ({
                                      ...provided,
                                      zIndex: 9999,
                                      width: '100%', // Match control width
                                      minWidth: '100%', // Ensure minimum width matches control
                                      maxWidth: '100%', // Prevent menu from exceeding control width
                                      maxHeight: '200px',
                                      overflowY: 'auto',
                                      borderRadius: '0.375rem',
                                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                    }),
                                    option: (provided, state) => ({
                                      ...provided,
                                      fontSize: '0.875rem',
                                      backgroundColor: state.isSelected ? primaryColor : state.isFocused ? '#f3f4f6' : 'white',
                                      color: state.isSelected ? 'white' : '#1f2937',
                                      whiteSpace: 'normal', // Allow text wrapping for long labels
                                      wordBreak: 'break-word', // Break long words
                                      padding: '8px 12px',
                                      '&:hover': {
                                        backgroundColor: state.isSelected ? primaryColor : '#f3f4f6',
                                      },
                                    }),
                                    singleValue: (provided) => ({
                                      ...provided,
                                      color: '#1f2937',
                                      whiteSpace: 'normal', // Allow wrapping in selected value
                                      wordBreak: 'break-word',
                                    }),
                                    placeholder: (provided) => ({
                                      ...provided,
                                      color: '#9ca3af',
                                    }),
                                    menuPortal: (provided) => ({
                                      ...provided,
                                      zIndex: 9999, // Ensure dropdown is above all elements
                                    }),
                                  }}
                                  menuPortalTarget={document.body} // Render dropdown in body to avoid clipping
                                  menuPlacement="auto" // Adjust placement to prevent off-screen rendering
                                />
                                {errors.inventoryItems?.[index]?.inventoryId && (
                                  <p className="mt-1 text-[10px] text-red-500">{errors.inventoryItems[index].inventoryId.message}</p>
                                )}
                              </div>
                            );
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <Controller
                            name={`inventoryItems.${index}.quantity`}
                            control={control}
                            rules={{ required: 'Quantity required', min: { value: 0.1, message: 'Minimum 0.1' } }}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="number"
                                step="0.1"
                                placeholder="Qty"
                                className={`px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 border-gray-300 transition-colors duration-200 ${isMobile ? 'w-20' : 'w-16'}`}
                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                onChange={e => field.onChange(parseFloat(e.target.value))}
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
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => append({ inventoryId: '', quantity: 1 })}
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
                <div className={isMobile ? 'mt-4 flex flex-col gap-3' : 'mt-6 flex justify-between'}>
                  <button
                    type="button"
                    onClick={prevStep}
                    className={`px-4 ${isMobile ? 'py-2' : 'py-1.5'} text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAdd || isSubmittingEdit}
                    className={`px-4 ${isMobile ? 'py-2' : 'py-1.5'} text-sm text-white rounded-md hover:bg-[#043818] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${isSubmittingAdd || isSubmittingEdit ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    style={{ backgroundColor: primaryColor, '--tw-ring-color': primaryColor } as React.CSSProperties}
                  >
                    {(isSubmittingAdd || isSubmittingEdit) ? (
                      <ColorRing height="16" width="16" color="#ffffff" ariaLabel="loading" visible />
                    ) : isEditing ? (
                      'Update'
                    ) : (
                      'Create'
                    )}
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