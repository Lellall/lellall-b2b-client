import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetRestaurantBySubdomainQuery } from '@/redux/api/restaurant/restaurant.api';
import { ColorRing } from 'react-loader-spinner';
import { theme } from '@/theme/theme';
import { format } from 'date-fns';
import banner from '@/assets/banner.svg';
import {
    People,
    Clock,
    Cloud,
    ArrowRight2,
    Moon,
    Calendar2,
    Add,
    Filter,
    Sun1
} from 'iconsax-react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import styled from 'styled-components';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Mock data - Replace with actual API calls
const mockKPIData = {
    totalEmployees: 452,
    onTime: 360,
    absent: 30,
    lateArrival: 62,
    earlyDepartures: 6,
    timeOff: 42,
    onTimeChange: -10,
    absentChange: 3,
    lateChange: 3,
    earlyChange: -10,
    timeOffChange: 2,
};

const mockAttendanceComparisonData = [
    { date: '01 Aug', percentage: 85 },
    { date: '02 Aug', percentage: 88 },
    { date: '03 Aug', percentage: 82 },
    { date: '04 Aug', percentage: 90 },
    { date: '05 Aug', percentage: 87 },
    { date: '06 Aug', percentage: 89 },
    { date: '07 Aug', percentage: 91 },
    { date: '08 Aug', percentage: 86 },
    { date: '09 Aug', percentage: 88 },
    { date: '10 Aug', percentage: 85 },
    { date: '11 Aug', percentage: 87 },
    { date: '12 Aug', percentage: 90 },
    { date: '13 Aug', percentage: 88 },
    { date: '14 Aug', percentage: 86 },
    { date: '15 Aug', percentage: 89 },
    { date: '16 Aug', percentage: 91 },
];

const mockWeeklyAttendanceData = [
    { department: 'Sales', percentage: 78 },
    { department: 'IT', percentage: 82 },
    { department: 'Marketing', percentage: 86 },
    { department: 'Legal', percentage: 75 },
    { department: 'API', percentage: 80 },
];

export const Banner = styled.div`
    background-image: url(${banner}); 
    background-size: cover;
    background-position: center;
    border-radius: 15px;
    width: 100%;
    height: 120px;
`;

