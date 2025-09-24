import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/ui/PageHeader';

export default function FileManagement(){
  return (
    <PageContainer>
    <div className="space-y-6" aria-label="file-management-root">
      <PageHeader
        title="File Management"
        description="Upload, browse and manage assets used across campaigns, templates and automations."
      />
      <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center bg-white">
        <p className="text-gray-500">Placeholder: Implement file listing & uploader (Cloudinary / S3 integration) here.</p>
      </div>
    </div>
    </PageContainer>
  );
}
