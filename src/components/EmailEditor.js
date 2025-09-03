// emailxp/frontend/src/components/EmailEditor.js

import React, { useState, useCallback, useRef } from 'react';
import { 
  Type, 
  Image, 
  Square, 
  Minus, 
  Space, 
  Eye, 
  Save, 
  Undo, 
  Redo,
  Settings,
  Trash2,
  Copy,
  Move,
  ChevronUp,
  ChevronDown,
  Heading2,
  Columns,
  Share2
} from 'lucide-react';

const EmailEditor = ({ 
  initialStructure = null, 
  onSave, 
  onPreview,
  className = '' 
}) => {
  const [structure, setStructure] = useState(initialStructure || {
    blocks: [],
    settings: {
      backgroundColor: '#f4f4f4',
      contentWidth: 600,
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      lineHeight: 1.5,
      textColor: '#333333'
    }
  });

  const [selectedBlock, setSelectedBlock] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const draggedItem = useRef(null);

  // Save state to history for undo/redo
  const saveToHistory = useCallback((newStructure) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newStructure)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Update structure and save to history
  const updateStructure = useCallback((newStructure) => {
    setStructure(newStructure);
    saveToHistory(newStructure);
  }, [saveToHistory]);

  // Undo/Redo functions
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setStructure(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setStructure(history[historyIndex + 1]);
    }
  };

  // Block templates
  const blockTemplates = {
    text: {
      type: 'text',
      content: '<p>Enter your text here...</p>',
      styles: 'padding: 15px 20px;'
    },
    heading: {
      type: 'text',
      content: '<h2 style="margin: 0; color: #333;">Your Heading Here</h2>',
      styles: 'padding: 20px 20px 10px;'
    },
    image: {
      type: 'image',
      src: 'https://via.placeholder.com/400x200',
      alt: 'Image',
      styles: 'text-align: center; padding: 10px 20px;'
    },
    button: {
      type: 'button',
      text: 'Click Here',
      href: '#',
      backgroundColor: '#007bff',
      textColor: '#ffffff',
      styles: 'text-align: center; padding: 20px;'
    },
    divider: {
      type: 'divider',
      color: '#e0e0e0',
      height: 1,
      styles: 'padding: 10px 20px;'
    },
    spacer: {
      type: 'spacer',
      height: 20
    },
    columns: {
      type: 'columns',
      columns: [
        {
          content: '<p>Column 1 content</p>',
          width: '50%'
        },
        {
          content: '<p>Column 2 content</p>',
          width: '50%'
        }
      ],
      styles: 'padding: 20px;'
    },
    social: {
      type: 'social',
      links: [
        { platform: 'facebook', url: 'https://facebook.com', icon: '📘' },
        { platform: 'twitter', url: 'https://twitter.com', icon: '🐦' },
        { platform: 'instagram', url: 'https://instagram.com', icon: '📷' }
      ],
      styles: 'text-align: center; padding: 20px;'
    }
  };

  // Add new block
  const addBlock = (type) => {
    const newBlock = { 
      ...blockTemplates[type], 
      id: Date.now().toString() 
    };
    const newStructure = {
      ...structure,
      blocks: [...structure.blocks, newBlock]
    };
    updateStructure(newStructure);
    setSelectedBlock(newBlock.id);
  };

  // Update block
  const updateBlock = (blockId, updates) => {
    const newStructure = {
      ...structure,
      blocks: structure.blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    };
    updateStructure(newStructure);
  };

  // Delete block
  const deleteBlock = (blockId) => {
    const newStructure = {
      ...structure,
      blocks: structure.blocks.filter(block => block.id !== blockId)
    };
    updateStructure(newStructure);
    setSelectedBlock(null);
  };

  // Duplicate block
  const duplicateBlock = (blockId) => {
    const blockToDuplicate = structure.blocks.find(block => block.id === blockId);
    if (blockToDuplicate) {
      const duplicatedBlock = {
        ...blockToDuplicate,
        id: Date.now().toString()
      };
      const blockIndex = structure.blocks.findIndex(block => block.id === blockId);
      const newBlocks = [...structure.blocks];
      newBlocks.splice(blockIndex + 1, 0, duplicatedBlock);
      
      const newStructure = {
        ...structure,
        blocks: newBlocks
      };
      updateStructure(newStructure);
    }
  };

  // Move block
  const moveBlock = (blockId, direction) => {
    const blockIndex = structure.blocks.findIndex(block => block.id === blockId);
    if (blockIndex === -1) return;

    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (newIndex < 0 || newIndex >= structure.blocks.length) return;

    const newBlocks = [...structure.blocks];
    [newBlocks[blockIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[blockIndex]];

    const newStructure = {
      ...structure,
      blocks: newBlocks
    };
    updateStructure(newStructure);
  };

  // Drag and drop handlers
  const handleDragStart = (e, blockId) => {
    draggedItem.current = blockId;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetBlockId) => {
    e.preventDefault();
    
    if (!draggedItem.current || draggedItem.current === targetBlockId) return;

    const draggedIndex = structure.blocks.findIndex(block => block.id === draggedItem.current);
    const targetIndex = structure.blocks.findIndex(block => block.id === targetBlockId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newBlocks = [...structure.blocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(targetIndex, 0, draggedBlock);

    const newStructure = {
      ...structure,
      blocks: newBlocks
    };
    updateStructure(newStructure);
    draggedItem.current = null;
  };

  // Render block editor
  const renderBlockEditor = (block) => {
    if (selectedBlock !== block.id) return null;

    switch (block.type) {
      case 'text':
        return (
          <div className="mt-2 p-3 bg-gray-50 rounded">
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              value={block.content.replace(/<[^>]*>/g, '')}
              onChange={(e) => updateBlock(block.id, { content: `<p>${e.target.value}</p>` })}
              className="w-full h-24 p-2 border border-gray-300 rounded text-sm"
              placeholder="Enter your text..."
            />
          </div>
        );

      case 'image':
        return (
          <div className="mt-2 p-3 bg-gray-50 rounded space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={block.src}
                onChange={(e) => updateBlock(block.id, { src: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
              <input
                type="text"
                value={block.alt}
                onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Image description"
              />
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="mt-2 p-3 bg-gray-50 rounded space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
              <input
                type="text"
                value={block.text}
                onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Click Here"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
              <input
                type="url"
                value={block.href}
                onChange={(e) => updateBlock(block.id, { href: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="https://example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
                <input
                  type="color"
                  value={block.backgroundColor}
                  onChange={(e) => updateBlock(block.id, { backgroundColor: e.target.value })}
                  className="w-full h-8 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                <input
                  type="color"
                  value={block.textColor}
                  onChange={(e) => updateBlock(block.id, { textColor: e.target.value })}
                  className="w-full h-8 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        );

      case 'divider':
        return (
          <div className="mt-2 p-3 bg-gray-50 rounded space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="color"
                value={block.color}
                onChange={(e) => updateBlock(block.id, { color: e.target.value })}
                className="w-full h-8 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
              <input
                type="number"
                value={block.height}
                onChange={(e) => updateBlock(block.id, { height: parseInt(e.target.value) || 1 })}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                min="1"
                max="10"
              />
            </div>
          </div>
        );

      case 'spacer':
        return (
          <div className="mt-2 p-3 bg-gray-50 rounded">
            <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
            <input
              type="number"
              value={block.height}
              onChange={(e) => updateBlock(block.id, { height: parseInt(e.target.value) || 20 })}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              min="10"
              max="100"
            />
          </div>
        );

      case 'columns':
        return (
          <div className="mt-2 p-3 bg-gray-50 rounded space-y-3">
            {block.columns?.map((column, index) => (
              <div key={index} className="border border-gray-200 rounded p-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Column {index + 1} Content
                </label>
                <textarea
                  value={column.content.replace(/<[^>]*>/g, '')}
                  onChange={(e) => {
                    const newColumns = [...block.columns];
                    newColumns[index] = { ...column, content: `<p>${e.target.value}</p>` };
                    updateBlock(block.id, { columns: newColumns });
                  }}
                  className="w-full h-20 p-2 border border-gray-300 rounded text-sm"
                  placeholder="Enter column content..."
                />
              </div>
            ))}
          </div>
        );

      case 'social':
        return (
          <div className="mt-2 p-3 bg-gray-50 rounded space-y-2">
            {block.links?.map((link, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={link.platform}
                  onChange={(e) => {
                    const newLinks = [...block.links];
                    newLinks[index] = { ...link, platform: e.target.value };
                    updateBlock(block.id, { links: newLinks });
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  placeholder="Platform"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...block.links];
                    newLinks[index] = { ...link, url: e.target.value };
                    updateBlock(block.id, { links: newLinks });
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  placeholder="URL"
                />
                <input
                  type="text"
                  value={link.icon}
                  onChange={(e) => {
                    const newLinks = [...block.links];
                    newLinks[index] = { ...link, icon: e.target.value };
                    updateBlock(block.id, { links: newLinks });
                  }}
                  className="w-16 p-2 border border-gray-300 rounded text-sm text-center"
                  placeholder="Icon"
                />
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`flex h-full ${className}`}>
      {/* Toolbar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="space-y-4">
          {/* Actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Actions</h3>
            <div className="flex space-x-2">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </button>
              <button
                onClick={() => onPreview && onPreview(structure)}
                className="p-2 text-gray-600 hover:text-gray-800"
                title="Preview"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => onSave && onSave(structure)}
                className="p-2 text-primary-red hover:text-red-600"
                title="Save"
              >
                <Save className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Block Library */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Add Blocks</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addBlock('text')}
                className="flex flex-col items-center p-3 border border-gray-200 rounded hover:border-primary-red hover:bg-red-50 transition-colors"
              >
                <Type className="h-5 w-5 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">Text</span>
              </button>
              <button
                onClick={() => addBlock('heading')}
                className="flex flex-col items-center p-3 border border-gray-200 rounded hover:border-primary-red hover:bg-red-50 transition-colors"
              >
                <Heading2 className="h-5 w-5 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">Heading</span>
              </button>
              <button
                onClick={() => addBlock('image')}
                className="flex flex-col items-center p-3 border border-gray-200 rounded hover:border-primary-red hover:bg-red-50 transition-colors"
              >
                <Image className="h-5 w-5 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">Image</span>
              </button>
              <button
                onClick={() => addBlock('button')}
                className="flex flex-col items-center p-3 border border-gray-200 rounded hover:border-primary-red hover:bg-red-50 transition-colors"
              >
                <Square className="h-5 w-5 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">Button</span>
              </button>
              <button
                onClick={() => addBlock('columns')}
                className="flex flex-col items-center p-3 border border-gray-200 rounded hover:border-primary-red hover:bg-red-50 transition-colors"
              >
                <Columns className="h-5 w-5 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">Columns</span>
              </button>
              <button
                onClick={() => addBlock('social')}
                className="flex flex-col items-center p-3 border border-gray-200 rounded hover:border-primary-red hover:bg-red-50 transition-colors"
              >
                <Share2 className="h-5 w-5 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">Social</span>
              </button>
              <button
                onClick={() => addBlock('divider')}
                className="flex flex-col items-center p-3 border border-gray-200 rounded hover:border-primary-red hover:bg-red-50 transition-colors"
              >
                <Minus className="h-5 w-5 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">Divider</span>
              </button>
              <button
                onClick={() => addBlock('spacer')}
                className="flex flex-col items-center p-3 border border-gray-200 rounded hover:border-primary-red hover:bg-red-50 transition-colors"
              >
                <Space className="h-5 w-5 text-gray-600 mb-1" />
                <span className="text-xs text-gray-600">Spacer</span>
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <Settings className="h-4 w-4" />
              <span>Email Settings</span>
            </button>
            
            {showSettings && (
              <div className="space-y-3 p-3 bg-gray-50 rounded">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Background Color</label>
                  <input
                    type="color"
                    value={structure.settings.backgroundColor}
                    onChange={(e) => updateStructure({
                      ...structure,
                      settings: { ...structure.settings, backgroundColor: e.target.value }
                    })}
                    className="w-full h-8 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Content Width</label>
                  <input
                    type="number"
                    value={structure.settings.contentWidth}
                    onChange={(e) => updateStructure({
                      ...structure,
                      settings: { ...structure.settings, contentWidth: parseInt(e.target.value) || 600 }
                    })}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    min="400"
                    max="800"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-gray-100 p-8 overflow-y-auto">
        <div 
          className="mx-auto bg-white shadow-lg"
          style={{ 
            maxWidth: `${structure.settings.contentWidth}px`,
            backgroundColor: structure.settings.backgroundColor 
          }}
        >
          {structure.blocks.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Type className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Start building your email</p>
              <p className="text-sm">Add blocks from the sidebar to get started</p>
            </div>
          ) : (
            structure.blocks.map((block, index) => (
              <div
                key={block.id}
                className={`relative group ${selectedBlock === block.id ? 'ring-2 ring-primary-red' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, block.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, block.id)}
                onClick={() => setSelectedBlock(selectedBlock === block.id ? null : block.id)}
              >
                {/* Block Controls */}
                {selectedBlock === block.id && (
                  <div className="absolute -top-8 left-0 flex space-x-1 bg-white border border-gray-200 rounded shadow-sm z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBlock(block.id, 'up');
                      }}
                      disabled={index === 0}
                      className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      title="Move Up"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBlock(block.id, 'down');
                      }}
                      disabled={index === structure.blocks.length - 1}
                      className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                      title="Move Down"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateBlock(block.id);
                      }}
                      className="p-1 text-gray-600 hover:text-gray-800"
                      title="Duplicate"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBlock(block.id);
                      }}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Block Content */}
                <div className="cursor-pointer">
                  {block.type === 'text' && (
                    <div 
                      className="p-4"
                      dangerouslySetInnerHTML={{ __html: block.content }}
                    />
                  )}
                  {block.type === 'image' && (
                    <div className="p-4 text-center">
                      <img 
                        src={block.src} 
                        alt={block.alt}
                        className="max-w-full h-auto mx-auto"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  )}
                  {block.type === 'button' && (
                    <div className="p-4 text-center">
                      <a
                        href={block.href}
                        className="inline-block px-6 py-3 rounded text-white font-medium no-underline"
                        style={{ 
                          backgroundColor: block.backgroundColor,
                          color: block.textColor 
                        }}
                      >
                        {block.text}
                      </a>
                    </div>
                  )}
                  {block.type === 'divider' && (
                    <div className="p-4">
                      <div 
                        style={{ 
                          height: `${block.height}px`,
                          backgroundColor: block.color 
                        }}
                      />
                    </div>
                  )}
                  {block.type === 'spacer' && (
                    <div 
                      style={{ height: `${block.height}px` }}
                      className="bg-gray-100 border-2 border-dashed border-gray-300"
                    />
                  )}
                  {block.type === 'columns' && (
                    <div className="p-4">
                      <div className="flex space-x-4">
                        {block.columns?.map((column, index) => (
                          <div 
                            key={index}
                            style={{ width: column.width }}
                            className="flex-shrink-0"
                          >
                            <div 
                              dangerouslySetInnerHTML={{ __html: column.content }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {block.type === 'social' && (
                    <div className="p-4 text-center">
                      <div className="flex justify-center space-x-4">
                        {block.links?.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            className="text-2xl hover:opacity-75 transition-opacity"
                            title={link.platform}
                          >
                            {link.icon}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Block Editor */}
                {renderBlockEditor(block)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailEditor;