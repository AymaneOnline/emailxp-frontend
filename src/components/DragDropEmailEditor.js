// emailxp/frontend/src/components/DragDropEmailEditor.js

import React, { useState, useCallback } from 'react';
import { 
  Type, 
  Image, 
  Link, 
  Minus, 
  Eye, 
  Code, 
  Trash2, 
  GripVertical,
  Plus
} from 'lucide-react';

// Block types
const BLOCK_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  BUTTON: 'button',
  DIVIDER: 'divider',
  SPACER: 'spacer'
};

// Default blocks
const createBlock = (type, content = {}) => ({
  id: Date.now() + Math.random(),
  type,
  content: {
    ...getDefaultContent(type),
    ...content
  }
});

const getDefaultContent = (type) => {
  switch (type) {
    case BLOCK_TYPES.TEXT:
      return {
        text: 'Enter your text here...',
        fontSize: '16',
        color: '#333333',
        align: 'left',
        bold: false,
        italic: false
      };
    case BLOCK_TYPES.IMAGE:
      return {
        src: '',
        alt: 'Image',
        width: '100%',
        align: 'center',
        link: ''
      };
    case BLOCK_TYPES.BUTTON:
      return {
        text: 'Click Here',
        link: '#',
        backgroundColor: '#007bff',
        textColor: '#ffffff',
        borderRadius: '4',
        padding: '12 24',
        align: 'center'
      };
    case BLOCK_TYPES.DIVIDER:
      return {
        color: '#cccccc',
        thickness: '1',
        style: 'solid'
      };
    case BLOCK_TYPES.SPACER:
      return {
        height: '20'
      };
    default:
      return {};
  }
};

