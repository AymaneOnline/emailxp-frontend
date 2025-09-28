import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PageContainer from '../components/layout/PageContainer';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Trash2, Edit } from 'lucide-react';
import { H1, Body } from '../components/ui/Typography';
import templateService from '../services/templateService';

// Minimal clean version after corruption cleanup.
const TemplateManagement = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await templateService.getTemplates();
      // Expecting array or { templates: [] }
      const list = Array.isArray(res) ? res : (res?.templates || []);
      setTemplates(list || []);
    } catch (err) {
      console.error('Failed to load templates', err);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTemplates(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      await templateService.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t._id !== id && t.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      toast?.error?.('Failed to delete template');
    }
  };

  return (
    <PageContainer>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <H1 className="mb-0 text-2xl">Templates</H1>
          <button
            onClick={() => navigate('/templates/new')}
            className='flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
          >
            <Plus className='h-4 w-4' />
            <span>Create Template</span>
          </button>
        </div>

        {loading && <Body className='text-gray-600'>Loading templates…</Body>}
        {error && <Body className='text-red-600'>{error}</Body>}

        {!loading && templates.length === 0 && (
          <Body className='text-gray-600'>No templates found. Create a new template to get started.</Body>
        )}

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {templates.map(t => (
            <div
              key={t._id || t.id}
              className='relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition transform hover:-translate-y-1'
            >
              <div className='h-40 bg-gray-50 flex items-center justify-center overflow-hidden'>
                {t.thumbnail ? (
                  // Thumbnail image
                  <img src={t.thumbnail} alt={`${t.name} thumbnail`} className='w-full h-full object-cover' />
                ) : (
                  <div className='flex flex-col items-center justify-center text-gray-400'>
                    <div className='w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mb-2'>
                      <svg className='w-6 h-6' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5'><path d='M3 7h18M3 12h18M3 17h18' strokeLinecap='round' strokeLinejoin='round'/></svg>
                    </div>
                    <div className='text-sm'>No preview</div>
                  </div>
                )}
              </div>

              <div className='p-4 space-y-2'>
                <div className='flex items-start justify-between'>
                  <div className='min-w-0'>
                    <div className='text-base font-semibold text-gray-900 truncate'>{t.name}</div>
                    <div className='text-sm text-gray-500 truncate'>{t.subject || 'No subject'}</div>
                  </div>
                  <div className='text-sm text-gray-400 ml-3'>{t.stats?.timesUsed ?? 0} uses</div>
                </div>

                {t.tags && t.tags.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {t.tags.slice(0,4).map(tag => (
                      <span key={tag} className='text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full'>{tag}</span>
                    ))}
                  </div>
                )}

                <p className='text-sm text-gray-600 mt-2 line-clamp-2'>{t.description}</p>
              </div>

              <div className='px-3 pb-4 flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() => navigate(`/templates/preview/${t._id || t.id}`)}
                    className='inline-flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50'
                    aria-label='Preview template'
                  >
                    <Eye className='w-4 h-4' />
                    <span>Preview</span>
                  </button>
                </div>

                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() => navigate(`/templates/edit/${t._id || t.id}`)}
                    className='inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700'
                    aria-label='Edit template'
                  >
                    <Edit className='w-4 h-4 mr-2' />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t._id || t.id)}
                    className='inline-flex items-center px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-md text-sm hover:bg-red-100'
                    aria-label='Delete template'
                  >
                    <Trash2 className='w-4 h-4 mr-2' />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};

export default TemplateManagement;
