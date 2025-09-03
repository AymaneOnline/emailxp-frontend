// emailxp/frontend/src/components/EnhancedDragDropEditor.js

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Type,
  Image,
  Link,
  Hash,
  Layers,
  Grid,
  Share2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Palette,
  Settings,
  Eye,
  Code,
  Smartphone,
  Tablet,
  Monitor,
  Trash2,
  Copy,
  Move,
  GripVertical
} from 'lucide-react';

const BLOCK_TYPES = [
  {
    id: 'text',
    label: 'Text Block',
    icon: Type,
    description: 'Add paragraph text',
    defaultContent: {
      text: 'Enter your text here...',
      styles: {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#333333',
        lineHeight: '1.6',
        textAlign: 'left',
        padding: '10px 0'
      }
    }
  },
  {
    id: 'heading',
    label: 'Heading',
    icon: Hash,
    description: 'Add a heading',
    defaultContent: {
      text: 'Your Heading',
      level: 'h2',
      styles: {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        color: '#333333',
        fontWeight: 'bold',
        textAlign: 'left',
        padding: '20px 0 10px 0'
      }
    }
  },
  {
    id: 'image',
    label: 'Image',
    icon: Image,
    description: 'Add an image',
    defaultContent: {
      src: 'https://via.placeholder.com/600x300?text=Your+Image',
      alt: 'Image',
      width: '100%',
      link: '',
      styles: {
        textAlign: 'center',
        padding: '10px 0'
      }
    }
  },
  {
    id: 'button',
    label: 'Button',
    icon: Link,
    description: 'Add a call-to-action button',
    defaultContent: {
      text: 'Click Here',
      link: '#',
      styles: {
        backgroundColor: '#007cba',
        color: '#ffffff',
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        padding: '12px 24px',
        borderRadius: '4px',
        textDecoration: 'none',
        display: 'inline-block',
        textAlign: 'center',
        margin: '10px 0'
      }
    }
  },
  {
    id: 'divider',
    label: 'Divider',
    icon: Layers,
    description: 'Add a divider line',
    defaultContent: {
      style: 'solid',
      color: '#cccccc',
      width: '100%',
      styles: {
        margin: '20px 0'
      }
    }
  },
  {
    id: 'spacer',
    label: 'Spacer',
    icon: Grid,
    description: 'Add spacing',
    defaultContent: {
      height: '20px'
    }
  }
];

const DEVICE_PREVIEWS = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: '100%' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: '768px' },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '375px' }
];

// Sortable Block Component
const SortableBlock = ({ block, onUpdate, onDelete, onDuplicate, isSelected, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const blockType = BLOCK_TYPES.find(type => type.id === block.type);
  const BlockIcon = blockType?.icon || Settings;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border-2 rounded-lg p-4 mb-4 transition-all ${
        isSelected
          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
      }`}
      onClick={() => onSelect(block.id)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 bg-gray-100 dark:bg-gray-700 rounded"
      >
        <GripVertical className="w-4 h-4 text-gray-500" />
      </div>

      {/* Block Controls */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded shadow-lg p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(block.id);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Duplicate"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(block.id);
            }}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Block Content */}
      <div className="pl-8">
        <div className="flex items-center space-x-2 mb-2">
          <BlockIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {blockType?.label}
          </span>
        </div>
        
        <div className="block-content">
          {renderBlockContent(block)}
        </div>
      </div>
    </div>
  );
};

// Block Content Renderer
const renderBlockContent = (block) => {
  switch (block.type) {
    case 'text':
      return (
        <div style={block.content.styles}>
          {block.content.text}
        </div>
      );
    case 'heading':
      const HeadingTag = block.content.level || 'h2';
      return React.createElement(
        HeadingTag,
        { style: block.content.styles },
        block.content.text
      );
    case 'image':
      return (
        <div style={block.content.styles}>
          <img
            src={block.content.src}
            alt={block.content.alt}
            style={{ width: block.content.width, height: 'auto', display: 'block' }}
          />
        </div>
      );
    case 'button':
      return (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <a
            href={block.content.link}
            style={block.content.styles}
            onClick={(e) => e.preventDefault()}
          >
            {block.content.text}
          </a>
        </div>
      );
    case 'divider':
      return (
        <hr
          style={{
            border: 'none',
            borderTop: `1px ${block.content.style} ${block.content.color}`,
            width: block.content.width,
            ...block.content.styles
          }}
        />
      );
    case 'spacer':
      return <div style={{ height: block.content.height }} />;
    default:
      return <div>Unknown block type</div>;
  }
};

// Block Properties Panel
const BlockPropertiesPanel = ({ block, onUpdate }) => {
  if (!block) {
    return (
      <div className="text-center py-8">
        <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          No Block Selected
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Click on a block to edit its properties
        </p>
      </div>
    );
  }

  const updateContent = (updates) => {
    onUpdate(block.id, {
      ...block,
      content: { ...block.content, ...updates }
    });
  };

  const updateStyles = (updates) => {
    onUpdate(block.id, {
      ...block,
      content: {
        ...block.content,
        styles: { ...block.content.styles, ...updates }
      }
    });
  };

  switch (block.type) {
    case 'text':
      return (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Text Properties</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content
            </label>
            <textarea
              value={block.content.text}
              onChange={(e) => updateContent({ text: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Font Size
              </label>
              <select
                value={block.content.styles.fontSize}
                onChange={(e) => updateStyles({ fontSize: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              >
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color
              </label>
              <input
                type="color"
                value={block.content.styles.color}
                onChange={(e) => updateStyles({ color: e.target.value })}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text Alignment
            </label>
            <div className="flex space-x-2">
              {['left', 'center', 'right'].map(align => (
                <button
                  key={align}
                  onClick={() => updateStyles({ textAlign: align })}
                  className={`p-2 rounded border ${
                    block.content.styles.textAlign === align
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {align === 'left' && <AlignLeft className="w-4 h-4" />}
                  {align === 'center' && <AlignCenter className="w-4 h-4" />}
                  {align === 'right' && <AlignRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      );

    case 'heading':
      return (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Heading Properties</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Text
            </label>
            <input
              type="text"
              value={block.content.text}
              onChange={(e) => updateContent({ text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Heading Level
            </label>
            <select
              value={block.content.level}
              onChange={(e) => updateContent({ level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            >
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
              <option value="h4">H4</option>
              <option value="h5">H5</option>
              <option value="h6">H6</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Font Size
              </label>
              <select
                value={block.content.styles.fontSize}
                onChange={(e) => updateStyles({ fontSize: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              >
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
                <option value="28px">28px</option>
                <option value="32px">32px</option>
                <option value="36px">36px</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color
              </label>
              <input
                type="color"
                value={block.content.styles.color}
                onChange={(e) => updateStyles({ color: e.target.value })}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>
        </div>
      );

    case 'image':
      return (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Image Properties</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={block.content.src}
              onChange={(e) => updateContent({ src: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alt Text
            </label>
            <input
              type="text"
              value={block.content.alt}
              onChange={(e) => updateContent({ alt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Link URL (optional)
            </label>
            <input
              type="url"
              value={block.content.link}
              onChange={(e) => updateContent({ link: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Width
            </label>
            <select
              value={block.content.width}
              onChange={(e) => updateContent({ width: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            >
              <option value="100%">Full Width</option>
              <option value="75%">75%</option>
              <option value="50%">50%</option>
              <option value="25%">25%</option>
              <option value="200px">200px</option>
              <option value="300px">300px</option>
              <option value="400px">400px</option>
            </select>
          </div>
        </div>
      );

    case 'button':
      return (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Button Properties</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Button Text
            </label>
            <input
              type="text"
              value={block.content.text}
              onChange={(e) => updateContent({ text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Link URL
            </label>
            <input
              type="url"
              value={block.content.link}
              onChange={(e) => updateContent({ link: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              placeholder="https://example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Background Color
              </label>
              <input
                type="color"
                value={block.content.styles.backgroundColor}
                onChange={(e) => updateStyles({ backgroundColor: e.target.value })}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Text Color
              </label>
              <input
                type="color"
                value={block.content.styles.color}
                onChange={(e) => updateStyles({ color: e.target.value })}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="text-center py-8">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Properties for this block type are not yet implemented.
          </p>
        </div>
      );
  }
};

// Main Enhanced Drag Drop Editor Component
const EnhancedDragDropEditor = ({ 
  initialBlocks = [], 
  onBlocksChange, 
  onPreview,
  className = '' 
}) => {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [showBlockLibrary, setShowBlockLibrary] = useState(true);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (onBlocksChange) {
      onBlocksChange(blocks);
    }
  }, [blocks, onBlocksChange]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  const addBlock = (blockType) => {
    const blockTemplate = BLOCK_TYPES.find(type => type.id === blockType);
    if (!blockTemplate) return;

    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: blockType,
      content: { ...blockTemplate.defaultContent }
    };

    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = (blockId, updatedBlock) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? updatedBlock : block
    ));
  };

  const deleteBlock = (blockId) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const duplicateBlock = (blockId) => {
    const blockToDuplicate = blocks.find(block => block.id === blockId);
    if (!blockToDuplicate) return;

    const newBlock = {
      ...blockToDuplicate,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    const blockIndex = blocks.findIndex(block => block.id === blockId);
    setBlocks(prev => [
      ...prev.slice(0, blockIndex + 1),
      newBlock,
      ...prev.slice(blockIndex + 1)
    ]);
  };

  const selectedBlock = blocks.find(block => block.id === selectedBlockId);

  return (
    <div className={`h-full flex ${className}`}>
      {/* Left Sidebar - Block Library & Properties */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowBlockLibrary(true)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                showBlockLibrary
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Blocks
            </button>
            <button
              onClick={() => setShowBlockLibrary(false)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                !showBlockLibrary
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Settings className="w-4 h-4 mr-2 inline" />
              Properties
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {showBlockLibrary ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Add Blocks
              </h3>
              {BLOCK_TYPES.map(blockType => {
                const BlockIcon = blockType.icon;
                return (
                  <button
                    key={blockType.id}
                    onClick={() => addBlock(blockType.id)}
                    className="w-full p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <BlockIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {blockType.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {blockType.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <BlockPropertiesPanel
              block={selectedBlock}
              onUpdate={updateBlock}
            />
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Device Preview Controls */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {DEVICE_PREVIEWS.map(device => {
                const DeviceIcon = device.icon;
                return (
                  <button
                    key={device.id}
                    onClick={() => setPreviewDevice(device.id)}
                    className={`p-2 rounded transition-colors ${
                      previewDevice === device.id
                        ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title={device.label}
                  >
                    <DeviceIcon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {onPreview && (
              <button
                onClick={() => onPreview(blocks)}
                className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
            )}
          </div>
        </div>

        {/* Editor Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-6">
          <div 
            className="mx-auto bg-white shadow-lg min-h-96"
            style={{ 
              width: DEVICE_PREVIEWS.find(d => d.id === previewDevice)?.width,
              maxWidth: '100%'
            }}
          >
            <div className="p-6">
              {blocks.length === 0 ? (
                <div className="text-center py-12">
                  <Type className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Start Building Your Email
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Add blocks from the sidebar to create your email content
                  </p>
                  <button
                    onClick={() => addBlock('text')}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your First Block
                  </button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
                    {blocks.map((block) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        onUpdate={updateBlock}
                        onDelete={deleteBlock}
                        onDuplicate={duplicateBlock}
                        isSelected={selectedBlockId === block.id}
                        onSelect={setSelectedBlockId}
                      />
                    ))}
                  </SortableContext>
                  <DragOverlay>
                    {activeId ? (
                      <div className="bg-white border-2 border-red-500 rounded-lg p-4 shadow-lg opacity-90">
                        <div className="text-sm font-medium text-gray-700">
                          Moving block...
                        </div>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDragDropEditor;