// emailxp/frontend/src/pages/CampaignManagement.js

import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import CampaignList from '../components/CampaignList';
const CampaignManagement = () => {

  return (
    <PageContainer>
    <div className="space-y-6">
      {/* Single campaigns view (A/B Tests handled inside campaign creation flow now). Page header rendered inside CampaignList. */}
      <CampaignList />
    </div>
    </PageContainer>
  );
};

export default CampaignManagement;
