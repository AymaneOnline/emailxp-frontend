// UnlayerEmailEditor.js - Wrapper for Unlayer React Email Editor

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import EmailEditor from 'react-email-editor';
import { Eye, Code, Save, Download } from 'lucide-react';

const UnlayerEmailEditor = forwardRef(({ 
  initialDesign = null,
  onDesignChange,
  onHtmlChange,
  onSave,
  onEditorReady,
  className = '',
  height = 600,
  hideToolbar = false,
  editorMode = 'email' // 'email' or 'page'
}, ref) => {
  const emailEditorRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [editorReady, setEditorReady] = useState(false);
  const [showHtml, setShowHtml] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    exportHtml: () => {
      return new Promise((resolve) => {
        if (emailEditorRef.current?.editor) {
          emailEditorRef.current.editor.exportHtml((data) => {
            const { design, html } = data;
            setHtmlContent(html);
            
            if (onHtmlChange) {
              onHtmlChange(html);
            }
            if (onDesignChange) {
              onDesignChange(design);
            }
            resolve({ design, html });
          });
        } else {
          resolve(null);
        }
      });
    },
    exportDesign: () => {
      if (emailEditorRef.current?.editor) {
        emailEditorRef.current.editor.exportHtml((data) => {
          const { design } = data;
          
          if (onDesignChange) {
            onDesignChange(design);
          }
        });
      }
    },
    saveDesign: () => {
      return new Promise((resolve) => {
        if (emailEditorRef.current?.editor) {
          emailEditorRef.current.editor.exportHtml((data) => {
            const { design, html } = data;
            if (onSave) {
              onSave({ design, html });
            }
            resolve({ design, html });
          });
        } else {
          resolve(null);
        }
      });
    }
  }), [onHtmlChange, onDesignChange, onSave]);

  useEffect(() => {
    // Load initial design when component mounts or design changes
    if (initialDesign && emailEditorRef.current?.editor && editorReady) {
      console.log('Loading design into Unlayer editor:', initialDesign);
      emailEditorRef.current.editor.loadDesign(initialDesign);
    }
  }, [initialDesign, editorReady]);

  const onReady = () => {
    console.log('Unlayer editor is ready');
    
    // Check if editor is available
    if (!emailEditorRef.current?.editor) {
      console.error('Editor not found after onReady');
      return;
    }
    
    const editor = emailEditorRef.current.editor;
    
    // Set editor appearance
    editor.setAppearance({
      theme: 'light',
      panels: {
        tools: {
          dock: 'left'
        }
      }
    });

    // Load initial design if provided
    if (initialDesign) {
      console.log('Loading initial design on ready:', initialDesign);
      editor.loadDesign(initialDesign);
    }
    
    setLoading(false);
    setEditorReady(true);
    
    // Notify parent that editor is ready
    if (onEditorReady) {
      onEditorReady();
    }
  };

  const onDesignLoad = (data) => {
    console.log('Design loaded:', data);
  };

  const exportHtml = () => {
    if (emailEditorRef.current?.editor) {
      emailEditorRef.current.editor.exportHtml((data) => {
        const { design, html } = data;
        console.log('HTML exported:', html);
        setHtmlContent(html);
        
        if (onHtmlChange) {
          onHtmlChange(html);
        }
        if (onDesignChange) {
          onDesignChange(design);
        }
      });
    } else {
      console.error('Editor not ready');
    }
  };

  const saveDesign = () => {
    if (emailEditorRef.current?.editor) {
      emailEditorRef.current.editor.exportHtml((data) => {
        const { design, html } = data;
        if (onSave) {
          onSave({ design, html });
        }
      });
    } else {
      console.error('Editor not ready');
    }
  };

  const toggleHtmlView = () => {
    if (!showHtml) {
      exportHtml();
    }
    setShowHtml(!showHtml);
  };

  const downloadHtml = () => {
    if (!htmlContent) {
      exportHtml();
      return;
    }
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = editorMode === 'page' ? 'landing-page.html' : 'email-template.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Configure editor options based on mode
  const getEditorOptions = () => {
    const baseOptions = {
      features: {
        textEditor: {
          cleanPaste: true,
          spellChecker: true
        }
      },
      appearance: {
        theme: 'light',
        panels: {
          tools: {
            dock: 'left'
          }
        },
        minHeight: '600px'
      }
    };

    if (editorMode === 'page') {
      // Page builder specific options
      return {
        ...baseOptions,
        displayMode: 'web',
        // Disable email-specific features for page mode
        tools: {
          form: {
            enabled: false
          }
        }
      };
    } else {
      // Email builder specific options
      return {
        ...baseOptions,
        displayMode: 'email',
        mergeTags: [
          {
            name: 'Email',
            value: '{{email}}',
            sample: 'john@example.com'
          },
          {
            name: 'First Name',
            value: '{{firstName}}',
            sample: 'John'
          },
          {
            name: 'Last Name',
            value: '{{lastName}}',
            sample: 'Doe'
          },
          {
            name: 'Company',
            value: '{{company}}',
            sample: 'Acme Corp'
          },
          {
            name: 'Unsubscribe URL',
            value: '{{unsubscribeUrl}}',
            sample: 'https://example.com/unsubscribe'
          }
        ]
      };
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`} style={{
      margin: '0px !important',
      padding: '0px !important',
      boxSizing: 'border-box !important'
    }}>
      {/* Toolbar */}
      {!hideToolbar && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editorMode === 'page' ? 'Page Designer' : 'Email Designer'}
            </h3>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleHtmlView}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !editorReady}
              >
                {showHtml ? <Eye className="w-4 h-4 mr-2" /> : <Code className="w-4 h-4 mr-2" />}
                {showHtml ? 'Show Editor' : 'View HTML'}
              </button>
              
              {htmlContent && (
                <button
                  onClick={downloadHtml}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download HTML
                </button>
              )}
              
              {onSave && (
                <button
                  onClick={saveDesign}
                  className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !editorReady}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Editor Container */}
      <div className="flex-1 relative min-h-0 h-full" style={{
        margin: '0px !important',
        padding: '0px !important'
      }}>
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        )}
        
        {showHtml ? (
          <div className="h-full bg-gray-50 dark:bg-gray-900" style={{
            margin: '0px !important',
            padding: '16px !important'
          }}>
            <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="h-full">
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm border-none resize-none focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="HTML content will appear here..."
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full w-full" style={{
            margin: '0px !important',
            padding: '0px !important'
          }}>
            <EmailEditor
              ref={emailEditorRef}
              onReady={onReady}
              onLoad={onDesignLoad}
              style={{ 
                height: typeof height === 'string' && height.includes('calc') ? height : typeof height === 'string' && height.includes('%') ? '100vh' : height,
                width: '100%',
                minHeight: '600px',
                margin: '0px !important',
                padding: '0px !important'
              }}
              options={getEditorOptions()}
            />
          </div>
        )}
      </div>
    </div>
  );
});

UnlayerEmailEditor.displayName = 'UnlayerEmailEditor';

export default UnlayerEmailEditor;