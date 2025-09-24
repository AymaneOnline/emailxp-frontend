// emailxp/frontend/src/pages/AutomationBuilderPage.js

import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import VisualAutomationBuilder from '../components/VisualAutomationBuilder';

const AutomationBuilderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const automationId = searchParams.get('id');

  const handleSave = async (automationData) => {
    console.log('Saving automation:', automationData);
    // The VisualAutomationBuilder component already handles the API call
    // We just need to navigate back to the automation list
    navigate('/automation');
  };

  const handleCancel = () => {
    navigate('/automation');
  };

  return (
    <div className="py-6">
      <VisualAutomationBuilder 
        automationId={automationId}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default AutomationBuilderPage;