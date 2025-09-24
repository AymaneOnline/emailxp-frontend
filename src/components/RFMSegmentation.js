// emailxp/frontend/src/components/RFMSegmentation.js

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import advancedSegmentationService from '../services/advancedSegmentationService';
import { toast } from 'react-toastify';

const RFMSegmentation = ({ onSegmentCreated, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [recency, setRecency] = useState({ operator: 'more_than_days_ago', value: '' });
  const [frequency, setFrequency] = useState({ operator: 'greater_than', value: '' });
  const [monetary, setMonetary] = useState({ operator: 'greater_than', value: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Segment name is required');
      return;
    }

    setSaving(true);
    try {
      const rfmData = {
        name: name.trim(),
        description: description.trim(),
        recency,
        frequency,
        monetary
      };

      await advancedSegmentationService.createRFMSegment(rfmData);
      toast.success('RFM segment created successfully');
      
      if (onSegmentCreated) {
        onSegmentCreated();
      }
    } catch (error) {
      console.error('Failed to create RFM segment:', error);
      toast.error(error.response?.data?.message || 'Failed to create RFM segment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create RFM Segment</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Create segments based on Recency, Frequency, and Monetary value
        </p>
      </div>

      {/* Form */}
      <div className="p-4 space-y-4">
        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Segment Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
            placeholder="e.g., High Value Customers"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
            placeholder="Optional description"
          />
        </div>

        {/* RFM Criteria */}
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Recency (R)</h4>
            <p className="text-sm text-blue-700 mb-3">
              How recently a customer has made a purchase
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={recency.operator}
                onChange={(e) => setRecency({...recency, operator: e.target.value})}
                className="p-2 border border-gray-300 rounded text-sm"
              >
                <option value="more_than_days_ago">More than X days ago</option>
                <option value="within_days">Within last X days</option>
              </select>
              <input
                type="number"
                value={recency.value}
                onChange={(e) => setRecency({...recency, value: e.target.value})}
                className="p-2 border border-gray-300 rounded text-sm"
                placeholder="Number of days"
                min="1"
              />
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Frequency (F)</h4>
            <p className="text-sm text-green-700 mb-3">
              How often a customer makes purchases
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={frequency.operator}
                onChange={(e) => setFrequency({...frequency, operator: e.target.value})}
                className="p-2 border border-gray-300 rounded text-sm"
              >
                <option value="greater_than">More than</option>
                <option value="less_than">Less than</option>
                <option value="equals">Equals</option>
              </select>
              <input
                type="number"
                value={frequency.value}
                onChange={(e) => setFrequency({...frequency, value: e.target.value})}
                className="p-2 border border-gray-300 rounded text-sm"
                placeholder="Number of purchases"
                min="0"
              />
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">Monetary (M)</h4>
            <p className="text-sm text-purple-700 mb-3">
              How much money a customer has spent
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={monetary.operator}
                onChange={(e) => setMonetary({...monetary, operator: e.target.value})}
                className="p-2 border border-gray-300 rounded text-sm"
              >
                <option value="greater_than">More than</option>
                <option value="less_than">Less than</option>
                <option value="equals">Equals</option>
              </select>
              <input
                type="number"
                value={monetary.value}
                onChange={(e) => setMonetary({...monetary, value: e.target.value})}
                className="p-2 border border-gray-300 rounded text-sm"
                placeholder="Total spending amount"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-red text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          <span>{saving ? 'Creating...' : 'Create Segment'}</span>
        </button>
      </div>
    </div>
  );
};

export default RFMSegmentation;// emailxp/frontend/src/components/RFMSegmentation.js

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import advancedSegmentationService from '../services/advancedSegmentationService';
import { toast } from 'react-toastify';

const RFMSegmentation = ({ onSegmentCreated, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [recency, setRecency] = useState({ operator: 'more_than_days_ago', value: '' });
  const [frequency, setFrequency] = useState({ operator: 'greater_than', value: '' });
  const [monetary, setMonetary] = useState({ operator: 'greater_than', value: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Segment name is required');
      return;
    }

    setSaving(true);
    try {
      const rfmData = {
        name: name.trim(),
        description: description.trim(),
        recency,
        frequency,
        monetary
      };

      await advancedSegmentationService.createRFMSegment(rfmData);
      toast.success('RFM segment created successfully');
      
      if (onSegmentCreated) {
        onSegmentCreated();
      }
    } catch (error) {
      console.error('Failed to create RFM segment:', error);
      toast.error(error.response?.data?.message || 'Failed to create RFM segment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create RFM Segment</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Create segments based on Recency, Frequency, and Monetary value
        </p>
      </div>

      {/* Form */}
      <div className="p-4 space-y-4">
        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Segment Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
            placeholder="e.g., High Value Customers"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
            placeholder="Optional description"
          />
        </div>

        {/* RFM Criteria */}
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Recency (R)</h4>
            <p className="text-sm text-blue-700 mb-3">
              How recently a customer has made a purchase
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={recency.operator}
                onChange={(e) => setRecency({...recency, operator: e.target.value})}
                className="p-2 border border-gray-300 rounded text-sm"
              >
                <option value="more_than_days_ago">More than X days ago</option>
                <option value="within_days">Within last X days</option>
              </select>
              <input
                type="number"
                value={recency.value}
                onChange={(e) => setRecency({...recency, value: e.target.value})}
                className="p-2 border border-gray-300 rounded text-sm"
                placeholder="Number of days"
                min="1"
              />
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Frequency (F)</h4>
            <p className="text-sm text-green-700 mb-3">
              How often a customer makes purchases
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={frequency.operator}
                onChange={(e) => setFrequency({...frequency, operator: e.target.value})}
                className="p-2 border border-gray-300 rounded text-sm"
              >
                <option value="greater_than">More than</option>
                <option value="less_than">Less than</option>
                <option value="equals">Equals</option>
              </select>
              <input
                type="number"
                value={frequency.value}
                onChange={(e) => setFrequency({...frequency, value: e.target.value})}
                className="p-2 border border-gray-300 rounded text-sm"
                placeholder="Number of purchases"
                min="0"
              />
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">Monetary (M)</h4>
            <p className="text-sm text-purple-700 mb-3">
              How much money a customer has spent
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={monetary.operator}
                onChange={(e) => setMonetary({...monetary, operator: e.target.value})}
                className="p-2 border border-gray-300 rounded text-sm"
              >
                <option value="greater_than">More than</option>
                <option value="less_than">Less than</option>
                <option value="equals">Equals</option>
              </select>
              <input
                type="number"
                value={monetary.value}
                onChange={(e) => setMonetary({...monetary, value: e.target.value})}
                className="p-2 border border-gray-300 rounded text-sm"
                placeholder="Total spending amount"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-red text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          <span>{saving ? 'Creating...' : 'Create Segment'}</span>
        </button>
      </div>
    </div>
  );
};

export default RFMSegmentation;