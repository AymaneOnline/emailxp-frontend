// emailxp/frontend/src/pages/Dashboard.js

import React, { useState, useEffect } from 'react';
import { H1, H2, H3, H4, Body, Small } from '../components/ui/Typography';
import {
  BarChart3,
  TrendingUp,
  Users,
  Mail,
  Eye,
  MousePointer,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  Zap,
  Award,
  CalendarDays
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import analyticsService from '../services/analyticsService';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import OnboardingChecklist from '../components/OnboardingChecklist';
import PageContainer from '../components/layout/PageContainer';
// Removed TopBar import since it's already in the Layout component

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [quickStats, setQuickStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.isVerified) {
      loadQuickStats();
    } else {
      setLoading(false); // stop loading spinner if present
    }
  }, [selectedTimeframe, user, navigate]);

  const loadQuickStats = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboardOverview(selectedTimeframe);
      setQuickStats(data);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 403) {
        // Silently ignore; user not verified yet
        return;
      }
      console.error('Error loading quick stats:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const renderQuickStatCard = (title, value, change, icon, format = 'number', color = 'primary-red', description = '') => {
    const formattedValue = analyticsService.formatMetric(value, format);
    const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';
    const ChangeIcon = change > 0 ? ArrowUpRight : ArrowDownRight;

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Small className="font-medium text-gray-600 mb-1 flex items-center">
              {icon && React.createElement(icon, { className: "h-4 w-4 mr-2 text-gray-500" })}
              {title}
            </Small>
            <p className="text-3xl font-bold text-gray-900 mb-2">{formattedValue}</p>
            {description && (
              <Small className="text-gray-500">{description}</Small>
            )}
            {change !== undefined && (
              <div className={`flex items-center ${changeColor}`}>
                <ChangeIcon className="h-4 w-4 mr-1" />
                <Small className="font-medium">
                  {Math.abs(change).toFixed(1)}% vs previous period
                </Small>
              </div>
            )}
          </div>
          <div className={`p-4 bg-${color} bg-opacity-10 rounded-xl`}>
            {icon && React.createElement(icon, { className: `h-8 w-8 text-${color}` })}
          </div>
        </div>
      </div>
    );
  };

  const renderRecentActivity = () => {
    if (!quickStats?.recentActivity) return null;

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <H3 className="mb-0">Recent Activity</H3>
          <button className="text-sm text-primary-red hover:text-red-600">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {quickStats.recentActivity.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <div className="flex-1">
                <Body className="font-medium text-gray-900">
                  Analytics generated for {activity.entityId?.name || 'Unknown Entity'}
                </Body>
                <Small className="text-gray-600">
                  {new Date(activity.createdAt).toLocaleString()}
                </Small>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTopCampaigns = () => {
    if (!quickStats?.topCampaigns || quickStats.topCampaigns.length === 0) return null;

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <H3 className="mb-0">Top Performing Campaigns</H3>
          <button className="text-sm text-primary-red hover:text-red-600">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {quickStats.topCampaigns.slice(0, 5).map((campaign, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  {campaign.entityId?.name || 'Unknown Campaign'}
                </h4>
                <Body className="text-gray-600 mb-2">
                  {campaign.entityId?.subject}
                </Body>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Sent: {analyticsService.formatMetric(campaign.metrics?.sent || 0)}</span>
                  <span>Delivered: {analyticsService.formatMetric(campaign.metrics?.delivered || 0)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary-red mb-1">
                  {analyticsService.formatMetric(campaign.rates?.openRate || 0, 'percentage')}
                </div>
                <div className="text-xs text-gray-600">Open Rate</div>
                <Body className="font-medium text-gray-900 mt-1">
                  {analyticsService.formatMetric(campaign.rates?.clickRate || 0, 'percentage')} CTR
                </Body>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPerformanceInsights = () => {
    if (!quickStats?.overview) return null;

    const insights = [];
    const overview = quickStats.overview;

    // Generate insights based on performance
    if (overview.avgOpenRate > 25) {
      insights.push({
        type: 'success',
        title: 'Excellent Open Rate',
        description: `Your average open rate of ${overview.avgOpenRate.toFixed(1)}% is above industry average.`,
        icon: Eye,
        value: overview.avgOpenRate
      });
    } else if (overview.avgOpenRate < 15) {
      insights.push({
        type: 'warning',
        title: 'Low Open Rate',
        description: `Your open rate of ${overview.avgOpenRate.toFixed(1)}% could be improved with better subject lines.`,
        icon: Eye,
        value: overview.avgOpenRate
      });
    }

    if (overview.avgClickRate > 3) {
      insights.push({
        type: 'success',
        title: 'Great Click Rate',
        description: `Your click rate of ${overview.avgClickRate.toFixed(1)}% shows strong engagement.`,
        icon: MousePointer,
        value: overview.avgClickRate
      });
    }

    if (overview.avgUnsubscribeRate < 0.5) {
      insights.push({
        type: 'success',
        title: 'Low Unsubscribe Rate',
        description: `Your unsubscribe rate of ${overview.avgUnsubscribeRate.toFixed(2)}% is healthy.`,
        icon: Users,
        value: overview.avgUnsubscribeRate
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'info',
        title: 'Keep Growing',
        description: 'Your campaigns are performing well. Consider A/B testing to optimize further.',
        icon: BarChart3,
        value: null
      });
    }

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
  <H3 className="mb-4">Performance Insights</H3>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            const colorClasses = {
              success: 'bg-green-100 text-green-800 border-green-200',
              warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
              info: 'bg-blue-100 text-blue-800 border-blue-200'
            };

            return (
              <div key={index} className={`p-4 rounded-lg border ${colorClasses[insight.type]}`}>
                <div className="flex items-start space-x-3">
                  <Icon className="h-5 w-5 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">{insight.title}</h4>
                    <Body className="opacity-90">{insight.description}</Body>
                    {insight.value !== null && (
                      <div className="mt-2 text-xs font-medium">
                        Current value: {insight.value.toFixed(2)}{typeof insight.value === 'number' && insight.title.includes('Rate') ? '%' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderIndustryBenchmarks = () => {
    if (!quickStats?.overview) return null;

    const benchmarks = [
      {
        metric: 'Open Rate',
        current: quickStats.overview.avgOpenRate,
        industry: '15-25',
        description: 'Percentage of delivered emails opened',
        icon: Eye
      },
      {
        metric: 'Click Rate',
        current: quickStats.overview.avgClickRate,
        industry: '2-5',
        description: 'Percentage of delivered emails clicked',
        icon: MousePointer
      },
      {
        metric: 'Unsubscribe Rate',
        current: quickStats.overview.avgUnsubscribeRate,
        industry: '<1',
        description: 'Percentage of unsubscribes',
        icon: Users
      }
    ];

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
  <H3 className="mb-4">Industry Benchmarks</H3>
        <div className="space-y-4">
          {benchmarks.map((benchmark, index) => {
            const Icon = benchmark.icon;
            const performance = benchmark.current > 25 ? 'excellent' : 
                              benchmark.current > 15 ? 'good' : 
                              benchmark.current > 10 ? 'average' : 'poor';
            const performanceColor = performance === 'excellent' ? 'text-green-600' : 
                                   performance === 'good' ? 'text-blue-600' : 
                                   performance === 'average' ? 'text-yellow-600' : 'text-red-600';

            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{benchmark.metric}</p>
                    <Small className="text-gray-500">{benchmark.description}</Small>
                  </div>
                </div>
                <div className="text-right">
                  <Body className="font-medium text-gray-900">
                    {analyticsService.formatMetric(benchmark.current, 'percentage')}
                  </Body>
                  <Small className={performanceColor}>
                    {performance.charAt(0).toUpperCase() + performance.slice(1)} performance
                  </Small>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        {/* Removed TopBar since it's already in the Layout component */}
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red"></div>
        </div>
      </div>
    );
  }

  // Show onboarding (welcome + checklist) until user verified and profile complete
  if (!user?.isVerified || !user?.isProfileComplete) {
    return (
      <PageContainer>
  <H1 className="mb-6">Dashboard</H1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-xl border border-gray-200 flex flex-col justify-center shadow-sm">
            <H2 className="mb-4">
              Welcome to <span className="text-primary-red">EmailXP</span>!
            </H2>
            <Body className="text-gray-700 leading-relaxed">
              You're just a step away from starting to build your campaigns, automations, forms, and more.
              Complete the checklist to unlock full analytics and platform features.
            </Body>
          </div>
          <OnboardingChecklist />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
  <H1 className="mb-6">Dashboard</H1>
      <div className="space-y-6">
        {/* Timeframe selector moved to top right of page */}
        <div className="flex justify-end">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent"
          >
            {analyticsService.getDateRangeOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={loadQuickStats}
            className="ml-2 p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'dashboard'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView('advanced')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'advanced'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Advanced Analytics
          </button>
        </div>

        {/* Dashboard View */}
        {activeView === 'dashboard' && quickStats && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {renderQuickStatCard(
                'Total Emails Sent',
                quickStats.overview.totalSent,
                undefined,
                Mail,
                'number',
                'primary-red',
                'Total emails sent in selected period'
              )}
              {renderQuickStatCard(
                'Total Delivered',
                quickStats.overview.totalDelivered,
                undefined,
                Users,
                'number',
                'green-600',
                'Successfully delivered emails'
              )}
              {renderQuickStatCard(
                'Average Open Rate',
                quickStats.overview.avgOpenRate,
                undefined,
                Eye,
                'percentage',
                'blue-600',
                'Percentage of delivered emails opened'
              )}
              {renderQuickStatCard(
                'Average Click Rate',
                quickStats.overview.avgClickRate,
                undefined,
                MousePointer,
                'percentage',
                'purple-600',
                'Percentage of delivered emails clicked'
              )}
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {renderQuickStatCard(
                'Avg. Unsubscribe Rate',
                quickStats.overview.avgUnsubscribeRate,
                undefined,
                Users,
                'percentage',
                'yellow-600',
                'Percentage of unsubscribes'
              )}
              {renderQuickStatCard(
                'Bounce Rate',
                (quickStats.overview.totalSent > 0 
                  ? (quickStats.overview.totalSent - quickStats.overview.totalDelivered) / quickStats.overview.totalSent * 100 
                  : 0),
                undefined,
                Mail,
                'percentage',
                'red-600',
                'Percentage of bounced emails'
              )}
              {renderQuickStatCard(
                'Click-to-Open Rate',
                (quickStats.overview.avgOpenRate > 0 
                  ? (quickStats.overview.avgClickRate / quickStats.overview.avgOpenRate) * 100 
                  : 0),
                undefined,
                Target,
                'percentage',
                'indigo-600',
                'Clicks relative to opens'
              )}
              {renderQuickStatCard(
                'Delivery Rate',
                (quickStats.overview.totalSent > 0 
                  ? quickStats.overview.totalDelivered / quickStats.overview.totalSent * 100 
                  : 0),
                undefined,
                Zap,
                'percentage',
                'teal-600',
                'Percentage of emails successfully delivered'
              )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                {renderTopCampaigns()}
                {renderRecentActivity()}
              </div>

              {/* Right Column - 1/3 width */}
              <div className="space-y-6">
                {renderPerformanceInsights()}
                {renderIndustryBenchmarks()}
                
                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <H3 className="mb-4">Quick Actions</H3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveView('advanced')}
                      className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="h-5 w-5 text-primary-red" />
                        <span className="font-medium text-gray-900">Advanced Analytics</span>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-gray-400" />
                    </button>
                    
                    <button
                      onClick={() => {
                        const data = [{
                          metric: 'Total Sent',
                          value: quickStats.overview.totalSent,
                          timeframe: selectedTimeframe
                        }];
                        analyticsService.exportToCSV(data, `dashboard-${selectedTimeframe}.csv`);
                        toast.success('Dashboard data exported');
                      }}
                      className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Download className="h-5 w-5 text-primary-red" />
                        <span className="font-medium text-gray-900">Export Data</span>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Analytics View */}
        {activeView === 'advanced' && (
          <AdvancedAnalytics />
        )}
      </div>
    </PageContainer>
  );
};

export default Dashboard;