// emailxp/frontend/src/components/AdvancedTemplateEditor.js

import React, { useState, useEffect } from 'react';
import {
  Save,
  Eye,
  Code,
  Palette,
  Type,
  Image,
  Link,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  Upload,
  Copy,
  Undo,
  Redo,
  Settings,
  Layers,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  Hash,
  X,
  Plus,
  Trash2,
  Move,
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-toastify';
import templateService from '../services/templateService';


const DEVICE_PREVIEWS = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: '100%' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: '768px' },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '375px' }
];

const BLOCK_TYPES = [
  { id: 'text', label: 'Text', icon: Type, description: 'Add text content' },
  { id: 'heading', label: 'Heading', icon: Hash, description: 'Add a heading' },
  { id: 'image', label: 'Image', icon: Image, description: 'Add an image' },
  { id: 'button', label: 'Button', icon: Link, description: 'Add a call-to-action button' },
  { id: 'divider', label: 'Divider', icon: Layers, description: 'Add a divider line' },
  { id: 'spacer', label: 'Spacer', icon: Grid, description: 'Add spacing' },
  { id: 'social', label: 'Social', icon: Link, description: 'Add social media links' },
  { id: 'footer', label: 'Footer', icon: AlignCenter, description: 'Add footer content' }
];

const FONT_FAMILIES = [
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Georgia, serif',
  'Times New Roman, serif',
  'Verdana, sans-serif',
  'Trebuchet MS, sans-serif',
  'Impact, sans-serif'
];

const FONT_SIZES = [
  '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'
];

const AdvancedTemplateEditor = ({ templateId, onSave, onCancel }) => {
  const [template, setTemplate] = useState({
    name: '',
    description: '',
    category: 'newsletter',
    htmlContent: '',
    blocks: [],
    styles: {
      backgroundColor: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      lineHeight: '1.6',
      textColor: '#333333',
      linkColor: '#007cba',
      containerWidth: '600px'
    },
    settings: {
      preheader: '',
      enableDarkMode: false,
      enableRTL: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(true);
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load template if editing
  useEffect(() => {
    if (templateId) {
      loadTemplate();
    } else {
      // Initialize with default content
      addToHistory(template);
    }
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      console.log('Loading template with ID:', templateId);
      const data = await templateService.getTemplateById(templateId);
      console.log('Template data received:', data);
      
      // Convert backend structure to frontend format
      const settings = data.structure?.settings || {};
      const blocks = (data.structure?.blocks || []).map(b => ({
        ...b,
        content: b?.content || {},
        styles: b?.styles || {}
      }));
      const convertedTemplate = {
        name: data.name || '',
        description: data.description || '',
        category: data.category || 'custom',
        tags: data.tags || [],
        blocks,
        styles: {
          backgroundColor: settings.backgroundColor || '#f4f4f4',
          containerWidth: `${settings.contentWidth || settings.containerWidth || 600}px`,
          fontFamily: settings.fontFamily || 'Arial, sans-serif',
          fontSize: `${settings.fontSize || 16}px`,
          lineHeight: `${settings.lineHeight || 1.6}`,
          textColor: settings.textColor || '#333333',
          linkColor: settings.linkColor || '#007cba',
        },
        settings: {
          preheader: settings.preheader || ''
        }
      };
      
      console.log('Converted template:', convertedTemplate);
      setTemplate(convertedTemplate);
      addToHistory(convertedTemplate);
    } catch (error) {
      console.error('Failed to load template:', error);
      toast.error(`Failed to load template: ${error.message}`);
      // Initialize with empty template if loading fails
      const emptyTemplate = {
        name: '',
        description: '',
        category: 'custom',
        tags: [],
        blocks: [],
        styles: {
          backgroundColor: '#f4f4f4',
          containerWidth: '600px',
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          lineHeight: '1.6',
          textColor: '#333333'
        }
      };
      setTemplate(emptyTemplate);
      addToHistory(emptyTemplate);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    try {
      setSaving(true);
      
      if (!template.name.trim()) {
        toast.error('Please enter a template name');
        return;
      }

      // Client-side validation: require footer + unsubscribe token
      const hasFooter = (template.blocks || []).some(b => b.type === 'footer');
      const footer = (template.blocks || []).find(b => b.type === 'footer');
      const footerText = (footer?.content?.text || '').toString();
      if (!hasFooter || !/\{\{\s*unsubscribeUrl\s*\}\}/i.test(footerText)) {
        toast.error('Template must include a Footer block with an unsubscribe link ({{unsubscribeUrl}}).');
        return;
      }

      // Convert frontend format to backend format (align naming)
      const styles = template.styles || {};
      const advSettings = template.settings || {};

      // Normalize container/content width to number
      const contentWidth = typeof styles.containerWidth === 'string'
        ? parseInt(styles.containerWidth, 10) || 600
        : (styles.containerWidth || styles.contentWidth || 600);

      const structureSettings = {
        backgroundColor: styles.backgroundColor || '#f4f4f4',
        contentWidth,
        fontFamily: styles.fontFamily || 'Arial, sans-serif',
        fontSize: parseInt(styles.fontSize, 10) || 16,
        lineHeight: typeof styles.lineHeight === 'string' ? parseFloat(styles.lineHeight) || 1.6 : (styles.lineHeight || 1.6),
        textColor: styles.textColor || '#333333',
        linkColor: styles.linkColor || '#007cba',
        preheader: advSettings.preheader || ''
      };

      const templateData = {
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        structure: {
          blocks: template.blocks,
          settings: structureSettings
        }
      };

      let result;
      if (templateId) {
        result = await templateService.updateTemplate(templateId, templateData);
      } else {
        result = await templateService.createTemplate(templateData);
      }

      toast.success('Template saved successfully');
      if (onSave) onSave(result);
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const addToHistory = (state) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(state)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setTemplate(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setTemplate(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const addBlock = (blockType, position = -1) => {
    const newBlock = {
      id: Date.now() + Math.random(),
      type: blockType,
      content: getDefaultBlockContent(blockType),
      styles: getDefaultBlockStyles(blockType)
    };

    const newBlocks = [...template.blocks];
    if (position === -1) {
      newBlocks.push(newBlock);
    } else {
      newBlocks.splice(position, 0, newBlock);
    }

    const newTemplate = { ...template, blocks: newBlocks };
    setTemplate(newTemplate);
    addToHistory(newTemplate);
    setShowBlockLibrary(false);
    setSelectedBlock(newBlock.id);
  };

  const getDefaultBlockContent = (blockType) => {
    switch (blockType) {
      case 'text':
        return { text: 'Enter your text here...' };
      case 'heading':
        return { text: 'Your Heading', level: 'h2' };
      case 'image':
        return { src: '', alt: 'Image', width: '100%', link: '' };
      case 'button':
        return { text: 'Click Here', link: '#', align: 'center' };
      case 'divider':
        return { style: 'solid', color: '#cccccc', width: '100%' };
      case 'spacer':
        return { height: '20px' };
      case 'social':
        return { 
          links: [
            { platform: 'facebook', url: '#' },
            { platform: 'twitter', url: '#' },
            { platform: 'instagram', url: '#' }
          ],
          align: 'center'
        };
      case 'footer':
        return { 
          text: 'Copyright © 2024 Your Company. All rights reserved.',
          unsubscribeText: 'Unsubscribe from this list',
          align: 'center'
        };
      default:
        return {};
    }
  };

  const getDefaultBlockStyles = (blockType) => {
    switch (blockType) {
      case 'text':
        return {
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif',
          color: '#333333',
          lineHeight: '1.6',
          textAlign: 'left',
          padding: '10px 0'
        };
      case 'heading':
        return {
          fontSize: '24px',
          fontFamily: 'Arial, sans-serif',
          color: '#333333',
          fontWeight: 'bold',
          textAlign: 'left',
          padding: '20px 0 10px 0'
        };
      case 'button':
        return {
          backgroundColor: '#007cba',
          color: '#ffffff',
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif',
          padding: '12px 24px',
          borderRadius: '4px',
          textDecoration: 'none',
          display: 'inline-block',
          margin: '10px 0'
        };
      default:
        return {};
    }
  };

  const updateBlock = (blockId, updates) => {
    const newTemplate = {
      ...template,
      blocks: template.blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    };
    setTemplate(newTemplate);
    addToHistory(newTemplate);
  };

  const deleteBlock = (blockId) => {
    const newTemplate = {
      ...template,
      blocks: template.blocks.filter(block => block.id !== blockId)
    };
    setTemplate(newTemplate);
    addToHistory(newTemplate);
    setSelectedBlock(null);
  };

  const duplicateBlock = (blockId) => {
    const blockToDuplicate = template.blocks.find(b => b.id === blockId);
    if (blockToDuplicate) {
      const newBlock = {
        ...blockToDuplicate,
        id: Date.now() + Math.random()
      };
      
      const blockIndex = template.blocks.findIndex(b => b.id === blockId);
      const newBlocks = [...template.blocks];
      newBlocks.splice(blockIndex + 1, 0, newBlock);
      
      const newTemplate = { ...template, blocks: newBlocks };
      setTemplate(newTemplate);
      addToHistory(newTemplate);
    }
  };

  const moveBlock = (blockId, direction) => {
    const blockIndex = template.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const newBlocks = [...template.blocks];
    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    
    if (newIndex >= 0 && newIndex < newBlocks.length) {
      [newBlocks[blockIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[blockIndex]];
      
      const newTemplate = { ...template, blocks: newBlocks };
      setTemplate(newTemplate);
      addToHistory(newTemplate);
    }
  };

  // Safely serialize style objects
  const styleObjectToString = (styles) => {
    if (!styles || typeof styles !== 'object') return '';
    return Object.entries(styles)
      .filter(([k, v]) => v !== undefined && v !== null && v !== '')
      .map(([key, value]) => {
        const kebab = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        const needsPx = typeof value === 'number' && !kebab.includes('color') && !kebab.includes('opacity') && !kebab.includes('z-index') && !kebab.includes('font-weight') && !kebab.includes('line-height');
        return `${kebab}: ${value}${needsPx ? 'px' : ''}`;
      })
      .join('; ');
  };

  const generateHTMLFromBlocks = (blocks, styles) => {
    const blockHTML = blocks.map(block => generateBlockHTML(block)).join('\n');
    const preheader = template.settings?.preheader ? `<div style="display:none; max-height:0; overflow:hidden; opacity:0;">${template.settings.preheader}</div>` : '';
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.name}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: ${styles.backgroundColor};
      font-family: ${styles.fontFamily};
      font-size: ${styles.fontSize};
      line-height: ${styles.lineHeight};
      color: ${styles.textColor};
    }
    .container {
      max-width: ${styles.containerWidth};
      margin: 0 auto;
      padding: 20px;
    }
    a {
      color: ${styles.linkColor};
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 10px !important;
      }
    }
  </style>
</head>
<body>
  ${preheader}
  <div class="container">
    ${blockHTML}
  </div>
</body>
</html>`;
  };

  const generateBlockHTML = (block) => {
    const styles = block?.styles || {};
    const content = block?.content || {};
    switch (block?.type) {
      case 'text':
        return `<p style="${styleObjectToString(styles)}">${content.text || ''}</p>`;
      case 'heading': {
        const level = content.level || 'h2';
        return `<${level} style="${styleObjectToString(styles)}">${content.text || ''}</${level}>`;
      }
      case 'image': {
        const width = content.width || '100%';
        const imgStyle = `width: ${width}; height: auto; display: block;`;
        const img = `<img src="${content.src || ''}" alt="${content.alt || ''}" style="${imgStyle}">`;
        return content.link ? `<a href="${content.link}">${img}</a>` : img;
      }
      case 'button':
        return `<div style="text-align: ${content.align || 'center'};">
          <a href="${content.link || '#'}" style="${styleObjectToString(styles)}">${content.text || 'Button'}</a>
        </div>`;
      case 'divider':
        return `<hr style="border: none; border-top: 1px ${content.style || 'solid'} ${content.color || '#cccccc'}; width: ${content.width || '100%'}; margin: 20px auto;">`;
      case 'spacer':
        return `<div style="height: ${content.height || '20px'};"></div>`;
      case 'social': {
        const links = content.links || [];
        const align = content.align || 'center';
        return `<div style="text-align: ${align}; ${styleObjectToString(styles)}">
          ${links.map(link => `<a href="${link.url || '#'}" style="display: inline-block; margin: 0 10px; text-decoration: none; font-size: 24px;">🔗</a>`).join('')}
        </div>`;
      }
      case 'footer': {
        const align = content.align || 'center';
        return `<div style="text-align: ${align}; ${styleObjectToString(styles)}">${content.text || ''}</div>`;
      }
      default:
        return '';
    }
  };

  const styleObjectToString = (styles) => {
    return Object.entries(styles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');
  };

  const renderBlockEditor = (block) => {
    if (!block) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Edit {BLOCK_TYPES.find(t => t.id === block.type)?.label}
          </h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => duplicateBlock(block.id)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteBlock(block.id)}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {block.type === 'text' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Text Content
              </label>
              <textarea
                value={block.content.text}
                onChange={(e) => updateBlock(block.id, {
                  content: { ...block.content, text: e.target.value }
                })}
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
                  value={block.styles.fontSize}
                  onChange={(e) => updateBlock(block.id, {
                    styles: { ...block.styles, fontSize: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                >
                  {FONT_SIZES.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Text Color
                </label>
                <input
                  type="color"
                  value={block.styles.color}
                  onChange={(e) => updateBlock(block.id, {
                    styles: { ...block.styles, color: e.target.value }
                  })}
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Text Alignment
              </label>
              <div className="flex space-x-2">
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    onClick={() => updateBlock(block.id, {
                      styles: { ...block.styles, textAlign: align }
                    })}
                    className={`p-2 rounded border ${
                      block.styles.textAlign === align
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
        )}

        {block.type === 'button' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={block.content.text}
                onChange={(e) => updateBlock(block.id, {
                  content: { ...block.content, text: e.target.value }
                })}
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
                onChange={(e) => updateBlock(block.id, {
                  content: { ...block.content, link: e.target.value }
                })}
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
                  value={block.styles.backgroundColor}
                  onChange={(e) => updateBlock(block.id, {
                    styles: { ...block.styles, backgroundColor: e.target.value }
                  })}
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Text Color
                </label>
                <input
                  type="color"
                  value={block.styles.color}
                  onChange={(e) => updateBlock(block.id, {
                    styles: { ...block.styles, color: e.target.value }
                  })}
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Add more block type editors as needed */}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
              className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white"
              placeholder="Template Name"
            />
            
            <div className="flex items-center space-x-2">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Device Preview Buttons */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {DEVICE_PREVIEWS.map(device => {
                const DeviceIcon = device.icon;
                return (
                  <button
                    key={device.id}
                    onClick={() => setPreviewDevice(device.id)}
                    className={`p-2 rounded ${
                      previewDevice === device.id
                        ? 'bg-white dark:bg-gray-600 shadow-sm'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <DeviceIcon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                previewMode
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? 'Edit' : 'Preview'}
            </button>
            
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={saveTemplate}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Block Library & Properties */}
        {!previewMode && (
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
                <div>
                  {selectedBlock ? (
                    renderBlockEditor(template.blocks.find(b => b.id === selectedBlock))
                  ) : (
                    <div className="text-center py-8">
                      <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        No Block Selected
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Click on a block in the editor to edit its properties
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Editor/Preview Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {previewMode ? (
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-6">
              <div 
                className="mx-auto bg-white shadow-lg"
                style={{ 
                  width: DEVICE_PREVIEWS.find(d => d.id === previewDevice)?.width,
                  maxWidth: '100%'
                }}
              >
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: generateHTMLFromBlocks(template.blocks, template.styles) 
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto p-4">
              {/* Block List */}
              <div className="max-w-3xl mx-auto space-y-4">
                {template.blocks.map((block) => (
                  <div
                    key={block.id}
                    className={`border rounded-lg p-4 bg-white dark:bg-gray-800 ${selectedBlock === block.id ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                    onClick={() => setSelectedBlock(block.id)}
                  >
                    {renderBlockPreview(block)}
                    <div className="flex justify-end space-x-2 mt-3">
                      <button className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded" onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}>Up</button>
                      <button className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded" onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}>Down</button>
                      <button className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded" onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}>Duplicate</button>
                      <button className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded" onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}>Delete</button>
                    </div>
                  </div>
                ))}
                <div className="text-center">
                  <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={() => setShowBlockLibrary(true)}>Add block</button>
                </div>
              </div>
            </div>
          )
        </div>
      </div>
    </div>
  );
};

export default AdvancedTemplateEditor;