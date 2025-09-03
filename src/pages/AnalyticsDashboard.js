// emailxp/frontend/src/pages/AnalyticsDashboard.js

import React, { useState, useEffect } from 'react';
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
  ArrowDownRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import analyticsService from '../services/analyticsService';

const AnalyticsDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [quickStats, setQuickStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  useEffect(() => {
    loadQuickStats();
  }, [selectedTimeframe]);

  const loadQuickStats = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboardOverview(selectedTimeframe);
      setQuickStats(data);
    } catch (error) {
      console.error('Error loading quick stats:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const renderQuickStatCard = (title, value, change, icon: Icon, format = 'number', color = 'primary-red') => {
    const formattedValue = analyticsService.formatMetric(value, format);
    const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';
    const ChangeIcon = change > 0 ? ArrowUpRight : ArrowDownRight;

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{formattedValue}</p>
            {change !== undefined && (
              <div className={`flex items-center ${changeColor}`}>
                <ChangeIcon className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">
                  {Math.abs(change).toFixed(1)}% vs previous period
                </span>
              </div>
            )}
          </div>
          <div className={`p-4 bg-${color} bg-opacity-10 rounded-xl`}>
            <Icon className={`h-8 w-8 text-${color}`} />
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
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button className="text-sm text-primary-red hover:text-red-600">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {quickStats.recentActivity.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-primary-red rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Analytics generated for {activity.entityId?.name || 'Unknown Entity'}
                </p>
                <p className="text-xs text-gray-600">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
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
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Campaigns</h3>
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
                <p className="text-sm text-gray-600 mb-2">
                  {campaign.entityId?.subject}
                </p>
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
                <div className="text-sm font-medium text-gray-900 mt-1">
                  {analyticsService.formatMetric(campaign.rates?.clickRate || 0, 'percentage')} CTR
                </div>
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
        icon: TrendingUp
      });
    } else if (overview.avgOpenRate < 15) {
      insights.push({
        type: 'warning',
        title: 'Low Open Rate',
        description: `Your open rate of ${overview.avgOpenRate.toFixed(1)}% could be improved with better subject lines.`,
        icon: Eye
      });
    }

    if (overview.avgClickRate > 3) {
      insights.push({
        type: 'success',
        title: 'Great Click Rate',
        description: `Your click rate of ${overview.avgClickRate.toFixed(1)}% shows strong engagement.`,
        icon: MousePointer
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'info',
        title: 'Keep Growing',
        description: 'Your campaigns are performing well. Consider A/B testing to optimize further.',
        icon: BarChart3
      });
    }

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
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
                    <p className="text-sm opacity-90">{insight.description}</p>
                  </div>
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your email marketing performance and gain actionable insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
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
            className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
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
              Mail
            )}
            {renderQuickStatCard(
              'Total Delivered',
              quickStats.overview.totalDelivered,
              undefined,
              Users,
              'number',
              'green-600'
            )}
            {renderQuickStatCard(
              'Average Open Rate',
              quickStats.overview.avgOpenRate,
              undefined,
              Eye,
              'percentage',
              'blue-600'
            )}
            {renderQuickStatCard(
              'Average Click Rate',
              quickStats.overview.avgClickRate,
              undefined,
              MousePointer,
              'percentage',
              'purple-600'
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
              
              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
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
  );
};

export default AnalyticsDashboard;