const DragDropEmailEditor = ({ value, onChange, className = '' }) => {
  const [blocks, setBlocks] = useState(() => {
    if (value && typeof value === 'string' && value.trim()) {
      // Try to parse existing HTML content into blocks (basic implementation)
      return [createBlock(BLOCK_TYPES.TEXT, { text: value })];
    }
    return [createBlock(BLOCK_TYPES.TEXT)];
  });
  
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Update parent component when blocks change
  const updateBlocks = useCallback((newBlocks) => {
    setBlocks(newBlocks);
    // Convert blocks to HTML
    const html = blocksToHtml(newBlocks);
    onChange(html);
  }, [onChange]);

  const addBlock = (type) => {
    const newBlock = createBlock(type);
    const newBlocks = [...blocks, newBlock];
    updateBlocks(newBlocks);
    setSelectedBlock(newBlock.id);
  };

  const updateBlock = (blockId, updates) => {
    const newBlocks = blocks.map(block =>
      block.id === blockId
        ? { ...block, content: { ...block.content, ...updates } }
        : block
    );
    updateBlocks(newBlocks);
  };

  const deleteBlock = (blockId) => {
    const newBlocks = blocks.filter(block => block.id !== blockId);
    updateBlocks(newBlocks);
    setSelectedBlock(null);
  };

  const moveBlock = (fromIndex, toIndex) => {
    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    updateBlocks(newBlocks);
  };

  // Convert blocks to HTML
  const blocksToHtml = (blocks) => {
    return blocks.map(block => blockToHtml(block)).join('\n');
  };

  const blockToHtml = (block) => {
    const { type, content } = block;
    
    switch (type) {
      case BLOCK_TYPES.TEXT:
        const textStyle = `
          font-size: ${content.fontSize}px;
          color: ${content.color};
          text-align: ${content.align};
          ${content.bold ? 'font-weight: bold;' : ''}
          ${content.italic ? 'font-style: italic;' : ''}
        `.trim();
        return `<p style="${textStyle}">${content.text}</p>`;
        
      case BLOCK_TYPES.IMAGE:
        const imgStyle = `width: ${content.width}; text-align: ${content.align};`;
        const img = `<img src="${content.src}" alt="${content.alt}" style="max-width: 100%; height: auto;" />`;
        return content.link 
          ? `<div style="${imgStyle}"><a href="${content.link}">${img}</a></div>`
          : `<div style="${imgStyle}">${img}</div>`;
          
      case BLOCK_TYPES.BUTTON:
        const btnStyle = `
          display: inline-block;
          background-color: ${content.backgroundColor};
          color: ${content.textColor};
          padding: ${content.padding.replace(' ', 'px ')}px;
          border-radius: ${content.borderRadius}px;
          text-decoration: none;
          text-align: center;
        `.trim();
        return `<div style="text-align: ${content.align};"><a href="${content.link}" style="${btnStyle}">${content.text}</a></div>`;
        
      case BLOCK_TYPES.DIVIDER:
        return `<hr style="border: none; border-top: ${content.thickness}px ${content.style} ${content.color}; margin: 20px 0;" />`;
        
      case BLOCK_TYPES.SPACER:
        return `<div style="height: ${content.height}px;"></div>`;
        
      default:
        return '';
    }
  };

  const renderBlockEditor = (block) => {
    const { type, content } = block;
    
    switch (type) {
      case BLOCK_TYPES.TEXT:
        return (
          <div className="space-y-3">
            <textarea
              value={content.text}
              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
              className="w-full p-2 border rounded resize-none"
              rows="3"
              placeholder="Enter your text..."
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Font Size</label>
                <input
                  type="number"
                  value={content.fontSize}
                  onChange={(e) => updateBlock(block.id, { fontSize: e.target.value })}
                  className="w-full p-1 border rounded text-sm"
                  min="8"
                  max="72"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  value={content.color}
                  onChange={(e) => updateBlock(block.id, { color: e.target.value })}
                  className="w-full h-8 border rounded"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={content.align}
                onChange={(e) => updateBlock(block.id, { align: e.target.value })}
                className="p-1 border rounded text-sm"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={content.bold}
                  onChange={(e) => updateBlock(block.id, { bold: e.target.checked })}
                  className="mr-1"
                />
                <span className="text-sm">Bold</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={content.italic}
                  onChange={(e) => updateBlock(block.id, { italic: e.target.checked })}
                  className="mr-1"
                />
                <span className="text-sm">Italic</span>
              </label>
            </div>
          </div>
        );
        
      case BLOCK_TYPES.IMAGE:
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={content.src}
                onChange={(e) => updateBlock(block.id, { src: e.target.value })}
                className="w-full p-2 border rounded text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={content.alt}
                  onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alignment</label>
                <select
                  value={content.align}
                  onChange={(e) => updateBlock(block.id, { align: e.target.value })}
                  className="w-full p-1 border rounded text-sm"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Link (optional)</label>
              <input
                type="url"
                value={content.link}
                onChange={(e) => updateBlock(block.id, { link: e.target.value })}
                className="w-full p-1 border rounded text-sm"
                placeholder="https://example.com"
              />
            </div>
          </div>
        );
        
      case BLOCK_TYPES.BUTTON:
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={content.text}
                  onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Link</label>
                <input
                  type="url"
                  value={content.link}
                  onChange={(e) => updateBlock(block.id, { link: e.target.value })}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Background</label>
                <input
                  type="color"
                  value={content.backgroundColor}
                  onChange={(e) => updateBlock(block.id, { backgroundColor: e.target.value })}
                  className="w-full h-8 border rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Text Color</label>
                <input
                  type="color"
                  value={content.textColor}
                  onChange={(e) => updateBlock(block.id, { textColor: e.target.value })}
                  className="w-full h-8 border rounded"
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return <div className="text-gray-500 text-sm">No options available</div>;
    }
  };

  const renderBlockPreview = (block) => {
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: blockToHtml(block) }}
        className="min-h-[40px] p-2"
      />
    );
  };

  if (previewMode) {
    return (
      <div className={`border border-gray-300 rounded-lg ${className}`}>
        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
          <h3 className="font-medium">Email Preview</h3>
          <button
            onClick={() => setPreviewMode(false)}
            className="flex items-center space-x-1 px-3 py-1 bg-primary-red text-white rounded text-sm hover:bg-red-600"
          >
            <Code className="h-4 w-4" />
            <span>Edit</span>
          </button>
        </div>
        <div className="p-4 bg-white">
          <div dangerouslySetInnerHTML={{ __html: blocksToHtml(blocks) }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium">Email Editor</h3>
          <div className="flex items-center space-x-1">
            {[
              { type: BLOCK_TYPES.TEXT, icon: Type, label: 'Text' },
              { type: BLOCK_TYPES.IMAGE, icon: Image, label: 'Image' },
              { type: BLOCK_TYPES.BUTTON, icon: Link, label: 'Button' },
              { type: BLOCK_TYPES.DIVIDER, icon: Minus, label: 'Divider' }
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="flex items-center space-x-1 px-2 py-1 bg-white border rounded text-sm hover:bg-gray-50"
                title={`Add ${label}`}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setPreviewMode(true)}
          className="flex items-center space-x-1 px-3 py-1 bg-primary-red text-white rounded text-sm hover:bg-red-600"
        >
          <Eye className="h-4 w-4" />
          <span>Preview</span>
        </button>
      </div>

      <div className="flex">
        {/* Blocks List */}
        <div className="flex-1 p-4 space-y-3">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className={`border rounded-lg ${
                selectedBlock === block.id ? 'border-primary-red bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between p-2 bg-gray-50 border-b">
                <div className="flex items-center space-x-2">
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                  <span className="text-sm font-medium capitalize">{block.type}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setSelectedBlock(selectedBlock === block.id ? null : block.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Plus className={`h-3 w-3 transition-transform ${selectedBlock === block.id ? 'rotate-45' : ''}`} />
                  </button>
                  <button
                    onClick={() => deleteBlock(block.id)}
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              {selectedBlock === block.id ? (
                <div className="p-3 border-b">
                  {renderBlockEditor(block)}
                </div>
              ) : null}
              
              <div className="p-2">
                {renderBlockPreview(block)}
              </div>
            </div>
          ))}
          
          {blocks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Type className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No content blocks yet</p>
              <p className="text-sm">Add a block to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DragDropEmailEditor;