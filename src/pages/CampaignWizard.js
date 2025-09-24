// emailxp/frontend/src/pages/CampaignWizard.js

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EnhancedCampaignBuilder from '../components/EnhancedCampaignBuilder';
import PageContainer from '../components/layout/PageContainer';
import { ArrowLeft } from 'lucide-react';

const CampaignWizard = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleSave = (campaign) => {
    navigate('/campaigns');
  };

  const handleCancel = () => {
    navigate('/campaigns');
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{id ? 'Edit Campaign' : 'Create Campaign'}</h1>
            <p className="mt-1 text-sm text-gray-500">Create and configure your campaign in steps.</p>
          </div>
          <div>
            <button onClick={() => navigate('/campaigns')} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
          </div>
        </div>

        <EnhancedCampaignBuilder
          campaignId={id}
          onSave={handleSave}
          onCancel={handleCancel}
          fullscreenModal={false}
          showBreadcrumbs={true}
        />
      </div>
    </PageContainer>
  );
};

export default CampaignWizard;