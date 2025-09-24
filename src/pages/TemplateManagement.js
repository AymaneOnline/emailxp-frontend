import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { H1, Body } from '../components/ui/Typography';

// Minimal clean version after corruption cleanup.
const TemplateManagement = () => {
  const navigate = useNavigate();
  return (
    <PageContainer>
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <H1 className="mb-0 text-2xl">Template Management</H1>
        <button
          onClick={() => navigate('/templates/new')}
          className='flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
        >
          <Plus className='h-4 w-4' />
          <span>Create Template</span>
        </button>
      </div>
      <Body className='text-gray-600'>Minimal reset version. Features will be reintroduced later.</Body>
    </div>
    </PageContainer>
  );
};

export default TemplateManagement;
