import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetVendorsQuery } from '@/redux/api/vendors/vendors.api';
import { toast } from 'react-toastify';
import { ColorRing } from 'react-loader-spinner';
import Papa from 'papaparse';
import { useRequestSupplyMutation } from '@/redux/api/inventory/inventory.api';

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

type NewSupplyFormData = {
  newSupplies: {
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

const NewSupplyRequestWizard = ({ isModalOpen, setModalOpen }) => {
  const { subdomain } = useSelector(selectAuth);
  const [step, setStep] = useState(1);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const primaryColor = '#05431E';
  const [requestSupply, { isLoading: isSubmitting }] = useRequestSupplyMutation();

  const { control, handleSubmit, formState: { errors }, reset, getValues, setValue } = useForm<NewSupplyFormData>({
    defaultValues: {
      newSupplies: [{
        vendorId: "",
        productName: "",
        quantity: 0,
        unitOfMeasurement: "crate",
        unitPrice: 0,
        baseUnit: "piece",
        baseQuantityPerUnit: 1,
        requestMethod: 'MANUAL',
        specialNote: ""
      }]
    },
    mode: 'onChange'
  });

  const { fields: newSupplyFields, append: appendNew, remove: removeNew } = useFieldArray({
    control,
    name: 'newSupplies'
  });

  const { data: vendorData, isLoading: isVendorsLoading } = useGetVendorsQuery({
    subdomain: subdomain,
    page: 1,
    limit: 100
  });

  const vendorOptions = vendorData?.map((item: { id: any; name: any; }) => ({
    value: item.id,
    label: item.name
  })) || [];

  const onSubmit = async (data: NewSupplyFormData, event?: React.BaseSyntheticEvent) => {
    if (step !== 2) {
      event?.preventDefault();
      return;
    }

    const validSupplies = data.newSupplies.filter(supply =>
      supply.vendorId && supply.productName && supply.quantity > 0 && supply.unitOfMeasurement &&
      supply.unitPrice >= 0 && supply.baseUnit && supply.baseQuantityPerUnit > 0
    );

    if (validSupplies.length === 0) {
      const suppliesWithoutVendor = data.newSupplies.filter(s => !s.vendorId || s.vendorId.trim() === '');
      if (suppliesWithoutVendor.length > 0) {
        toast.error(`Please add vendors for ${suppliesWithoutVendor.length} item${suppliesWithoutVendor.length > 1 ? 's' : ''}. Go back to Step 1 to add vendors.`);
      } else {
        toast.error('Please add at least one complete supply request with all required fields');
      }
      return;
    }

    try {
      await requestSupply({ subdomain, data: validSupplies }).unwrap();
      toast.success(`Successfully submitted ${validSupplies.length} supply request${validSupplies.length > 1 ? 's' : ''}!`);
      setModalOpen(false);
      reset();
      setStep(1);
    } catch (err) {
      toast.error('Failed to submit supply requests');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result: { data: any[] }) => {
          const parsedData = result.data
            .map(item => {
              // Handle different column name variations (case-insensitive)
              const getValue = (keys: string[]) => {
                for (const key of keys) {
                  const value = item[key] || item[key.toLowerCase()] || item[key.toUpperCase()];
                  if (value !== undefined && value !== null && value !== '') {
                    return String(value).trim();
                  }
                }
                return '';
              };

              // Map productName from various possible column names
              const productName = getValue(['productName', 'product_name', 'Product Name', 'name', 'itemName']);
              
              // Map quantity - try quantity first, then use closingStock or openingStock as fallback
              const quantityStr = getValue(['quantity', 'Quantity', 'qty']);
              let quantity = parseInt(quantityStr, 10);
              if (isNaN(quantity) || quantity <= 0) {
                // Try closingStock or openingStock as fallback
                const closingStock = parseFloat(getValue(['closingStock', 'closing_stock', 'Closing Stock']) || '0');
                const openingStock = parseFloat(getValue(['openingStock', 'opening_stock', 'Opening Stock']) || '0');
                quantity = Math.max(closingStock, openingStock, 1); // Default to 1 if both are 0
              }

              // Map unitPrice
              const unitPriceStr = getValue(['unitPrice', 'unit_price', 'Unit Price', 'price']);
              const unitPrice = parseFloat(unitPriceStr) || 0;

              // Map unitOfMeasurement
              const unitOfMeasurementStr = getValue(['unitOfMeasurement', 'unit_of_measurement', 'Unit Of Measurement', 'unit']);
              const unitOfMeasurement = CONTAINER_UNITS.includes(unitOfMeasurementStr) 
                ? unitOfMeasurementStr 
                : 'crate';

              // Map baseUnit
              const baseUnitStr = getValue(['baseUnit', 'base_unit', 'Base Unit']);
              const baseUnit = BASE_UNITS.includes(baseUnitStr) ? baseUnitStr : 'piece';

              // Map baseQuantityPerUnit
              const baseQuantityPerUnitStr = getValue(['baseQuantityPerUnit', 'base_quantity_per_unit', 'Base Quantity Per Unit', 'baseQtyPerUnit']);
              const baseQuantityPerUnit = parseFloat(baseQuantityPerUnitStr) || 1;

              // Map vendorId (might not be in inventory export)
              const vendorId = getValue(['vendorId', 'vendor_id', 'Vendor ID', 'vendor']);

              // Map specialNote
              const specialNote = getValue(['specialNote', 'special_note', 'Special Note', 'note', 'notes']);

              return {
                vendorId,
                productName,
                quantity: quantity > 0 ? quantity : 1, // Ensure at least 1
                unitOfMeasurement,
                unitPrice,
                baseUnit,
                baseQuantityPerUnit: baseQuantityPerUnit > 0 ? baseQuantityPerUnit : 1,
                requestMethod: 'BULK' as const,
                specialNote
              };
            })
            .filter(item => item.productName && item.productName.trim() !== ''); // Filter out items without product names

          if (parsedData.length === 0) {
            toast.error('No valid items found in CSV. Please check the file format.');
            return;
          }

          setValue('newSupplies', parsedData);
          toast.success(`Uploaded ${parsedData.length} item${parsedData.length > 1 ? 's' : ''} from CSV! ${parsedData.some(s => !s.vendorId) ? 'Please select vendors for items.' : ''}`);
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          toast.error('Failed to parse CSV file. Please check the file format.');
        }
      });
    }
  };

  const applySingleVendor = (vendorId: string) => {
    const updatedSupplies = getValues('newSupplies').map(supply => ({ ...supply, vendorId }));
    setValue('newSupplies', updatedSupplies);
    toast.success('Vendor applied to all supply requests!');
  };

  const nextStep = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const currentSupplies = getValues('newSupplies');
    
    // Filter out empty/invalid supplies
    const validSupplies = currentSupplies.filter(supply => 
      supply.productName && 
      supply.productName.trim() !== '' && 
      supply.quantity > 0
    );

    if (validSupplies.length === 0) {
      toast.error('Please fill in at least one complete supply request with product name and quantity');
      return;
    }

    // Check if any supply is missing vendorId
    const suppliesWithoutVendor = validSupplies.filter(s => !s.vendorId || s.vendorId.trim() === '');
    if (suppliesWithoutVendor.length > 0) {
      toast.warn(`${suppliesWithoutVendor.length} item${suppliesWithoutVendor.length > 1 ? 's' : ''} missing vendor. You can add vendors in the review step.`);
    }

    setStep(2);
  };

  const prevStep = () => setStep(1);

  const toggleExpand = (index: number) => {
    setExpandedItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const totalCost = getValues('newSupplies').reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  if (isVendorsLoading) {
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
          <h2 className="text-xl font-light text-gray-800 mb-10 tracking-tight">New Supply Request</h2>
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium ${step === 1 ? 'bg-[#05431E]' : 'bg-gray-300'}`}>
                1
              </div>
              <div>
                <p className={`text-base font-medium ${step === 1 ? 'text-[#05431E]' : 'text-gray-600'}`}>Supply Details</p>
                <p className="text-sm text-gray-500">Add supply items</p>
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
                    {newSupplyFields.map((field, index) => (
                      <div key={field.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Vendor</label>
                            <Controller
                              name={`newSupplies.${index}.vendorId`}
                              control={control}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <select
                                  {...field}
                                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05431E] transition-all duration-200"
                                >
                                  <option value="">Select Vendor</option>
                                  {vendorOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                                </select>
                              )}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Product Name</label>
                            <Controller
                              name={`newSupplies.${index}.productName`}
                              control={control}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  placeholder="Enter product name"
                                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05431E] transition-all duration-200"
                                />
                              )}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                            <Controller
                              name={`newSupplies.${index}.quantity`}
                              control={control}
                              rules={{ required: true, min: 1 }}
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
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Container Unit</label>
                            <Controller
                              name={`newSupplies.${index}.unitOfMeasurement`}
                              control={control}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <select
                                  {...field}
                                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05431E] transition-all duration-200"
                                >
                                  <option value="">Select Container Unit</option>
                                  {CONTAINER_UNITS.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                  ))}
                                </select>
                              )}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Base Unit</label>
                            <Controller
                              name={`newSupplies.${index}.baseUnit`}
                              control={control}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <select
                                  {...field}
                                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05431E] transition-all duration-200"
                                >
                                  <option value="">Select Base Unit</option>
                                  {BASE_UNITS.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                  ))}
                                </select>
                              )}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Base Qty/Unit</label>
                            <Controller
                              name={`newSupplies.${index}.baseQuantityPerUnit`}
                              control={control}
                              rules={{ required: true, min: 1 }}
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
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price (₦)</label>
                            <Controller
                              name={`newSupplies.${index}.unitPrice`}
                              control={control}
                              rules={{ required: true, min: 0 }}
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
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Special Note</label>
                            <Controller
                              name={`newSupplies.${index}.specialNote`}
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
                            name={`newSupplies.${index}.requestMethod`}
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
                            onClick={() => removeNew(index)}
                            className="text-red-500 hover:text-red-600 text-sm font-medium hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => appendNew({ vendorId: '', productName: '', quantity: 0, unitOfMeasurement: 'crate', unitPrice: 0, baseUnit: 'piece', baseQuantityPerUnit: 1, requestMethod: 'MANUAL' })}
                      className="px-4 py-2 text-sm text-[#05431E] border border-[#05431E] rounded-md hover:bg-[#05431E] hover:text-white transition-all duration-200"
                    >
                      + Add Item
                    </button>
                    <label className="px-4 py-2 text-sm bg-[#05431E] text-white rounded-md hover:bg-[#043818] transition-all duration-200 cursor-pointer flex items-center gap-2">
                      <span>📤 Bulk Upload</span>
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <select
                      onChange={(e) => applySingleVendor(e.target.value)}
                      className="px-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05431E] transition-all duration-200"
                    >
                      <option value="">Apply Vendor to All</option>
                      {vendorOptions.map(option => (
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
                        You have {getValues('newSupplies').length} supply request(s) to review
                      </p>
                      <p className="text-lg font-medium text-[#05431E]">
                        Total Cost: ₦{totalCost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {getValues('newSupplies').length > 0 ? (
                    <div className="space-y-4">
                      {getValues('newSupplies').map((item, index) => (
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
                                {vendorOptions.find(v => v.value === item.vendorId)?.label || 'N/A'}
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
                                {item.specialNote && (
                                  <p className="col-span-2"><span className="font-medium text-gray-700">Note:</span> {item.specialNote}</p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeNew(index)}
                                className="mt-4 px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-all duration-200 shadow-sm"
                              >
                                Remove Item
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
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
                    disabled={isSubmitting || getValues('newSupplies').length === 0}
                    className={`px-6 py-2 text-sm text-white rounded-md transition-all duration-200 ${
                      isSubmitting || getValues('newSupplies').length === 0
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

export default NewSupplyRequestWizard;