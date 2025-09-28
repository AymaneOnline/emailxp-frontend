import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Plus,
  Search,
  Download,
  Upload,
  Trash2,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  Pencil,
  Filter,
  Eye,
  X,
  MoreVertical,
  CheckCircle2,
  XCircle,
  FolderPlus,
  MinusCircle,
  ListPlus
} from 'lucide-react';
// PageHeader removed (using custom header with Typography)
import { H1, H4, Body } from '../components/ui/Typography';
import Modal from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import subscriberService from '../services/subscriberService';
import devLog from '../utils/devLog';
import groupService from '../services/groupService';
import segmentService from '../services/segmentService';
import SegmentBuilder from '../components/SegmentBuilder';
import PageContainer from '../components/layout/PageContainer';
import DashboardTabs from '../components/DashboardTabs';

const SubscriberManagement = () => {
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState('subscribers');

  // Data
  const [groups, setGroups] = useState([]);
  // Tags removed
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
  // Tag filter removed
  const [currentPage, setCurrentPage] = useState(1);

  // UI state
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  // Inline action bar popovers
  // Unified dropdown instead of separate popovers
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [pageInput, setPageInput] = useState(1);
  // Create Group modal state
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);
  const [showRemoveFromGroupModal, setShowRemoveFromGroupModal] = useState(false);
  const [selectedBulkGroup, setSelectedBulkGroup] = useState('');
  const [selectedBulkRemoveGroup, setSelectedBulkRemoveGroup] = useState('');
  const [newBulkGroupName, setNewBulkGroupName] = useState('');
  const [creatingBulkGroup, setCreatingBulkGroup] = useState(false);
  const [addModalError, setAddModalError] = useState('');
  const [removeModalError, setRemoveModalError] = useState('');
  const groupMenuRef = useRef(null);

  // Subscriber details are shown on a separate page; modal state removed

  // Close unified group menu on outside click
  useEffect(() => {
    if (!showGroupMenu) return;
    const handler = (e) => {
      if (groupMenuRef.current && !groupMenuRef.current.contains(e.target)) {
        setShowGroupMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showGroupMenu]);
  // Load static data (groups, stats) and initial subscribers
  useEffect(() => {
    (async () => {
      try {
        const [fetchedGroups, statsData] = await Promise.all([
          groupService.getGroups(),
          subscriberService.getSubscriberStats(),
        ]);
        setGroups(fetchedGroups || []);
        setStats(statsData || null);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setGroups([]);
        setStats(null);
      }

      // Load initial subscribers
      (async () => {
        setLoading(true);
        try {
          const params = { page: 1, limit: 20 };
          const data = await subscriberService.getSubscribers(params);
          setSubscribers(data.subscribers || data || []);
          setPagination(data.pagination || null);
        } catch (error) {
          console.error('Failed to load initial subscribers:', error);
          toast.error('Failed to load subscribers');
          setSubscribers([]);
          setPagination(null);
        } finally {
          setLoading(false);
        }
      })();
    })();
  }, []);

  // Keep input field in sync with applied search (on mount)
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Sync page input with currentPage
  useEffect(() => {
    setPageInput(currentPage);
  }, [currentPage]);

  // Debounce applying search
  useEffect(() => {
    const id = setTimeout(() => {
      if (searchInput.trim() !== search) {
        setSearch(searchInput.trim());
      }
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput, search]);

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
  devLog('Fetching subscribers with params:', params);
        const data = await subscriberService.getSubscribers(params);
        setSubscribers(data.subscribers || data || []);
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
  }, [search, statusFilter, groupFilter, currentPage]);

  // Auth state (not currently used after refactor) removed to satisfy lint
  const loadSegments = useCallback(async () => {
    try {
      setSegmentsLoading(true);
      const data = await segmentService.getSegments();
      setSegments(data || []);
    } catch (e) {
      console.error('Failed to load segments', e);
      setSegments([]);
    } finally {
      setSegmentsLoading(false);
    }
  }, []);

  const handleGroupChange = (e) => {
    setGroupFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Tag change handler removed

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
    // confirmation should be handled by the modal UI; remove browser confirm
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
  // tags removed
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
  // tags removed
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

  // Helper to refresh subscribers list after group operations
  const refreshSubscribers = useCallback(async () => {
    try {
      const params = {
        page: currentPage,
        limit: 20,
        ...(search.trim() && { search: search.trim() }),
        ...(statusFilter && { status: statusFilter }),
        ...(groupFilter && { groupId: groupFilter }),
      };
      const data = await subscriberService.getSubscribers(params);
      setSubscribers(data.subscribers || data || []);
      setPagination(data.pagination || null);
    } catch (e) {
      console.error('Failed to refresh subscribers:', e);
    }
  }, [currentPage, search, statusFilter, groupFilter]);

  const handleBulkAddToGroup = async (groupId) => {
    if (!groupId || selectedSubscribers.length === 0) return;
    try {
      await Promise.all(selectedSubscribers.map(id => subscriberService.addSubscriberToGroup(id, groupId)));
      toast.success('Added to group');
      await refreshSubscribers();
      setSelectedSubscribers([]);
    } catch (e) {
      console.error('Bulk add to group failed', e);
      toast.error('Failed to add to group');
    }
  };

  const handleBulkRemoveFromGroup = async (groupId) => {
    if (!groupId || selectedSubscribers.length === 0) return;
    try {
      await Promise.all(selectedSubscribers.map(id => subscriberService.removeSubscriberFromGroup(id, groupId)));
      toast.success('Removed from group');
      await refreshSubscribers();
      setSelectedSubscribers([]);
    } catch (e) {
      console.error('Bulk remove from group failed', e);
      toast.error('Failed to remove from group');
    }
  };

  // Inline group creation removed; replaced by modal-driven workflows.

  const handleExport = async () => {
    try {
      const params = {
        ...(search.trim() && { search: search.trim() }),
        ...(statusFilter && { status: statusFilter }),
        ...(groupFilter && { groupId: groupFilter })
        // tags removed
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
  // tag filter removed
    setCurrentPage(1);
  };
  // Legacy status badge color helper removed in favor of <StatusBadge /> component

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
    // confirmation should be handled by a modal UI; remove browser confirm
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

  const createSegmentFromSelection = async (name) => {
    try {
      const filters = [
        {
          field: 'email',
          operator: 'in',
          value: subscribers.filter(s=>selectedSubscribers.includes(s._id)).map(s=>s.email)
        }
      ];
      await segmentService.createSegment({ name, description: 'Created from manual selection', filters, logic: 'AND' });
      toast.success('Segment created');
      setShowGroupMenu(false);
      setSelectedSubscribers([]);
      loadSegments();
    } catch (e) {
      console.error('Create segment from selection failed', e);
      toast.error('Failed to create segment');
    }
  };

  // Compute groups that are present among selected subscribers
  const selectedSubscriberGroups = React.useMemo(() => {
    const map = new Map();
    subscribers.forEach(s => {
      if (selectedSubscribers.includes(s._id) && Array.isArray(s.groups)) {
        s.groups.forEach(g => {
          const id = typeof g === 'string' ? g : (g._id || g);
          const name = typeof g === 'string' ? g : (g.name || g);
          if (id) map.set(id, name);
        });
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ _id: id, name }));
  }, [selectedSubscribers, subscribers]);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <H1 className="text-2xl font-bold !text-gray-900 dark:!text-white">Subscribers</H1>
            {stats ? (
              <Body className="mt-1 text-gray-500 dark:!text-gray-400">{stats.total} total subscribers ({stats.subscribed} active)</Body>
            ) : (
              <div className="mt-2 h-4 w-56 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeTab === 'subscribers' && (
              <>
                <button onClick={() => navigate('/subscribers/import')} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Upload className="w-4 h-4 mr-2" /> Import
                </button>
                <button onClick={handleExport} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Download className="w-4 h-4 mr-2" /> Export
                </button>
                <button onClick={() => navigate('/subscribers/new')} className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <Plus className="w-5 h-5 mr-2" /> Add Subscriber
                </button>
              </>
            )}
            {activeTab === 'segments' && (
              <button onClick={handleCreateSegment} className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                <Plus className="w-5 h-5 mr-2" /> Create Segment
              </button>
            )}
            {activeTab === 'groups' && (
              <>
                <button onClick={() => setShowCreateGroupModal(true)} className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <Plus className="w-5 h-5 mr-2" /> Create Group
                </button>
                <Modal open={showCreateGroupModal} onClose={() => { setShowCreateGroupModal(false); setNewGroupName(''); }} title="Create Group">
                  <Body className="text-gray-600 mb-4">Enter a friendly name for the new group.</Body>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. VIP customers"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <div className="flex justify-end gap-3 mt-4">
                    <button onClick={() => { setShowCreateGroupModal(false); setNewGroupName(''); }} disabled={creatingGroup} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button onClick={async () => {
                      if (!newGroupName.trim()) return toast.error('Group name cannot be empty');
                      setCreatingGroup(true);
                      try {
                        const created = await groupService.createGroup({ name: newGroupName.trim() });
                        if (created && created._id) {
                          setGroups(prev => [...prev, created]);
                          toast.success('Group created');
                          setShowCreateGroupModal(false);
                          setNewGroupName('');
                        } else {
                          toast.error('Failed to create group');
                        }
                      } catch (e) {
                        console.error('Create group failed', e);
                        toast.error('Failed to create group');
                      } finally {
                        setCreatingGroup(false);
                      }
                    }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">{creatingGroup ? 'Creating...' : 'Create Group'}</button>
                  </div>
                </Modal>
              </>
            )}
          </div>
        </div>

        <DashboardTabs
          tabs={[{ key: 'subscribers', label: 'Subscribers' }, { key: 'segments', label: 'Segments' }, { key: 'groups', label: 'Groups' }]}
          active={activeTab}
          onChange={(k) => { setActiveTab(k); const hash = k === 'segments' ? '#segments' : k === 'groups' ? '#groups' : ''; window.history.pushState(null, null, `/subscribers${hash}`); }}
        />

        {activeTab === 'subscribers' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={searchInput} onChange={handleSearchChange} type="text" placeholder="Search by email..." className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select value={statusFilter} onChange={handleStatusChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  <option value="">All Statuses</option>
                  <option value="subscribed">Subscribed</option>
                  <option value="unsubscribed">Unsubscribed</option>
                  {/* Simplified: removed bounced & complained */}
                </select>
              </div>
              {groups.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Group</label>
                  <select value={groupFilter} onChange={handleGroupChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent">
                    <option value="">All Groups</option>
                    {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            {(search || statusFilter || groupFilter) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button onClick={clearFilters} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Clear all filters</button>
              </div>
            )}
          </div>
        )}

        

        {activeTab === 'subscribers' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-visible">
            {/* Embedded Sticky Action Bar */}
            <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 h-16 flex items-center justify-between gap-6 overflow-visible">
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 flex-shrink-0">
                  <input type="checkbox" checked={subscribers.length > 0 && selectedSubscribers.length === subscribers.length} onChange={handleSelectAll} className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <span>Select All</span>
                </label>
                {pagination && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700">«</button>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={!pagination.hasPrev} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700">Prev</button>
                    <div className="flex items-center gap-1">
                      <input type="number" min={1} max={pagination.totalPages} value={pageInput} onChange={e => setPageInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { const v = parseInt(pageInput, 10); if (!isNaN(v) && v>=1 && v<=pagination.totalPages) handlePageChange(v); else setPageInput(currentPage); } }} onBlur={() => { const v = parseInt(pageInput,10); if (isNaN(v)||v<1||v>pagination.totalPages) setPageInput(currentPage); else if (v!==currentPage) handlePageChange(v); }} className="w-14 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-red-500 focus:border-red-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">/ {pagination.totalPages}</span>
                    </div>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={!pagination.hasNext} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
                    <button onClick={() => handlePageChange(pagination.totalPages)} disabled={currentPage === pagination.totalPages} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700">»</button>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{pagination.totalItems} total</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 relative w-[260px] justify-end" ref={groupMenuRef}>
                {selectedSubscribers.length>0 ? (
                  <>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2 flex-shrink-0">{`${selectedSubscribers.length} selected`}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => setShowBulkDeleteModal(true)} className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white" title="Delete selected"><Trash2 className="w-4 h-4" /></button>
                      <div className="relative">
                        <button onClick={() => setShowGroupMenu(v=>!v)} title="More actions" aria-label="More actions" aria-expanded={showGroupMenu} className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                                {showGroupMenu && (
                                  <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50">
                            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</div>
                            <div className="flex flex-col">
                              {[
                                { key: 'subscribed', icon: <CheckCircle2 className='w-4 h-4 mr-2 text-green-600 dark:text-green-400' /> },
                                { key: 'unsubscribed', icon: <XCircle className='w-4 h-4 mr-2 text-yellow-600 dark:text-yellow-400' /> }
                              ].map(o => (
                                <button key={o.key} onClick={async ()=>{ try { await subscriberService.bulkUpdateStatus(selectedSubscribers, o.key); toast.success(`Status set to ${o.key}`); setShowGroupMenu(false); setSelectedSubscribers([]); refreshSubscribers(); } catch { toast.error('Bulk status update failed'); } }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center text-gray-700 dark:text-gray-200">
                                  {o.icon} Set {o.key}
                                </button>
                              ))}
                            </div>
                          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Groups</div>
                          <div className="flex flex-col">
                            <button onClick={() => { setShowAddToGroupModal(true); setShowGroupMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center text-gray-700 dark:text-gray-200">
                              <FolderPlus className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" /> Add to group
                            </button>
                            <button onClick={() => { setShowRemoveFromGroupModal(true); setShowGroupMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center text-gray-700 dark:text-gray-200">
                              <MinusCircle className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" /> Remove from group
                            </button>
                          </div>
                          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                          <button onClick={async ()=>{ try { await subscriberService.exportSelected(selectedSubscribers); toast.success('Export started'); } catch { toast.error('Export failed'); } finally { setShowGroupMenu(false); }} } className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center text-gray-700 dark:text-gray-200"><Download className="w-4 h-4 mr-2" /> Export Selected</button>
                          <button onClick={()=>{ const name = prompt('Segment name?'); if(!name) return; createSegmentFromSelection(name); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center text-gray-700 dark:text-gray-200"><ListPlus className="w-4 h-4 mr-2" /> Create Segment from Selection</button>
                        </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="opacity-0 pointer-events-none flex items-center select-none">
                    <span className="text-sm font-medium">0 selected</span>
                  </div>
                )}
              </div>
            </div>
            {loading ? (
              <div className="p-6 space-y-4">{Array.from({length:6}).map((_,i)=>(<div key={i} className="flex items-center gap-4"><Skeleton className="w-5 h-5 rounded" /><Skeleton className="h-4 w-48" /><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-32" /></div>))}</div>
            ) : subscribers.length===0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left" />
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subscriber</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Groups</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subscribed</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{(search||statusFilter||groupFilter)?'No matching subscribers. Adjust or clear filters to broaden results.':'No subscribers yet. Add your first subscriber manually or import a list.'}</div>
                        {(search||statusFilter||groupFilter) && (
                          <div className="mt-3">
                            <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left" />
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subscriber</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Groups</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subscribed</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {subscribers.map(s => (
                        <tr key={s._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedSubscribers.includes(s._id)?'bg-blue-50 dark:bg-blue-900/20':''}`}>
                          <td className="px-6 py-4"><input onClick={(e)=>{ e.stopPropagation(); handleSelectSubscriber(s._id); }} type="checkbox" checked={selectedSubscribers.includes(s._id)} onChange={()=>{}} className="rounded border-gray-300 text-red-600 focus:ring-red-500" /></td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div onClick={() => navigate(`/subscribers/${s._id}`)} className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:underline">{s.email||'No Email'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={s.status} /></td>
                          <td className="px-6 py-4"><div className="space-y-1">{s.groups && s.groups.length>0 && (<div className="flex flex-wrap gap-1">{s.groups.slice(0,2).map((g,i)=>(<span key={i} className="inline-flex items-center px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs rounded"><Users className="w-3 h-3 mr-1" />{g.name||g}</span>))}{s.groups.length>2 && <span className="text-xs text-gray-500 dark:text-gray-400">+{s.groups.length-2} more</span>}</div>)}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(s.subscriptionDate || s.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button onClick={()=>navigate(`/subscribers/edit/${s._id}`)} className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white" title="Edit"><Pencil className="w-4 h-4" /></button>
                              <button onClick={()=>handleDeleteSubscriber(s._id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pagination && pagination.totalPages>1 && (
                  <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700 dark:text-gray-300">Showing <span className="font-medium">{(currentPage-1)*20+1}</span> to <span className="font-medium">{Math.min(currentPage*20, pagination.totalItems)}</span> of <span className="font-medium">{pagination.totalItems}</span> results</p>
                      <div className="flex items-center gap-1">
                        <button onClick={()=>handlePageChange(currentPage-1)} disabled={!pagination.hasPrev} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-l disabled:opacity-40"> <ChevronLeft className="w-4 h-4" /> </button>
                        {[...Array(pagination.totalPages)].map((_,i)=>{const p=i+1; if(p===1||p===pagination.totalPages||(p>=currentPage-2&&p<=currentPage+2)){return <button key={p} onClick={()=>handlePageChange(p)} className={`px-3 py-1 border text-sm ${p===currentPage?'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-600 dark:text-red-400':'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>{p}</button>} if(p===currentPage-3||p===currentPage+3){return <span key={p} className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400">...</span>} return null;})}
                        <button onClick={()=>handlePageChange(currentPage+1)} disabled={!pagination.hasNext} className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-r disabled:opacity-40"> <ChevronRight className="w-4 h-4" /> </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'segments' && (
          <div className="space-y-6">
            {showSegmentBuilder ? (
              <SegmentBuilder segment={editingSegment} onSave={handleSegmentSave} onCancel={handleSegmentCancel} />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {segmentsLoading ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
                ) : segments.length === 0 ? (
                  <div className="text-center py-12"><Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <H4 className="mb-2">No segments found</H4>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first segment to organize your subscribers</p>
                    <button onClick={handleCreateSegment} className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Filter className="w-5 h-5 mr-2" />Create Segment</button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {segments.map(segment => (
                      <div key={segment._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <Filter className="w-5 h-5 text-gray-400" />
                              <div>
                                <H4 className="mb-0">{segment.name}</H4>
                                {segment.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{segment.description}</p>}
                                <div className="flex items-center space-x-4 mt-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"><Users className="w-3 h-3 mr-1" />{segment.subscriberCount||0} subscribers</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{segment.filters?.length||0} filter{segment.filters?.length!==1?'s':''}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Logic: {segment.logic||'AND'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button onClick={() => handleViewSegmentSubscribers(segment)} className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" title="View">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            <button onClick={() => handleEditSegment(segment)} className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300" title="Edit"><Pencil className="w-4 h-4 mr-1" />Edit</button>
                            <button onClick={() => handleDeleteSegment(segment)} className="inline-flex items-center px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300" title="Delete"><Trash2 className="w-4 h-4 mr-1" />Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {selectedSegment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Subscribers in "{selectedSegment.name}"</h2>
                <button onClick={()=>setSelectedSegment(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {loadingSegmentSubscribers ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
                ) : segmentSubscribers.length===0 ? (
                  <div className="text-center py-12"><Users className="w-12 h-12 text-gray-400 mx-auto mb-4" /><H4 className="mb-2">No subscribers match this segment</H4><p className="text-gray-500 dark:text-gray-400">Try adjusting the segment filters</p></div>
                ) : (
                  <div className="space-y-3">
                    {segmentSubscribers.map(sub => (
                      <div key={sub._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3"><User className="w-5 h-5 text-gray-400" /><div><p className="font-medium text-gray-900 dark:text-white">{sub.name||'No name'}</p><p className="text-sm text-gray-500 dark:text-gray-400">{sub.email}</p></div></div>
                        <StatusBadge status={sub.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        

        {activeTab === 'groups' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {groups === null ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
              ) : groups.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <H4 className="mb-2">No groups yet</H4>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Create groups to organize subscribers for targeted campaigns.</p>
                  <button onClick={() => setShowCreateGroupModal(true)} className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Users className="w-5 h-5 mr-2" /> Create Group</button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {groups.map(group => (
                    <div key={group._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <Users className="w-5 h-5 text-gray-400" />
                            <div>
                              <H4 className="mb-0">{group.name}</H4>
                              {group.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{group.description}</p>}
                              <div className="flex items-center space-x-4 mt-2">
                                {typeof group.subscriberCount === 'number' && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"><Users className="w-3 h-3 mr-1" />{group.subscriberCount} members</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={async () => { const name = prompt('New group name', group.name); if(!name || name===group.name) return; try { const updated = await groupService.updateGroup(group._id, { name }); setGroups(prev => prev.map(g => g._id===group._id ? { ...g, ...updated } : g)); toast.success('Group updated'); } catch { toast.error('Failed to update group'); } }} className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"><Pencil className="w-4 h-4 mr-1" /> Edit</button>
                          <button onClick={async () => {
                            try {
                              await groupService.deleteGroup(group._id);
                              setGroups(prev => prev.filter(g => g._id !== group._id));
                              toast.success('Group deleted');
                            } catch (err) {
                              console.error('Delete group failed', err);
                              if (err?.response?.status === 404) {
                                // Group already missing on server — remove locally and warn
                                setGroups(prev => prev.filter(g => g._id !== group._id));
                                toast.warn('Group not found on server; removed from list');
                              } else {
                                toast.error('Failed to delete group');
                              }
                            }
                          }} className="inline-flex items-center px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"><Trash2 className="w-4 h-4 mr-1" /> Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Removed duplicate Add / Manage Groups button to avoid duplication with the Create Group action above */}
          </div>
        )}
        {/* Bulk Add to Group Modal */}
        <Modal open={showAddToGroupModal} onClose={() => { setShowAddToGroupModal(false); setSelectedBulkGroup(''); setNewBulkGroupName(''); setAddModalError(''); }} title="Add selected to group">
          <Body className="text-gray-600 mb-4">Choose an existing group or create a new one to add the selected subscribers to.</Body>
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" onChange={e => { setSelectedBulkGroup(e.target.value); setAddModalError(''); }} value={selectedBulkGroup}>
            <option value="">Select a group</option>
            {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
          <div className="mt-3 text-sm text-gray-500">Or create a new group</div>
          <div className="flex gap-2 mt-2">
            <input value={newBulkGroupName} onChange={e => setNewBulkGroupName(e.target.value)} placeholder="New group name" className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <button disabled={!newBulkGroupName.trim() || creatingBulkGroup} onClick={async () => { setCreatingBulkGroup(true); try { const created = await groupService.createGroup({ name: newBulkGroupName.trim() }); if (created && created._id) { setGroups(prev => [...prev, created]); setSelectedBulkGroup(created._id); setNewBulkGroupName(''); toast.success('Group created'); setAddModalError(''); } } catch (e) { console.error(e); setAddModalError('Failed to create group'); } finally { setCreatingBulkGroup(false); } }} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">{creatingBulkGroup ? '...' : 'Create'}</button>
          </div>
          {addModalError && <div className="mt-2 text-sm text-red-600">{addModalError}</div>}
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => { setShowAddToGroupModal(false); setSelectedBulkGroup(''); setNewBulkGroupName(''); setAddModalError(''); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button disabled={!selectedBulkGroup || creatingBulkGroup || selectedSubscribers.length===0} onClick={async () => { const gid = selectedBulkGroup || null; if(!gid) { setAddModalError('Please select or create a group'); return; } try { await handleBulkAddToGroup(gid); setShowAddToGroupModal(false); setSelectedBulkGroup(''); setAddModalError(''); } catch (e) { console.error(e); setAddModalError('Failed to add to group'); } }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">Add</button>
          </div>
        </Modal>

        {/* Bulk Remove from Group Modal */}
        <Modal open={showRemoveFromGroupModal} onClose={() => { setShowRemoveFromGroupModal(false); setSelectedBulkRemoveGroup(''); setRemoveModalError(''); }} title="Remove selected from group">
          <Body className="text-gray-600 mb-4">Choose a group to remove the selected subscribers from. Only groups present on the selected subscribers are shown.</Body>
          <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" onChange={e => { setSelectedBulkRemoveGroup(e.target.value); setRemoveModalError(''); }} value={selectedBulkRemoveGroup}>
            <option value="">Select a group</option>
            {selectedSubscriberGroups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
            {selectedSubscriberGroups.length===0 && <option disabled>No groups found for selected subscribers</option>}
          </select>
          {removeModalError && <div className="mt-2 text-sm text-red-600">{removeModalError}</div>}
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => { setShowRemoveFromGroupModal(false); setSelectedBulkRemoveGroup(''); setRemoveModalError(''); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button disabled={!selectedBulkRemoveGroup || selectedSubscriberGroups.length===0} onClick={async () => { const gid = selectedBulkRemoveGroup || null; if(!gid) { setRemoveModalError('Please select a group'); return; } try { await handleBulkRemoveFromGroup(gid); setShowRemoveFromGroupModal(false); setSelectedBulkRemoveGroup(''); setRemoveModalError(''); } catch (e) { console.error(e); setRemoveModalError('Failed to remove from group'); } }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">Remove</button>
          </div>
        </Modal>
        {/* Bulk Delete Confirmation Modal */}
        <Modal open={showBulkDeleteModal} onClose={() => setShowBulkDeleteModal(false)} title="Delete selected subscribers">
          <Body className="text-gray-600 mb-4">Are you sure you want to permanently delete the selected {selectedSubscribers.length} subscriber(s)? This action cannot be undone.</Body>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowBulkDeleteModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={async () => { try { await handleBulkDelete(); setShowBulkDeleteModal(false); } catch (e) { console.error(e); } }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
          </div>
        </Modal>
      </div>
    </PageContainer>
  );
};

export default SubscriberManagement;
