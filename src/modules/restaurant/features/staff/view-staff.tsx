import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Briefcase, FileText, Lock, Mail, Calendar, Building2, Clock, Activity, Percent } from 'lucide-react';
import { Pencil } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetRestaurantBySubdomainQuery, useGetUserByIdQuery } from '@/redux/api/restaurant/restaurant.api';
import { useGetStaffAttendanceByUserIdQuery } from '@/redux/api/attendance/attendance.api';
import { ColorRing } from 'react-loader-spinner';
import { theme } from '@/theme/theme';
import { format } from 'date-fns';

type TabType = 'personal' | 'professional' | 'documents' | 'account';
type SideNavType = 'profile' | 'attendance' | 'branch' | 'leave';

const ViewStaff: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subdomain } = useSelector(selectAuth);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [activeSideNav, setActiveSideNav] = useState<SideNavType>('profile');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const {
    data: restaurant,
    isLoading: isRestaurantLoading,
  } = useGetRestaurantBySubdomainQuery(subdomain, { skip: !subdomain });

  const {
    data: selectedUser,
    isLoading: isUserLoading,
  } = useGetUserByIdQuery(id || '', { skip: !id });

  const {
    data: attendanceHistory,
    isLoading: isAttendanceLoading,
  } = useGetStaffAttendanceByUserIdQuery(
    {
      userId: id || '',
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
    { skip: !id || activeSideNav !== 'attendance' }
  );

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}` || '??';
  };

  const getFullName = (user: any) => {
    return `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'N/A';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatShortDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'hh:mm a');
    } catch {
      return '-';
    }
  };

  const formatWorkingHours = (checkInTime: string | null, checkOutTime: string | null) => {
    if (!checkInTime || !checkOutTime) return '-';
    try {
      const start = new Date(checkInTime);
      const end = new Date(checkOutTime);
      const diffMs = end.getTime() - start.getTime();
      if (diffMs <= 0) return '-';
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} Hrs`;
    } catch {
      return '-';
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    const base = 'px-3 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'PRESENT':
      case 'ON_TIME':
        return `${base} bg-green-100 text-green-700`;
      case 'LATE':
        return `${base} bg-yellow-100 text-yellow-700`;
      case 'LEAVE':
        return `${base} bg-blue-100 text-blue-700`;
      case 'ABSENT':
        return `${base} bg-red-100 text-red-700`;
      case 'HALF_DAY':
        return `${base} bg-purple-100 text-purple-700`;
      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'personal', label: 'Personal Information', icon: <User size={18} /> },
    { id: 'professional', label: 'Professional Information', icon: <Briefcase size={18} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={18} /> },
    { id: 'account', label: 'Account Access', icon: <Lock size={18} /> },
  ];

  const sideNavItems: { id: SideNavType; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'attendance', label: 'Attendance', icon: <Calendar size={18} /> },
    { id: 'branch', label: 'Branch', icon: <Building2 size={18} /> },
    { id: 'leave', label: 'Leave', icon: <FileText size={18} /> },
  ];

  if (isRestaurantLoading || isUserLoading) {
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

  if (!selectedUser) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-gray-500">Staff member not found</p>
          <button
            onClick={() => navigate('/staffs')}
            className="mt-4 text-[#05431E] hover:text-[#043020] transition-colors"
          >
            ← Back to All Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Employee Overview Section */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <div className="flex items-center gap-6">
          {/* Profile Picture */}
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            {selectedUser.profilePicture ? (
              <img
                src={selectedUser.profilePicture}
                alt={getFullName(selectedUser)}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-4xl font-medium text-gray-600">
                {getInitials(selectedUser.firstName, selectedUser.lastName)}
              </span>
            )}
          </div>

          {/* Employee Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {getFullName(selectedUser)}
            </h1>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Briefcase size={18} />
              <span className="text-sm">{selectedUser.role || selectedUser.designation || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail size={18} />
              <span className="text-sm">{selectedUser.email || 'N/A'}</span>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={() => navigate(`/staffs/${id}/edit`)}
            className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Pencil size={18} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Tab Navigation - only for Profile side section */}
      {activeSideNav === 'profile' && (
        <div className="bg-white rounded-lg mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#05431E] border-b-2 border-[#05431E]'
                    : 'text-gray-600 hover:text-[#05431E]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-[#05431E] rounded-lg p-4">
            <div className="space-y-2">
              {sideNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSideNav(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSideNav === item.id
                      ? 'bg-white text-[#05431E]'
                      : 'text-white hover:bg-[#043020]'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {/* Profile Details (tabs) */}
          {activeSideNav === 'profile' && (
            <div className="bg-white rounded-lg p-6">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">First Name</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.firstName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Mobile Number</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.phoneNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Date of Birth</label>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(selectedUser.dateOfBirth)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Gender</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.gender || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Address</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.address || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">State</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.state ? `${selectedUser.state}, Nigeria.` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Last Name</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.lastName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Marital Status</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.maritalStatus || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Email Address</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Nationality</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.nationality || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">City</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.city || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Zip Code</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.zipCode || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

              {/* Professional Information Tab */}
              {activeTab === 'professional' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Employee ID</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.employeeId || selectedUser.id?.slice(0, 9) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Employee Type</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.employeeType || selectedUser.role || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Department</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.department?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Working Days</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.workingDays || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Office Location</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.officeLocation || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">User Name</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.userName || selectedUser.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Email Address</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Designation</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.designation || selectedUser.role || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Joining Date</label>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(selectedUser.joiningDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
              <div className="space-y-6">
                {selectedUser.appointmentLetter && (
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">Appointment Letter</label>
                    <a
                      href={selectedUser.appointmentLetter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#05431E] hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                )}
                {selectedUser.salarySlips && selectedUser.salarySlips.length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">Salary Slips</label>
                    <div className="space-y-2">
                      {selectedUser.salarySlips.map((slip: string, index: number) => (
                        <a
                          key={index}
                          href={slip}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-[#05431E] hover:underline"
                        >
                          Salary Slip {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {selectedUser.relivingLetter && (
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">Reliving Letter</label>
                    <a
                      href={selectedUser.relivingLetter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#05431E] hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                )}
                {selectedUser.experienceLetter && (
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">Experience Letter</label>
                    <a
                      href={selectedUser.experienceLetter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#05431E] hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                )}
                {!selectedUser.appointmentLetter && 
                 !selectedUser.salarySlips?.length && 
                 !selectedUser.relivingLetter && 
                 !selectedUser.experienceLetter && (
                  <p className="text-gray-500 text-center py-8">No documents available</p>
                )}
              </div>
            )}

              {/* Account Access Tab */}
              {activeTab === 'account' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Monthly Salary</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.monthlySalary 
                        ? `₦${Number(selectedUser.monthlySalary).toLocaleString()}` 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Annual Salary</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.annualSalary 
                        ? `₦${Number(selectedUser.annualSalary).toLocaleString()}` 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Bank</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.bank || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Branch</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.bankBranch || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Account Number</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.accountNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Account Name</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.accountName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">BVN</label>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.bvn || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              )}
            </div>
          )}

          {/* Attendance Side Section */}
          {activeSideNav === 'attendance' && (
            <div className="bg-white rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
                  <p className="text-sm text-gray-500">
                    View {getFullName(selectedUser)}'s attendance history
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">From</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#05431E]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">To</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#05431E]"
                    />
                  </div>
                </div>
              </div>

              {isAttendanceLoading ? (
                <div className="flex items-center justify-center h-40">
                  <ColorRing
                    height="60"
                    width="60"
                    colors={[theme.colors.active, theme.colors.active, theme.colors.active, theme.colors.active, theme.colors.active]}
                    ariaLabel="loading"
                    visible={true}
                  />
                </div>
              ) : !attendanceHistory ? (
                <p className="text-gray-500 text-center py-10 text-sm">
                  No attendance data available.
                </p>
              ) : (
                <>
                  {/* Statistics cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="border border-gray-100 rounded-lg p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                        <Clock size={16} className="text-[#05431E]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Days</p>
                        <p className="text-base font-semibold text-gray-900">
                          {attendanceHistory.statistics.totalDays}
                        </p>
                      </div>
                    </div>
                    <div className="border border-gray-100 rounded-lg p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Activity size={16} className="text-emerald-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Present</p>
                        <p className="text-base font-semibold text-gray-900">
                          {attendanceHistory.statistics.presentDays}
                        </p>
                      </div>
                    </div>
                    <div className="border border-gray-100 rounded-lg p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                        <Clock size={16} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Late Days</p>
                        <p className="text-base font-semibold text-gray-900">
                          {attendanceHistory.statistics.lateDays}
                        </p>
                      </div>
                    </div>
                    <div className="border border-gray-100 rounded-lg p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <Percent size={16} className="text-blue-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Attendance Rate</p>
                        <p className="text-base font-semibold text-gray-900">
                          {attendanceHistory.statistics.attendanceRate || '0'}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Attendance table */}
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Check In
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Check Out
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Working Hours
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Notes
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                          {attendanceHistory.attendances.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {record.formattedDate || formatShortDate(record.date)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {formatTime(record.checkInTime)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {formatTime(record.checkOutTime)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {formatWorkingHours(record.checkInTime, record.checkOutTime)}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={getStatusBadgeClasses(record.status)}>
                                  {record.status === 'ON_TIME' ? 'On Time' : record.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                                {record.notes || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {attendanceHistory.attendances.length === 0 && (
                      <p className="text-gray-500 text-center py-8 text-sm">
                        No attendance records found for the selected range.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Branch and Leave side sections can be implemented later */}
        </div>
      </div>
    </div>
  );
};

export default ViewStaff;
