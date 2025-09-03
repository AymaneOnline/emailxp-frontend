// emailxp/frontend/src/components/TemplateAnalytics.js

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Eye, 
  Copy, 
  Star, 
  Calendar,
  Users,
  Activity
} from 'lucide-react';
import templateService from '../services/templateService';

const TemplateAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalTemplates: 0,
    totalUsage: 0,
    popularTemplates: [],
    categoryDistribution: [],
    usageOverTime: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get templates with analytics data
      const templatesResponse = await templateService.getTemplates();
      const templates = templatesResponse.templates || [];
      
      // Calculate analytics
      const totalTemplates = templates.length;
      const totalUsage = templates.reduce((sum, t) => sum + (t.stats?.timesUsed || 0), 0);
      
      // Popular templates (top 5 by usage)
      const popularTemplates = templates
        .filter(t => t.stats?.timesUsed > 0)
        .sort((a, b) => (b.stats?.timesUsed || 0) - (a.stats?.timesUsed || 0))
        .slice(0, 5)
        .map(t => ({
          name: t.name,
          usage: t.stats?.timesUsed || 0,
          category: t.category
        }));

      // Category distribution
      const categoryCount = {};
      templates.forEach(t => {
        categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
      });
      
      const categoryDistribution = Object.entries(categoryCount).map(([category, count]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: count,
        percentage: ((count / totalTemplates) * 100).toFixed(1)
      }));

      // Mock usage over time data (in real app, this would come from backend)
      const usageOverTime = generateMockUsageData();

      // Recent activity (mock data)
      const recentActivity = templates
        .filter(t => t.stats?.lastUsed)
        .sort((a, b) => new Date(b.stats.lastUsed) - new Date(a.stats.lastUsed))
        .slice(0, 10)
        .map(t => ({
          templateName: t.name,
          action: 'used',
          timestamp: t.stats.lastUsed,
          category: t.category
        }));

      setAnalytics({
        totalTemplates,
        totalUsage,
        popularTemplates,
        categoryDistribution,
        usageOverTime,
        recentActivity
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockUsageData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        usage: Math.floor(Math.random() * 20) + 5,
        templates: Math.floor(Math.random() * 5) + 1
      });
    }
    
    return data;
  };

  const COLORS = ['#dc2626', '#ea580c', '#d97706', '#65a30d', '#059669', '#0891b2', '#2563eb', '#7c3aed'];

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
          <h2 className="text-2xl font-bold text-gray-900">Template Analytics</h2>
          <p className="text-gray-600">Insights into your template usage and performance</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Templates</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalTemplates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalUsage}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Popular Templates</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.popularTemplates.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalTemplates > 0 ? Math.round(analytics.totalUsage / analytics.totalTemplates) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Templates Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Used Templates</h3>
          {analytics.popularTemplates.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.popularTemplates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No usage data available
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates by Category</h3>
          {analytics.categoryDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No category data available
            </div>
          )}
        </div>
      </div>

      {/* Usage Over Time */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.usageOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="usage" stroke="#dc2626" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        {analytics.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="p-1 bg-gray-100 rounded">
                    <Activity className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.templateName}</p>
                    <p className="text-xs text-gray-500">
                      {activity.action} • {activity.category}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateAnalytics;