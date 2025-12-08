import React from 'react';
import { X, Calendar, User, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface LeaveRequest {
  id: string;
  userId: string;
  employeeName: string;
  employeeId: string;
  employeeEmail: string;
  employeeRole: string;
  leaveType: 'SICK' | 'VACATION' | 'PERSONAL' | 'EMERGENCY' | 'MATERNITY' | 'PATERNITY' | 'OTHER';
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  department?: string;
}

interface ViewReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LeaveRequest;
  isHR?: boolean;
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
}

const leaveTypeMap: Record<string, string> = {
  SICK: 'Sick Leave',
  VACATION: 'Vacation',
  PERSONAL: 'Personal',
  EMERGENCY: 'Emergency',
  MATERNITY: 'Maternity',
  PATERNITY: 'Paternity',
  OTHER: 'Other',
};

const ViewReasonModal: React.FC<ViewReasonModalProps> = ({ isOpen, onClose, request, isHR = false, onApprove, onReject }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#05431E]" />
              <h2 className="text-xl font-semibold text-gray-900">Leave Request Details</h2>
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
              <div className="text-base font-semibold text-gray-900">{request.employeeName}</div>
              <div className="text-sm text-gray-500">
                {request.employeeId} • {request.employeeRole}
              </div>
              {request.department && (
                <div className="text-xs text-gray-400 mt-1">{request.department}</div>
              )}
            </div>
          </div>
        </div>

          {/* Leave Details */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Leave Type</label>
                <div className="text-base text-gray-900">{leaveTypeMap[request.leaveType] || request.leaveType}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Number of Days</label>
                <div className="text-base text-gray-900">
                  {request.numberOfDays} {request.numberOfDays === 1 ? 'day' : 'days'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Date Range
              </label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Start Date</div>
                    <div className="text-base font-medium text-gray-900">
                      {format(new Date(request.startDate), 'dd MMMM yyyy')}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">End Date</div>
                    <div className="text-base font-medium text-gray-900">
                      {format(new Date(request.endDate), 'dd MMMM yyyy')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <div className="inline-block">
                {request.status === 'PENDING' && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                    Pending
                  </span>
                )}
                {request.status === 'APPROVED' && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Approved
                  </span>
                )}
                {request.status === 'REJECTED' && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    Rejected
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Submitted At</label>
              <div className="text-sm text-gray-700">
                {format(new Date(request.submittedAt), 'dd MMMM yyyy, HH:mm')}
              </div>
            </div>

            {request.reviewedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Reviewed At</label>
                <div className="text-sm text-gray-700">
                  {format(new Date(request.reviewedAt), 'dd MMMM yyyy, HH:mm')}
                  {request.reviewedBy && ` by ${typeof request.reviewedBy === 'string' ? request.reviewedBy : request.reviewedBy.name}`}
                </div>
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Leave</label>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.reason}</p>
            </div>
          </div>

          {/* Rejection Reason (if rejected) */}
          {request.status === 'REJECTED' && request.rejectionReason && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-red-700 mb-2">Rejection Reason</label>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-sm text-red-700 whitespace-pre-wrap">{request.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {isHR && request.status === 'PENDING' && onApprove && onReject && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onApprove(request.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => {
                  onReject(request.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}
          <div className={isHR && request.status === 'PENDING' ? '' : 'ml-auto'}>
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
    </div>
  );
};

export default ViewReasonModal;

