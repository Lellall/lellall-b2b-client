import React, { useState, useEffect } from 'react';
import { useGetInventoryQuery } from '@/redux/api/inventory/inventory.api';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetMenusQuery, useAddMenuItemMutation } from '@/redux/api/menu/menu.api';
import { toast } from 'react-toastify';
import { ColorRing } from 'react-loader-spinner';

type FormData = {
  name: string;
  description: string;
  price: number;
  inventoryItems: { inventoryId: string; quantity: number }[];
  menuId: string;
};

const MenuItemForm = ({ setModalOpen }: { setModalOpen: (open: boolean) => void }) => {
  const { subdomain } = useSelector(selectAuth);
  const [step, setStep] = useState(1);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 640);
  const primaryColor = '#05431E';

  const { data: menus, isLoading: isMenusLoading, error: menusError } = useGetMenusQuery(
    { subdomain },
    { skip: !subdomain }
  );
  const [addMenuItem, { isLoading: isSubmitting, error: submitError }] = useAddMenuItemMutation();
  const { data: inventoryData, isLoading: isInventoryLoading, error: inventoryError } = useGetInventoryQuery(
    { subdomain, page: 1, limit: 50 },
    { skip: !subdomain }
  );

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      inventoryItems: [],
      menuId: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'inventoryItems',
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuOptions = menus?.map(item => ({
    value: item.id,
    label: item.name,
  })) || [];
  const inventoryOptions = inventoryData?.map(item => ({
    value: item.id,
    label: item.productName,
  })) || [];

  const onSubmit = async (data: FormData) => {
    if (!subdomain) {
      toast.error('Subdomain not found');
      return;
    }

    try {
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
      setModalOpen(false);
      toast.success('Menu item added successfully!');
      reset();
      setStep(1);
    } catch (err) {
      toast.error('Failed to add menu item');
      console.error('Failed to add menu item:', err);
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

  if (isMobile) {
    return (
      <div className="w-full max-w-full p-3 bg-white rounded-xl">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Create Menu Item - Step {step} of 2
          </h2>
          <div className="flex gap-1 mt-2">
            <div className={`w-4 h-4 rounded-full ${step === 1 ? 'bg-[#05431E]' : 'bg-gray-300'}`}></div>
            <div className={`w-4 h-4 rounded-full ${step === 2 ? 'bg-[#05431E]' : 'bg-gray-300'}`}></div>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <div className="space-y-3">
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
                      className={`w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                        errors.name ? 'border-red-400' : 'border-gray-300'
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
                    <label className="block text-xs font-medium text-gray-700 mb-1 truncate">Select Menu</label>
                    <select
                      {...field}
                      className="w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 bg-white border-gray-300 transition-colors duration-200"
                      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
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
                      rows={3}
                      className={`w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                        errors.description ? 'border-red-400' : 'border-gray-300'
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
                    <label className="block text-xs font-medium text-gray-700 mb-1 truncate">Price (N)</label>
                    <input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="e.g., 12.99"
                      className={`w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                        errors.price ? 'border-red-400' : 'border-gray-300'
                      }`}
                      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                    {errors.price && <p className="mt-1 text-[10px] text-red-500">{errors.price.message}</p>}
                  </div>
                )}
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 text-sm text-white rounded-md hover:bg-[#043818] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
                  style={{ backgroundColor: primaryColor, '--tw-ring-color': primaryColor } as React.CSSProperties}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 truncate">Inventory Items</label>
                {inventoryError && <p className="text-[10px] text-red-500">Error loading items</p>}
                <div className="space-y-2 mb-3 max-h-60 overflow-y-auto pr-1">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                      <Controller
                        name={`inventoryItems.${index}.inventoryId`}
                        control={control}
                        rules={{ required: 'Item is required' }}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 bg-white border-gray-300 transition-colors duration-200"
                            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                          >
                            <option value="">Select item</option>
                            {inventoryOptions.map(option => (
                              <option key={option.value} value={option.value} className="text-sm">
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
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
                              className="w-20 px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 border-gray-300 transition-colors duration-200"
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
              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                >
                  Previous
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-sm text-white rounded-md hover:bg-[#043818] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  style={{ backgroundColor: primaryColor, '--tw-ring-color': primaryColor } as React.CSSProperties}
                >
                  {isSubmitting ? (
                    <ColorRing
                      height="16"
                      width="16"
                      color="#ffffff"
                      ariaLabel="loading"
                      visible
                    />
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl min-h-[400px] mx-auto p-4 bg-white rounded-xl">
      <div className="flex flex-row">
        <div className="w-1/4 pr-4 border-r border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step === 1 ? 'text-white' : 'bg-gray-200 text-gray-600'
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
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step === 2 ? 'text-white' : 'bg-gray-200 text-gray-600'
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
                      <label className="block text-xs font-medium text-gray-700 mb-1 truncate">Item Name</label>
                      <input
                        {...field}
                        placeholder="e.g., Grilled Chicken"
                        className={`w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                          errors.name ? 'border-red-400' : 'border-gray-300'
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
                      <label className="block text-xs font-medium text-gray-700 mb-1 truncate">Select Menu</label>
                      <select
                        {...field}
                        className="w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 bg-white border-gray-300 transition-colors duration-200"
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
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
                        rows={2}
                        className={`w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                          errors.description ? 'border-red-400' : 'border-gray-300'
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
                      <label className="block text-xs font-medium text-gray-700 mb-1 truncate">Price (N)</label>
                      <input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="e.g., 12.99"
                        className={`w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${
                          errors.price ? 'border-red-400' : 'border-gray-300'
                        }`}
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
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
                  <label className="block text-xs font-medium text-gray-700 mb-1 truncate">Inventory Items</label>
                  {inventoryError && <p className="text-xs text-red-500">Error loading items</p>}
                  <div className="space-y-2 mb-3 max-h-72 overflow-y-auto pr-1">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200">
                        <Controller
                          name={`inventoryItems.${index}.inventoryId`}
                          control={control}
                          rules={{ required: 'Item is required' }}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="flex-1 px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 bg-white border-gray-300 transition-colors duration-200"
                              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                            >
                              <option value="">Select item</option>
                              {inventoryOptions.map(option => (
                                <option key={option.value} value={option.value} className="text-sm">
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )}
                        />
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
                              className="w-16 px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 border-gray-300 transition-colors duration-200"
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
                    className={`px-4 py-1.5 text-sm text-white rounded-md hover:bg-[#043818] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    style={{ backgroundColor: primaryColor, '--tw-ring-color': primaryColor } as React.CSSProperties}
                  >
                    {isSubmitting ? (
                      <ColorRing
                        height="16"
                        width="16"
                        color="#ffffff"
                        ariaLabel="loading"
                        visible
                      />
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