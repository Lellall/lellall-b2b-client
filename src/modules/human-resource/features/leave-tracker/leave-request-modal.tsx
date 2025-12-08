import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface LeaveRequestFormData {
  leaveType: 'SICK' | 'VACATION' | 'PERSONAL' | 'EMERGENCY' | 'MATERNITY' | 'PATERNITY' | 'OTHER';
  startDate: string;
  endDate: string;
  reason: string;
}

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeaveRequestFormData) => void;
}

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<LeaveRequestFormData>({
    leaveType: 'VACATION',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LeaveRequestFormData, string>>>({});

  // Calculate number of days
  const numberOfDays = formData.startDate && formData.endDate
    ? Math.ceil(
        (new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    : 0;

  const leaveTypes = [
    { value: 'SICK', label: 'Sick Leave' },
    { value: 'VACATION', label: 'Vacation' },
    { value: 'PERSONAL', label: 'Personal' },
    { value: 'EMERGENCY', label: 'Emergency' },
    { value: 'MATERNITY', label: 'Maternity' },
    { value: 'PATERNITY', label: 'Paternity' },
    { value: 'OTHER', label: 'Other' },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof LeaveRequestFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LeaveRequestFormData, string>> = {};

    if (!formData.leaveType) {
      newErrors.leaveType = 'Please select a leave type';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Please select a start date';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Please select an end date';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for your leave';
    }

    if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        leaveType: 'VACATION',
        startDate: '',
        endDate: '',
        reason: '',
      });
      setErrors({});
    }
  };

  const handleClose = () => {
    setFormData({
      leaveType: 'VACATION',
      startDate: '',
      endDate: '',
      reason: '',
    });
    setErrors({});
    onClose();
  };

  // Set minimum date to today
  const today = format(new Date(), 'yyyy-MM-dd');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#05431E]" />
            <h2 className="text-xl font-semibold text-gray-900">Request Leave</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm ${
                errors.leaveType ? 'border-red-300' : 'border-gray-200'
              }`}
            >
              {leaveTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.leaveType && (
              <p className="mt-1 text-xs text-red-600">{errors.leaveType}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={today}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm ${
                    errors.startDate ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate || today}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm ${
                    errors.endDate ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Number of Days Display */}
          {numberOfDays > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Total Days:</span> {numberOfDays}{' '}
                {numberOfDays === 1 ? 'day' : 'days'}
              </p>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={4}
              placeholder="Please provide a detailed reason for your leave request..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm resize-none ${
                errors.reason ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.reason && (
              <p className="mt-1 text-xs text-red-600">{errors.reason}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.reason.length}/500 characters (minimum 10 characters)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequestModal;



