// emailxp/frontend/src/pages/FormSubmissions.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import formService from '../services/formService';

const FormSubmissions = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFormAndSubmissions();
  }, [id]);

  const loadFormAndSubmissions = async () => {
    try {
      setLoading(true);
      
      // Load form details
      const formData = await formService.getFormById(id);
      setForm(formData);
      
      // Load submissions
      const submissionsData = await formService.getFormSubmissions(id);
      setSubmissions(submissionsData.submissions || []);
    } catch (err) {
      console.error('Error loading form submissions:', err);
      setError('Failed to load form submissions');
      toast.error('Failed to load form submissions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Forms
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {form?.name || 'Form Submissions'}
            </h1>
            <p className="text-gray-600 mt-1">
              {submissions.length} submission(s)
            </p>
          </div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No submissions yet</h3>
          <p className="text-gray-500">
            This form hasn't received any submissions yet.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Submissions
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Submitted
                  </th>
                  {form?.fields?.map((field) => (
                    <th key={field.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {submissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(submission.submittedAt)}
                      </div>
                    </td>
                    {form?.fields?.map((field) => (
                      <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {submission.data[field.id] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormSubmissions;