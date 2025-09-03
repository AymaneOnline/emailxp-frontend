// Test page for template preview functionality
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mockTemplateService from '../services/mockTemplateService';

const TestTemplatePreview = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadMockTemplates = async () => {
    setLoading(true);
    try {
      const response = await mockTemplateService.getTemplates();
      setTemplates(response.templates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const testPreview = (templateId) => {
    console.log('Testing preview for template:', templateId);
    navigate(`/templates/preview/${templateId}`);
  };

  const testEdit = (templateId) => {
    console.log('Testing edit for template:', templateId);
    navigate(`/templates/edit/${templateId}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Template Preview Test</h1>
      
      <div className="mb-6">
        <button
          onClick={loadMockTemplates}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load Mock Templates'}
        </button>
      </div>

      <div className="grid gap-4">
        {templates.map(template => (
          <div key={template._id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{template.name}</h3>
                <p className="text-gray-600 text-sm">{template.description}</p>
                <p className="text-xs text-gray-500">ID: {template._id}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => testPreview(template._id)}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Test Preview
                </button>
                <button
                  onClick={() => testEdit(template._id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Test Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && !loading && (
        <p className="text-gray-500 text-center py-8">
          Click "Load Mock Templates" to see test templates
        </p>
      )}
    </div>
  );
};

export default TestTemplatePreview;