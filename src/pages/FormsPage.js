// emailxp/frontend/src/pages/FormsPage.js

import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/ui/PageHeader';
import { H2, H3, Body, Small } from '../components/ui/Typography';
import { Plus, Edit, Eye, Trash2, BarChart, Link, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import formService from '../services/formService';

const FormsPage = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const data = await formService.getForms();
      setForms(data.forms || []);
    } catch (err) {
      console.error('Error loading forms:', err);
      // If it's a 404 or 401 error, it might be because there are no forms yet or user is not authenticated
      // In either case, we should show an empty state rather than an error
      if (err.response && (err.response.status === 404 || err.response.status === 401)) {
        setForms([]);
      } else {
        setError('Failed to load forms');
        toast.error('Failed to load forms');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = () => {
    navigate('/forms/new');
  };

  const handleEditForm = (formId) => {
    navigate(`/forms/edit/${formId}`);
  };

  const handleViewForm = (form) => {
    // In a real implementation, this would open the form in a new tab
    // For now, we'll just show a toast with the form URL
    toast.info(`Form URL: ${window.location.origin}/forms/${form._id}`);
  };

  const handleViewSubmissions = (formId) => {
    navigate(`/forms/${formId}/submissions`);
  };

  const handleDeleteForm = async (formId) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await formService.deleteForm(formId);
        toast.success('Form deleted successfully');
        loadForms(); // Refresh the list
      } catch (err) {
        console.error('Error deleting form:', err);
        toast.error('Failed to delete form');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <PageContainer>
    <div className="space-y-6">
      <PageHeader
        title="Forms"
        description="Create and manage web forms to collect subscriber information"
        actions={<button onClick={handleCreateForm} className="inline-flex items-center px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700 transition-colors"><Plus className="w-4 h-4 mr-2" />Create New Form</button>}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Forms List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <H2 className="mb-0">Your Forms</H2>
        </div>
        <div className="divide-y divide-gray-200">
          {forms.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <H3 className="mb-1">No forms yet</H3>
              <Body className="text-gray-500 mb-6">Get started by creating your first form to collect subscriber information.</Body>
              <button
                onClick={handleCreateForm}
                className="inline-flex items-center px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Form
              </button>
            </div>
          ) : (
            forms.map((form) => (
              <div key={form._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-red bg-opacity-10 rounded-lg flex items-center justify-center">
                      <BarChart className="w-5 h-5 text-primary-red" />
                    </div>
                    <div>
                      <H3 className="mb-0">{form.name}</H3>
                      <div className="flex items-center space-x-4 mt-1 text-gray-500">
                        <div className="flex items-center">
                          <Link className="w-4 h-4 mr-1" />
                          <Small className="text-gray-500 mb-0">{form.fields?.length || 0} fields</Small>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <Small className="text-gray-500 mb-0">Created {new Date(form.createdAt).toLocaleDateString()}</Small>
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          <Small className="text-gray-500 mb-0">{form.submissionCount || 0} submissions</Small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewForm(form)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                      title="View form"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleViewSubmissions(form._id)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                      title="View submissions"
                    >
                      <BarChart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditForm(form._id)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                      title="Edit form"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteForm(form._id)}
                      className="p-2 text-gray-500 hover:text-red-600"
                      title="Delete form"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </PageContainer>
  );
};

export default FormsPage;