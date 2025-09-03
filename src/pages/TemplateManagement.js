// emailxp/frontend/src/pages/TemplateManagement.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  Star,
  Grid,
  List,
  X,
  Save,
  Download,
  Share2
} from 'lucide-react';
import templateService from '../services/templateService';
import EmailEditor from '../components/EmailEditor';
import TemplateAnalytics from '../components/TemplateAnalytics';
import TemplateSharing from '../components/TemplateSharing';
import { toast } from 'react-toastify';

const TemplateManagement = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' or 'analytics'
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [sharingTemplate, setSharingTemplate] = useState(null);

  // Form state for template creation/editing
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: 'custom',
    tags: [],
    structure: null
  });

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      
      const response = await templateService.getTemplates(params);
      setTemplates(response.templates || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await templateService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadTemplates();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory]);

  const handleCreateTemplate = () => {
    navigate('/templates/new');
  };

  const handleEditTemplate = (template) => {
    navigate(`/templates/edit/${template._id}`);
  };

  const handleSaveTemplate = async (structure) => {
    try {
      if (!templateForm.name.trim()) {
        toast.error('Please enter a template name');
        return;
      }

      const templateData = {
        ...templateForm,
        structure
      };

      if (editingTemplate) {
        await templateService.updateTemplate(editingTemplate._id, templateData);
        toast.success('Template updated successfully');
      } else {
        await templateService.createTemplate(templateData);
        toast.success('Template created successfully');
      }

      setShowEditor(false);
      setEditingTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const handlePreviewTemplate = (structure) => {
    setPreviewTemplate(structure);
  };

  const handleDuplicateTemplate = async (template) => {
    try {
      await templateService.duplicateTemplate(template._id);
      toast.success('Template duplicated successfully');
      loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  const handleDeleteTemplate = async (template) => {
    if (!window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return;
    }

    try {
      await templateService.deleteTemplate(template._id);
      toast.success('Template deleted successfully');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleUseTemplate = async (template) => {
    try {
      await templateService.useTemplate(template._id);
      // You could redirect to campaign creation with this template
      toast.success('Template ready to use');
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to use template');
    }
  };

  const handlePreview = (template) => {
    navigate(`/templates/preview/${template._id}`);
  };

  const handleExport = async (template) => {
    try {
      const response = await templateService.exportTemplate(template._id);
      
      // Create and download JSON file
      const dataStr = JSON.stringify(response.template, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Template exported successfully');
    } catch (error) {
      console.error('Error exporting template:', error);
      toast.error('Failed to export template');
    }
  };

  const handleShare = (template) => {
    setSharingTemplate(template);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const templateData = JSON.parse(e.target.result);
        
        // Validate template structure
        if (!templateData.name || !templateData.structure) {
          toast.error('Invalid template file format');
          return;
        }

        // Import the template
        await templateService.importTemplate(templateData);
        toast.success('Template imported successfully');
        loadTemplates();
      } catch (error) {
        console.error('Error importing template:', error);
        toast.error('Failed to import template');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const renderTemplateCard = (template) => (
    <div key={template._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Template Preview */}
      <div className="aspect-video bg-gray-100 relative group">
        {template.thumbnail ? (
          <img 
            src={template.thumbnail} 
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Eye className="h-8 w-8" />
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
          <button
            onClick={() => handleUseTemplate(template)}
            className="px-3 py-1 bg-primary-red text-white rounded text-sm hover:bg-red-600"
          >
            Use Template
          </button>
          <button
            onClick={() => handlePreview(template)}
            className="px-3 py-1 bg-white text-gray-700 rounded text-sm hover:bg-gray-100"
          >
            Preview
          </button>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-900 truncate">{template.name}</h3>
          <div className="flex items-center space-x-1 ml-2">
            {template.isPopular && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
            <span className="text-xs text-gray-500">{template.stats?.timesUsed || 0}</span>
          </div>
        </div>
        
        {template.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {categories.find(cat => cat.value === template.category)?.label || template.category}
            </span>
            {template.type === 'system' && (
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                System
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePreview(template)}
              className="p-1 text-gray-600 hover:text-gray-800"
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleEditTemplate(template)}
              className="p-1 text-gray-600 hover:text-gray-800"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDuplicateTemplate(template)}
              className="p-1 text-gray-600 hover:text-gray-800"
              title="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleExport(template)}
              className="p-1 text-gray-600 hover:text-gray-800"
              title="Export"
            >
              <Download className="h-4 w-4" />
            </button>
            {template.type === 'user' && (
              <button
                onClick={() => handleShare(template)}
                className="p-1 text-gray-600 hover:text-gray-800"
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
            )}
            {template.type === 'user' && (
              <button
                onClick={() => handleDeleteTemplate(template)}
                className="p-1 text-red-600 hover:text-red-800"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTemplateList = (template) => (
    <div key={template._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="font-medium text-gray-900">{template.name}</h3>
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {categories.find(cat => cat.value === template.category)?.label || template.category}
            </span>
            {template.type === 'system' && (
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                System
              </span>
            )}
            {template.isPopular && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
          </div>
          {template.description && (
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
          )}
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>Used {template.stats?.timesUsed || 0} times</span>
            <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleUseTemplate(template)}
            className="px-3 py-1 bg-primary-red text-white rounded text-sm hover:bg-red-600"
          >
            Use
          </button>
          <button
            onClick={() => handlePreview(template)}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
          >
            Preview
          </button>
          <button
            onClick={() => handleEditTemplate(template)}
            className="p-2 text-gray-600 hover:text-gray-800"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDuplicateTemplate(template)}
            className="p-2 text-gray-600 hover:text-gray-800"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          {template.type === 'user' && (
            <button
              onClick={() => handleDeleteTemplate(template)}
              className="p-2 text-red-600 hover:text-red-800"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (showEditor) {
    return (
      <div className="h-screen flex flex-col">
        {/* Editor Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                placeholder="Template name..."
                className="w-full text-lg font-medium border-none outline-none"
              />
              <input
                type="text"
                value={templateForm.description}
                onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                placeholder="Template description..."
                className="w-full text-sm text-gray-600 border-none outline-none mt-1"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={templateForm.category}
                onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setShowEditor(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Email Editor */}
        <div className="flex-1">
          <EmailEditor
            initialStructure={templateForm.structure}
            onSave={handleSaveTemplate}
            onPreview={handlePreviewTemplate}
          />
        </div>

        {/* Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-medium">Template Preview</h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Preview</title>
                    </head>
                    <body style="margin: 0; padding: 20px; background-color: ${previewTemplate.settings?.backgroundColor || '#f4f4f4'};">
                      <!-- Preview content would be generated here -->
                      <div style="max-width: ${previewTemplate.settings?.contentWidth || 600}px; margin: 0 auto; background-color: #ffffff;">
                        <p style="padding: 20px; text-align: center; color: #666;">Template preview will be rendered here</p>
                      </div>
                    </body>
                    </html>
                  `}
                  className="w-full h-96 border border-gray-200 rounded"
                  title="Template Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600">Create and manage your email templates</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            id="template-import"
          />
          <label
            htmlFor="template-import"
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 rotate-180" />
            <span>Import</span>
          </label>
          <button
            onClick={handleCreateTemplate}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-primary-red text-primary-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-primary-red text-primary-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' ? (
        <TemplateAnalytics />
      ) : (
        <>
          {/* Filters */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-red text-white' : 'text-gray-600 hover:text-gray-800'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-red text-white' : 'text-gray-600 hover:text-gray-800'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Templates */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="h-12 w-12 mx-auto mb-4 text-gray-300">
            <Eye className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first email template to get started'
            }
          </p>
          <button
            onClick={handleCreateTemplate}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Template</span>
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {templates.map(template => 
            viewMode === 'grid' 
              ? renderTemplateCard(template)
              : renderTemplateList(template)
          )}
        </div>
      )}
        </>
      )}

      {/* Template Sharing Modal */}
      <TemplateSharing
        template={sharingTemplate}
        isOpen={!!sharingTemplate}
        onClose={() => setSharingTemplate(null)}
        onUpdate={loadTemplates}
      />
    </div>
  );
};

export default TemplateManagement;