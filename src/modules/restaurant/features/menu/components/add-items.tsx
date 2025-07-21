import React, { useState, useEffect } from 'react';
import { useGetInventoryQuery } from '@/redux/api/inventory/inventory.api';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetMenusQuery, useAddMenuItemMutation, useBulkEditMenuItemMutation, useGetAllTagsQuery } from '@/redux/api/menu/menu.api';
import { toast } from 'react-toastify';
import { ColorRing } from 'react-loader-spinner';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  menuId: string;
  inventoryItems: { inventoryId: string; quantity: number }[];
  tags?: string[];
};

type FormData = {
  name: string;
  description: string;
  price: number;
  inventoryItems: { inventoryId: string; quantity: number }[];
  menuId: string;
  newMenuId: string;
  tags: string[];
};

type MenuItemFormProps = {
  setModalOpen: (open: boolean) => void;
  itemToEdit?: MenuItem;
};

const PRIMARY_COLOR = '#05431E';
const HOVER_COLOR = '#043818';

const selectStyles = {
  control: (provided: any, state: { hasError: boolean }) => ({
    ...provided,
    borderColor: state.hasError ? '#f87171' : '#d1d5db',
    borderRadius: '0.375rem',
    padding: '0.25rem 0.5rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    boxShadow: 'none',
    minHeight: '38px',
    '&:hover': { borderColor: state.hasError ? '#f87171' : '#9ca3af' },
    '&:focus-within': { borderColor: PRIMARY_COLOR, boxShadow: `0 0 0 2px ${PRIMARY_COLOR}` },
  }),
  menu: (provided: any) => ({
    ...provided,
    zIndex: 9999,
    maxHeight: '200px',
    overflowY: 'auto',
    borderRadius: '0.375rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  }),
  option: (provided: any, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...provided,
    fontSize: '0.875rem',
    backgroundColor: state.isSelected ? PRIMARY_COLOR : state.isFocused ? '#f3f4f6' : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
    padding: '8px 12px',
    '&:hover': { backgroundColor: state.isSelected ? PRIMARY_COLOR : '#f3f4f6' },
  }),
  singleValue: (provided: any) => ({ ...provided, color: '#1f2937' }),
  placeholder: (provided: any) => ({ ...provided, color: '#9ca3af' }),
  menuPortal: (provided: any) => ({ ...provided, zIndex: 9999 }),
};

const MenuItemForm = ({ setModalOpen, itemToEdit }: MenuItemFormProps) => {
  const { subdomain } = useSelector(selectAuth);
  const [step, setStep] = useState(1);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 640);
  const isEditing = !!itemToEdit;

  const { data: menus, isLoading: isMenusLoading, error: menusError } = useGetMenusQuery({ subdomain }, { skip: !subdomain });
  const { data: tags, isLoading: isTagsLoading, error: tagsError } = useGetAllTagsQuery({ subdomain }, { skip: !subdomain });
  const [addMenuItem, { isLoading: isSubmittingAdd }] = useAddMenuItemMutation();
  const [bulkEditMenuItem, { isLoading: isSubmittingEdit }] = useBulkEditMenuItemMutation();
  const { data: inventoryData, isLoading: isInventoryLoading, error: inventoryError } = useGetInventoryQuery(
    { subdomain, page: 1, limit: 500 },
    { skip: !subdomain }
  );

  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    defaultValues: isEditing
      ? {
          name: itemToEdit.name,
          description: itemToEdit.description || '',
          price: itemToEdit.price,
          inventoryItems: itemToEdit.inventoryItems,
          menuId: itemToEdit.menuId,
          newMenuId: itemToEdit.menuId,
          tags: itemToEdit.tags || [],
        }
      : {
          name: '',
          description: '',
          price: 0,
          inventoryItems: [],
          menuId: '',
          newMenuId: '',
          tags: [],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'inventoryItems' });

  useEffect(() => {
    if (isEditing && itemToEdit) {
      setValue('menuId', itemToEdit.menuId);
      setValue('newMenuId', itemToEdit.menuId);
      setValue('tags', itemToEdit.tags || []);
    }
  }, [isEditing, itemToEdit, setValue]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuOptions = menus?.map(item => ({ value: item.id, label: item.name })) || [];
  const inventoryOptions = inventoryData?.data.map(item => ({ value: item.id, label: item.productName })) || [];
  const tagOptions = tags?.map(tag => ({ value: tag, label: tag })) || [];

  const onSubmit = async (data: FormData) => {
    if (!subdomain) {
      toast.error('Subdomain not found');
      return;
    }

    const payload = {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      inventoryItems: data.inventoryItems.map(item => ({
        inventoryId: item.inventoryId,
        quantity: Number(item.quantity),
      })),
      tags: data.tags,
    };

    try {
      if (isEditing) {
        await bulkEditMenuItem({
          subdomain,
          menuId: data.menuId,
          data: { items: [{ menuItemId: itemToEdit!.id, ...payload, newMenuId: data.newMenuId || undefined }] },
        }).unwrap();
        toast.success('Menu item updated successfully!');
      } else {
        await addMenuItem({ subdomain, menuId: data.menuId, data: payload }).unwrap();
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

  const renderError = () => (
    <div className="text-red-500 text-center p-4">{subdomain ? 'Error loading data' : 'Error: Subdomain not found'}</div>
  );

  const renderLoading = () => (
    <div className="flex items-center justify-center min-h-[200px]">
      <ColorRing height="50" width="50" colors={[PRIMARY_COLOR, PRIMARY_COLOR, PRIMARY_COLOR, PRIMARY_COLOR, PRIMARY_COLOR]} ariaLabel="loading" visible />
    </div>
  );

  const renderStepIndicator = () => (
    <div>
      <h2 className="text-sm font-semibold text-gray-900">
        {isEditing ? 'Edit Menu Item' : 'Create Menu Item'} - Step {step} of 2
      </h2>
      <div className="flex gap-1 mt-2">
        <div className={`w-4 h-4 rounded-full ${step === 1 ? `bg-[${PRIMARY_COLOR}]` : 'bg-gray-300'}`}></div>
        <div className={`w-4 h-4 rounded-full ${step === 2 ? `bg-[${PRIMARY_COLOR}]` : 'bg-gray-300'}`}></div>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className="w-1/4 pr-4 border-r border-gray-200">
      <div className="flex flex-col gap-4">
        {[
          { step: 1, title: 'Basic Info', desc: 'Name, desc, price, tags' },
          { step: 2, title: 'Inventory', desc: 'Add items' },
        ].map(item => (
          <div key={item.step} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === item.step ? 'text-white' : 'bg-gray-200 text-gray-600'}`}
              style={{ backgroundColor: step === item.step ? PRIMARY_COLOR : undefined }}
            >
              {item.step}
            </div>
            <div>
              <p className={`text-xs font-medium ${step === item.step ? `text-[${PRIMARY_COLOR}]` : 'text-gray-600'}`}>{item.title}</p>
              <p className="text-[10px] text-gray-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!subdomain || menusError || inventoryError || tagsError) return renderError();
  if (isMenusLoading || isInventoryLoading || isTagsLoading) return renderLoading();

  return (
    <div className={`w-full ${isMobile ? 'max-w-full p-3' : 'max-w-4xl min-h-[400px] mx-auto p-4'} bg-white rounded-xl`}>
      <div className={isMobile ? 'mb-3' : 'flex flex-row'}>
        {isMobile ? renderStepIndicator() : renderSidebar()}
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
                        className={`w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                        style={{ '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties}
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
                      <label className="block text-xs font-medium text-gray-700 mb-1 truncate">{isEditing ? 'Current Menu' : 'Select Menu'}</label>
                      <select
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value)}
                        className="w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 bg-white border-gray-300 transition-colors duration-200"
                        style={{ '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties}
                        disabled={isEditing}
                      >
                        <option value="" className="text-sm">Select Menu</option>
                        {menuOptions.map(option => (
                          <option key={option.value} value={option.value} className="text-sm">{option.label}</option>
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
                          style={{ '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties}
                        >
                          <option value="" className="text-sm">Keep in Current Menu</option>
                          {menuOptions.map(option => (
                            <option key={option.value} value={option.value} className="text-sm">{option.label}</option>
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
                        className={`w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
                        style={{ '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties}
                      />
                      {errors.description && <p className="mt-1 text-[10px] text-red-500">{errors.description.message}</p>}
                    </div>
                  )}
                />
                <Controller
                  name="price"
                  control={control}
                  rules={{ required: 'Price is required', min: { value: 0.01, message: 'Price must be greater than 0' } }}
                  render={({ field }) => (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 truncate">Price (₦)</label>
                      <input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="e.g., 12.99"
                        className={`w-full px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors duration-200 ${errors.price ? 'border-red-400' : 'border-gray-300'}`}
                        style={{ '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                      {errors.price && <p className="mt-1 text-[10px] text-red-500">{errors.price.message}</p>}
                    </div>
                  )}
                />
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 truncate">Tags (Optional)</label>
                      <CreatableSelect
                        isMulti
                        options={tagOptions}
                        value={field.value?.map(tag => ({ value: tag, label: tag })) || []}
                        onChange={(options) => field.onChange(options ? options.map(option => option.value) : [])}
                        placeholder="Select or create tags (e.g., Vegetarian, Spicy)"
                        isDisabled={isTagsLoading}
                        isLoading={isTagsLoading}
                        className="w-full text-sm"
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPlacement="auto"
                      />
                      {errors.tags && <p className="mt-1 text-[10px] text-red-500">{errors.tags.message}</p>}
                    </div>
                  )}
                />
                <div className={isMobile ? 'mt-4 flex justify-end' : 'mt-6 flex justify-end'}>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className={`px-4 ${isMobile ? 'py-2' : 'py-1.5'} text-sm text-white rounded-md hover:bg-[${HOVER_COLOR}] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
                    style={{ backgroundColor: PRIMARY_COLOR, '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties}
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
                          render={({ field }) => (
                            <div className="relative w-full">
                              <Select
                                options={[{ value: '', label: 'Select item' }, ...inventoryOptions]}
                                value={inventoryOptions.find(option => option.value === field.value) || { value: '', label: 'Select item' }}
                                onChange={(option) => field.onChange(option ? option.value : '')}
                                placeholder="Select item"
                                isSearchable
                                isOptionDisabled={(option) => option.value === ''}
                                className={`w-full text-sm ${isMobile ? '' : 'flex-1'}`}
                                styles={{ ...selectStyles, control: (provided: any) => selectStyles.control(provided, { hasError: !!errors.inventoryItems?.[index]?.inventoryId }) }}
                                menuPortalTarget={document.body}
                                menuPlacement="auto"
                              />
                              {errors.inventoryItems?.[index]?.inventoryId && (
                                <p className="mt-1 text-[10px] text-red-500">{errors.inventoryItems[index].inventoryId?.message}</p>
                              )}
                            </div>
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
                                className={`px-2 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 border-gray-300 transition-colors duration-200 ${isMobile ? 'w-20' : 'w-16'}`}
                                style={{ '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties}
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
                    style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                  >
                    <span>+</span> Add Item
                  </button>
                  {errors.inventoryItems && <p className="mt-1 text-[10px] text-red-500">{errors.inventoryItems.message || 'Add at least one item'}</p>}
                </div>
                <div className={isMobile ? 'mt-4 flex flex-col gap-3' : 'mt-6 flex justify-between'}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={`px-4 ${isMobile ? 'py-2' : 'py-1.5'} text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
                    style={{ '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties}
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAdd || isSubmittingEdit}
                    className={`px-4 ${isMobile ? 'py-2' : 'py-1.5'} text-sm text-white rounded-md hover:bg-[${HOVER_COLOR}] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${isSubmittingAdd || isSubmittingEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: PRIMARY_COLOR, '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties}
                  >
                    {isSubmittingAdd || isSubmittingEdit ? (
                      <ColorRing height="16" width="16" colors={['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']} ariaLabel="loading" visible />
                    ) : isEditing ? 'Update' : 'Create'}
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