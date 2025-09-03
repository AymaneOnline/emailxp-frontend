// emailxp/frontend/src/components/SegmentBuilder.js

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Users, Filter, Eye, Save, Trash2 } from 'lucide-react';
import segmentService from '../services/segmentService';
import { toast } from 'react-toastify';

const SegmentBuilder = ({ 
  segment = null, 
  onSave, 
  onCancel, 
  showPreview = true 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [filters, setFilters] = useState([]);
  const [logic, setLogic] = useState('AND');
  const [filterFields, setFilterFields] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditMode = !!segment;

  // Load filter fields on mount
  useEffect(() => {
    const loadFilterFields = async () => {
      try {
        const fields = await segmentService.getFilterFields();
        setFilterFields(fields);
      } catch (error) {
        console.error('Failed to load filter fields:', error);
        toast.error('Failed to load filter options');
      }
    };
    loadFilterFields();
  }, []);

  // Load segment data for editing
  useEffect(() => {
    if (segment) {
      setName(segment.name || '');
      setDescription(segment.description || '');
      setFilters(segment.filters || []);
      setLogic(segment.logic || 'AND');
    }
  }, [segment]);

  // Preview segment when filters change
  const previewSegment = useCallback(async () => {
    if (!showPreview || filters.length === 0) {
      setPreviewData(null);
      return;
    }

    try {
      setLoading(true);
      const preview = await segmentService.previewSegment(filters, logic);
      setPreviewData(preview);
    } catch (error) {
      console.error('Preview failed:', error);
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  }, [filters, logic, showPreview]);

  // Debounced preview
  useEffect(() => {
    const timer = setTimeout(previewSegment, 500);
    return () => clearTimeout(timer);
  }, [previewSegment]);

  const addFilter = () => {
    const newFilter = {
      id: Date.now(),
      field: filterFields[0]?.field || 'email',
      operator: 'equals',
      value: ''
    };
    setFilters([...filters, newFilter]);
  };

  const updateFilter = (filterId, updates) => {
    setFilters(filters.map(filter => 
      filter.id === filterId 
        ? { ...filter, ...updates }
        : filter
    ));
  };

  const removeFilter = (filterId) => {
    setFilters(filters.filter(filter => filter.id !== filterId));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Segment name is required');
      return;
    }

    if (filters.length === 0) {
      toast.error('At least one filter is required');
      return;
    }

    try {
      setSaving(true);
      const segmentData = {
        name: name.trim(),
        description: description.trim(),
        filters: filters.map(({ id, ...filter }) => filter), // Remove temporary ID
        logic
      };

      let savedSegment;
      if (isEditMode) {
        savedSegment = await segmentService.updateSegment(segment._id, segmentData);
        toast.success('Segment updated successfully');
      } else {
        savedSegment = await segmentService.createSegment(segmentData);
        toast.success('Segment created successfully');
      }

      if (onSave) {
        onSave(savedSegment);
      }
    } catch (error) {
      console.error('Save failed:', error);
      toast.error(error.response?.data?.message || 'Failed to save segment');
    } finally {
      setSaving(false);
    }
  };

  const getFieldConfig = (fieldName) => {
    return filterFields.find(f => f.field === fieldName) || {};
  };

  const getOperatorLabel = (operator) => {
    const labels = {
      equals: 'equals',
      not_equals: 'does not equal',
      contains: 'contains',
      not_contains: 'does not contain',
      starts_with: 'starts with',
      ends_with: 'ends with',
      is_empty: 'is empty',
      is_not_empty: 'is not empty',
      greater_than: 'is greater than',
      less_than: 'is less than',
      between: 'is between',
      in: 'is in',
      not_in: 'is not in',
      before: 'is before',
      after: 'is after',
      within_days: 'within last X days',
      more_than_days_ago: 'more than X days ago'
    };
    return labels[operator] || operator;
  };

  const renderFilterValue = (filter) => {
    const fieldConfig = getFieldConfig(filter.field);
    const needsValue = !['is_empty', 'is_not_empty'].includes(filter.operator);

    if (!needsValue) {
      return null;
    }

    if (filter.operator === 'between') {
      return (
        <div className="flex items-center space-x-2">
          <input
            type={fieldConfig.type === 'date' ? 'date' : fieldConfig.type === 'number' ? 'number' : 'text'}
            value={filter.value || ''}
            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
            className="flex-1 p-2 border border-gray-300 rounded text-sm"
            placeholder="From"
          />
          <span className="text-gray-500">and</span>
          <input
            type={fieldConfig.type === 'date' ? 'date' : fieldConfig.type === 'number' ? 'number' : 'text'}
            value={filter.secondValue || ''}
            onChange={(e) => updateFilter(filter.id, { secondValue: e.target.value })}
            className="flex-1 p-2 border border-gray-300 rounded text-sm"
            placeholder="To"
          />
        </div>
      );
    }

    if (['in', 'not_in'].includes(filter.operator)) {
      return (
        <input
          type="text"
          value={filter.value || ''}
          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
          className="flex-1 p-2 border border-gray-300 rounded text-sm"
          placeholder="Value1, Value2, Value3"
        />
      );
    }

    return (
      <input
        type={fieldConfig.type === 'date' ? 'date' : fieldConfig.type === 'number' ? 'number' : 'text'}
        value={filter.value || ''}
        onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
        className="flex-1 p-2 border border-gray-300 rounded text-sm"
        placeholder="Enter value"
      />
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-primary-red" />
            <h3 className="text-lg font-semibold">
              {isEditMode ? 'Edit Segment' : 'Create Segment'}
            </h3>
          </div>
          {showPreview && previewData && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{previewData.subscriberCount.toLocaleString()} subscribers</span>
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-red"></div>}
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Segment Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
              placeholder="e.g., Active Users"
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
        </div>

        {/* Logic Selector */}
        {filters.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Logic
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="AND"
                  checked={logic === 'AND'}
                  onChange={(e) => setLogic(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">AND (all conditions must match)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="OR"
                  checked={logic === 'OR'}
                  onChange={(e) => setLogic(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">OR (any condition can match)</span>
              </label>
            </div>
          </div>
        )}

        {/* Filters */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Filters *
            </label>
            <button
              onClick={addFilter}
              className="flex items-center space-x-1 px-3 py-1 bg-primary-red text-white rounded text-sm hover:bg-red-600"
            >
              <Plus className="h-4 w-4" />
              <span>Add Filter</span>
            </button>
          </div>

          {filters.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded">
              <Filter className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No filters added yet</p>
              <p className="text-sm">Click "Add Filter" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filters.map((filter, index) => {
                const fieldConfig = getFieldConfig(filter.field);
                return (
                  <div key={filter.id} className="p-3 border border-gray-200 rounded bg-gray-50">
                    {index > 0 && (
                      <div className="text-center mb-2">
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                          {logic}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      {/* Field */}
                      <select
                        value={filter.field}
                        onChange={(e) => {
                          const newFieldConfig = getFieldConfig(e.target.value);
                          updateFilter(filter.id, { 
                            field: e.target.value,
                            operator: newFieldConfig.operators?.[0] || 'equals',
                            value: '',
                            secondValue: ''
                          });
                        }}
                        className="p-2 border border-gray-300 rounded text-sm"
                      >
                        {filterFields.map(field => (
                          <option key={field.field} value={field.field}>
                            {field.label}
                          </option>
                        ))}
                      </select>

                      {/* Operator */}
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(filter.id, { 
                          operator: e.target.value,
                          value: '',
                          secondValue: ''
                        })}
                        className="p-2 border border-gray-300 rounded text-sm"
                      >
                        {fieldConfig.operators?.map(op => (
                          <option key={op} value={op}>
                            {getOperatorLabel(op)}
                          </option>
                        ))}
                      </select>

                      {/* Value */}
                      {renderFilterValue(filter)}

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFilter(filter.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {showPreview && previewData && (
            <div className="text-sm text-gray-600">
              Preview: <span className="font-medium">{previewData.subscriberCount.toLocaleString()}</span> subscribers
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || filters.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-red text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SegmentBuilder;