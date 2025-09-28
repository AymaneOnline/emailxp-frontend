// emailxp/frontend/src/pages/AutomationBuilderPage.js

import React, { useRef } from 'react';
import devLog from '../utils/devLog';
import { useNavigate, useParams } from 'react-router-dom';
import AutomationBuilder from '../components/AutomationBuilder';
import PageContainer from '../components/layout/PageContainer';
import { ArrowLeft, Save } from 'lucide-react';

const AutomationBuilderPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const automationId = id || null;
  const builderRef = useRef(null);

  const handleSave = async (automationData) => {
  devLog('Saving automation:', automationData);
    // The VisualAutomationBuilder component already handles the API call
    // We just need to navigate back to the automation list
    navigate('/automation');
  };

  const handleCancel = () => {
    navigate('/automation');
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{automationId ? 'Edit Automation' : 'Create Automation'}</h1>
            <p className="mt-1 text-sm text-gray-500">Create and configure your automation workflow.</p>
          </div>
          <div className="flex items-center">
            <button onClick={() => navigate('/automation')} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
          </div>
        </div>

        <AutomationBuilder
          ref={builderRef}
          automationId={automationId}
          onSave={handleSave}
          onCancel={handleCancel}
          fullScreen={true}
        />
        {/* Save button in the page flow (not sticky) */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => builderRef.current && builderRef.current.save && builderRef.current.save()}
            className="inline-flex items-center px-4 py-3 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow"
            aria-label="Save Automation"
            title="Save Automation"
          >
            <Save className="w-4 h-4 mr-2" /> Save
          </button>
        </div>
      </div>
    </PageContainer>
  );
};

export default AutomationBuilderPage;