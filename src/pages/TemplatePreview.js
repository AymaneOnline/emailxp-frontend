// emailxp/frontend/src/pages/TemplatePreview.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Copy,
  Download,
  Share2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Code,
  Settings
} from 'lucide-react';
import { toast } from 'react-toastify';
import templateService from '../services/templateService';

const DEVICE_PREVIEWS = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: '100%', maxWidth: '1200px' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: '768px', maxWidth: '768px' },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '375px', maxWidth: '375px' }
];

const TemplatePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'code'

  useEffect(() => {
    loadTemplate();
  }, [id]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      console.log('Loading template with ID:', id);
      const templateData = await templateService.getTemplateById(id);
      console.log('Template data loaded:', templateData);
      setTemplate(templateData);
    } catch (error) {
      console.error('Failed to load template:', error);
      toast.error(`Failed to load template: ${error.message}`);
      // Don't navigate away immediately, let user see the error
      setTimeout(() => {
        navigate('/templates');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/templates/edit/${id}`);
  };

  const handleDuplicate = async () => {
    try {
      await templateService.duplicateTemplate(id);
      toast.success('Template duplicated successfully');
      navigate('/templates');
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  const handleExport = async () => {
    try {
      const response = await templateService.exportTemplate(id);
      
      // Create and download JSON file
      const dataStr = JSON.stringify(response.template, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Template exported successfully');
    } catch (error) {
      console.error('Failed to export template:', error);
      toast.error('Failed to export template');
    }
  };

  const generateHTMLFromTemplate = (template) => {
    if (!template || !template.structure) {
      return '<div style="padding: 20px; text-align: center; color: #666;">No content available</div>';
    }

    // This is a simplified HTML generation - you might want to use the same logic from AdvancedTemplateEditor
    const { blocks = [], settings = {} } = template.structure;

    const blockHTML = blocks.map(block => {
      switch (block.type) {
        case 'text':
          return `<div class="text-block block" style="${styleObjectToString(block.styles || {})}">${block.content?.text || ''}</div>`;
        case 'heading': {
          const level = block.content?.level || 'h2';
          return `<${level} class="block" style="${styleObjectToString(block.styles || {})}">${block.content?.text || ''}</${level}>`;
        }
        case 'image': {
          const imgStyle = `width: ${block.content?.width || '100%'}; height: auto; display: block;`;
          const img = `<img src="${block.content?.src || ''}" alt="${block.content?.alt || ''}" style="${imgStyle}">`;
          return `<div class="image-block block" style="${styleObjectToString(block.styles || {})}">${block.content?.link ? `<a href="${block.content.link}">${img}</a>` : img}</div>`;
        }
        case 'button':
          return `<div class="button-block block" style="text-align: ${block.content?.align || 'center'}; padding: 10px 0;">
            <a href="${block.content?.link || '#'}" class="button" style="${styleObjectToString(block.styles || {})}">${block.content?.text || 'Button'}</a>
          </div>`;
        case 'divider':
          return `<div class="divider-block block"><div class="divider" style="border: none; border-top: 1px ${block.content?.style || 'solid'} ${block.content?.color || '#cccccc'}; width: ${block.content?.width || '100%'}; margin: 20px auto;"></div></div>`;
        case 'spacer':
          return `<div class="spacer-block" style="height: ${block.content?.height || '20px'};"></div>`;
        case 'social': {
          const links = block.content?.links || [];
          const align = block.content?.align || 'center';
          return `<div class="social-block block" style="text-align: ${align}; ${styleObjectToString(block.styles || {})}">
            ${links.map(link => `<a href="${link.url || '#'}" style="display: inline-block; margin: 0 10px; text-decoration: none; font-size: 24px;">🔗</a>`).join('')}
          </div>`;
        }
        case 'footer': {
          const align = block.content?.align || 'center';
          return `<div class="block" style="text-align: ${align}; ${styleObjectToString(block.styles || {})}">${block.content?.text || ''}</div>`;
        }
        default:
          return '';
      }
    }).join('\n');

    const preheader = settings.preheader ? `<div style="display:none; max-height:0; overflow:hidden; opacity:0;">${settings.preheader}</div>` : '';

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
      background-color: ${settings.backgroundColor || '#ffffff'};
      font-family: ${settings.fontFamily || 'Arial, sans-serif'};
      font-size: ${settings.fontSize || '16px'};
      line-height: ${settings.lineHeight || '1.6'};
      color: ${settings.textColor || '#333333'};
    }
    a { color: ${settings.linkColor || '#007cba'}; }
    .container {
      max-width: ${settings.contentWidth || '600px'};
      margin: 0 auto;
      padding: 20px;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Template Not Found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The template you're looking for doesn't exist or has been deleted.
        </p>
        <button
          onClick={() => navigate('/templates')}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Templates
        </button>
      </div>
    );
  }

  const currentDevice = DEVICE_PREVIEWS.find(d => d.id === previewDevice);
  const htmlContent = generateHTMLFromTemplate(template);

  // Prevent clicks inside preview from navigating the SPA (only when not using iframe src)
  useEffect(() => {
    const handler = (e) => {
      const target = e.target.closest('a');
      if (target) {
        e.preventDefault();
      }
    };
    // Applies only if we ever render a div-based preview
    document.getElementById('template-preview-root')?.addEventListener('click', handler);
    return () => document.getElementById('template-preview-root')?.removeEventListener('click', handler);
  }, [htmlContent]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/templates')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {template.name}
              </h1>
              {template.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {template.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4 mr-2 inline" />
                Preview
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === 'code'
                    ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Code className="w-4 h-4 mr-2 inline" />
                Code
              </button>
            </div>

            {/* Device Preview Buttons */}
            {viewMode === 'preview' && (
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
            )}
            
            {/* Action Buttons */}
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            
            <button
              onClick={handleDuplicate}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </button>
            
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'preview' ? (
          <div className="p-6 flex justify-center">
            <div 
              className="bg-white shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              style={{ 
                width: currentDevice.width,
                maxWidth: currentDevice.maxWidth,
                minHeight: '600px'
              }}
            >
              <iframe
                src={templateService.getPreviewUrl(id)}
                className="w-full h-full border-0"
                style={{ minHeight: '600px' }}
                title="Template Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                <span className="text-sm text-gray-300 font-mono">HTML Source</span>
              </div>
              <pre className="p-4 text-sm text-gray-300 overflow-auto" style={{ maxHeight: '70vh' }}>
                <code>{htmlContent}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatePreview;