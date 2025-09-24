// emailxp/frontend/src/components/RecommendationStats.js

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { 
  TrendingUp, 
  Star,
  Zap,
  BarChart3
} from 'lucide-react';

/**
 * Recommendation Stats Component
 * Dashboard widget showing recommendation engine statistics
 */
function RecommendationStats() {
  const [stats, setStats] = useState({
    totalRecommendations: 0,
    avgRelevanceScore: 0,
    topCategories: [],
    engagementRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would call an API to get actual stats
      // For now, we'll use mock data
      const mockStats = {
        totalRecommendations: Math.floor(Math.random() * 10000) + 5000,
        avgRelevanceScore: Math.floor(Math.random() * 20) + 75, // 75-95
        topCategories: [
          { name: 'Welcome', count: Math.floor(Math.random() * 1000) + 500 },
          { name: 'Newsletter', count: Math.floor(Math.random() * 800) + 400 },
          { name: 'Promotional', count: Math.floor(Math.random() * 600) + 300 },
          { name: 'Transactional', count: Math.floor(Math.random() * 400) + 200 }
        ],
        engagementRate: Math.floor(Math.random() * 15) + 25 // 25-40
      };
      
      setStats(mockStats);
    } catch (err) {
      console.error('Failed to fetch recommendation stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2" />
            Recommendation Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-red"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2" />
            Recommendation Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-2 text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2" />
          Recommendation Engine
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-xs font-medium text-gray-600">Total Recs</span>
              </div>
              <div className="text-lg font-bold mt-1">
                {stats.totalRecommendations.toLocaleString()}
              </div>
            </div>
            
            <div className="border rounded-lg p-3">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-xs font-medium text-gray-600">Avg Score</span>
              </div>
              <div className="text-lg font-bold mt-1">
                {stats.avgRelevanceScore}%
              </div>
            </div>
          </div>
          
          {/* Engagement Rate */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-xs font-medium text-gray-600">Engagement</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                +{Math.floor(Math.random() * 5)}%
              </Badge>
            </div>
            <div className="text-lg font-bold mt-1">
              {stats.engagementRate}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div 
                className="bg-green-500 h-1.5 rounded-full" 
                style={{ width: `${stats.engagementRate}%` }}
              ></div>
            </div>
          </div>
          
          {/* Top Categories */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2">Top Categories</h4>
            <div className="space-y-2">
              {stats.topCategories.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <span className="text-sm font-medium">{category.count}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Engine Status */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Engine Status</span>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                <span className="text-xs text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecommendationStats;