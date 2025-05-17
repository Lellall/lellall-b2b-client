import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetInventoryQuery, useRequestResupplyMutation } from '@/redux/api/inventory/inventory.api';
import { toast } from 'react-toastify';
import { ColorRing } from 'react-loader-spinner';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
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

type ResupplyFormData = {
  resupplies: {
    inventoryId: string;
    quantity: number;
  }[];
};

const ResupplyRequestWizard = ({ isModalOpen, setModalOpen }) => {
  const { subdomain } = useSelector(selectAuth);
  const [step, setStep] = useState(1);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const primaryColor = '#05431E';
  const [requestResupply, { isLoading: isSubmitting }] = useRequestResupplyMutation();

  const { control, handleSubmit, formState: { errors }, reset, getValues } = useForm<ResupplyFormData>({
    defaultValues: {
      resupplies: []
    },
    mode: 'onChange'
  });

  const { fields: resupplyFields, append: appendResupply, remove: removeResupply } = useFieldArray({
    control,
    name: 'resupplies'
  });

  const { data: inventoryData, isLoading: isInventoryLoading } = useGetInventoryQuery({
    subdomain: subdomain,
    page: 1,
    limit: 100
  });

  const inventoryOptions = inventoryData?.data?.map(item => ({
    value: item.id,
    label: item.productName,
    unitOfMeasurement: item.unitOfMeasurement,
    closingStock: item.closingStock
  })) || [];

  const onSubmit = async (data: ResupplyFormData, event?: React.BaseSyntheticEvent) => {
    // Safeguard: Only submit if on step 2
    if (step !== 2) {
      event?.preventDefault(); // Prevent submission if triggered on step 1
      return;
    }

    const validResupplies = data.resupplies.filter(item => item.inventoryId && item.quantity > 0);
    if (validResupplies.length === 0) {
      toast.error('Please add at least one complete resupply request');
      return;
    }

    try {
      await requestResupply({ subdomain, data: validResupplies }).unwrap();
      toast.success(`Successfully submitted ${validResupplies.length} resupply request${validResupplies.length > 1 ? 's' : ''}!`);
      setModalOpen(false);
      reset();
      setStep(1);
    } catch (err) {
      console.error('Failed to submit resupply requests:', err);
      toast.error('Failed to submit resupply requests');
    }
  };

  const nextStep = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Explicitly prevent form submission
    const currentResupplies = getValues('resupplies');
    if (currentResupplies.every(item => !item.inventoryId || item.quantity <= 0)) {
      toast.error('Please fill in at least one complete resupply request before proceeding');
      return;
    }
    setStep(2);
  };

  const prevStep = () => setStep(1);

  const toggleExpand = (index: number) => {
    setExpandedItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  if (isInventoryLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <ColorRing height="80" width="80" radius="9" color={primaryColor} visible={true} />
      </div>
    );
  }

  return (
    <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
      <div className="flex h-full">
        <div className="w-72 bg-gray-50 p-8 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-800 mb-10 tracking-tight">Resupply Request</h2>
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium ${step === 1 ? 'bg-[#05431E]' : 'bg-gray-300'}`}>
                1
              </div>
              <div>
                <p className={`text-base font-medium ${step === 1 ? 'text-[#05431E]' : 'text-gray-600'}`}>Resupply Details</p>
                <p className="text-sm text-gray-500">Add items to resupply</p>
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

        <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">Add Resupply Items</h3>
                <div className="grid grid-cols-1 gap-4 max-h-[65vh] overflow-y-auto pr-2">
                  {resupplyFields.map((field, index) => (
                    <div key={field.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Item</label>
                          <Controller
                            name={`resupplies.${index}.inventoryId`}
                            control={control}
                            rules={{ required: 'Item is required' }}
                            render={({ field }) => (
                              <select
                                {...field}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05431E] transition-all duration-200"
                              >
                                <option value="">Select Item</option>
                                {inventoryOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label} (Stock: {option.closingStock} {option.unitOfMeasurement})
                                  </option>
                                ))}
                              </select>
                            )}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                          <Controller
                            name={`resupplies.${index}.quantity`}
                            control={control}
                            rules={{ required: 'Quantity is required', min: 1 }}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="number"
                                placeholder="0"
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05431E] transition-all duration-200"
                              />
                            )}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeResupply(index)}
                        className="mt-4 text-red-500 hover:text-red-600 text-sm font-medium hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => appendResupply({ inventoryId: '', quantity: 0 })}
                  className="px-4 py-2 text-sm text-[#05431E] border border-[#05431E] rounded-md hover:bg-[#05431E] hover:text-white transition-all duration-200"
                >
                  + Add Item
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">Review Your Resupply Requests</h3>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      You have {getValues('resupplies').length} resupply request(s) to review
                    </p>
                  </div>
                </div>
                {getValues('resupplies').length > 0 ? (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {getValues('resupplies').map((item, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                      >
                        <div
                          className="flex justify-between items-center p-4 cursor-pointer"
                          onClick={() => toggleExpand(index)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-[#05431E]"></span>
                            <p className="text-lg font-medium text-gray-800">
                              {inventoryOptions.find(i => i.value === item.inventoryId)?.label || 'Unknown Item'}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-lg font-semibold text-[#05431E]">
                              {item.quantity} {inventoryOptions.find(i => i.value === item.inventoryId)?.unitOfMeasurement || ''}
                            </p>
                            <span className={`transform transition-transform duration-200 ${expandedItems.includes(index) ? 'rotate-180' : ''}`}>
                              ▼
                            </span>
                          </div>
                        </div>
                        {expandedItems.includes(index) && (
                          <div className="p-4 border-t border-gray-100 bg-gray-50 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <p><span className="font-medium text-gray-700">Item ID:</span> {item.inventoryId}</p>
                              <p><span className="font-medium text-gray-700">Quantity:</span> {item.quantity}</p>
                              <p><span className="font-medium text-gray-700">Current Stock:</span> {inventoryOptions.find(i => i.value === item.inventoryId)?.closingStock || 'N/A'}</p>
                              <p><span className="font-medium text-gray-700">Unit:</span> {inventoryOptions.find(i => i.value === item.inventoryId)?.unitOfMeasurement || 'N/A'}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeResupply(index)}
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
                    <p className="text-gray-500 text-lg font-light">No resupply requests to review.</p>
                    <p className="text-gray-400 text-sm mt-2">Please add items in Step 1.</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex justify-between items-center">
              <button
                type="button"
                onClick={step === 1 ? () => setModalOpen(false) : prevStep}
                className="px-6 py-2 text-sm text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-all duration-200"
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </button>
              <button
                type={step === 1 ? 'button' : 'submit'} // Step 1: button, Step 2: submit
                onClick={step === 1 ? nextStep : undefined} // Step 1: call nextStep with event prevention
                disabled={step === 2 && (isSubmitting || getValues('resupplies').length === 0)}
                className={`px-6 py-2 text-sm text-white rounded-md transition-all duration-200 ${
                  step === 2 && (isSubmitting || getValues('resupplies').length === 0)
                    ? 'bg-[#05431E] opacity-60 cursor-not-allowed'
                    : 'bg-[#05431E] hover:bg-[#043818]'
                }`}
              >
                {step === 1 ? 'Next' : isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default ResupplyRequestWizard;