import React, { useState, useMemo } from 'react';
import { Calendar, Search, Plus, CheckCircle2, XCircle, Clock, Filter, User, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ColorRing } from 'react-loader-spinner';
import { theme } from '@/theme/theme';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import LeaveRequestModal from './leave-request-modal';
import RejectLeaveModal from './reject-leave-modal';
import ViewReasonModal from './view-reason-modal';
import { 
  useGetLeaveRequestsQuery, 
  useCreateLeaveRequestMutation, 
  useApproveLeaveRequestMutation, 
  useRejectLeaveRequestMutation,
  type LeaveRequest 
} from '@/redux/api/leave/leave.api';

const leaveTypeMap: Record<string, string> = {
  SICK: 'Sick Leave',
  VACATION: 'Vacation',
  PERSONAL: 'Personal',
  EMERGENCY: 'Emergency',
  MATERNITY: 'Maternity',
  PATERNITY: 'Paternity',
  OTHER: 'Other',
};

const LeaveTracker: React.FC = () => {
  const { user } = useSelector(selectAuth);
  const isHR = user?.role === 'HUMAN_RESOURCE';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  // API hooks
  const { data: leaveRequestsData, isLoading: isLoadingRequests, refetch: refetchRequests } = useGetLeaveRequestsQuery({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    leaveType: leaveTypeFilter !== 'ALL' ? leaveTypeFilter as any : undefined,
    page: currentPage,
    limit: recordsPerPage,
  });

  const [createLeaveRequest, { isLoading: isCreating }] = useCreateLeaveRequestMutation();
  const [approveLeaveRequest, { isLoading: isApproving }] = useApproveLeaveRequestMutation();
  const [rejectLeaveRequest, { isLoading: isRejecting }] = useRejectLeaveRequestMutation();

  // Get leave requests from API or empty array
  const allRequests = leaveRequestsData?.data || [];

  // Filter and search leave requests (client-side search on API results)
  const filteredRequests = useMemo(() => {
    if (!searchTerm) return allRequests;
    return allRequests.filter((request) => {
      const matchesSearch =
        request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.employeeEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [allRequests, searchTerm]);

  // Pagination - use API pagination when available, otherwise client-side
  const totalRecords = leaveRequestsData?.pagination?.total || filteredRequests.length;
  const totalPages = leaveRequestsData?.pagination?.totalPages || Math.ceil(filteredRequests.length / recordsPerPage);
  const paginatedRequests = leaveRequestsData?.pagination 
    ? filteredRequests // API handles pagination
    : filteredRequests.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage); // Client-side pagination

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await approveLeaveRequest(requestId).unwrap();
      refetchRequests();
    } catch (error) {
      console.error('Failed to approve leave request:', error);
    }
  };

  const handleReject = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (selectedRequestId) {
      try {
        await rejectLeaveRequest({
          leaveRequestId: selectedRequestId,
          data: { rejectionReason: reason },
        }).unwrap();
        setShowRejectModal(false);
        setSelectedRequestId(null);
        refetchRequests();
      } catch (error) {
        console.error('Failed to reject leave request:', error);
      }
    }
  };

  const handleRecordsPerPageChange = (value: number) => {
    setRecordsPerPage(value);
    setCurrentPage(1);
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, leaveTypeFilter]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-gray-700" />
            <h1 className="text-2xl font-semibold text-gray-800">Leave Tracker</h1>
          </div>
          {!isHR && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Request Leave
            </button>
          )}
        </div>
      </div>

      {/* Top Control Bar */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full md:w-auto">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm cursor-pointer appearance-none bg-white"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={leaveTypeFilter}
                onChange={(e) => setLeaveTypeFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm cursor-pointer appearance-none bg-white"
              >
                <option value="ALL">All Types</option>
                <option value="SICK">Sick Leave</option>
                <option value="VACATION">Vacation</option>
                <option value="PERSONAL">Personal</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="MATERNITY">Maternity</option>
                <option value="PATERNITY">Paternity</option>
                <option value="OTHER">Other</option>
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg overflow-hidden">
        {isLoadingRequests ? (
          <div className="flex items-center justify-center py-12">
            <ColorRing
              height="60"
              width="60"
              colors={[theme.colors.active, theme.colors.active, theme.colors.active, theme.colors.active, theme.colors.active]}
              ariaLabel="loading"
              visible={true}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Employee</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Leave Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Days</th>
                  {!isHR && (
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Reason</th>
                  )}
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Submitted</th>
                  {isHR && (
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={isHR ? 6 : 6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || statusFilter !== 'ALL' || leaveTypeFilter !== 'ALL'
                        ? 'No leave requests found matching your filters'
                        : 'No leave requests found'}
                    </td>
                  </tr>
                ) : (
                paginatedRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.employeeName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.employeeId} • {request.employeeRole}
                          </div>
                          {request.department && (
                            <div className="text-xs text-gray-400">{request.department}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {leaveTypeMap[request.leaveType] || request.leaveType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {request.numberOfDays} {request.numberOfDays === 1 ? 'day' : 'days'}
                    </td>
                    {!isHR && (
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                        <div className="truncate" title={request.reason}>
                          {request.reason}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>{format(new Date(request.submittedAt), 'dd MMM yyyy')}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(request.submittedAt), 'HH:mm')}
                      </div>
                      {request.reviewedAt && (
                        <div className="text-xs text-gray-400 mt-1">
                          Reviewed: {format(new Date(request.reviewedAt), 'dd MMM yyyy')}
                        </div>
                      )}
                    </td>
                    {isHR && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowReasonModal(true);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          {request.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(request.id)}
                                disabled={isApproving || isRejecting}
                                className="px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                disabled={isApproving || isRejecting}
                                className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                              >
                                <XCircle className="w-3 h-3" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoadingRequests && totalRecords > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Showing</span>
              <select
                value={recordsPerPage}
                onChange={(e) => handleRecordsPerPageChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="text-sm text-gray-700">
              {leaveRequestsData?.pagination 
                ? `Showing ${(currentPage - 1) * recordsPerPage + 1} to ${Math.min(currentPage * recordsPerPage, totalRecords)} out of ${totalRecords} records`
                : `Showing ${(currentPage - 1) * recordsPerPage + 1} to ${Math.min(currentPage * recordsPerPage, filteredRequests.length)} out of ${filteredRequests.length} records`
              }
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ←
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 border rounded text-sm transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#05431E] text-white border-[#05431E]'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Request Leave Modal */}
      {showRequestModal && (
        <LeaveRequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSubmit={async (data) => {
            try {
              await createLeaveRequest(data).unwrap();
              setShowRequestModal(false);
              refetchRequests();
            } catch (error) {
              console.error('Failed to submit leave request:', error);
            }
          }}
        />
      )}

      {/* Reject Leave Modal */}
      {showRejectModal && (
        <RejectLeaveModal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedRequestId(null);
          }}
          onConfirm={handleRejectConfirm}
        />
      )}

      {/* View Reason Modal */}
      {showReasonModal && selectedRequest && (
        <ViewReasonModal
          isOpen={showReasonModal}
          onClose={() => {
            setShowReasonModal(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
          isHR={isHR}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default LeaveTracker;

