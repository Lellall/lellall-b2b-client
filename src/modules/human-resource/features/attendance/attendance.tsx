import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Search, ArrowUp, SlidersHorizontal, Pencil, Clock, LogIn, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { ColorRing } from 'react-loader-spinner';
import { theme } from '@/theme/theme';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetRestaurantBySubdomainQuery } from '@/redux/api/restaurant/restaurant.api';
import {
  useGetStaffWithAttendanceStatusQuery,
  useRecordAttendanceMutation,
  useUpdateAttendanceStatusMutation,
  useRecordCheckInOutMutation,
  StaffMemberWithAttendance,
} from '@/redux/api/attendance/attendance.api';

// Map API status to UI display
const statusMap: Record<string, string> = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  HALF_DAY: 'Half Shift',
  LEAVE: 'Leave',
  LATE: 'Late',
  ON_TIME: 'On Time',
  EARLY_LEAVE: 'Early Leave',
};

// Map UI status to API status
const apiStatusMap: Record<string, 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE'> = {
  Present: 'PRESENT',
  Absent: 'ABSENT',
  'Half Shift': 'HALF_DAY',
  Leave: 'LEAVE',
};

const Attendance: React.FC = () => {
  const { subdomain } = useSelector(selectAuth);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Get restaurant data
  const {
    data: restaurant,
    isLoading: isRestaurantLoading,
  } = useGetRestaurantBySubdomainQuery(subdomain, { skip: !subdomain });

  // Get parent restaurant ID (if restaurant is a branch, use parentId, otherwise use restaurant.id)
  const parentRestaurantId = restaurant?.parentId || restaurant?.id;

  // Get staff with attendance status for the selected date
  const {
    data: staffResponse,
    isLoading: isStaffLoading,
    refetch: refetchStaff,
  } = useGetStaffWithAttendanceStatusQuery(
    {
      parentRestaurantId: parentRestaurantId || '',
      date: format(selectedDate, 'yyyy-MM-dd'),
    },
    { 
      skip: !parentRestaurantId,
      refetchOnMountOrArgChange: true, // Force refetch when date changes
    }
  );

  const [recordAttendance, { isLoading: isRecording }] = useRecordAttendanceMutation();
  const [updateAttendanceStatus, { isLoading: isUpdating }] = useUpdateAttendanceStatusMutation();
  const [recordCheckInOut, { isLoading: isCheckInOutLoading }] = useRecordCheckInOutMutation();

  const allStaff = staffResponse?.staff || [];

  // Filter and paginate staff client-side
  const filteredStaff = useMemo(() => {
    return allStaff.filter((staff) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        staff.fullName.toLowerCase().includes(searchLower) ||
        staff.email.toLowerCase().includes(searchLower) ||
        staff.employeeId.toLowerCase().includes(searchLower) ||
        staff.role.toLowerCase().includes(searchLower)
      );
    });
  }, [allStaff, searchTerm]);

  // Pagination
  const totalRecords = filteredStaff.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedStaff = filteredStaff.slice(startIndex, endIndex);

  // Handle Check-In/Check-Out
  const handleCheckInOut = async (staff: StaffMemberWithAttendance, action: 'CHECK_IN' | 'CHECK_OUT') => {
    if (!parentRestaurantId) return;

    try {
      await recordCheckInOut({
        userId: staff.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        action,
        departmentId: staff.departmentId || undefined,
        branchId: staff.restaurantId && staff.restaurantId !== parentRestaurantId ? staff.restaurantId : undefined,
        notes: action === 'CHECK_IN' ? 'Staff checked in' : 'Staff checked out',
      }).unwrap();

      refetchStaff();
    } catch (error) {
      console.error(`Failed to record ${action}:`, error);
    }
  };

  const handleStatusChange = async (staff: StaffMemberWithAttendance, status: string) => {
    if (!parentRestaurantId) return;

    const apiStatus = apiStatusMap[status];
    if (!apiStatus) return;

    try {
      const attendanceRecord = staff.attendance;

      // If attendance record already exists, update it
      if (attendanceRecord?.id) {
        await updateAttendanceStatus({
          attendanceId: attendanceRecord.id,
          data: { status: apiStatus },
        }).unwrap();
      } else {
        // Otherwise, create a new attendance record
        await recordAttendance({
          userId: staff.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          status: apiStatus,
        }).unwrap();

        // Additionally, record a CHECK_IN when marking as Present for the first time
        if (apiStatus === 'PRESENT') {
          await recordCheckInOut({
            userId: staff.id,
            date: format(selectedDate, 'yyyy-MM-dd'),
            action: 'CHECK_IN',
            departmentId: staff.departmentId || undefined,
            branchId: staff.restaurantId && staff.restaurantId !== parentRestaurantId ? staff.restaurantId : undefined,
            notes: 'Staff checked in when attendance was recorded as Present',
          }).unwrap();
        }
      }

      // Refetch staff list
      refetchStaff();
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update attendance:', error);
    }
  };

  const getStatusButtonClass = (status: string | null) => {
    const baseClass = 'px-3 py-1 rounded text-xs font-medium transition-colors';
    if (!status) return `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200`;
    
    const displayStatus = statusMap[status] || status;
    
    switch (displayStatus) {
      case 'Present':
        return `${baseClass} bg-green-100 text-green-700 hover:bg-green-200`;
      case 'Absent':
        return `${baseClass} bg-yellow-100 text-yellow-700 hover:bg-yellow-200`;
      case 'Half Shift':
        return `${baseClass} bg-blue-100 text-blue-700 hover:bg-blue-200`;
      case 'Leave':
        return `${baseClass} bg-red-100 text-red-700 hover:bg-red-200`;
      default:
        return `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200`;
    }
  };

  const getAttendanceStatusBadge = (staff: StaffMemberWithAttendance) => {
    if (!staff.hasAttendance) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
          Not Recorded
        </span>
      );
    }

    if (staff.isCheckedIn) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
          Checked In
        </span>
      );
    }

    if (staff.attendance?.hasCheckOut) {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
          Checked Out
        </span>
      );
    }

    return null;
  };

  // Get shift time display
  const getShiftTimeDisplay = (staff: StaffMemberWithAttendance) => {
    // Use shiftTime from staff object (backend now provides this)
    if (staff.shiftTime && staff.shiftTime !== 'N/A') {
      return staff.shiftTime;
    }
    
    // Fallback: show actual check-in/check-out times if available
    if (staff.attendance?.checkInTime && staff.attendance?.checkOutTime) {
      return `${format(new Date(staff.attendance.checkInTime), 'HH:mm')} - ${format(new Date(staff.attendance.checkOutTime), 'HH:mm')}`;
    }
    
    // Fallback: show check-in time only
    if (staff.attendance?.checkInTime) {
      return `${format(new Date(staff.attendance.checkInTime), 'HH:mm')} - --`;
    }
    
    return 'N/A';
  };

  // Determine what buttons to show
  const getActionButtons = (staff: StaffMemberWithAttendance) => {
    // If no attendance recorded, show status buttons + Check In button
    if (!staff.hasAttendance) {
      return {
        showStatusButtons: true,
        showCheckIn: true,
        showCheckOut: false,
        showEdit: false,
      };
    }

    // If currently checked in, show Check Out button
    if (staff.isCheckedIn) {
      return {
        showStatusButtons: false,
        showCheckIn: false,
        showCheckOut: true,
        showEdit: false,
      };
    }

    // If checked out, show status with edit option
    if (staff.attendance?.hasCheckOut) {
      return {
        showStatusButtons: false,
        showCheckIn: false,
        showCheckOut: false,
        showEdit: true,
      };
    }

    // If status-only record (no times), show only status with edit button
    return {
      showStatusButtons: false,
      showCheckIn: false,
      showCheckOut: false,
      showEdit: true,
    };
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export attendance data');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setSelectedDate(date);
    setCurrentPage(1); // Reset to first page when date changes
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Refetch attendance data when date changes
  useEffect(() => {
    if (parentRestaurantId) {
      refetchStaff();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format(selectedDate, 'yyyy-MM-dd'), parentRestaurantId]);

  // Reset to first page when records per page changes
  const handleRecordsPerPageChange = (value: number) => {
    setRecordsPerPage(value);
    setCurrentPage(1);
  };

  if (isRestaurantLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ColorRing
          height="80"
          width="80"
          colors={[theme.colors.active, theme.colors.active, theme.colors.active, theme.colors.active, theme.colors.active]}
          ariaLabel="loading"
          visible={true}
        />
      </div>
    );
  }

  if (!parentRestaurantId) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-gray-500">Restaurant not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-semibold text-gray-800">Attendance</h1>
        </div>
        {/* Summary Stats */}
        {/* {summary && (
          <div className="flex gap-4 mt-4">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <div className="text-xs text-gray-500">Total Staff</div>
              <div className="text-lg font-semibold text-gray-900">{summary.totalStaff}</div>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <div className="text-xs text-gray-500">With Attendance</div>
              <div className="text-lg font-semibold text-green-600">{summary.withAttendance}</div>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
              <div className="text-xs text-gray-500">Without Attendance</div>
              <div className="text-lg font-semibold text-yellow-600">{summary.withoutAttendance}</div>
            </div>
          </div>
        )} */}
      </div>

      {/* Top Control Bar */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full md:w-auto">
            <Button
              onClick={handleExport}
              className="bg-[#05431E] hover:bg-[#043020] text-white px-4 py-2 text-sm flex items-center gap-2"
            >
              <ArrowUp className="w-4 h-4" />
              Export
            </Button>
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Quick Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative">
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm cursor-pointer"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <Button
              className="bg-[#05431E] hover:bg-[#043020] text-white px-4 py-2 text-sm flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isStaffLoading ? (
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
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Employee</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Shift Time</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedStaff.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        {searchTerm ? 'No staff members found matching your search' : 'No staff members found'}
                      </td>
                    </tr>
                  ) : (
                    paginatedStaff.map((staff) => {
                      const attendanceRecord = staff.attendance;
                      const attendanceId = attendanceRecord?.id || staff.id;
                      const isEditing = editingId === attendanceId;
                      const displayStatus = attendanceRecord?.status
                        ? statusMap[attendanceRecord.status] || attendanceRecord.status
                        : null;
                      
                      const actionButtons = getActionButtons(staff);
                      const shouldShowButtons = isEditing || actionButtons.showStatusButtons;
                      
                      return (
                        <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-600 text-sm font-medium">
                                  {staff.fullName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {staff.fullName}
                                  {staff.role && `, ${staff.role}`}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {staff.employeeId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <div>{format(selectedDate, 'dd-MMM-yyyy')}</div>
                            {attendanceRecord?.checkInTime && (
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                <span>
                                  In: {format(new Date(attendanceRecord.checkInTime), 'HH:mm')}
                                  {attendanceRecord.checkOutTime && 
                                    ` | Out: ${format(new Date(attendanceRecord.checkOutTime), 'HH:mm')}`
                                  }
                                </span>
                              </div>
                            )}
                            {attendanceRecord?.recordedAt && (
                              <div className="text-xs text-gray-400 mt-1">
                                Recorded: {format(new Date(attendanceRecord.recordedAt), 'HH:mm')}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {getShiftTimeDisplay(staff)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Status Badge */}
                              {getAttendanceStatusBadge(staff)}
                              
                              {/* Status Buttons (Present/Absent/Half Shift/Leave) */}
                              {shouldShowButtons && (
                                <div className="flex gap-2 flex-wrap">
                                  <button
                                    onClick={() => handleStatusChange(staff, 'Present')}
                                    disabled={isRecording || isUpdating || isCheckInOutLoading}
                                    className={getStatusButtonClass('Present')}
                                  >
                                    Present
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(staff, 'Absent')}
                                    disabled={isRecording || isUpdating || isCheckInOutLoading}
                                    className={getStatusButtonClass('Absent')}
                                  >
                                    Absent
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(staff, 'Half Shift')}
                                    disabled={isRecording || isUpdating || isCheckInOutLoading}
                                    className={getStatusButtonClass('Half Shift')}
                                  >
                                    Half Shift
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(staff, 'Leave')}
                                    disabled={isRecording || isUpdating || isCheckInOutLoading}
                                    className={getStatusButtonClass('Leave')}
                                  >
                                    Leave
                                  </button>
                                </div>
                              )}

                              {/* Check-In Button */}
                              {actionButtons.showCheckIn && !shouldShowButtons && (
                                <button
                                  onClick={() => handleCheckInOut(staff, 'CHECK_IN')}
                                  disabled={isCheckInOutLoading || isRecording || isUpdating}
                                  className="px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 flex items-center gap-1 transition-colors disabled:opacity-50"
                                >
                                  <LogIn className="w-3 h-3" />
                                  Check In
                                </button>
                              )}

                              {/* Check-Out Button */}
                              {actionButtons.showCheckOut && (
                                <button
                                  onClick={() => handleCheckInOut(staff, 'CHECK_OUT')}
                                  disabled={isCheckInOutLoading || isRecording || isUpdating}
                                  className="ml-auto px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-1 transition-colors disabled:opacity-50"
                                >
                                  <LogOut className="w-3 h-3" />
                                  Check Out
                                </button>
                              )}

                              {/* Status Display (when not editing) */}
                              {!shouldShowButtons && displayStatus && (
                                <span className={getStatusButtonClass(attendanceRecord?.status || null)}>
                                  {displayStatus}
                                </span>
                              )}

                              {/* Edit Button */}
                              {actionButtons.showEdit && !isEditing && (
                                <button
                                  onClick={() => setEditingId(attendanceId)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  aria-label="Edit status"
                                  disabled={isRecording || isUpdating || isCheckInOutLoading}
                                >
                                  <Pencil className="w-3 h-3 text-gray-500" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalRecords > 0 && (
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
                  Showing {startIndex + 1} to {Math.min(endIndex, totalRecords)} out of {totalRecords} records
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || isStaffLoading}
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
                        disabled={isStaffLoading}
                        className={`px-3 py-1 border rounded text-sm transition-colors ${
                          currentPage === pageNum
                            ? 'bg-[#05431E] text-white border-[#05431E]'
                            : 'border-gray-200 hover:bg-gray-50'
                        } ${isStaffLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || isStaffLoading}
                    className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Attendance;
