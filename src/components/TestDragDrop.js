// Test component for drag & drop functionality
import React, { useState } from 'react';
import EnhancedDragDropEditor from './EnhancedDragDropEditor';

const TestDragDrop = () => {
  const [blocks, setBlocks] = useState([]);

  const handleBlocksChange = (newBlocks) => {
    console.log('Blocks changed:', newBlocks);
    setBlocks(newBlocks);
  };

  const handlePreview = (previewBlocks) => {
    console.log('Preview blocks:', previewBlocks);
  };

  return (
    <div className="h-screen">
      <h1 className="text-2xl font-bold p-4">Drag & Drop Editor Test</h1>
      <EnhancedDragDropEditor
        initialBlocks={blocks}
        onBlocksChange={handleBlocksChange}
        onPreview={handlePreview}
      />
    </div>
  );
};

export default TestDragDrop;