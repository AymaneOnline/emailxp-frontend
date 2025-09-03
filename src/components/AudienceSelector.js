// emailxp/frontend/src/components/AudienceSelector.js

import React, { useState, useEffect } from 'react';
import { Users, Filter, Search, X, Plus } from 'lucide-react';
import groupService from '../services/groupService';
import subscriberService from '../services/subscriberService';
import segmentService from '../services/segmentService';

const AudienceSelector = ({ 
  selectedGroups = [], 
  selectedSegments = [], 
  selectedIndividuals = [],
  onSelectionChange,
  showRecipientCount = true 
}) => {
  const [activeTab, setActiveTab] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [segments, setSegments] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recipientCount, setRecipientCount] = useState(0);

  // Load groups
  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoading(true);
        const groupsData = await groupService.getGroups();
        setGroups(groupsData || []);
      } catch (error) {
        console.error('Failed to load groups:', error);
      } finally {
        setLoading(false);
      }
    };
    loadGroups();
  }, []);

  // Load segments
  useEffect(() => {
    if (activeTab === 'segments') {
      const loadSegments = async () => {
        try {
          setLoading(true);
          const segmentsData = await segmentService.getSegments();
          setSegments(segmentsData || []);
        } catch (error) {
          console.error('Failed to load segments:', error);
        } finally {
          setLoading(false);
        }
      };
      loadSegments();
    }
  }, [activeTab]);

  // Load subscribers for individual selection
  useEffect(() => {
    if (activeTab === 'individuals') {
      const loadSubscribers = async () => {
        try {
          setLoading(true);
          const subscribersData = await subscriberService.getSubscribers();
          setSubscribers(subscribersData?.subscribers || []);
        } catch (error) {
          console.error('Failed to load subscribers:', error);
        } finally {
          setLoading(false);
        }
      };
      loadSubscribers();
    }
  }, [activeTab]);

  // Calculate recipient count
  useEffect(() => {
    const calculateRecipientCount = async () => {
      if (!showRecipientCount) return;
      
      try {
        // This would need a backend endpoint to calculate total unique recipients
        // For now, we'll estimate based on selected groups
        let count = 0;
        
        // Count from selected groups
        for (const groupId of selectedGroups) {
          const group = groups.find(g => g._id === groupId);
          if (group && group.subscriberCount) {
            count += group.subscriberCount;
          }
        }
        
        // Count from selected segments
        for (const segmentId of selectedSegments) {
          const segment = segments.find(s => s._id === segmentId);
          if (segment && segment.subscriberCount) {
            count += segment.subscriberCount;
          }
        }
        
        // Add individual subscribers
        count += selectedIndividuals.length;
        
        setRecipientCount(count);
      } catch (error) {
        console.error('Failed to calculate recipient count:', error);
      }
    };
    
    calculateRecipientCount();
  }, [selectedGroups, selectedSegments, selectedIndividuals, groups, segments, showRecipientCount]);

  const handleGroupToggle = (groupId) => {
    const newSelection = selectedGroups.includes(groupId)
      ? selectedGroups.filter(id => id !== groupId)
      : [...selectedGroups, groupId];
    
    onSelectionChange({
      groups: newSelection,
      segments: selectedSegments,
      individuals: selectedIndividuals
    });
  };

  const handleSegmentToggle = (segmentId) => {
    const newSelection = selectedSegments.includes(segmentId)
      ? selectedSegments.filter(id => id !== segmentId)
      : [...selectedSegments, segmentId];
    
    onSelectionChange({
      groups: selectedGroups,
      segments: newSelection,
      individuals: selectedIndividuals
    });
  };

  const handleIndividualToggle = (subscriberId) => {
    const newSelection = selectedIndividuals.includes(subscriberId)
      ? selectedIndividuals.filter(id => id !== subscriberId)
      : [...selectedIndividuals, subscriberId];
    
    onSelectionChange({
      groups: selectedGroups,
      segments: selectedSegments,
      individuals: newSelection
    });
  };

  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderGroupsTab = () => (
    <div className="space-y-3">
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-red mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading groups...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No groups available</p>
          <p className="text-sm">Create a group first to select recipients</p>
        </div>
      ) : (
        groups.map(group => (
          <div
            key={group._id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedGroups.includes(group._id)
                ? 'border-primary-red bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleGroupToggle(group._id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{group.name}</h4>
                <p className="text-sm text-gray-500">
                  {group.subscriberCount || 0} subscribers
                </p>
              </div>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                selectedGroups.includes(group._id)
                  ? 'border-primary-red bg-primary-red'
                  : 'border-gray-300'
              }`}>
                {selectedGroups.includes(group._id) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderSegmentsTab = () => (
    <div className="space-y-3">
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-red mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading segments...</p>
        </div>
      ) : segments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Filter className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No segments available</p>
          <p className="text-sm">Create segments to target specific subscriber groups</p>
          <button
            onClick={() => window.open('/subscribers#segments', '_blank')}
            className="mt-3 flex items-center space-x-1 px-3 py-1 bg-primary-red text-white rounded text-sm hover:bg-red-600 mx-auto"
          >
            <Plus className="h-3 w-3" />
            <span>Create Segment</span>
          </button>
        </div>
      ) : (
        segments.map(segment => (
          <div
            key={segment._id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedSegments.includes(segment._id)
                ? 'border-primary-red bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleSegmentToggle(segment._id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{segment.name}</h4>
                <p className="text-sm text-gray-500">
                  {segment.subscriberCount || 0} subscribers
                </p>
                {segment.description && (
                  <p className="text-xs text-gray-400 mt-1">{segment.description}</p>
                )}
              </div>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                selectedSegments.includes(segment._id)
                  ? 'border-primary-red bg-primary-red'
                  : 'border-gray-300'
              }`}>
                {selectedSegments.includes(segment._id) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderIndividualsTab = () => (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search subscribers..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-red mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading subscribers...</p>
        </div>
      ) : filteredSubscribers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>{searchTerm ? 'No subscribers found' : 'No subscribers available'}</p>
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-2">
          {filteredSubscribers.map(subscriber => (
            <div
              key={subscriber._id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedIndividuals.includes(subscriber._id)
                  ? 'border-primary-red bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleIndividualToggle(subscriber._id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {subscriber.name || subscriber.email}
                  </h4>
                  {subscriber.name && (
                    <p className="text-sm text-gray-500">{subscriber.email}</p>
                  )}
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selectedIndividuals.includes(subscriber._id)
                    ? 'border-primary-red bg-primary-red'
                    : 'border-gray-300'
                }`}>
                  {selectedIndividuals.includes(subscriber._id) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4">
          {[
            { id: 'groups', label: 'Groups', icon: Users },
            { id: 'segments', label: 'Segments', icon: Filter },
            { id: 'individuals', label: 'Individual', icon: Search }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-red text-primary-red'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'groups' && renderGroupsTab()}
        {activeTab === 'segments' && renderSegmentsTab()}
        {activeTab === 'individuals' && renderIndividualsTab()}
      </div>

      {/* Recipient Count */}
      {showRecipientCount && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Recipients</span>
            <span className="font-medium text-gray-900">
              {recipientCount.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudienceSelector;