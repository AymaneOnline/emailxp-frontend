// emailxp/frontend/src/pages/SegmentManagement.js

import React, { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import AdvancedSegmentation from '../components/AdvancedSegmentation';
import SegmentBuilder from '../components/SegmentBuilder';
import { toast } from 'react-toastify';

const SegmentManagement = () => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingSegment, setEditingSegment] = useState(null);

  const handleCreateSegment = () => {
    setEditingSegment(null);
    setShowBuilder(true);
  };

  const handleSaveSegment = () => {
    setShowBuilder(false);
    setEditingSegment(null);
    // In a real implementation, we would refresh the segments list
    toast.success('Segment saved successfully');
  };

  const handleCancelBuilder = () => {
    setShowBuilder(false);
    setEditingSegment(null);
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Segments</h1>
          <p className="text-gray-600">Create and manage subscriber segments</p>
        </div>
        <button
          onClick={handleCreateSegment}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-600"
        >
          <Plus className="h-4 w-4" />
          <span>Create Segment</span>
        </button>
      </div>

      {showBuilder ? (
        <div className="p-4">
          <SegmentBuilder
            segment={editingSegment}
            onSave={handleSaveSegment}
            onCancel={handleCancelBuilder}
            showPreview={true}
          />
        </div>
      ) : (
        <AdvancedSegmentation />
      )}
    </div>
  );
};

export default SegmentManagement;