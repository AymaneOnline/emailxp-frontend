// emailxp/frontend/src/components/AdvancedAnalytics.js

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Mail,
  Eye,
  MousePointer,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Clock,
  Target,
  Zap,
  Award,
  CalendarDays
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import analyticsService from '../services/analyticsService';

const AdvancedAnalytics = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [linkData, setLinkData] = useState(null);
  const [subscriberData, setSubscriberData] = useState(null);
  const [campaignsData, setCampaignsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user?.isVerified) {
      setLoading(false);
      return; // Skip fetching until verified
    }
    loadAnalyticsData();
  }, [selectedTimeframe, user?.isVerified]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load all analytics data in parallel
      const [dashboard, engagement, geography, links, subscribers, campaigns] = await Promise.all([
        analyticsService.getDashboardOverview(selectedTimeframe),
        analyticsService.getEngagementAnalytics(selectedTimeframe),
        analyticsService.getGeographicAnalytics(selectedTimeframe),
        analyticsService.getLinkPerformance(selectedTimeframe),
        analyticsService.getSubscriberAnalytics(selectedTimeframe),
        analyticsService.getCampaignsAnalytics({ timeframe: selectedTimeframe })
      ]);

      setDashboardData(dashboard);
      setEngagementData(engagement);
      setGeoData(geography);
      setLinkData(links);
      setSubscriberData(subscribers);
      setCampaignsData(campaigns);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    if (!dashboardData) return;
    
    const exportData = [
      {
        metric: 'Total Sent',
        value: dashboardData.overview.totalSent,
        timeframe: selectedTimeframe
      },
      {
        metric: 'Total Delivered',
        value: dashboardData.overview.totalDelivered,
        timeframe: selectedTimeframe
      },
      {
        metric: 'Average Open Rate',
        value: `${dashboardData.overview.avgOpenRate}%`,
        timeframe: selectedTimeframe
      },
      {
        metric: 'Average Click Rate',
        value: `${dashboardData.overview.avgClickRate}%`,
        timeframe: selectedTimeframe
      }
    ];

    analyticsService.exportToCSV(exportData, `analytics-${selectedTimeframe}.csv`);
    toast.success('Analytics data exported successfully');
  };

  const renderMetricCard = (title, value, change, IconComponent, format = 'number', description = '') => {
    const formattedValue = analyticsService.formatMetric(value, format);
    const changeColor = analyticsService.getGrowthColor(change);
    const ChangeIcon = change > 0 ? TrendingUp : TrendingDown;

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 flex items-center">
              {IconComponent && <IconComponent className="h-4 w-4 mr-2 text-gray-500" />}
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formattedValue}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
            {change !== undefined && (
              <div className={`flex items-center mt-2 ${changeColor}`}>
                <ChangeIcon className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">
                  {Math.abs(change).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs previous period</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-primary-red bg-opacity-10 rounded-lg">
            {IconComponent && <IconComponent className="h-6 w-6 text-primary-red" />}
          </div>
        </div>
      </div>
    );
  };

  const renderEngagementChart = () => {
    if (!engagementData?.engagementTrends) return null;

    const chartData = engagementData.engagementTrends.map(item => ({
      date: new Date(item._id).toLocaleDateString(),
      openRate: item.avgOpenRate || 0,
      clickRate: item.avgClickRate || 0,
      sent: item.totalSent || 0
    }));

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="openRate" 
              stroke="#dc2626" 
              strokeWidth={2}
              name="Open Rate (%)"
            />
            <Line 
              type="monotone" 
              dataKey="clickRate" 
              stroke="#059669" 
              strokeWidth={2}
              name="Click Rate (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderDeviceBreakdown = () => {
    if (!engagementData?.deviceBreakdown) return null;

    const deviceData = [
      { name: 'Desktop', value: engagementData.deviceBreakdown.desktop, color: '#dc2626' },
      { name: 'Mobile', value: engagementData.deviceBreakdown.mobile, color: '#059669' },
      { name: 'Tablet', value: engagementData.deviceBreakdown.tablet, color: '#2563eb' },
      { name: 'Unknown', value: engagementData.deviceBreakdown.unknown, color: '#6b7280' }
    ].filter(item => item.value > 0);

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
        <div className="flex items-center justify-between">
          <ResponsiveContainer width="60%" height={200}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {deviceData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="text-sm font-medium text-gray-900">
                  {analyticsService.formatMetric(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderClientBreakdown = () => {
    if (!engagementData?.clientBreakdown) return null;

    const clientData = Object.entries(engagementData.clientBreakdown)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Client Breakdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={clientData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip />
            <Bar dataKey="value" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderGeographicData = () => {
    if (!geoData?.geoData || geoData.geoData.length === 0) return null;

    const topCountries = geoData.geoData.slice(0, 10);

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries by Engagement</h3>
        <div className="space-y-3">
          {topCountries.map((country, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">{country._id}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{analyticsService.formatMetric(country.totalOpens)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MousePointer className="h-4 w-4" />
                  <span>{analyticsService.formatMetric(country.totalClicks)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLinkPerformance = () => {
    if (!linkData?.linkPerformance || linkData.linkPerformance.length === 0) return null;

    const topLinks = linkData.linkPerformance.slice(0, 10);

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Links</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unique Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CTR
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topLinks.map((link, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={link._id}>
                      {link._id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {analyticsService.formatMetric(link.totalClicks)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {analyticsService.formatMetric(link.uniqueClicks)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {link.totalClicks && dashboardData?.overview?.totalDelivered 
                      ? analyticsService.formatMetric((link.totalClicks / dashboardData.overview.totalDelivered) * 100, 'percentage')
                      : '0%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSubscriberGrowth = () => {
    if (!subscriberData?.growthData || subscriberData.growthData.length === 0) return null;

    const chartData = subscriberData.growthData.map(item => ({
      date: new Date(item._id).toLocaleDateString(),
      count: item.count
    }));

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscriber Growth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#dc2626" 
              fill="#dc2626" 
              fillOpacity={0.1} 
              name="New Subscribers"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderCampaignPerformance = () => {
    if (!campaignsData?.analytics || campaignsData.analytics.length === 0) return null;

    const chartData = campaignsData.analytics.slice(0, 10).map(campaign => ({
      name: campaign.entityId?.name || 'Unknown Campaign',
      openRate: campaign.rates?.openRate || 0,
      clickRate: campaign.rates?.clickRate || 0
    }));

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="openRate" fill="#dc2626" name="Open Rate (%)" />
            <Bar dataKey="clickRate" fill="#059669" name="Click Rate (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderEngagementSegments = () => {
    if (!subscriberData?.engagementSegments) return null;

    const segmentData = [
      { name: 'Highly Engaged', value: subscriberData.engagementSegments.highly_engaged || 0, color: '#059669' },
      { name: 'Moderately Engaged', value: subscriberData.engagementSegments.moderately_engaged || 0, color: '#f59e0b' },
      { name: 'Low Engagement', value: subscriberData.engagementSegments.low_engaged || 0, color: '#dc2626' },
      { name: 'Inactive', value: subscriberData.engagementSegments.inactive || 0, color: '#6b7280' }
    ].filter(item => item.value > 0);

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscriber Engagement Segments</h3>
        <div className="flex items-center justify-between">
          <ResponsiveContainer width="60%" height={200}>
            <PieChart>
              <Pie
                data={segmentData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {segmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {segmentData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="text-sm font-medium text-gray-900">
                  {analyticsService.formatMetric(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceInsights = () => {
    if (!dashboardData?.overview) return null;

    const insights = [];
    const overview = dashboardData.overview;

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
        icon: TrendingUp,
        value: null
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  if (!user?.isVerified) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Locked</h3>
        <p className="text-sm text-gray-600">Verify your email to unlock advanced analytics and performance insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into your email marketing performance</p>
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
            onClick={loadAnalyticsData}
            className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'engagement', label: 'Engagement' },
            { id: 'geography', label: 'Geography' },
            { id: 'performance', label: 'Performance' },
            { id: 'campaigns', label: 'Campaigns' },
            { id: 'subscribers', label: 'Subscribers' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-red text-primary-red'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboardData && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {renderMetricCard(
              'Total Emails Sent',
              dashboardData.overview.totalSent,
              undefined,
              Mail,
              'number',
              'Total emails sent in selected period'
            )}
            {renderMetricCard(
              'Total Delivered',
              dashboardData.overview.totalDelivered,
              undefined,
              Users,
              'number',
              'Successfully delivered emails'
            )}
            {renderMetricCard(
              'Average Open Rate',
              dashboardData.overview.avgOpenRate,
              undefined,
              Eye,
              'percentage',
              'Percentage of delivered emails opened'
            )}
            {renderMetricCard(
              'Average Click Rate',
              dashboardData.overview.avgClickRate,
              undefined,
              MousePointer,
              'percentage',
              'Percentage of delivered emails clicked'
            )}
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderMetricCard(
              'Avg. Unsubscribe Rate',
              dashboardData.overview.avgUnsubscribeRate,
              undefined,
              Users,
              'percentage',
              'Percentage of unsubscribes'
            )}
            {renderMetricCard(
              'Bounce Rate',
              (dashboardData.overview.totalSent > 0 
                ? (dashboardData.overview.totalSent - dashboardData.overview.totalDelivered) / dashboardData.overview.totalSent * 100 
                : 0),
              undefined,
              Mail,
              'percentage',
              'Percentage of bounced emails'
            )}
            {renderMetricCard(
              'Click-to-Open Rate',
              (dashboardData.overview.avgOpenRate > 0 
                ? (dashboardData.overview.avgClickRate / dashboardData.overview.avgOpenRate) * 100 
                : 0),
              undefined,
              Target,
              'percentage',
              'Clicks relative to opens'
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderEngagementChart()}
            {renderPerformanceInsights()}
          </div>

          {/* Top Campaigns */}
          {dashboardData.topCampaigns && dashboardData.topCampaigns.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Campaigns</h3>
              <div className="space-y-3">
                {dashboardData.topCampaigns.map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{campaign.entityId?.name}</p>
                      <p className="text-sm text-gray-600">{campaign.entityId?.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {analyticsService.formatMetric(campaign.rates.openRate, 'percentage')} open rate
                      </p>
                      <p className="text-sm text-gray-600">
                        {analyticsService.formatMetric(campaign.metrics.sent)} sent
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderDeviceBreakdown()}
          {renderClientBreakdown()}
        </div>
      )}

      {/* Geography Tab */}
      {activeTab === 'geography' && (
        <div className="space-y-6">
          {renderGeographicData()}
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {renderLinkPerformance()}
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {renderCampaignPerformance()}
        </div>
      )}

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && subscriberData && (
        <div className="space-y-6">
          {/* Subscriber Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {renderMetricCard(
              'Total Subscribers',
              subscriberData.overview.totalSubscribers,
              undefined,
              Users,
              'number',
              'Total active subscribers'
            )}
            {renderMetricCard(
              'New Subscribers',
              subscriberData.overview.newSubscribers,
              undefined,
              UserPlus,
              'number',
              'New subscribers in period'
            )}
            {renderMetricCard(
              'Unsubscribes',
              subscriberData.overview.unsubscribed,
              undefined,
              UserX,
              'number',
              'Unsubscribes in period'
            )}
            {renderMetricCard(
              'Net Growth',
              subscriberData.overview.netGrowth,
              undefined,
              TrendingUp,
              'number',
              'Net subscriber growth'
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderSubscriberGrowth()}
            {renderEngagementSegments()}
          </div>
        </div>
      )}
    </div>
  );
};

// Add missing icons
const UserPlus = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const UserX = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default AdvancedAnalytics;