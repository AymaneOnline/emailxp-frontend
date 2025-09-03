// emailxp/frontend/src/pages/EnhancedCampaignManagement.js

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Mail, 
  Users, 
  Eye, 
  MousePointer,
  Calendar,
  BarChart3
} from 'lucide-react';
import EnhancedCampaignList from '../components/EnhancedCampaignList';
import campaignService from '../services/campaignService';

const EnhancedCampaignManagement = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const statsData = await campaignService.getDashboardStats('30days');
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500'
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
            {change !== undefined && (
              <p className={`text-sm mt-2 flex items-center ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(change)}% from last month
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Campaigns"
            value={stats.totalCampaigns || 0}
            change={stats.campaignsChange}
            icon={Mail}
            color="blue"
          />
          <StatCard
            title="Total Sent"
            value={stats.totalSent || 0}
            change={stats.sentChange}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Avg. Open Rate"
            value={`${stats.avgOpenRate || 0}%`}
            change={stats.openRateChange}
            icon={Eye}
            color="purple"
          />
          <StatCard
            title="Avg. Click Rate"
            value={`${stats.avgClickRate || 0}%`}
            change={stats.clickRateChange}
            icon={MousePointer}
            color="orange"
          />
        </div>
      )}

      {/* Campaign List */}
      <EnhancedCampaignList />
    </div>
  );
};

export default EnhancedCampaignManagement;