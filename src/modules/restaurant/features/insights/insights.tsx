import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetWaiterPerformanceQuery, useGetTopPerformersQuery, useGetBusinessInsightsQuery, useCompareRestaurantsMutation, useGetSeasonalTrendsQuery } from '@/redux/api/restaurant/restaurant.api';
import { useGetBranchesQuery, Branch } from '@/redux/api/branches/branches.api';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Activity,
  BarChart3,
  Building2,
  ArrowLeftRight,
  X,
  Users,
  Star,
  ChefHat,
  TrendingUp as TrendingUpIcon,
  Briefcase,
  Trophy,
  AlertTriangle,
  Zap,
  Home,
  CalendarDays
} from 'lucide-react';

interface WaiterPerformanceData {
  topPerformers: Array<{
    waiter: string;
    performance: string;
    strengths: string[];
    revenueGenerated: string;
    orderAccuracy: string;
  }>;
  underPerformers: Array<{
    waiter: string;
    issues: string[];
    recommendations: string[];
    conversionRate: string;
  }>;
  insights: string[];
  trainingRecommendations: string[];
  bestPractices: string[];
  orderAccuracy: {
    summary: string;
    recommendations: string[];
  };
}

interface TopPerformersData {
  superstarItems: string[];
  emergingTrends: string[];
  underperformers: string[];
  menuRecommendations: string[];
  categoryInsights: string[];
  crossSellOpportunities: string[];
}

interface BusinessInsightsData {
  trends: string[];
  opportunities: string[];
  menuOptimization: string[];
  operational: string[];
  risks: string[];
  actionItems: string[];
}

interface SeasonalTrendsData {
  seasonalTrends: string[];
  peakMonths: string[];
  lowPeriods: string[];
  patternInsights: string[];
  recommendations: string[];
  forecast: {
    nextMonth: string;
    confidence: string;
  };
}

const Insights: React.FC = () => {
  const { user } = useSelector(selectAuth);
  const [activeTab, setActiveTab] = useState<'waiter-performance' | 'top-performers' | 'business-insights' | 'comparisons' | 'seasonal-trends'>('waiter-performance');
  const [days, setDays] = useState(30);
  const [months, setMonths] = useState(12);
  const [comparisonType, setComparisonType] = useState<'revenue' | 'orders' | 'growth'>('revenue');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [includeParent, setIncludeParent] = useState(false);
  
  const restaurantId = user?.ownedRestaurants?.[0]?.id || user?.restaurantId;
  const parentRestaurant = user?.ownedRestaurants?.[0];

  // Helper to format currency (extract number from string like "₦450,000" or "₦2824890.00")
  const formatCurrency = (value: string | undefined): string => {
    if (!value) return '₦0.00';
    // Remove currency symbol and any existing formatting, but keep decimal point
    const cleaned = value.replace(/[₦,]/g, '').trim();
    if (!cleaned) return value;
    // Parse as float to preserve decimal places
    const num = parseFloat(cleaned);
    if (isNaN(num)) return value;
    // Format with 2 decimal places
    return `₦${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper to get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Fetch branches
  const parentId = user?.ownedRestaurants?.[0]?.id || user?.restaurantId || '';
  const { data: branches = [], isLoading: branchesLoading } = useGetBranchesQuery(parentId, {
    skip: !parentId,
  });
  
  const { data: waiterData, isLoading: isLoadingWaiter } = useGetWaiterPerformanceQuery(
    { restaurantId, days },
    { skip: !restaurantId || activeTab !== 'waiter-performance' }
  );
  
  const { data: topPerformersData, isLoading: isLoadingTopPerformers } = useGetTopPerformersQuery(
    { restaurantId, days },
    { skip: !restaurantId || activeTab !== 'top-performers' }
  );
  
  const { data: businessInsightsData, isLoading: isLoadingBusinessInsights } = useGetBusinessInsightsQuery(
    { restaurantId, days },
    { skip: !restaurantId || activeTab !== 'business-insights' }
  );
  
  const { data: seasonalTrendsData, isLoading: isLoadingSeasonalTrends } = useGetSeasonalTrendsQuery(
    { restaurantId, months },
    { skip: !restaurantId || activeTab !== 'seasonal-trends' }
  );
  
  // Comparison mutation
  const [compareRestaurants, { data: comparisonData, isLoading: isComparing }] = useCompareRestaurantsMutation();

  const isLoading = isLoadingWaiter || isLoadingTopPerformers || isLoadingBusinessInsights || isComparing || isLoadingSeasonalTrends;
  
  const totalSelected = selectedBranches.length + (includeParent ? 1 : 0);
  
  const toggleBranchSelection = (branchId: string) => {
    setSelectedBranches(prev => 
      prev.includes(branchId) 
        ? prev.filter(id => id !== branchId)
        : [...prev, branchId]
    );
  };
  
  const handleCompare = async () => {
    if (totalSelected < 2) return;
    
    const restaurantIds = includeParent && restaurantId 
      ? [restaurantId, ...selectedBranches]
      : selectedBranches;
    
    await compareRestaurants({
      restaurantIds,
      comparisonType,
    });
  };
  
  const removeBranch = (branchId: string) => {
    setSelectedBranches(prev => prev.filter(id => id !== branchId));
  };

  // Render Waiter Performance Tab
  const renderWaiterPerformanceTab = () => {
    if (!waiterData) return null;
    
    return (
      <div className="space-y-6">
        {/* Top Performers */}
        <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(to right, #10B981, #059669)' }}>
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-medium text-[#0F172A]">Top Performers</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {waiterData.topPerformers?.map((waiter, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200 group"
              >
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Avatar */}
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                  >
                    {getInitials(waiter.waiter)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-[#0F172A] truncate">{waiter.waiter}</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-[#10B981] bg-[#10B981]/10 mt-1">
                      {waiter.performance}
                    </span>
                  </div>
                  
                  <div className="p-2 rounded-lg bg-[#FEF3C7]/20">
                    <Star className="w-5 h-5" style={{ color: '#F59E0B' }} />
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#ECFDF5] to-[#D1FAE5]">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[#10B981]/20">
                        <Trophy className="w-4 h-4 text-[#10B981]" />
                      </div>
                      <span className="text-xs font-medium text-[#6B7280]">Revenue</span>
                    </div>
                    <span className="text-sm font-semibold text-[#0F172A]">{formatCurrency(waiter.revenueGenerated)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#EEF2FF] to-[#E0E7FF]">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[#6366F1]/20">
                        <Target className="w-4 h-4 text-[#6366F1]" />
                      </div>
                      <span className="text-xs font-medium text-[#6B7280]">Accuracy</span>
                    </div>
                    <span className="text-sm font-semibold text-[#0F172A]">{waiter.orderAccuracy}</span>
                  </div>
                </div>
                
                {/* Strengths */}
                {waiter.strengths && waiter.strengths.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#6B7280] mb-2">Key Strengths:</p>
                    <div className="flex flex-wrap gap-2">
                      {waiter.strengths?.slice(0, 2).map((strength, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#10B981] bg-[#10B981]/10">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Under Performers */}
        {waiterData.underPerformers && waiterData.underPerformers.length > 0 && (
          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(to right, #EF4444, #DC2626)' }}>
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-medium text-[#0F172A]">Need Improvement</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {waiterData.underPerformers.map((waiter, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200"
                >
                  {/* Profile Header */}
                  <div className="flex items-center gap-4 mb-4">
                    {/* Avatar */}
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
                    >
                      {getInitials(waiter.waiter)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-[#0F172A] truncate">{waiter.waiter}</h3>
                      <div className="text-xs text-[#6B7280] mt-1">
                        Needs Improvement
                      </div>
                    </div>
                    
                    <div className="p-2 rounded-lg bg-[#FEF2F2]">
                      <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#FEF2F2] to-[#FEE2E2]">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-[#EF4444]/20">
                          <AlertCircle className="w-4 h-4 text-[#EF4444]" />
                        </div>
                        <span className="text-xs font-medium text-[#6B7280]">Conversion Rate</span>
                      </div>
                      <span className="text-sm font-semibold text-[#EF4444]">{waiter.conversionRate}</span>
                    </div>
                  </div>
                  
                  {/* Issues */}
                  {waiter.issues && waiter.issues.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-[#6B7280] mb-2">Key Issues:</p>
                      <div className="space-y-1.5">
                        {waiter.issues.slice(0, 2).map((issue, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-[#EF4444]">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Recommendations */}
                  {waiter.recommendations && waiter.recommendations.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#6B7280] mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {waiter.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-[#10B981]">
                            <CheckCircle className="w-4 h-4" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Recommendations & Best Practices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(to right, #6366F1, #8B5CF6)' }}>
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-medium text-[#0F172A]">Training Recommendations</h3>
            </div>
            <div className="space-y-3">
              {waiterData.trainingRecommendations?.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[#F8F9FA]">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#6366F1]" />
                  <p className="text-sm text-[#0F172A]">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(to right, #F59E0B, #D97706)' }}>
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-medium text-[#0F172A]">Best Practices</h3>
            </div>
            <div className="space-y-3">
              {waiterData.bestPractices?.map((practice, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[#F8F9FA]">
                  <Star className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#F59E0B]" />
                  <p className="text-sm text-[#0F172A]">{practice}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Accuracy */}
        {waiterData.orderAccuracy && (
          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(to right, #10B981, #059669)' }}>
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-medium text-[#0F172A]">Order Accuracy</h3>
            </div>
            <p className="text-[#0F172A] mb-4">{waiterData.orderAccuracy.summary}</p>
            {waiterData.orderAccuracy.recommendations && (
              <div className="space-y-2">
                {waiterData.orderAccuracy.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[#ECFDF5]">
                    <Activity className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#0F172A]">{rec}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Insights */}
        {waiterData.insights && waiterData.insights.length > 0 && (
          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-[#F59E0B]" />
              <h3 className="text-lg font-medium text-[#0F172A]">AI Insights</h3>
            </div>
            <div className="space-y-3">
              {waiterData.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'linear-gradient(to right, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05))' }}>
                  <TrendingUpIcon className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#0F172A]">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Top Performers Tab
  const renderTopPerformersTab = () => {
    if (!topPerformersData) return null;
    
    return (
      <div className="space-y-6">
        {/* Superstar Items */}
        <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(to right, #6366F1, #8B5CF6)' }}>
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-medium text-[#0F172A]">Superstar Items</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topPerformersData.superstarItems?.map((item, index) => (
              <div
                key={index}
                className="p-5 rounded-xl cursor-pointer hover:-translate-y-1 transition-all duration-200"
                style={{ background: 'linear-gradient(to bottom, #EEF2FF, #E0E7FF)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-[#6366F1]/20">
                    <Star className="w-5 h-5" style={{ color: '#6366F1' }} />
                  </div>
                  <h3 className="text-base font-semibold text-[#0F172A]">{item}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#10B981]">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Top Performer</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emerging Trends */}
        <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(to right, #10B981, #059669)' }}>
              <TrendingUpIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-medium text-[#0F172A]">Emerging Trends</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topPerformersData.emergingTrends?.map((trend, index) => (
              <div
                key={index}
                className="p-5 rounded-xl cursor-pointer hover:-translate-y-1 transition-all duration-200 border-l-4 border-[#10B981]"
                style={{ background: 'linear-gradient(to right, #ECFDF5, #D1FAE5)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-[#10B981]" />
                  <h3 className="font-semibold text-[#0F172A]">{trend}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Underperformers */}
        {topPerformersData.underperformers && topPerformersData.underperformers.length > 0 && (
          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(to right, #EF4444, #DC2626)' }}>
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-medium text-[#0F172A]">Underperformers</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topPerformersData.underperformers.map((item, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl cursor-pointer hover:-translate-y-1 transition-all duration-200 bg-[#FEF2F2] border-l-4 border-[#EF4444]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                    <h3 className="font-semibold text-[#0F172A]">{item}</h3>
                  </div>
                  <p className="text-sm text-[#6B7280]">Needs attention</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Recommendations & Cross-sell Opportunities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(to right, #6366F1, #8B5CF6)' }}>
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-medium text-[#0F172A]">Menu Recommendations</h3>
            </div>
            <div className="space-y-3">
              {topPerformersData.menuRecommendations?.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[#EEF2FF]">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#6366F1]" />
                  <p className="text-sm text-[#0F172A]">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(to right, #F59E0B, #D97706)' }}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-medium text-[#0F172A]">Cross-sell Opportunities</h3>
            </div>
            <div className="space-y-3">
              {topPerformersData.crossSellOpportunities?.map((opp, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[#FFFBEB]">
                  <Zap className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#F59E0B]" />
                  <p className="text-sm text-[#0F172A]">{opp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Insights */}
        {topPerformersData.categoryInsights && topPerformersData.categoryInsights.length > 0 && (
          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(to right, #10B981, #059669)' }}>
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-medium text-[#0F172A]">Category Insights</h3>
            </div>
            <div className="space-y-3">
              {topPerformersData.categoryInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-[#ECFDF5]">
                  <TrendingUp className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#0F172A]">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Comparisons Tab
  const renderComparisonsTab = () => (
    <div className="space-y-6">
      {/* Comparison Type Selector */}
      <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200" style={{ }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[#0F172A]">Comparison Type:</label>
            <select
              value={comparisonType}
              onChange={(e) => setComparisonType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] outline-none transition-all cursor-pointer"
            >
              <option value="revenue">Revenue</option>
              <option value="orders">Orders</option>
              <option value="growth">Growth</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parent Restaurant Card */}
      {parentRestaurant && (
        <div
          onClick={() => setIncludeParent(!includeParent)}
          className={`p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
            includeParent ? 'border-2 border-[#6366F1]' : 'bg-white'
          }`}
          style={includeParent 
            ? { background: 'linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))' }
            : {}
          }
        >
          <div className="flex items-center gap-4">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              includeParent ? 'border-[#6366F1] bg-[#6366F1]' : 'border-gray-300'
            }`}>
              {includeParent && <CheckCircle className="w-3 h-3 text-white" />}
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-[#0F172A]">{parentRestaurant.name}</h3>
              <p className="text-sm text-[#6B7280]">Main Location</p>
              <span className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#6366F1]/10 text-[#6366F1]">
                Parent Restaurant
              </span>
            </div>
            {includeParent && (
              <div className="p-2 rounded-lg bg-[#10B981]/20">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Branch Selection */}
      <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200" style={{ }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(to right, #6366F1, #8B5CF6)' }}>
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-[#0F172A]">Select Branches to Compare</h2>
        </div>
        <p className="text-[#6B7280] mb-4">Select branches to compare their performance</p>
        
        {branchesLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#6366F1] border-t-transparent"></div>
          </div>
        ) : branches.length === 0 ? (
          <div className="text-center py-8 text-[#6B7280]">
            No branches available to compare
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((branch) => {
              const isSelected = selectedBranches.includes(branch.id);
              return (
                <div
                  key={branch.id}
                  onClick={() => toggleBranchSelection(branch.id)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 ${
                    isSelected ? 'border-2 border-[#6366F1]' : 'bg-white'
                  }`}
                  style={isSelected 
                    ? { background: 'linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))' }
                    : {}
                  }
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#6366F1] bg-[#6366F1]' : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="p-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    {isSelected && (
                      <div className="p-2 rounded-lg bg-[#10B981]/20">
                        <CheckCircle className="w-4 h-4 text-[#10B981]" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0F172A]">{branch.name}</h3>
                    <p className="text-sm text-[#6B7280]">{branch.address}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Branches */}
        {selectedBranches.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-[#0F172A] mb-3">
              Selected Branches ({selectedBranches.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedBranches.map((branchId) => {
                const branch = branches.find(b => b.id === branchId);
                return branch ? (
                  <div
                    key={branchId}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#EEF2FF]"
                  >
                    <span className="text-sm font-medium text-[#6366F1]">{branch.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBranch(branchId);
                      }}
                      className="text-[#EF4444] hover:text-[#DC2626]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Compare Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleCompare}
            disabled={totalSelected < 2 || isComparing}
            className={`px-8 py-3 rounded-xl font-medium text-white transition-all duration-200 ${
              totalSelected < 2
                ? 'bg-gray-400 cursor-not-allowed'
                : ''
            }`}
            style={totalSelected >= 2 ? { background: 'linear-gradient(to right, #6366F1, #8B5CF6)' } : {}}
          >
            {isComparing ? 'Comparing...' : 'Compare Branches'}
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {comparisonData && (
        <div className="space-y-6">
          {/* Best/Worst */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6 text-white cursor-pointer hover:-translate-y-1 transition-all duration-200" style={{ background: 'linear-gradient(to bottom right, #10B981, #059669)' }}>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Best Performer</h3>
              </div>
              <p className="text-2xl font-semibold">{comparisonData.comparison?.best || 'N/A'}</p>
            </div>

            <div className="rounded-2xl p-6 text-white cursor-pointer hover:-translate-y-1 transition-all duration-200" style={{ background: 'linear-gradient(to bottom right, #EF4444, #DC2626)' }}>
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Needs Improvement</h3>
              </div>
              <p className="text-2xl font-semibold">{comparisonData.comparison?.worst || 'N/A'}</p>
            </div>
          </div>

          {/* Differences */}
          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <ArrowLeftRight className="w-6 h-6" style={{ color: '#6366F1' }} />
              <h2 className="text-lg font-medium text-[#0F172A]">Key Differences</h2>
            </div>
            <div className="space-y-3">
              {comparisonData.comparison?.differences?.map((diff, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-[#EEF2FF] border-l-4 border-[#6366F1]"
                >
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-[#6366F1] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#0F172A]">{diff}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          {comparisonData.insights && comparisonData.insights.length > 0 && (
            <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-[#F59E0B]" />
                <h2 className="text-lg font-medium text-[#0F172A]">AI Insights</h2>
              </div>
              <div className="space-y-3">
                {comparisonData.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-xl bg-[#FFFBEB]"
                  >
                    <TrendingUp className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#0F172A]">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {comparisonData.recommendations && comparisonData.recommendations.length > 0 && (
            <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-[#10B981]" />
                <h2 className="text-lg font-medium text-[#0F172A]">Recommendations</h2>
              </div>
              <div className="space-y-3">
                {comparisonData.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-xl bg-[#ECFDF5]"
                  >
                    <Activity className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#0F172A]">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render Seasonal Trends Tab
  const renderSeasonalTrendsTab = () => {
    if (!seasonalTrendsData) return null;
    
    return (
      <div className="space-y-6">
        {/* Forecast */}
        <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(to right, #6366F1, #8B5CF6)' }}>
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-medium text-[#0F172A]">Next Month Forecast</h2>
          </div>
          
          <div className="p-5 rounded-xl bg-gradient-to-r from-[#EEF2FF] to-[#E0E7FF] border-l-4 border-[#6366F1]">
            <p className="text-lg font-medium text-[#0F172A] mb-2">{seasonalTrendsData.forecast?.nextMonth || 'No forecast available'}</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              seasonalTrendsData.forecast?.confidence === 'high' 
                ? 'bg-[#10B981]/20 text-[#10B981]' 
                : seasonalTrendsData.forecast?.confidence === 'medium'
                ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                : 'bg-[#6B7280]/20 text-[#6B7280]'
            }`}>
              Confidence: {seasonalTrendsData.forecast?.confidence || 'medium'}
            </span>
          </div>
        </div>

        {/* Peak Months */}
        {seasonalTrendsData.peakMonths && seasonalTrendsData.peakMonths.length > 0 && (
          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(to right, #10B981, #059669)' }}>
                <TrendingUpIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-medium text-[#0F172A]">Peak Months</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {seasonalTrendsData.peakMonths.map((month, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl cursor-pointer hover:-translate-y-1 transition-all duration-200"
                  style={{ background: 'linear-gradient(to right, #ECFDF5, #D1FAE5)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#10B981]/20">
                      <TrendingUp className="w-5 h-5 text-[#10B981]" />
                    </div>
                    <h3 className="text-base font-semibold text-[#0F172A]">{month}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low Periods */}
        {seasonalTrendsData.lowPeriods && seasonalTrendsData.lowPeriods.length > 0 && (
          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(to right, #EF4444, #DC2626)' }}>
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-medium text-[#0F172A]">Low Periods</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {seasonalTrendsData.lowPeriods.map((period, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl cursor-pointer hover:-translate-y-1 transition-all duration-200 bg-[#FEF2F2] border-l-4 border-[#EF4444]"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#EF4444]/20">
                      <TrendingDown className="w-5 h-5 text-[#EF4444]" />
                    </div>
                    <h3 className="text-base font-semibold text-[#0F172A]">{period}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seasonal Trends & Pattern Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(to right, #6366F1, #8B5CF6)' }}>
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-medium text-[#0F172A]">Seasonal Trends</h3>
            </div>
            <div className="space-y-3">
              {seasonalTrendsData.seasonalTrends?.map((trend, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[#EEF2FF]">
                  <Activity className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#6366F1]" />
                  <p className="text-sm text-[#0F172A]">{trend}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(to right, #F59E0B, #D97706)' }}>
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-medium text-[#0F172A]">Pattern Insights</h3>
            </div>
            <div className="space-y-3">
              {seasonalTrendsData.patternInsights?.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[#FFFBEB]">
                  <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#F59E0B]" />
                  <p className="text-sm text-[#0F172A]">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {seasonalTrendsData.recommendations && seasonalTrendsData.recommendations.length > 0 && (
          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(to right, #10B981, #059669)' }}>
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-medium text-[#0F172A]">Recommendations</h2>
            </div>
            
            <div className="space-y-3">
              {seasonalTrendsData.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-5 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
                  style={{ background: 'linear-gradient(to right, #ECFDF5, #D1FAE5)' }}
                >
                  <div className="p-2 rounded-lg bg-[#10B981]/20">
                    <CheckCircle className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <p className="font-medium text-[#0F172A]">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Business Insights Tab
  const renderBusinessInsightsTab = () => {
    if (!businessInsightsData) return null;
    
    return (
      <div className="space-y-6">
        {/* Trends */}
        <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(to right, #6366F1, #8B5CF6)' }}>
              <TrendingUpIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-medium text-[#0F172A]">Business Trends</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businessInsightsData.trends?.map((trend, index) => (
              <div
                key={index}
                className="p-5 rounded-xl cursor-pointer hover:-translate-y-1 transition-all duration-200"
                style={{ background: 'linear-gradient(to right, #EEF2FF, #E0E7FF)', }}
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-[#6366F1]" />
                  <p className="text-sm font-medium text-[#0F172A]">{trend}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunities */}
        {businessInsightsData.opportunities && businessInsightsData.opportunities.length > 0 && (
          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(to right, #10B981, #059669)' }}>
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-medium text-[#0F172A]">Opportunities</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businessInsightsData.opportunities.map((opp, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl cursor-pointer hover:-translate-y-1 transition-all duration-200"
                  style={{ background: 'linear-gradient(to right, #ECFDF5, #D1FAE5)' }}
                >
                  <div className="flex items-center gap-3">
                    <Lightbulb className="w-5 h-5 text-[#10B981]" />
                    <p className="text-sm font-medium text-[#0F172A]">{opp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Optimization & Operational */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <ChefHat className="w-6 h-6" style={{ color: '#6366F1' }} />
              <h3 className="text-lg font-medium text-[#0F172A]">Menu Optimization</h3>
            </div>
            <div className="space-y-3">
              {businessInsightsData.menuOptimization?.map((opt, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[#EEF2FF]">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#6366F1]" />
                  <p className="text-sm text-[#0F172A]">{opt}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-6 h-6" style={{ color: '#F59E0B' }} />
              <h3 className="text-lg font-medium text-[#0F172A]">Operational</h3>
            </div>
            <div className="space-y-3">
              {businessInsightsData.operational?.map((oper, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-[#FFFBEB]">
                  <Activity className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
                  <p className="text-sm text-[#0F172A]">{oper}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risks */}
        {businessInsightsData.risks && businessInsightsData.risks.length > 0 && (
          <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(to right, #EF4444, #DC2626)' }}>
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-medium text-[#0F172A]">Risks</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businessInsightsData.risks.map((risk, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl cursor-pointer hover:-translate-y-1 transition-all duration-200 bg-[#FEF2F2] border-l-4 border-[#EF4444]"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                    <p className="text-sm font-medium text-[#0F172A]">{risk}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items */}
        <div className="bg-white rounded-2xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(to right, #10B981, #059669)' }}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-medium text-[#0F172A]">Action Items</h2>
          </div>
          
          <div className="space-y-3">
            {businessInsightsData.actionItems?.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-5 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: 'linear-gradient(to right, #ECFDF5, #D1FAE5)' }}
              >
                <div className="p-2 rounded-lg bg-[#10B981]/20">
                  <CheckCircle className="w-5 h-5 text-[#10B981]" />
                </div>
                <div>
                  <p className="font-medium text-[#0F172A]">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#0F172A] mb-2">AI Insights & Reports</h1>
          <p className="text-[#6B7280]">AI-powered business intelligence and performance analytics</p>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-2xl p-6 mb-6 cursor-pointer hover:-translate-y-1 transition-all duration-200" style={{ }}>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-[#0F172A]">Analysis Period:</label>
              <select
                value={activeTab === 'seasonal-trends' ? months : days}
                onChange={(e) => activeTab === 'seasonal-trends' ? setMonths(Number(e.target.value)) : setDays(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1] outline-none transition-all cursor-pointer"
              >
                {activeTab === 'seasonal-trends' ? (
                  <>
                    <option value={6}>6 months</option>
                    <option value={12}>12 months</option>
                    <option value={24}>24 months</option>
                  </>
                ) : (
                  <>
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-2 mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('waiter-performance')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ease-in-out flex items-center gap-2 cursor-pointer ${
              activeTab === 'waiter-performance'
                ? 'text-white bg-[#05431E]'
                : 'text-[#6B7280] hover:text-[#0F172A] hover:bg-[#F8F9FA]'
            }`}
          >
            <Users className="w-5 h-5" />
            Waiter Performance
          </button>
          <button
            onClick={() => setActiveTab('top-performers')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ease-in-out flex items-center gap-2 cursor-pointer ${
              activeTab === 'top-performers'
                ? 'text-white bg-[#05431E]'
                : 'text-[#6B7280] hover:text-[#0F172A] hover:bg-[#F8F9FA]'
            }`}
          >
            <Star className="w-5 h-5" />
            Top Performers
          </button>
          <button
            onClick={() => setActiveTab('business-insights')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ease-in-out flex items-center gap-2 cursor-pointer ${
              activeTab === 'business-insights'
                ? 'text-white bg-[#05431E]'
                : 'text-[#6B7280] hover:text-[#0F172A] hover:bg-[#F8F9FA]'
            }`}
          >
            <Lightbulb className="w-5 h-5" />
            Business Insights
          </button>
          <button
            onClick={() => setActiveTab('comparisons')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ease-in-out flex items-center gap-2 cursor-pointer ${
              activeTab === 'comparisons'
                ? 'text-white bg-[#05431E]'
                : 'text-[#6B7280] hover:text-[#0F172A] hover:bg-[#F8F9FA]'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5" />
            Comparisons
          </button>
          <button
            onClick={() => setActiveTab('seasonal-trends')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ease-in-out flex items-center gap-2 cursor-pointer ${
              activeTab === 'seasonal-trends'
                ? 'text-white bg-[#05431E]'
                : 'text-[#6B7280] hover:text-[#0F172A] hover:bg-[#F8F9FA]'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            Seasonal Trends
          </button>
        </div>

          {/* Tab Content */}
        {isLoading && activeTab !== 'comparisons' ? (
          <div className="bg-white rounded-2xl p-12 text-center" style={{ }}>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#0E5D37] border-t-transparent"></div>
            <p className="mt-4 text-[#6B7280]">Loading AI insights...</p>
          </div>
        ) : (
          <>
            {activeTab === 'waiter-performance' && renderWaiterPerformanceTab()}
            {activeTab === 'top-performers' && renderTopPerformersTab()}
            {activeTab === 'business-insights' && renderBusinessInsightsTab()}
            {activeTab === 'comparisons' && renderComparisonsTab()}
            {activeTab === 'seasonal-trends' && renderSeasonalTrendsTab()}
          </>
        )}
      </div>
    </div>
  );
};

export default Insights;
