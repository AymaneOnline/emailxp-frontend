// emailxp/frontend/src/pages/SegmentManagement.js

import React, { useState, useEffect } from 'react';
import { Plus, Filter, Users, Edit, Trash2, RefreshCw, Eye, X } from 'lucide-react';
import segmentService from '../services/segmentService';
import SegmentBuilder from '../components/SegmentBuilder';
import { toast } from 'react-toastify';

const SegmentManagement = () => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  // Load segments on mount
  useEffect(() => {
    loadSegments();
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

  const handleCreateSegment = () => {
    setEditingSegment(null);
    setShowBuilder(true);
  };

  const handleEditSegment = (segment) => {
    setEditingSegment(segment);
    setShowBuilder(true);
  };

  const handleDeleteSegment = async (segment) => {
    if (!window.confirm(`Are you sure you want to delete "${segment.name}"?`)) {
      return;
    }

    try {
      await segmentService.deleteSegment(segment._id);
      toast.success('Segment deleted successfully');
      loadSegments();
    } catch (error) {
      console.error('Failed to delete segment:', error);
      toast.error('Failed to delete segment');
    }
  };

  const handleRefreshSegment = async (segment) => {
    try {
      const refreshed = await segmentService.refreshSegment(segment._id);
      toast.success(`Segment refreshed: ${refreshed.subscriberCount} subscribers`);
      loadSegments();
    } catch (error) {
      console.error('Failed to refresh segment:', error);
      toast.error('Failed to refresh segment');
    }
  };

  const handleViewSubscribers = async (segment) => {
    try {
      setLoadingSubscribers(true);
      setSelectedSegment(segment);
      const data = await segmentService.getSegmentSubscribers(segment._id, 100);
      setSubscribers(data.subscribers);
    } catch (error) {
      console.error('Failed to load subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const handleSaveSegment = (savedSegment) => {
    setShowBuilder(false);
    setEditingSegment(null);
    loadSegments();
  };

  const handleCancelBuilder = () => {
    setShowBuilder(false);
    setEditingSegment(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderFiltersPreview = (filters, logic) => {
    if (!filters || filters.length === 0) return 'No filters';
    
    const preview = filters.slice(0, 2).map(filter => {
      const value = filter.value ? ` "${filter.value}"` : '';
      return `${filter.field} ${filter.operator}${value}`;
    }).join(` ${logic} `);
    
    const remaining = filters.length - 2;
    return preview + (remaining > 0 ? ` ${logic} ${remaining} more...` : '');
  };

  if (showBuilder) {
    return (
      <div className="p-4">
        <SegmentBuilder
          segment={editingSegment}
          onSave={handleSaveSegment}
          onCancel={handleCancelBuilder}
          showPreview={true}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Segments</h1>
          <p className="text-gray-600">Create and manage subscriber segments</p>
        </div>
        <button
          onClick={handleCreateSegment}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-600"
        >
          <Plus className="h-4 w-4" />
          <span>Create Segment</span>
        </button>
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
                    onClick={() => handleViewSubscribers(segment)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="View subscribers"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRefreshSegment(segment)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Refresh count"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditSegment(segment)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit segment"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSegment(segment)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete segment"
                  >
                    <Trash2 className="h-4 w-4" />
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subscribers Modal */}
      {selectedSegment && (
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
                <div className="space-y-2">
                  {subscribers.map(subscriber => (
                    <div key={subscriber._id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                      <div>
                        <div className="font-medium">{subscriber.name || subscriber.email}</div>
                        {subscriber.name && (
                          <div className="text-sm text-gray-600">{subscriber.email}</div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(subscriber.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SegmentManagement;