// emailxp/frontend/src/components/AdvancedSegmentation.js

import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Users, 
  BarChart3, 
  Target, 
  Calendar, 
  TrendingUp,
  Settings,
  Save,
  Plus,
  X,
  Eye,
  Download,
  RefreshCw,
  Share2,
  PieChart
} from 'lucide-react';
import segmentService from '../services/segmentService';
import advancedSegmentationService from '../services/advancedSegmentationService';
import SegmentBuilder from './SegmentBuilder';
import RFMSegmentation from './RFMSegmentation';
import { toast } from 'react-toastify';

const AdvancedSegmentation = () => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showRFMBuilder, setShowRFMBuilder] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [segmentStats, setSegmentStats] = useState({});
  const [timeframe, setTimeframe] = useState('30d');
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Load segments on mount
  useEffect(() => {
    loadSegments();
    loadSegmentStats();
  }, []);

  const loadSegments = async () => {
    try {
      setLoading(true);
      const segmentsData = await segmentService.getSegments();
      setSegments(segmentsData);
    } catch (error) {
      console.error('Failed to load segments:', error);
      toast.error('Failed to load segments');
    } finally {
      setLoading(false);
    }
  };

  const loadSegmentStats = async () => {
    try {
      // In a real implementation, this would fetch actual stats
      // For now, we'll use mock data
      const mockStats = {
        totalSegments: 12,
        avgSubscribersPerSegment: 1250,
        mostPopularSegment: 'Highly Engaged Users'
      };
      setSegmentStats(mockStats);
    } catch (error) {
      console.error('Failed to load segment stats:', error);
    }
  };

  const handleCreateSegment = () => {
    setEditingSegment(null);
    setShowBuilder(true);
    setShowRFMBuilder(false);
  };
  
  const handleCreateRFMSegment = () => {
    setEditingSegment(null);
    setShowRFMBuilder(true);
    setShowBuilder(false);
  };

  const handleEditSegment = (segment) => {
    setEditingSegment(segment);
    setShowBuilder(true);
  };

  const handleSaveSegment = () => {
    setShowBuilder(false);
    setShowRFMBuilder(false);
    setEditingSegment(null);
    loadSegments();
  };

  const handleCancelBuilder = () => {
    setShowBuilder(false);
    setShowRFMBuilder(false);
    setEditingSegment(null);
  };

  const handleDeleteSegment = async (segmentId) => {
    if (window.confirm('Are you sure you want to delete this segment?')) {
      try {
        await segmentService.deleteSegment(segmentId);
        toast.success('Segment deleted successfully');
        loadSegments();
      } catch (error) {
        console.error('Failed to delete segment:', error);
        toast.error('Failed to delete segment');
      }
    }
  };

  const handleViewSubscribers = async (segment) => {
    try {
      setLoadingSubscribers(true);
      setSelectedSegment(segment);
      const data = await segmentService.getSegmentSubscribers(segment._id);
      setSubscribers(data.subscribers || []);
    } catch (error) {
      console.error('Failed to load subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const handleRefreshSegment = async (segmentId) => {
    try {
      await segmentService.refreshSegment(segmentId);
      toast.success('Segment refreshed successfully');
      loadSegments();
    } catch (error) {
      console.error('Failed to refresh segment:', error);
      toast.error('Failed to refresh segment');
    }
  };

  const handleViewAnalytics = async (segment) => {
    try {
      setLoadingAnalytics(true);
      setSelectedSegment(segment);
      const data = await advancedSegmentationService.getSegmentAnalytics(segment._id);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleExportSegment = async (segment) => {
    try {
      const data = await advancedSegmentationService.exportSegmentData(segment._id);
      // Create a downloadable CSV file
      const csvContent = [
        Object.keys(data.exportData[0]).join(','),
        ...data.exportData.map(item => Object.values(item).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.segmentName.replace(/\s+/g, '_')}_export.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Segment data exported successfully');
    } catch (error) {
      console.error('Failed to export segment:', error);
      toast.error('Failed to export segment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderFiltersPreview = (filters, logic) => {
    if (!filters || filters.length === 0) return 'No filters';
    
    const fieldLabels = {
      'email': 'Email',
      'name': 'Name',
      'tags': 'Tags',
      'createdAt': 'Signup Date',
      'lastActivity': 'Last Activity',
      'location.country': 'Country',
      'location.city': 'City',
      'emailOpens': 'Email Opens',
      'emailClicks': 'Email Clicks',
      'engagementScore': 'Engagement Score',
      'lifetimeValue': 'Lifetime Value',
      'purchaseCount': 'Purchase Count',
      'lastPurchaseDate': 'Last Purchase Date'
    };

    const operatorLabels = {
      'equals': '=',
      'not_equals': '!=',
      'contains': 'contains',
      'not_contains': 'not contains',
      'greater_than': '>',
      'less_than': '<',
      'between': 'between',
      'in': 'in',
      'before': 'before',
      'after': 'after'
    };

    return filters.map((filter, index) => {
      const fieldLabel = fieldLabels[filter.field] || filter.field;
      const operatorLabel = operatorLabels[filter.operator] || filter.operator;
      const value = filter.value || '';
      
      let filterText = `${fieldLabel} ${operatorLabel} ${value}`;
      if (filter.operator === 'between') {
        filterText = `${fieldLabel} between ${value} and ${filter.secondValue || ''}`;
      }
      
      if (index < filters.length - 1) {
        filterText += ` ${logic} `;
      }
      
      return filterText;
    }).join('');
  };

  const renderAnalyticsModal = () => {
    if (!selectedSegment || !analytics) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Analytics for "{selectedSegment.name}"
              </h3>
              <button
                onClick={() => {
                  setSelectedSegment(null);
                  setAnalytics(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-[80vh]">
            {loadingAnalytics ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{analytics.totalSubscribers}</div>
                    <div className="text-sm text-blue-600">Total Subscribers</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">{analytics.activity.activeLast7Days}</div>
                    <div className="text-sm text-green-600">Active Last 7 Days</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">{analytics.activity.activeLast30Days}</div>
                    <div className="text-sm text-purple-600">Active Last 30 Days</div>
                  </div>
                </div>
                
                {/* Demographics */}
                <div>
                  <h4 className="text-md font-semibold mb-3">Top Countries</h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.demographics.countries).slice(0, 5).map(([country, count]) => (
                      <div key={country} className="flex items-center justify-between">
                        <span>{country}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-semibold mb-3">Top Cities</h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.demographics.cities).slice(0, 5).map(([city, count]) => (
                      <div key={city} className="flex items-center justify-between">
                        <span>{city}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Activity */}
                <div>
                  <h4 className="text-md font-semibold mb-3">Activity Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Active Last 7 Days</span>
                      <span className="font-medium">{analytics.activity.activeLast7Days} ({Math.round((analytics.activity.activeLast7Days / analytics.totalSubscribers) * 100)}%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Last 30 Days</span>
                      <span className="font-medium">{analytics.activity.activeLast30Days} ({Math.round((analytics.activity.activeLast30Days / analytics.totalSubscribers) * 100)}%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Inactive 90+ Days</span>
                      <span className="font-medium">{analytics.activity.inactive90Days} ({Math.round((analytics.activity.inactive90Days / analytics.totalSubscribers) * 100)}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (showBuilder) {
    return (
      <div className="p-4">
        <div className="mb-4">
          <button
            onClick={handleCancelBuilder}
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
            <span>Back to Segments</span>
          </button>
        </div>
        <SegmentBuilder
          segment={editingSegment}
          onSave={handleSaveSegment}
          onCancel={handleCancelBuilder}
          showPreview={true}
        />
      </div>
    );
  }
  
  if (showRFMBuilder) {
    return (
      <div className="p-4">
        <div className="mb-4">
          <button
            onClick={handleCancelBuilder}
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
          >
            <X className="h-4 w-4" />
            <span>Back to Segments</span>
          </button>
        </div>
        <RFMSegmentation
          onSegmentCreated={handleSaveSegment}
          onCancel={handleCancelBuilder}
        />
      </div>
    );
  }

  // Add function to handle segment overlap analysis
  const handleSegmentOverlap = async () => {
    if (segments.length < 2) {
      toast.info('You need at least 2 segments to analyze overlap');
      return;
    }
    
    try {
      // In a real implementation, we would show a modal to select segments
      // For now, we'll just analyze the first two segments
      const segmentIds = segments.slice(0, 2).map(s => s._id);
      const overlapData = await advancedSegmentationService.getSegmentOverlap(segmentIds);
      
      // Show overlap results in a modal
      toast.info(`Overlap analysis complete. ${overlapData[0]?.overlapCount || 0} subscribers in common.`);
    } catch (error) {
      console.error('Failed to analyze segment overlap:', error);
      toast.error('Failed to analyze segment overlap');
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Segmentation</h1>
          <p className="text-gray-600">Create and manage sophisticated subscriber segments</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSegmentOverlap}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            <Share2 className="h-4 w-4" />
            <span>Overlap Analysis</span>
          </button>
          <div className="relative group">
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-600"
            >
              <Plus className="h-4 w-4" />
              <span>Create Segment</span>
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-10">
              <button
                onClick={handleCreateSegment}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Custom Filters
              </button>
              <button
                onClick={handleCreateRFMSegment}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <PieChart className="h-4 w-4 mr-2" />
                  RFM Segmentation
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Segments</p>
              <p className="text-2xl font-semibold text-gray-900">{segmentStats.totalSegments || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Subscribers per Segment</p>
              <p className="text-2xl font-semibold text-gray-900">{segmentStats.avgSubscribersPerSegment || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Most Popular Segment</p>
              <p className="text-lg font-semibold text-gray-900">{segmentStats.mostPopularSegment || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Segments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red"></div>
        </div>
      ) : segments.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No segments yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first segment to organize and target your subscribers
          </p>
          <button
            onClick={handleCreateSegment}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-600 mx-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create Segment</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {segments.map(segment => (
            <div key={segment._id} className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {segment.name}
                  </h3>
                  {segment.description && (
                    <p className="text-sm text-gray-600 mb-2">{segment.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={() => handleViewAnalytics(segment)}
                    className="p-1 text-gray-400 hover:text-primary-red"
                    title="View analytics"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleViewSubscribers(segment)}
                    className="p-1 text-gray-400 hover:text-primary-red"
                    title="View subscribers"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditSegment(segment)}
                    className="p-1 text-gray-400 hover:text-primary-red"
                    title="Edit segment"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSegment(segment._id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Delete segment"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-primary-red" />
                  <span className="text-lg font-semibold text-gray-900">
                    {segment.subscriberCount?.toLocaleString() || 0}
                  </span>
                  <span className="text-sm text-gray-600">subscribers</span>
                </div>
              </div>

              {/* Filters Preview */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Filters:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {renderFiltersPreview(segment.filters, segment.logic)}
                </p>
              </div>

              {/* Footer */}
              <div className="text-xs text-gray-500 border-t pt-3">
                <div>Created: {formatDate(segment.createdAt)}</div>
                {segment.lastCalculated && (
                  <div>Last updated: {formatDate(segment.lastCalculated)}</div>
                )}
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleRefreshSegment(segment._id)}
                    className="text-primary-red hover:text-red-700 text-xs flex items-center"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </button>
                  <button
                    onClick={() => handleExportSegment(segment)}
                    className="text-primary-red hover:text-red-700 text-xs flex items-center"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subscribers Modal */}
      {selectedSegment && !analytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Subscribers in "{selectedSegment.name}"
                </h3>
                <button
                  onClick={() => setSelectedSegment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {loadingSubscribers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-red"></div>
                </div>
              ) : subscribers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No subscribers match this segment
                </div>
              ) : (
                <div className="space-y-3">
                  {subscribers.map(subscriber => (
                    <div key={subscriber._id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                      <div>
                        <p className="font-medium text-gray-900">
                          {subscriber.firstName} {subscriber.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{subscriber.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Joined {formatDate(subscriber.createdAt)}
                        </p>
                        {subscriber.tags && subscriber.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {subscriber.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                            {subscriber.tags.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                +{subscriber.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {renderAnalyticsModal()}
    </div>
  );
};

export default AdvancedSegmentation;