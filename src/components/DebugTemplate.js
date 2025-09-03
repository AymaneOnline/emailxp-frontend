// Debug component to test template functionality
import React, { useState, useEffect } from 'react';
import templateService from '../services/templateService';
import mockTemplateService from '../services/mockTemplateService';

const DebugTemplate = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMock, setUseMock] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading templates...', useMock ? 'using mock' : 'using real service');
      const service = useMock ? mockTemplateService : templateService;
      const response = await service.getTemplates();
      console.log('Templates response:', response);
      setTemplates(response.templates || []);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testTemplateById = async (id) => {
    try {
      console.log('Testing template by ID:', id);
      const service = useMock ? mockTemplateService : templateService;
      const template = await service.getTemplateById(id);
      console.log('Template by ID response:', template);
    } catch (err) {
      console.error('Error loading template by ID:', err);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [useMock]);

  if (loading) return <div className="p-4">Loading templates...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Template Debug</h1>
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useMock}
            onChange={(e) => setUseMock(e.target.checked)}
            className="rounded"
          />
          <span>Use Mock Data</span>
        </label>
      </div>
      <p className="mb-4">Found {templates.length} templates</p>
      
      <div className="space-y-2">
        {templates.map(template => (
          <div key={template._id} className="border p-3 rounded">
            <h3 className="font-semibold">{template.name}</h3>
            <p className="text-sm text-gray-600">ID: {template._id}</p>
            <p className="text-sm text-gray-600">Type: {template.type}</p>
            <button
              onClick={() => testTemplateById(template._id)}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Test Load by ID
            </button>
          </div>
        ))}
      </div>
      
      {templates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No templates found</p>
        </div>
      )}
    </div>
  );
};

export default DebugTemplate;