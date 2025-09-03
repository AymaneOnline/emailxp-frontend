// emailxp/frontend/src/pages/TemplateEditor.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdvancedTemplateEditor from '../components/AdvancedTemplateEditor';
import templateService from '../services/templateService';

const TemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSave = (template) => {
    toast.success(id ? 'Template updated successfully!' : 'Template created successfully!');
    navigate('/templates');
  };

  const handleCancel = () => {
    navigate('/templates');
  };

  return (
    <div className="h-screen">
      <AdvancedTemplateEditor
        templateId={id}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default TemplateEditor;