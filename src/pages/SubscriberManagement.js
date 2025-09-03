import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  PlusCircle,
  Search,
  Download,
  Upload,
  Trash2,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Tag,
  Users,
  Pencil,
  Filter,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';
import subscriberService from '../services/subscriberService';
import groupService from '../services/groupService';
import tagService from '../services/tagService';
import segmentService from '../services/segmentService';
import SegmentBuilder from '../components/SegmentBuilder';

const SubscriberManagement = () => {
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState('subscribers');

  // Data
  const [groups, setGroups] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [stats, setStats] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Segments data
  const [segments, setSegments] = useState([]);
  const [segmentsLoading, setSegmentsLoading] = useState(false);
  const [showSegmentBuilder, setShowSegmentBuilder] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [segmentSubscribers, setSegmentSubscribers] = useState([]);
  const [loadingSegmentSubscribers, setLoadingSegmentSubscribers] = useState(false);

  // Filters and pagination
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // UI state
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [bulkGroupModal, setBulkGroupModal] = useState({ open: false, selectedGroupIds: [], newGroupName: '', creating: false, processing: false });

  // Load static data (groups, tags, stats)
  useEffect(() => {
    (async () => {
      try {
        const [fetchedGroups, fetchedTags, statsData] = await Promise.all([
          groupService.getGroups(),
          tagService.getTags(),
          subscriberService.getSubscriberStats(),
        ]);
        setGroups(fetchedGroups || []);
        setAllTags(fetchedTags || []);
        setStats(statsData || null);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setGroups([]);
        setAllTags([]);
        setStats(null);
      }
    })();
  }, []);

  // Keep input field in sync with applied search (on mount)
  useEffect(() => {
    setSearchInput(search);
  }, []);

  // Debounce applying search to avoid firing on every keypress
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Load subscribers whenever filters/page change
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 20,
        };
        if (search.trim()) params.search = search.trim();
        if (statusFilter) params.status = statusFilter;
        if (groupFilter) params.groupId = groupFilter;
        if (tagFilter) params.tag = tagFilter;
        console.log('Fetching subscribers with params:', params);
        const data = await subscriberService.getSubscribers(params);
        setSubscribers(data.subscribers || []);
        setPagination(data.pagination || null);
      } catch (error) {
        console.error('Failed to load subscribers:', error);
        toast.error('Failed to load subscribers');
        setSubscribers([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [search, statusFilter, groupFilter, tagFilter, currentPage]);

  // Load segments when segments tab is active
  useEffect(() => {
    if (activeTab === 'segments') {
      loadSegments();
    }
  }, [activeTab]);

  // Handle URL hash to switch to segments tab
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#segments') {
      setActiveTab('segments');
    }
  }, []);

  const loadSegments = async () => {
    try {
      setSegmentsLoading(true);
      const segmentsData = await segmentService.getSegments();
      setSegments(segmentsData);
    } catch (error) {
      console.error('Failed to load segments:', error);
      toast.error('Failed to load segments');
    } finally {
      setSegmentsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleGroupChange = (e) => {
    setGroupFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleTagChange = (e) => {
    setTagFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedSubscribers([]);
  };

  const handleSelectSubscriber = (subscriberId) => {
    setSelectedSubscribers(prev =>
      prev.includes(subscriberId)
        ? prev.filter(id => id !== subscriberId)
        : [...prev, subscriberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubscribers.length === subscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(subscribers.map(s => s._id));
    }
  };

  const handleDeleteSubscriber = async (subscriberId) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return;
    try {
      await subscriberService.deleteSubscriber(subscriberId);
      toast.success('Subscriber deleted successfully');
      // Refresh after delete
      const params = {
        page: currentPage,
        limit: 20,
        ...(search.trim() && { search: search.trim() }),
        ...(statusFilter && { status: statusFilter }),
        ...(groupFilter && { groupId: groupFilter }),
        ...(tagFilter && { tag: tagFilter })
      };
      const data = await subscriberService.getSubscribers(params);
      setSubscribers(data.subscribers || []);
      setPagination(data.pagination || null);
      // Stats may change
      try {
        const statsData = await subscriberService.getSubscriberStats();
        setStats(statsData || null);
      } catch (err) { /* noop */ }
    } catch (error) {
      console.error('Failed to delete subscriber:', error);
      toast.error('Failed to delete subscriber');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSubscribers.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedSubscribers.length} subscribers?`)) return;
    try {
      await Promise.all(selectedSubscribers.map(id => subscriberService.deleteSubscriber(id)));
      toast.success(`${selectedSubscribers.length} subscribers deleted successfully`);
      setSelectedSubscribers([]);
      // Refresh after delete
      const params = {
        page: currentPage,
        limit: 20,
        ...(search.trim() && { search: search.trim() }),
        ...(statusFilter && { status: statusFilter }),
        ...(groupFilter && { groupId: groupFilter }),
        ...(tagFilter && { tag: tagFilter })
      };
      const data = await subscriberService.getSubscribers(params);
      setSubscribers(data.subscribers || []);
      setPagination(data.pagination || null);
      // Stats may change
      try {
        const statsData = await subscriberService.getSubscriberStats();
        setStats(statsData || null);
      } catch (err) { /* noop */ }
    } catch (error) {
      console.error('Failed to delete subscribers:', error);
      toast.error('Failed to delete subscribers');
    }
  };

  const handleExport = async () => {
    try {
      const params = {
        ...(search.trim() && { search: search.trim() }),
        ...(statusFilter && { status: statusFilter }),
        ...(groupFilter && { groupId: groupFilter }),
        ...(tagFilter && { tag: tagFilter })
      };
      await subscriberService.exportSubscribers(params);
      toast.success('Subscribers exported successfully');
    } catch (error) {
      console.error('Failed to export subscribers:', error);
      toast.error('Failed to export subscribers');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setGroupFilter('');
    setTagFilter('');
    setCurrentPage(1);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'subscribed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'unsubscribed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'bounced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'complained': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Segment handlers
  const handleCreateSegment = () => {
    setEditingSegment(null);
    setShowSegmentBuilder(true);
  };

  const handleEditSegment = (segment) => {
    setEditingSegment(segment);
    setShowSegmentBuilder(true);
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

  const handleViewSegmentSubscribers = async (segment) => {
    try {
      setLoadingSegmentSubscribers(true);
      setSelectedSegment(segment);
      const subscribers = await segmentService.getSegmentSubscribers(segment._id);
      setSegmentSubscribers(subscribers);
    } catch (error) {
      console.error('Failed to load segment subscribers:', error);
      toast.error('Failed to load segment subscribers');
    } finally {
      setLoadingSegmentSubscribers(false);
    }
  };

  const handleSegmentSave = async (segmentData) => {
    try {
      if (editingSegment) {
        await segmentService.updateSegment(editingSegment._id, segmentData);
        toast.success('Segment updated successfully');
      } else {
        await segmentService.createSegment(segmentData);
        toast.success('Segment created successfully');
      }
      setShowSegmentBuilder(false);
      setEditingSegment(null);
      loadSegments();
    } catch (error) {
      console.error('Failed to save segment:', error);
      toast.error('Failed to save segment');
    }
  };

  const handleSegmentCancel = () => {
    setShowSegmentBuilder(false);
    setEditingSegment(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeTab === 'subscribers' ? 'Subscribers' : 'Segments'}
          </h1>
          {activeTab === 'subscribers' && stats && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {stats.total} total subscribers ({stats.subscribed} active)
            </p>
          )}
          {activeTab === 'segments' && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create and manage subscriber segments
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'subscribers' ? (
            <>
              <button
                onClick={() => navigate('/subscribers/import')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </button>

              <button
                onClick={handleExport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>

              <button
                onClick={() => navigate('/subscribers/new')}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add Subscriber
              </button>
            </>
          ) : (
            <button
              onClick={handleCreateSegment}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Filter className="w-5 h-5 mr-2" />
              Create Segment
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('subscribers');
              window.history.pushState(null, null, '/subscribers');
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subscribers'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Subscribers
          </button>
          <button
            onClick={() => {
              setActiveTab('segments');
              window.history.pushState(null, null, '/subscribers#segments');
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'segments'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <Filter className="w-4 h-4 inline mr-2" />
            Segments
          </button>
        </nav>
      </div>

      {/* Filters - Only show for subscribers tab */}
      {activeTab === 'subscribers' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchInput}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="subscribed">Subscribed</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="bounced">Bounced</option>
              <option value="complained">Complained</option>
            </select>
          </div>

          {/* Group */}
          {groups.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Group</label>
              <select
                value={groupFilter}
                onChange={handleGroupChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Groups</option>
                {groups.map(group => (
                  <option key={group._id} value={group._id}>{group.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tag */}
          {allTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tag</label>
              <select
                value={tagFilter}
                onChange={handleTagChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag._id} value={tag._id}>{tag.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {(search || statusFilter || groupFilter || tagFilter) && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Clear all filters
            </button>
          </div>
        )}
        </div>
      )}

      {/* Floating Bulk Actions - avoids layout shift */}
      {selectedSubscribers.length > 0 && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className="flex items-center space-x-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-full px-4 py-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {selectedSubscribers.length} selected
            </span>
            <button
              onClick={() => setBulkGroupModal({ open: true, selectedGroupIds: [], newGroupName: '', creating: false, processing: false })}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm"
              title="Add selected to group(s)"
            >
              <Users className="w-4 h-4 mr-1" /> Add to Group
            </button>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm"
              title="Delete selected"
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </button>
            <button
              onClick={() => setSelectedSubscribers([])}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Clear selection"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {bulkGroupModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Add selected subscribers to groups</h2>

            {/* Group selection list */}
            <div className="mb-4 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-3">
              {groups && groups.length > 0 ? (
                <div className="space-y-2">
                  {groups.map(group => (
                    <label key={group._id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={bulkGroupModal.selectedGroupIds.includes(group._id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setBulkGroupModal(modal => ({
                              ...modal,
                              selectedGroupIds: checked
                                ? Array.from(new Set([...(modal.selectedGroupIds || []), group._id]))
                                : (modal.selectedGroupIds || []).filter(id => id !== group._id)
                            }));
                          }}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="ml-2 text-sm text-gray-900 dark:text-white">{group.name}</span>
                      </div>
                      {typeof group.subscriberCount === 'number' && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{group.subscriberCount} members</span>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No groups found. Create one below.</p>
              )}
            </div>

            {/* Create new group */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Create new group</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bulkGroupModal.newGroupName}
                  onChange={(e) => setBulkGroupModal(modal => ({ ...modal, newGroupName: e.target.value }))}
                  placeholder="Group name"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  type="button"
                  disabled={bulkGroupModal.creating || !bulkGroupModal.newGroupName.trim()}
                  onClick={async () => {
                    try {
                      setBulkGroupModal(modal => ({ ...modal, creating: true }));
                      const newGroup = await groupService.createGroup({ name: bulkGroupModal.newGroupName.trim() });
                      setGroups(prev => [newGroup, ...(prev || [])]);
                      setBulkGroupModal(modal => ({
                        ...modal,
                        creating: false,
                        newGroupName: '',
                        selectedGroupIds: Array.from(new Set([...(modal.selectedGroupIds || []), newGroup._id]))
                      }));
                      toast.success('Group created');
                    } catch (error) {
                      console.error('Failed to create group:', error);
                      toast.error(error.response?.data?.message || 'Failed to create group');
                      setBulkGroupModal(modal => ({ ...modal, creating: false }));
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkGroupModal.creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setBulkGroupModal({ open: false, selectedGroupIds: [], newGroupName: '', creating: false, processing: false })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                disabled={bulkGroupModal.processing || (bulkGroupModal.selectedGroupIds || []).length === 0}
                onClick={async () => {
                  try {
                    setBulkGroupModal(modal => ({ ...modal, processing: true }));
                    // Apply group assignment for each selected subscriber and group
                    const ops = [];
                    for (const sId of selectedSubscribers) {
                      for (const gId of bulkGroupModal.selectedGroupIds) {
                        ops.push(subscriberService.addSubscriberToGroup(sId, gId));
                      }
                    }
                    await Promise.allSettled(ops);
                    toast.success('Subscribers added to group(s)');

                    // Refresh list
                    const params = {
                      page: currentPage,
                      limit: 20,
                    };
                    if (search.trim()) params.search = search.trim();
                    if (statusFilter) params.status = statusFilter;
                    if (groupFilter) params.groupId = groupFilter;
                    if (tagFilter) params.tag = tagFilter;
                    const data = await subscriberService.getSubscribers(params);
                    setSubscribers(data.subscribers || []);
                    setPagination(data.pagination || null);

                    // Refresh groups to update counts
                    try {
                      const fetchedGroups = await groupService.getGroups();
                      setGroups(fetchedGroups || []);
                    } catch (err) { /* noop */ }

                    setSelectedSubscribers([]);
                    setBulkGroupModal({ open: false, selectedGroupIds: [], newGroupName: '', creating: false, processing: false });
                  } catch (error) {
                    console.error('Failed to add subscribers to groups:', error);
                    toast.error('Failed to add subscribers to groups');
                    setBulkGroupModal(modal => ({ ...modal, processing: false }));
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkGroupModal.processing ? 'Adding...' : 'Add to Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      {activeTab === 'subscribers' ? (
        /* Subscribers Table */
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No subscribers found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {search || statusFilter || groupFilter || tagFilter
                ? 'Try adjusting your filters or clear them to see all subscribers'
                : 'Get started by adding your first subscriber'}
            </p>
            <div className="flex justify-center space-x-3">
              {(search || statusFilter || groupFilter || tagFilter) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => navigate('/subscribers/new')}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add Subscriber
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.length === subscribers.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subscriber</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tags & Groups</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subscribed</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedSubscribers.includes(subscriber._id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedSubscribers.includes(subscriber._id)}
                          onChange={() => handleSelectSubscriber(subscriber._id)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {subscriber.name && subscriber.name.trim().length > 0
                                ? subscriber.name
                                : (subscriber.email || 'No Name')}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{subscriber.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(subscriber.status)}`}>
                          {subscriber.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {/* Tags */}
                          {subscriber.tags && subscriber.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {subscriber.tags.slice(0, 2).map((tag, index) => {
                                const tagObj = tag._id ? tag : allTags.find(t => t._id === tag);
                                if (!tagObj) return null;
                                return (
                                  <span
                                    key={tagObj._id}
                                    className="inline-flex items-center px-2 py-0.5 text-xs rounded"
                                    style={{ backgroundColor: tagObj.color || '#e0e7ff', color: tagObj.color ? '#fff' : '#1e40af' }}
                                  >
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tagObj.name || 'Unnamed Tag'}
                                  </span>
                                );
                              }).filter(Boolean)}
                              {subscriber.tags.length > 2 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">+{subscriber.tags.length - 2} more</span>
                              )}
                            </div>
                          )}
                          {/* Groups */}
                          {subscriber.groups && subscriber.groups.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {subscriber.groups.slice(0, 2).map((group, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs rounded"
                                >
                                  <Users className="w-3 h-3 mr-1" />
                                  {group.name || group}
                                </span>
                              ))}
                              {subscriber.groups.length > 2 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">+{subscriber.groups.length - 2} more</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(subscriber.subscriptionDate || subscriber.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/subscribers/edit/${subscriber._id}`)}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                            title="Edit Details"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubscriber(subscriber._id)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                                              </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Showing{' '}
                        <span className="font-medium">{(currentPage - 1) * 20 + 1}</span>{' '}
                        to{' '}
                        <span className="font-medium">{Math.min(currentPage * 20, pagination.totalItems)}</span>{' '}
                        of{' '}
                        <span className="font-medium">{pagination.totalItems}</span>{' '}
                        results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!pagination.hasPrev}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        {[...Array(pagination.totalPages)].map((_, i) => {
                          const page = i + 1;
                          if (
                            page === 1 ||
                            page === pagination.totalPages ||
                            (page >= currentPage - 2 && page <= currentPage + 2)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  page === currentPage
                                    ? 'z-10 bg-red-50 dark:bg-red-900/20 border-red-500 text-red-600 dark:text-red-400'
                                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (page === currentPage - 3 || page === currentPage + 3) {
                            return (
                              <span
                                key={page}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!pagination.hasNext}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      ) : (
        /* Segments Content */
        <div className="space-y-6">
          {showSegmentBuilder ? (
            <SegmentBuilder
              segment={editingSegment}
              onSave={handleSegmentSave}
              onCancel={handleSegmentCancel}
            />
          ) : (
            <>
              {/* Segments List */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {segmentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : segments.length === 0 ? (
                  <div className="text-center py-12">
                    <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No segments found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Create your first segment to organize your subscribers
                    </p>
                    <button
                      onClick={handleCreateSegment}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Filter className="w-5 h-5 mr-2" />
                      Create Segment
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {segments.map((segment) => (
                      <div key={segment._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <Filter className="w-5 h-5 text-gray-400" />
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                  {segment.name}
                                </h3>
                                {segment.description && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {segment.description}
                                  </p>
                                )}
                                <div className="flex items-center space-x-4 mt-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                    <Users className="w-3 h-3 mr-1" />
                                    {segment.subscriberCount || 0} subscribers
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {segment.filters?.length || 0} filter{segment.filters?.length !== 1 ? 's' : ''}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Logic: {segment.logic || 'AND'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewSegmentSubscribers(segment)}
                              className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                              title="View subscribers"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditSegment(segment)}
                              className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                              title="Edit segment"
                            >
                              <Pencil className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSegment(segment)}
                              className="inline-flex items-center px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                              title="Delete segment"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Segment Subscribers Modal */}
              {selectedSegment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        Subscribers in "{selectedSegment.name}"
                      </h2>
                      <button
                        onClick={() => setSelectedSegment(null)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                      {loadingSegmentSubscribers ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                      ) : segmentSubscribers.length === 0 ? (
                        <div className="text-center py-12">
                          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No subscribers match this segment
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400">
                            Try adjusting the segment filters to include more subscribers
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {segmentSubscribers.map((subscriber) => (
                            <div key={subscriber._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <User className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {subscriber.name || 'No name'}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {subscriber.email}
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(subscriber.status)}`}>
                                {subscriber.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriberManagement;
