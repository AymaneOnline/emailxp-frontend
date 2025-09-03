// emailxp/frontend/src/pages/EnhancedCampaignWizard.js

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EnhancedCampaignBuilder from '../components/EnhancedCampaignBuilder';

const EnhancedCampaignWizard = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleSave = (campaign) => {
    // Navigate back to campaigns list
    navigate('/campaigns');
  };

  const handleCancel = () => {
    // Navigate back to campaigns list
    navigate('/campaigns');
  };

  return (
    <EnhancedCampaignBuilder
      campaignId={id}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};

export default EnhancedCampaignWizard;