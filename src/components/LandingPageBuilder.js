// LandingPageBuilder.js - Full-screen modal wrapper for Unlayer Landing Page Editor

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Code, 
  Download, 
  Save, 
  Palette, 
  File, 
  Type,
  Smartphone,
  Monitor
} from 'lucide-react';
import { toast } from 'react-toastify';
import { userHasVerifiedDomain } from '../utils/domainErrors';
import UnlayerEmailEditor from './UnlayerEmailEditor';
import axios from 'axios';

const LandingPageBuilder = ({ 
  isOpen,
  onClose,
  initialDesign = null,
  initialData = {},
  onSave,
  onDesignChange,
  onHtmlChange,
  editorMode = 'page'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentView, setCurrentView] = useState('design'); // 'design', 'json', 'html', 'plaintext'
  const [htmlContent, setHtmlContent] = useState('');
  const [jsonContent, setJsonContent] = useState('');
  const [plainTextContent, setPlainTextContent] = useState('');
  const [editorReady, setEditorReady] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop', 'mobile'
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(initialData.formIntegration || null);
  const [landingPageData, setLandingPageData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    slug: initialData.slug || '',
    status: initialData.status || 'draft',
    seo: {
      title: initialData.seo?.title || '',
      description: initialData.seo?.description || '',
      keywords: initialData.seo?.keywords || ''
    }
  });
  const hasDomain = userHasVerifiedDomain();
  const editorComponentRef = useRef(null);

  // Fetch forms when component mounts
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get('/api/forms');
        setForms(response.data.forms || []);
      } catch (error) {
        console.error('Error fetching forms:', error);
      }
    };

    if (isOpen) {
      fetchForms();
    }
  }, [isOpen]);

  // Helper function to extract text from Lexical editor format
  const extractTextFromLexical = useCallback((lexicalData) => {
    if (!lexicalData || !lexicalData.root || !lexicalData.root.children) {
      return '';
    }

    let text = '';
    
    const processNode = (node) => {
      if (node.type === 'text') {
        text += node.text;
      } else if (node.type === 'linebreak') {
        text += '\n';
      } else if (node.children && Array.isArray(node.children)) {
        node.children.forEach(processNode);
      }
    };

    lexicalData.root.children.forEach(processNode);
    return text;
  }, []);

  // Helper function to generate plain text from design JSON (supports modern Unlayer format)
  const generatePlainTextFromDesign = useCallback((design) => {
    if (!design) return 'No text content found in design';
    
    try {
      // Handle modern Unlayer design format with body.content
      if (design.body && design.body.content && Array.isArray(design.body.content)) {
        let plainText = '';
        
        const processContent = (content) => {
          if (Array.isArray(content)) {
            content.forEach(item => {
              if (item.type === 'text' && item.data && item.data.text) {
                // Handle Lexical editor format
                if (typeof item.data.text === 'object' && item.data.text.root) {
                  plainText += extractTextFromLexical(item.data.text) + '\n\n';
                } 
                // Handle plain text
                else if (typeof item.data.text === 'string') {
                  plainText += item.data.text + '\n\n';
                }
              } else if (item.type === 'button' && item.data && item.data.text) {
                plainText += item.data.text + '\n\n';
              } else if (item.type === 'divider') {
                plainText += '---\n\n';
              } else if (item.type === 'image' && item.data && item.data.caption) {
                plainText += item.data.caption + '\n\n';
              } else if (item.content) {
                processContent(item.content);
              }
            });
          }
        };
        
        processContent(design.body.content);
        return plainText.trim() || 'No text content found in design';
      }
      
      // Fallback for older/simple formats
      return 'No text content found in design';
    } catch (error) {
      console.error('Error generating plain text from design:', error);
      return 'Error processing design content';
    }
  }, [extractTextFromLexical]);

  // Helper function to generate plain text from HTML
  const generatePlainTextFromHtml = useCallback((html) => {
    if (!html) return '';
    
    try {
      // Create a temporary DOM element to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Extract text content
      let plainText = tempDiv.textContent || tempDiv.innerText || '';
      
      // Clean up the text
      plainText = plainText
        .replace(/\n\s*\n/g, '\n\n')          // Normalize double line breaks
        .replace(/^\s+|\s+$/gm, '')           // Trim whitespace from start and end of lines
        .trim();
      
      return plainText || 'No text content found in HTML';
    } catch (error) {
      console.error('Error extracting plain text from HTML:', error);
      return 'Error processing HTML content';
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Initialize JSON content with initial design
      if (initialDesign) {
        setJsonContent(JSON.stringify(initialDesign, null, 2));
        
        // Generate initial HTML content from design
        // For landing pages, we would use a different HTML generation method
        setHtmlContent('<!DOCTYPE html><html><head><title>Landing Page</title></head><body>Loading...</body></html>');
        
        // Try to extract plain text from design JSON first (now supports modern Unlayer format)
        let generatedPlainText = generatePlainTextFromDesign(initialDesign);
        
        // If design extraction didn't work, set placeholder and wait for editor export
        if (!generatedPlainText || generatedPlainText === 'No text content found in design') {
          generatedPlainText = 'Loading content...';
        }
        
        setPlainTextContent(generatedPlainText);
      }
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialDesign, generatePlainTextFromDesign]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 150); // Wait for animation to complete
  };

  const handleSave = async (data) => {
    try {
      // Enforce domain gating for publish action
      if (!hasDomain && (data.status === 'published' || landingPageData.status === 'published')) {
        toast.warning('Verify a sending domain before publishing landing pages.');
        // Force status back to draft
        data.status = 'draft';
        setLandingPageData(prev => ({ ...prev, status: 'draft' }));
      }
      // Prepare data for saving
      const saveData = {
        name: landingPageData.name || 'Untitled Landing Page',
        description: landingPageData.description,
        slug: landingPageData.slug,
        status: landingPageData.status,
        seo: landingPageData.seo,
        design: data.design || {},
        htmlContent: htmlContent || '',
        formIntegration: selectedForm ? selectedForm._id : null
      };
      
      // Call the onSave callback with the data
      if (onSave) {
        await onSave(saveData);
      }
      
      toast.success('Landing page saved successfully!');
      handleClose();
    } catch (error) {
      console.error('Error saving landing page:', error);
      toast.error('Failed to save landing page');
    }
  };

  const toggleHtmlView = () => {
    if (currentView !== 'html') {
      // Export HTML when switching to HTML view
      if (editorComponentRef.current && editorComponentRef.current.exportHtml) {
        editorComponentRef.current.exportHtml();
      }
    }
    setCurrentView('html');
  };

  const toggleJsonView = () => {
    if (currentView !== 'json') {
      // Export design JSON when switching to JSON view
      if (editorComponentRef.current && editorComponentRef.current.exportDesign) {
        editorComponentRef.current.exportDesign();
      }
    }
    setCurrentView('json');
  };

  const togglePlainTextView = () => {
    if (currentView !== 'plaintext') {
      // Generate plain text if not already available
      if (!plainTextContent || plainTextContent.includes('No text content found')) {
        // First try to use existing HTML content
        if (htmlContent) {
          const generatedPlainText = generatePlainTextFromHtml(htmlContent);
          setPlainTextContent(generatedPlainText);
        }
        // Then try design-based extraction
        else if (initialDesign) {
          const generatedPlainText = generatePlainTextFromDesign(initialDesign);
          setPlainTextContent(generatedPlainText);
        }
        // Finally, try to export HTML from editor
        else if (editorComponentRef.current && editorComponentRef.current.exportHtml) {
          editorComponentRef.current.exportHtml();
        }
      }
    }
    setCurrentView('plaintext');
  };

  const toggleDesignView = () => {
    setCurrentView('design');
  };

  const downloadHtml = () => {
    if (!htmlContent) {
      toast.error('No HTML content available. Please view HTML first.');
      return;
    }
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'landing-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Landing page downloaded successfully!');
  };

  const saveDesign = () => {
    if (editorComponentRef.current && editorComponentRef.current.saveDesign) {
      editorComponentRef.current.saveDesign();
    }
  };

  // Handle callbacks from the editor
  const handleHtmlChange = (html) => {
    setHtmlContent(html);
    
    // Auto-generate plain text when HTML changes
    if (html) {
      const newPlainText = generatePlainTextFromHtml(html);
      setPlainTextContent(newPlainText);
    }
    
    if (onHtmlChange) {
      onHtmlChange(html);
    }
  };

  const handleDesignChange = (design) => {
    setJsonContent(JSON.stringify(design, null, 2));
    
    // Regenerate plain text from the updated design
    const updatedPlainText = generatePlainTextFromDesign(design);
    setPlainTextContent(updatedPlainText);
    
    if (onDesignChange) {
      onDesignChange(design);
    }
  };

  const handleEditorReady = () => {
    setEditorReady(true);
    
    // Generate HTML content from the current design when editor is ready
    if (editorComponentRef.current && editorComponentRef.current.exportHtml) {
      setTimeout(() => {
        // Export HTML from the actual editor (this should have the real content)
        editorComponentRef.current.exportHtml();
      }, 1500); // Give editor more time to fully initialize with design
    }
  };

  if (!isOpen && !isVisible) return null;

  const modalContent = (
    <div className={`fixed inset-0 z-50 transition-opacity duration-150 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`} style={{ 
      top: '0px !important', 
      left: '0px !important', 
      right: '0px !important', 
      bottom: '0px !important', 
      position: 'fixed !important',
      margin: '0px !important',
      padding: '0px !important',
      boxSizing: 'border-box !important',
      width: '100vw !important',
      height: '100vh !important'
    }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
        style={{ 
          margin: '0px !important',
          padding: '0px !important'
        }}
      />
      
      {/* Modal */}
      <div className={`relative w-full h-full bg-white dark:bg-gray-900 transition-transform duration-150 transform flex flex-col ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`} style={{ 
        margin: '0px !important', 
        padding: '0px !important',
        width: '100% !important',
        height: '100% !important',
        maxWidth: '100vw !important',
        maxHeight: '100vh !important'
      }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0" style={{ 
          margin: '0px !important',
          padding: '16px !important'
        }}>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Landing Page Builder
          </h2>
          
          {/* View Toggle Buttons */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={toggleDesignView}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'design'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
              }`}
            >
              <Palette className="w-4 h-4 mr-2" />
              Design
            </button>
            
            <button
              onClick={toggleJsonView}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                currentView === 'json'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
              }`}
              disabled={!editorReady}
            >
              <File className="w-4 h-4 mr-2" />
              JSON
            </button>
            
            <button
              onClick={toggleHtmlView}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                currentView === 'html'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
              }`}
              disabled={!editorReady}
            >
              <Code className="w-4 h-4 mr-2" />
              HTML
            </button>
            
            <button
              onClick={togglePlainTextView}
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                currentView === 'plaintext'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-600/50'
              }`}
              disabled={!editorReady}
            >
              <Type className="w-4 h-4 mr-2" />
              Plain Text
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Preview Device Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-2 rounded-md ${
                  previewDevice === 'desktop'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
                title="Desktop preview"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-2 rounded-md ${
                  previewDevice === 'mobile'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
                title="Mobile preview"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            
            {htmlContent && currentView === 'html' && (
              <button
                onClick={downloadHtml}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download HTML
              </button>
            )}
            
            <button
              onClick={saveDesign}
              className="inline-flex items-center px-3 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!editorReady}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
            
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Add a settings panel for landing page details */}
        {currentView === 'design' && (
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Page Name *
                </label>
                <input
                  type="text"
                  value={landingPageData.name}
                  onChange={(e) => handleLandingPageDataChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Product Launch"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={landingPageData.slug}
                  onChange={(e) => handleLandingPageDataChange('slug', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., product-launch"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={landingPageData.status}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'published' && !hasDomain) {
                      toast.info('Add and verify a sending domain before publishing.');
                      return; // Do not change state
                    }
                    handleLandingPageDataChange('status', val);
                  }}
                  title={!hasDomain ? 'Verify a sending domain to publish' : undefined}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent ${!hasDomain ? '' : ''}`}
                >
                  <option value="draft">Draft</option>
                  <option value="published" disabled={!hasDomain}>Published {(!hasDomain ? '(domain required)' : '')}</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Form Integration
                </label>
                <select
                  value={selectedForm?._id || ''}
                  onChange={(e) => {
                    const form = forms.find(f => f._id === e.target.value);
                    handleFormSelect(form || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">No form integration</option>
                  {forms.map((form) => (
                    <option key={form._id} value={form._id}>
                      {form.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={landingPageData.seo.title}
                  onChange={(e) => handleLandingPageDataChange('seo.title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Page title for search engines"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SEO Description
                </label>
                <input
                  type="text"
                  value={landingPageData.seo.description}
                  onChange={(e) => handleLandingPageDataChange('seo.description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Page description for search engines"
                />
              </div>
            </div>
          </div>
        )}

        {/* Editor Content */}
        <div className="flex-1 min-h-0" style={{ 
          height: 'calc(100vh - 80px) !important', 
          margin: '0px !important', 
          padding: '0px !important',
          width: '100% !important'
        }}>
          {currentView === 'html' ? (
            <div className="h-full bg-gray-50 dark:bg-gray-900" style={{ 
              margin: '0px !important',
              padding: '16px !important'
            }}>
              <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="h-full">
                  <textarea
                    value={htmlContent}
                    onChange={(e) => {
                      setHtmlContent(e.target.value);
                      if (onHtmlChange) {
                        onHtmlChange(e.target.value);
                      }
                    }}
                    className="w-full h-full p-4 font-mono text-sm border-none resize-none focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="HTML content will appear here..."
                  />
                </div>
              </div>
            </div>
          ) : currentView === 'json' ? (
            <div className="h-full bg-gray-50 dark:bg-gray-900" style={{ 
              margin: '0px !important',
              padding: '16px !important'
            }}>
              <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="h-full">
                  <textarea
                    value={jsonContent}
                    onChange={(e) => {
                      setJsonContent(e.target.value);
                      // Optionally parse and update design if valid JSON
                      try {
                        const design = JSON.parse(e.target.value);
                        if (onDesignChange) {
                          onDesignChange(design);
                        }
                      } catch (error) {
                        // Invalid JSON, don't update design
                      }
                    }}
                    className="w-full h-full p-4 font-mono text-sm border-none resize-none focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Design JSON will appear here..."
                  />
                </div>
              </div>
            </div>
          ) : currentView === 'plaintext' ? (
            <div className="h-full bg-gray-50 dark:bg-gray-900" style={{ 
              margin: '0px !important',
              padding: '16px !important'
            }}>
              <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="h-full">
                  <textarea
                    value={plainTextContent}
                    onChange={(e) => setPlainTextContent(e.target.value)}
                    className="w-full h-full p-4 font-mono text-sm border-none resize-none focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Plain text content will appear here..."
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full w-full" style={{ 
              margin: '0px !important',
              padding: '0px !important'
            }}>
              <UnlayerEmailEditor
                ref={editorComponentRef}
                initialDesign={initialDesign}
                onDesignChange={handleDesignChange}
                onHtmlChange={handleHtmlChange}
                onSave={handleSave}
                onEditorReady={handleEditorReady}
                height="calc(100vh - 80px)"
                className="h-full w-full"
                hideToolbar={true}
                editorMode={editorMode} // Pass the editorMode prop
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Handler for landing page data changes
  const handleLandingPageDataChange = (field, value) => {
    if (field.includes('.')) {
      // Handle nested fields like 'seo.title'
      const [parent, child] = field.split('.');
      setLandingPageData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      // Handle top-level fields
      setLandingPageData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handler for form selection
  const handleFormSelect = (form) => {
    setSelectedForm(form);
  };

  // Use a portal to render the modal at the document body level to avoid parent container positioning issues
  return createPortal(modalContent, document.body);
};

LandingPageBuilder.displayName = 'LandingPageBuilder';

export default LandingPageBuilder;