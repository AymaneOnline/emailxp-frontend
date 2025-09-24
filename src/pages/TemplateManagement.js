import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { H1, Body } from '../components/ui/Typography';
import unlayerTemplateService from '../services/unlayerTemplateService';
import TemplateCard from '../components/templates/TemplateCard';

const TemplateManagement = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { value: 'welcome', label: 'Welcome' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'promotional', label: 'Promotional' },
    { value: 'transactional', label: 'Transactional' },
    { value: 'educational', label: 'Educational' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, [searchTerm, selectedCategory]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;

      const result = await unlayerTemplateService.getTemplates(params);
      setTemplates(result.templates || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (template) => {
    // Navigate to preview page or open modal
    navigate(`/templates/preview/${template.id}`);
  };

  const handleUseTemplate = (template) => {
    // Navigate to campaign creation with template selected
    navigate('/campaigns/new', { state: { selectedTemplate: template } });
  };

  return (
    <PageContainer>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <H1 className="mb-0 text-2xl">Email Templates</H1>
          <button
            onClick={() => navigate('/templates/new')}
            className='flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
          >
            <Plus className='h-4 w-4' />
            <span>Create Template</span>
          </button>
        </div>

        <Body className='text-gray-600'>
          Choose from our collection of professionally designed email templates or create your own.
        </Body>

        {/* Search and Filter */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
            <input
              type='text'
              placeholder='Search templates...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500'
            />
          </div>
          <div className='relative'>
            <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none bg-white'
            >
              <option value=''>All Categories</option>
              <option value='welcome'>Welcome</option>
              <option value='newsletter'>Newsletter</option>
              <option value='promotional'>Promotional</option>
              <option value='transactional'>Transactional</option>
              <option value='educational'>Educational</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Loading templates...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className='text-center py-12'>
            <div className='text-red-600 mb-4'>
              <svg className='h-12 w-12 mx-auto' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' />
              </svg>
            </div>
            <p className='text-red-600 font-medium'>{error}</p>
            <button
              onClick={fetchTemplates}
              className='mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
            >
              Try Again
            </button>
          </div>
        )}

        {/* Templates Grid */}
        {!loading && !error && (
          <>
            {templates.length === 0 ? (
              <div className='text-center py-12'>
                <div className='text-gray-400 mb-4'>
                  <svg className='h-12 w-12 mx-auto' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                </div>
                <p className='text-gray-600'>No templates found.</p>
                {searchTerm && (
                  <p className='text-sm text-gray-500 mt-2'>
                    Try adjusting your search terms or filters.
                  </p>
                )}
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    categories={categories}
                    onPreview={handlePreview}
                    onUse={handleUseTemplate}
                    unlayerTemplateService={unlayerTemplateService}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
};

export default TemplateManagement;