const HRDashboard: React.FC = () => {
    const { subdomain, user } = useSelector(selectAuth);
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [chartView, setChartView] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

    const {
        data: restaurant,
        isLoading: isRestaurantLoading,
    } = useGetRestaurantBySubdomainQuery(subdomain, { skip: !subdomain });

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return format(date, 'h:mm:ss a');
    };

    const formatDate = (date: Date) => {
        return format(date, "do 'of' MMMM yyyy");
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

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            {/* Welcome Banner */}
            <Banner className="p-6 mb-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
                </div>
                <div className="relative flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome {user?.firstName || 'User'}!
                        </h1>
                        <div className="flex gap-4 text-white/80 text-sm">
                            <a href="/staffs" className="hover:text-white transition-colors">All Employees</a>
                            <span>•</span>
                            <a href="/payroll" className="hover:text-white transition-colors">Payroll</a>
                            <span>•</span>
                            <a href="/leave-tracker" className="hover:text-white transition-colors">Leave tracker</a>
                        </div>
                    </div>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors ">
                        <Add size={24} />
                    </button>
                </div>
            </Banner>

            <div className="grid grid-cols-1 mt-4 lg:grid-cols-4 gap-6 mb-6">
                {/* Time and Date Card */}
                <div className="bg-white rounded-lg p-6 min-h-[200px] flex flex-col justify-between">
                    <div className="flex items-center gap-3 ">
                        <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <Sun1 size={24} className="text-yellow-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{formatTime(currentTime)}</div>
                            <div className="text-xs text-gray-500">Realtime Insight</div>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 ">Today: {formatDate(new Date())}</div>
                    <button
                        onClick={() => navigate('/attendance')}
                        className="w-full mt-10 bg-[#05431E] hover:bg-[#043020] text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                        View Attendance
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Total Employees */}
                    <div className="bg-white rounded-lg p-4 min-h-[140px] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <People size={24} className="text-blue-600" />
                            <span className="text-2xl font-bold text-gray-900">{mockKPIData.totalEmployees}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Total Employees</div>
                        <div className="text-xs text-green-600">+ 2 new employees added!</div>
                    </div>

                    {/* On Time */}
                    <div className="bg-white rounded-lg p-4 min-h-[140px] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <Clock size={24} className="text-green-600" />
                            <span className="text-2xl font-bold text-gray-900">{mockKPIData.onTime}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-700 mb-1">On Time</div>
                        <div className="text-xs text-green-600 flex items-center gap-1">
                            <ArrowRight2 size={12} className="rotate-[-90deg]" />
                            {Math.abs(mockKPIData.onTimeChange)}% Less than yesterday
                        </div>
                    </div>

                    {/* Absent */}
                    <div className="bg-white rounded-lg p-4 min-h-[140px] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <Cloud size={24} className="text-red-600" />
                            <span className="text-2xl font-bold text-gray-900">{mockKPIData.absent}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Absent</div>
                        <div className="text-xs text-red-600 flex items-center gap-1">
                            <ArrowRight2 size={12} className="rotate-90" />
                            +{mockKPIData.absentChange}% Increase than yesterday
                        </div>
                    </div>

                    {/* Late Arrival */}
                    <div className="bg-white rounded-lg p-4 min-h-[140px] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <ArrowRight2 size={24} className="text-orange-600" />
                            <span className="text-2xl font-bold text-gray-900">{mockKPIData.lateArrival}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Late Arrival</div>
                        <div className="text-xs text-red-600 flex items-center gap-1">
                            <ArrowRight2 size={12} className="rotate-90" />
                            +{mockKPIData.lateChange}% Increase than yesterday
                        </div>
                    </div>

                    {/* Early Departures */}
                    <div className="bg-white rounded-lg p-4 min-h-[140px] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <Moon size={24} className="text-purple-600" />
                            <span className="text-2xl font-bold text-gray-900">{mockKPIData.earlyDepartures}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Early Departures</div>
                        <div className="text-xs text-green-600 flex items-center gap-1">
                            <ArrowRight2 size={12} className="rotate-[-90deg]" />
                            {Math.abs(mockKPIData.earlyChange)}% Less than yesterday
                        </div>
                    </div>

                    {/* Time-off */}
                    <div className="bg-white rounded-lg p-4 min-h-[140px] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <Calendar2 size={24} className="text-indigo-600" />
                            <span className="text-2xl font-bold text-gray-900">{mockKPIData.timeOff}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Time-off</div>
                        <div className="text-xs text-blue-600 flex items-center gap-1">
                            <ArrowRight2 size={12} className="rotate-90" />
                            {mockKPIData.timeOffChange}% Increase than yesterday
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Comparison Chart */}
                <div className="bg-white rounded-lg p-6 ">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Attendance Comparison Chart</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setChartView('Daily')}
                                    className={`px-3 py-1 text-xs rounded transition-colors ${chartView === 'Daily'
                                        ? 'bg-white text-[#05431E] '
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Daily
                                </button>
                                <button
                                    onClick={() => setChartView('Weekly')}
                                    className={`px-3 py-1 text-xs rounded transition-colors ${chartView === 'Weekly'
                                        ? 'bg-white text-[#05431E] '
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Weekly
                                </button>
                                <button
                                    onClick={() => setChartView('Monthly')}
                                    className={`px-3 py-1 text-xs rounded transition-colors ${chartView === 'Monthly'
                                        ? 'bg-white text-[#05431E] '
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Monthly
                                </button>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Filter size={18} className="text-gray-600" />
                            </button>
                        </div>
                    </div>
                    <div style={{ height: '300px', position: 'relative' }}>
                        <Line
                            data={{
                                labels: mockAttendanceComparisonData.map(item => item.date),
                                datasets: [
                                    {
                                        label: 'Attendance %',
                                        data: mockAttendanceComparisonData.map(item => item.percentage),
                                        borderColor: '#05431E',
                                        backgroundColor: 'rgba(5, 67, 30, 0.1)',
                                        fill: true,
                                        tension: 0.4,
                                        borderWidth: 2,
                                        pointRadius: 4,
                                        pointBackgroundColor: '#05431E',
                                        pointBorderColor: '#fff',
                                        pointBorderWidth: 2,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                    tooltip: {
                                        backgroundColor: '#fff',
                                        borderColor: '#e5e7eb',
                                        borderWidth: 1,
                                        titleColor: '#1f2937',
                                        bodyColor: '#374151',
                                        padding: 12,
                                        cornerRadius: 8,
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 100,
                                        ticks: {
                                            callback: function (value) {
                                                return value + '%';
                                            },
                                            color: '#6b7280',
                                            font: {
                                                size: 12,
                                            },
                                        },
                                        grid: {
                                            color: '#e5e7eb',
                                            dash: [3, 3],
                                        } as any,
                                    },
                                    x: {
                                        ticks: {
                                            color: '#6b7280',
                                            font: {
                                                size: 12,
                                            },
                                        },
                                        grid: {
                                            display: false,
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Weekly Attendance Chart */}
                <div className="bg-white rounded-lg p-6 ">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Weekly Attendance</h2>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Filter size={18} className="text-gray-600" />
                        </button>
                    </div>
                    <div style={{ height: '300px', position: 'relative' }}>
                        <Bar
                            data={{
                                labels: mockWeeklyAttendanceData.map(item => item.department),
                                datasets: [
                                    {
                                        label: 'Attendance %',
                                        data: mockWeeklyAttendanceData.map(item => item.percentage),
                                        backgroundColor: mockWeeklyAttendanceData.map((item) =>
                                            item.department === 'Marketing' ? '#05431E' : 'rgba(5, 67, 30, 0.6)'
                                        ),
                                        borderRadius: 8,
                                        borderSkipped: false,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                    tooltip: {
                                        backgroundColor: '#fff',
                                        borderColor: '#e5e7eb',
                                        borderWidth: 1,
                                        titleColor: '#1f2937',
                                        bodyColor: '#374151',
                                        padding: 12,
                                        cornerRadius: 8,
                                        callbacks: {
                                            label: function (context) {
                                                return `Attendance: ${context.parsed.y}%`;
                                            },
                                        },
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 100,
                                        ticks: {
                                            callback: function (value) {
                                                return value + '%';
                                            },
                                            color: '#6b7280',
                                            font: {
                                                size: 12,
                                            },
                                        },
                                        grid: {
                                            color: '#e5e7eb',
                                            dash: [3, 3],
                                        } as any,
                                    },
                                    x: {
                                        ticks: {
                                            color: '#6b7280',
                                            font: {
                                                size: 12,
                                            },
                                        },
                                        grid: {
                                            display: false,
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;

