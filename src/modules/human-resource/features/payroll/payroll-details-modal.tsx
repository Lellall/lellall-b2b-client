import React from 'react';
import { X, Calendar, User, FileText, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { PayrollRecord } from '@/redux/api/payroll/payroll.api';

interface PayrollDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payrollItem: PayrollRecord;
}

const PayrollDetailsModal: React.FC<PayrollDetailsModalProps> = ({ isOpen, onClose, payrollItem }) => {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            Pending
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            Processing
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            Failed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const salary = payrollItem.salary;
  const totalDeductions = salary.deductions?.reduce((sum, d) => sum + d.amount, 0) || 0;
  const allowances = 0; // Not available in API
  const overtime = 0; // Not available in API
  const bonuses = 0; // Not available in API
  const totalAdditions = allowances + overtime + bonuses;
  const grossSalary = salary.grossSalary;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white overflow-y-auto transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#05431E]" />
              <h2 className="text-xl font-semibold text-gray-900">Payroll Breakdown</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Employee Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <div className="text-base font-semibold text-gray-900">{salary.employee.name}</div>
                <div className="text-sm text-gray-500">
                  {salary.employee.employeeId}
                </div>
                <div className="text-xs text-gray-400 mt-1">{salary.department?.name || 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xs text-gray-500">Pay Period</div>
                <div className="text-sm font-medium text-gray-900">
                  {format(new Date(salary.year, salary.month - 1, 1), 'MMMM yyyy')}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className="mt-1">{getStatusBadge(payrollItem.status)}</div>
              </div>
              {payrollItem.paymentDate && (
                <div>
                  <div className="text-xs text-gray-500">Payment Date</div>
                  <div className="text-sm font-medium text-gray-900">
                    {format(new Date(payrollItem.paymentDate), 'dd MMM yyyy')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Breakdown</h3>

            {/* Base Salary */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Base Salary</span>
                </div>
                <span className="text-base font-semibold text-gray-900">
                  {formatCurrency(salary.baseSalary)}
                </span>
              </div>
            </div>

            {/* Additions Section */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-900">Additions</span>
              </div>
              <div className="space-y-2">
                {allowances > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Allowances</span>
                    <span className="text-sm font-medium text-green-700">
                      {formatCurrency(allowances)}
                    </span>
                  </div>
                )}
                {overtime > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Overtime</span>
                    <span className="text-sm font-medium text-green-700">
                      {formatCurrency(overtime)}
                    </span>
                  </div>
                )}
                {bonuses > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Bonuses</span>
                    <span className="text-sm font-medium text-green-700">
                      {formatCurrency(bonuses)}
                    </span>
                  </div>
                )}
                {salary.deductions && salary.deductions.length > 0 && (
                  <div className="space-y-1">
                    {salary.deductions.map((deduction) => (
                      <div key={deduction.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{deduction.reason || deduction.type}</span>
                        <span className="text-sm font-medium text-green-700">
                          {formatCurrency(deduction.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t border-green-300 pt-2 mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-900">Total Additions</span>
                  <span className="text-base font-bold text-green-900">
                    {formatCurrency(totalAdditions)}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions Section */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-900">Deductions</span>
              </div>
              <div className="space-y-2">
                {salary.deductions && salary.deductions.length > 0 ? (
                  salary.deductions.map((deduction) => (
                    <div key={deduction.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{deduction.reason || deduction.type}</span>
                      <span className="text-sm font-medium text-red-700">
                        {formatCurrency(deduction.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Total Deductions</span>
                    <span className="text-sm font-medium text-red-700">
                      {formatCurrency(totalDeductions)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 border-2 border-[#05431E] rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Gross Salary</span>
                  <span className="text-base font-semibold text-gray-900">
                    {formatCurrency(grossSalary)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-300 pt-3">
                  <span className="text-base font-bold text-[#05431E]">Net Salary</span>
                  <span className="text-xl font-bold text-[#05431E]">
                    {formatCurrency(salary.netSalary)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {payrollItem.status === 'PAID' && payrollItem.paymentMethod && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Payment Information</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Payment Method</span>
                  <span className="text-sm font-medium text-blue-900">
                    {payrollItem.paymentMethod}
                  </span>
                </div>
                {payrollItem.paymentDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Payment Date</span>
                    <span className="text-sm font-medium text-blue-900">
                      {format(new Date(payrollItem.paymentDate), 'dd MMMM yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollDetailsModal;

