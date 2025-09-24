// emailxp/frontend/src/pages/FormBuilder.js

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  Plus, 
  X, 
  ArrowLeft, 
  Type, 
  Mail, 
  Phone, 
  Calendar,
  CheckSquare,
  AlignLeft,
  Hash,
  Globe,
  BarChart
} from 'lucide-react';
import { toast } from 'react-toastify';
import formService from '../services/formService';
import { H1, H2, H3, Body, Small } from '../components/ui/Typography';

const FormBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fields: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Available field types
  const fieldTypes = [
    { id: 'text', name: 'Text', icon: Type },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'phone', name: 'Phone', icon: Phone },
    { id: 'date', name: 'Date', icon: Calendar },
    { id: 'checkbox', name: 'Checkbox', icon: CheckSquare },
    { id: 'textarea', name: 'Text Area', icon: AlignLeft },
    { id: 'number', name: 'Number', icon: Hash },
    { id: 'select', name: 'Dropdown', icon: Globe }
  ];

  const loadForm = useCallback(async () => {
    try {
      setLoading(true);
      const form = await formService.getFormById(id);
      setFormData({
        name: form.name,
        description: form.description,
        fields: form.fields || []
      });
    } catch (err) {
      console.error('Error loading form:', err);
      setError('Failed to load form');
      toast.error('Failed to load form');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditing) {
      loadForm();
    }
  }, [isEditing, loadForm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addField = (fieldType) => {
    const newField = {
      id: Date.now().toString(),
      type: fieldType.id,
      label: `${fieldType.name} Field`,
      required: false,
      placeholder: '',
      options: fieldType.id === 'select' ? ['Option 1', 'Option 2'] : undefined
    };

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const removeField = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const moveField = (fieldId, direction) => {
    const fields = [...formData.fields];
    const index = fields.findIndex(f => f.id === fieldId);
    
    if (direction === 'up' && index > 0) {
      [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]];
    } else if (direction === 'down' && index < fields.length - 1) {
      [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
    }
    
    setFormData(prev => ({
      ...prev,
      fields
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a form name');
      return;
    }

    if (formData.fields.length === 0) {
      toast.error('Please add at least one field to the form');
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing) {
        await formService.updateForm(id, formData);
        toast.success('Form updated successfully');
      } else {
        await formService.createForm(formData);
        toast.success('Form created successfully');
      }
      
      navigate('/forms');
    } catch (err) {
      console.error('Error saving form:', err);
      setError('Failed to save form');
      toast.error('Failed to save form');
    } finally {
      setLoading(false);
    }
  };

  const getFieldIcon = (type) => {
    const fieldType = fieldTypes.find(ft => ft.id === type);
    return fieldType ? fieldType.icon : Type;
  };

  const renderFieldOptions = (field) => {
    const Icon = getFieldIcon(field.type);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Icon className="w-4 h-4 text-gray-500 mr-2" />
            <span className="font-medium text-gray-900 dark:text-white">
              {field.label}
            </span>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => moveField(field.id, 'up')}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="Move up"
            >
              ↑
            </button>
            <button
              onClick={() => moveField(field.id, 'down')}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="Move down"
            >
              ↓
            </button>
            <button
              onClick={() => removeField(field.id)}
              className="p-1 text-gray-500 hover:text-red-600"
              title="Remove field"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Label
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={field.placeholder}
              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`required-${field.id}`}
              checked={field.required}
              onChange={(e) => updateField(field.id, { required: e.target.checked })}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor={`required-${field.id}`} className="ml-2 block text-sm text-gray-900 dark:text-white">
              Required field
            </label>
          </div>
          
          {field.type === 'select' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Options
              </label>
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...field.options];
                        newOptions[index] = e.target.value;
                        updateField(field.id, { options: newOptions });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => {
                        const newOptions = field.options.filter((_, i) => i !== index);
                        updateField(field.id, { options: newOptions });
                      }}
                      className="ml-2 p-2 text-gray-500 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newOptions = [...(field.options || []), 'New Option'];
                    updateField(field.id, { options: newOptions });
                  }}
                  className="inline-flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Option
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/forms')}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Forms
        </button>
        <H1 className="mb-0">{isEditing ? 'Edit Form' : 'Create New Form'}</H1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <H2 className="mb-4">Form Details</H2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Form Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Newsletter Signup"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Describe what this form is for..."
              />
            </div>
          </div>
        </div>

        {/* Field Builder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <H2 className="mb-0">Form Fields</H2>
            <Small className="text-gray-500 mb-0">{formData.fields.length} field(s)</Small>
          </div>
          
          {formData.fields.length === 0 ? (
            <div className="text-center py-8">
              <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <H3 className="mb-1">No fields yet</H3>
              <Body className="text-gray-500 mb-0">Add your first field to get started</Body>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.fields.map((field) => renderFieldOptions(field))}
            </div>
          )}
        </div>

        {/* Add Field Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <H2 className="mb-4">Add Field</H2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {fieldTypes.map((fieldType) => {
              const Icon = fieldType.icon;
              return (
                <button
                  key={fieldType.id}
                  type="button"
                  onClick={() => addField(fieldType)}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Icon className="w-6 h-6 text-gray-500 mb-2" />
                  <Small className="text-gray-700 dark:text-gray-300 mb-0">{fieldType.name}</Small>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/forms')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isEditing ? 'Update Form' : 'Create Form'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormBuilder;