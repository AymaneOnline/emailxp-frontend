// UnlayerEmailEditorModal.js - Full-screen modal wrapper for Unlayer React Email Editor

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Code, Download, Save, Palette, File, Type } from 'lucide-react';
import { toast } from 'react-toastify';
import UnlayerEmailEditor from './UnlayerEmailEditor';
import unlayerTemplateService from '../services/unlayerTemplateService';

const UnlayerEmailEditorModal = ({ 
  isOpen,
  onClose,
  initialDesign = null,
  onSave,
  onDesignChange,
  onHtmlChange
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentView, setCurrentView] = useState('design'); // 'design', 'json', 'html', 'plaintext'
  const [htmlContent, setHtmlContent] = useState('');
  const [jsonContent, setJsonContent] = useState('');
  const [plainTextContent, setPlainTextContent] = useState('');
  const [editorReady, setEditorReady] = useState(false);
  const editorComponentRef = useRef(null);

  // Helper function to generate plain text from design JSON
  const generatePlainTextFromDesign = (design) => {
    if (!design || !design.body || !design.body.rows) {
      return 'No content available';
    }

    let plainText = '';
    
    try {
      design.body.rows.forEach(row => {
        if (row.columns && Array.isArray(row.columns)) {
          row.columns.forEach(column => {
            if (column.contents && Array.isArray(column.contents)) {
              column.contents.forEach(content => {
                // Handle modern Unlayer paragraph elements with textJson
                if (content.type === 'paragraph' && content.values && content.values.textJson) {
                  try {
                    const textJsonData = JSON.parse(content.values.textJson);
                    const extractedText = extractTextFromLexical(textJsonData);
                    if (extractedText) {
                      plainText += extractedText + '\n\n';
                    }
                  } catch (e) {
                    console.warn('Error parsing textJson:', e);
                  }
                }
                // Handle legacy text elements
                else if (content.type === 'text' && content.values && content.values.text) {
                  const textContent = content.values.text.replace(/<[^>]*>/g, '').trim();
                  if (textContent) {
                    plainText += textContent + '\n\n';
                  }
                }
                // Handle button elements
                else if (content.type === 'button' && content.values) {
                  let buttonText = '';
                  if (content.values.text) {
                    buttonText = content.values.text.replace(/<[^>]*>/g, '').trim();
                  } else if (content.values.textJson) {
                    try {
                      const textJsonData = JSON.parse(content.values.textJson);
                      buttonText = extractTextFromLexical(textJsonData);
                    } catch (e) {
                      console.warn('Error parsing button textJson:', e);
                    }
                  }
                  if (buttonText) {
                    plainText += `[${buttonText}]\n\n`;
                  }
                }
                // Handle image elements
                else if (content.type === 'image' && content.values && content.values.altText) {
                  plainText += `[Image: ${content.values.altText}]\n\n`;
                }
              });
            }
          });
        }
      });
    } catch (error) {
      console.error('Error extracting plain text from design:', error);
      return 'Error processing design content';
    }
    
    return plainText.trim() || 'No text content found in design';
  };

  // Helper function to extract text from Lexical editor format
  const extractTextFromLexical = (lexicalData) => {
    if (!lexicalData || !lexicalData.root || !lexicalData.root.children) {
      return '';
    }

    let text = '';
    
    const processNode = (node) => {
      if (node.type === 'paragraph' && node.children) {
        node.children.forEach(child => {
          if (child.type === 'extended-text' && child.text) {
            text += child.text + ' ';
          } else if (child.children) {
            child.children.forEach(processNode);
          }
        });
        text += '\n';
      } else if (node.type === 'extended-text' && node.text) {
        text += node.text + ' ';
      } else if (node.children) {
        node.children.forEach(processNode);
      }
    };

    lexicalData.root.children.forEach(processNode);
    
    return text.trim();
  };

  // Fallback function to generate plain text from HTML
  const generatePlainTextFromHtml = (html) => {
    if (!html) return 'No content available';
    
    try {
      // Create a temporary DOM element to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Remove script and style elements
      const scripts = tempDiv.querySelectorAll('script, style');
      scripts.forEach(el => el.remove());
      
      // Get text content and clean it up
      let plainText = tempDiv.textContent || tempDiv.innerText || '';
      
      // Clean up the text more thoroughly
      plainText = plainText
        .replace(/Content Block/g, '')              // Remove placeholder text
        .replace(/\s+/g, ' ')                      // Replace multiple spaces with single space
        .replace(/([A-Z])\s+([A-Z])\s+([A-Z])/g, '$1$2$3')  // Fix spaced out words like "T H A N K S"
        .replace(/([a-zA-Z])\s+([a-zA-Z])\s+([a-zA-Z])\s+([a-zA-Z])/g, '$1$2$3$4')  // Fix longer spaced words
        .replace(/\n\s*\n/g, '\n\n')                // Normalize double line breaks
        .replace(/^\s+|\s+$/gm, '')                // Trim whitespace from start and end of lines
        .trim();
      
      return plainText || 'No text content found in HTML';
    } catch (error) {
      console.error('Error extracting plain text from HTML:', error);
      return 'Error processing HTML content';
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Initialize JSON content with initial design
      if (initialDesign) {
        setJsonContent(JSON.stringify(initialDesign, null, 2));
        
        // Generate initial HTML content from design
        const generatedHtml = unlayerTemplateService.generateComprehensiveHtml(initialDesign);
        setHtmlContent(generatedHtml);
        
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
  }, [isOpen, initialDesign]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 150); // Wait for animation to complete
  };

  const handleSave = (data) => {
    if (onSave) {
      onSave(data);
    }
    handleClose();
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
    a.download = 'email-template.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('HTML downloaded successfully!');
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
            Email Designer
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
              className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Use a portal to render the modal at the document body level to avoid parent container positioning issues
  return createPortal(modalContent, document.body);
};

UnlayerEmailEditorModal.displayName = 'UnlayerEmailEditorModal';

export default UnlayerEmailEditorModal;