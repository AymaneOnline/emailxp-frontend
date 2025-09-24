// Wizard scaffold for EnhancedCampaignBuilder
import React, { useCallback, useEffect, useState, useRef, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AudienceSelector from './AudienceSelector';
import audienceService from '../services/audienceService';
import campaignService from '../services/campaignService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Lazy load the Unlayer editor for better performance
const UnlayerEmailEditor = lazy(() => import('./UnlayerEmailEditor'));

const SetupAudienceStep = ({ data, onChange, showValidation = false }) => {
  const name = data.name || '';
  const from = data.from || '';
  const fromName = data.fromName || '';
  const subject = data.subject || '';

  const [touched, setTouched] = React.useState({ name: false, from: false, fromName: false, subject: false });

  const emailValid = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const nameError = !name && (touched.name || showValidation);
  const fromError = !from && (touched.from || showValidation);
  const fromInvalid = from && !emailValid(from) && (touched.from || showValidation);
  const subjectError = !subject && (touched.subject || showValidation);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Campaign Details Column */}
        <div className="space-y-6">
          {/* Campaign Details Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Campaign Details</h3>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign name</label>
                <input
                  required
                  aria-required="true"
                  aria-invalid={nameError}
                  value={name}
                  onChange={(e) => onChange({ name: e.target.value })}
                  onBlur={() => setTouched((s) => ({ ...s, name: true }))}
                  className={`block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 ${
                    nameError
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-red-500 focus:ring-red-500 hover:border-gray-300'
                  } focus:ring-2 focus:ring-opacity-20 bg-white`}
                  placeholder="My amazing campaign"
                />
                {nameError && <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Campaign name is required.
                </p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From address</label>
                <input
                  required
                  aria-required="true"
                  aria-invalid={fromError || fromInvalid}
                  value={from}
                  onChange={(e) => onChange({ from: e.target.value })}
                  onBlur={() => setTouched((s) => ({ ...s, from: true }))}
                  className={`block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 ${
                    fromError || fromInvalid
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-red-500 focus:ring-red-500 hover:border-gray-300'
                  } focus:ring-2 focus:ring-opacity-20 bg-white`}
                  placeholder="hello@yourcompany.com"
                />
                {fromError && <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  From address is required.
                </p>}
                {!fromError && fromInvalid && <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Please enter a valid email address.
                </p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From name <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  value={fromName}
                  onChange={(e) => onChange({ fromName: e.target.value })}
                  onBlur={() => setTouched((s) => ({ ...s, fromName: true }))}
                  className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:border-red-500 focus:ring-red-500 focus:ring-2 focus:ring-opacity-20 transition-all duration-200 hover:border-gray-300 bg-white"
                  placeholder="Your Company Name"
                />
                <p className="mt-2 text-sm text-gray-500">Display name that appears with the from address</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject line</label>
                <input
                  required
                  aria-required="true"
                  aria-invalid={subjectError}
                  value={subject}
                  onChange={(e) => onChange({ subject: e.target.value })}
                  onBlur={() => setTouched((s) => ({ ...s, subject: true }))}
                  className={`block w-full px-4 py-3 border-2 rounded-lg shadow-sm transition-all duration-200 ${
                    subjectError
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-red-500 focus:ring-red-500 hover:border-gray-300'
                  } focus:ring-2 focus:ring-opacity-20 bg-white`}
                  placeholder="Your special offer awaits!"
                />
                {subjectError && <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Subject line is required.
                </p>}
              </div>
            </div>
          </div>
        </div>

        {/* Recipients Column */}
        <div className="space-y-6">
          {/* Recipients Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Recipients</h3>
                <p className="text-sm text-gray-600 mt-1">Select who will receive this campaign</p>
              </div>
            </div>

            {/* Audience Section */}
            <AudienceSelector
              selectedGroups={data.groups || []}
              selectedSegments={data.segments || []}
              selectedIndividuals={data.subscribers || []}
              onSelectionChange={({ groups, segments, individuals }) => onChange({
                groups: groups || [],
                segments: segments || [],
                subscribers: individuals || []
              })}
              showRecipientCount={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ContentDesignStep = ({ data, onChange, editorRef }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState(null); // 'unlayer' or 'quill'
  const [selectedEditorType, setSelectedEditorType] = useState(data?.editorType || 'unlayer'); // 'unlayer' or 'quill'
  const [quillContent, setQuillContent] = useState(data?.htmlContent || '');
  const [showHtml, setShowHtml] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Debounced HTML export to avoid excessive calls
  const debounceTimerRef = useRef(null);

  // Memoize Quill modules to prevent unnecessary re-renders
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  // Memoize Quill formats
  const quillFormats = useMemo(() => [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'color', 'background', 'link', 'image'
  ], []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle modal close with cleanup
  const handleModalClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirm) return;
    }
    setShowModal(false);
    setSelectedEditor(null);
    setShowHtml(false);
    setHasUnsavedChanges(false);
    setIsLoading(false);
    // Clear auto-save on successful close
    if (!hasUnsavedChanges) {
      localStorage.removeItem('emailxp-autosave');
    }
  }, [hasUnsavedChanges]);

  const openQuillEditor = useCallback(() => {
    setSelectedEditor('quill');
    setShowModal(true);
  }, []);

  const handleEditorTypeChange = useCallback((editorType) => {
    if (editorType !== selectedEditorType) {
      // Clear content when switching editors to avoid conflicts
      onChange({ 
        htmlContent: '', 
        design: null, 
        editorType: editorType 
      });
      setQuillContent('');
      setHtmlContent('');
      setSelectedEditorType(editorType);
    }
  }, [selectedEditorType, onChange]);

  // Initialize editor type from data
  useEffect(() => {
    if (data?.editorType && data.editorType !== selectedEditorType) {
      setSelectedEditorType(data.editorType);
    }
  }, [data?.editorType, selectedEditorType]);

  const openPreviewModal = useCallback(async () => {
    if (selectedEditorType === 'unlayer' && editorRef.current) {
      // Export HTML from Unlayer editor before showing preview
      await editorRef.current.exportHtml();
    }
    setShowPreviewModal(true);
  }, [selectedEditorType, editorRef]);

  const closePreviewModal = useCallback(() => {
    setShowPreviewModal(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showPreviewModal && e.key === 'Escape') {
        closePreviewModal();
        return;
      }

      if (!showModal) return;

      if (e.key === 'Escape') {
        handleModalClose();
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          if (selectedEditor === 'quill') {
            handleQuillSave();
          } else if (selectedEditor === 'unlayer') {
            handleUnlayerSave();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal, showPreviewModal, selectedEditor, handleModalClose, closePreviewModal]);

  const handleSaveFromEditor = useCallback((payload) => {
    // payload: { design, html }
    onChange({ ...payload, htmlContent: payload.html, editorType: selectedEditorType });
    setShowModal(false);
    setHasUnsavedChanges(false);
  }, [onChange, selectedEditorType]);

  const handleQuillSave = useCallback(() => {
    onChange({ htmlContent: quillContent, editorType: selectedEditorType });
    setShowModal(false);
    setHasUnsavedChanges(false);
  }, [onChange, quillContent, selectedEditorType]);

  const toggleHtmlView = useCallback(() => {
    if (!showHtml && editorRef.current) {
      setIsLoading(true);
      editorRef.current.exportHtml();
      setTimeout(() => setIsLoading(false), 200);
    }
    setShowHtml(!showHtml);
  }, [showHtml, editorRef]);

  const downloadHtml = useCallback(() => {
    if (htmlContent) {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `email-template-${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [htmlContent]);

  const handleUnlayerSave = useCallback(async () => {
    if (editorRef.current) {
      setIsLoading(true);
      await editorRef.current.exportHtml();
      setIsLoading(false);
      setHasUnsavedChanges(false);
      // Note: onChange is called in handleUnlayerHtmlChange, so we don't need to call it here
    }
  }, [editorRef]);

  const openUnlayerEditor = useCallback(() => {
    setSelectedEditor('unlayer');
    setShowModal(true);
    setIsLoading(true);
    // Simulate loading time for better UX
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!showModal || selectedEditor !== 'quill' || !hasUnsavedChanges) return;

    const autoSaveInterval = setInterval(() => {
      // Auto-save Quill content every 30 seconds
      localStorage.setItem('emailxp-autosave', quillContent);
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [showModal, selectedEditor, hasUnsavedChanges, quillContent]);

  // Initialize content based on editor type
  useEffect(() => {
    if (data?.editorType === 'quill' && data?.htmlContent) {
      setQuillContent(data.htmlContent);
    } else if (data?.editorType === 'unlayer') {
      // For unlayer, content is managed by the editor component
      setQuillContent('');
    }
  }, [data?.editorType, data?.htmlContent]);

  // Handle content changes
  const handleQuillChange = useCallback((content) => {
    setQuillContent(content);
    setHasUnsavedChanges(true);
  }, []);

  const handleUnlayerHtmlChange = useCallback((html) => {
    setHtmlContent(html);
    onChange({ htmlContent: html, editorType: selectedEditorType });
    setHasUnsavedChanges(true);
  }, [onChange, selectedEditorType]);

  const handleUnlayerDesignChange = useCallback((design) => {
    onChange({ design });
    setHasUnsavedChanges(true);
  }, [onChange]);

  return (
    <>
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email Design Column */}
          <div className="space-y-6">
            {/* Email Design Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Email Design</h3>
                  <p className="text-sm text-gray-600 mt-1">Choose your email editor to compose your campaign content</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Editor Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">Choose Editor Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedEditorType === 'unlayer'
                        ? 'border-red-500 bg-red-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="editorType"
                        value="unlayer"
                        checked={selectedEditorType === 'unlayer'}
                        onChange={() => handleEditorTypeChange('unlayer')}
                        className="sr-only"
                      />
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                        selectedEditorType === 'unlayer' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-6 h-6 ${selectedEditorType === 'unlayer' ? 'text-red-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                      </div>
                      <span className={`text-sm font-medium ${selectedEditorType === 'unlayer' ? 'text-red-900' : 'text-gray-700'}`}>Drag & Drop Editor</span>
                      <span className="text-xs text-gray-500 text-center mt-1">Visual email builder</span>
                      {selectedEditorType === 'unlayer' && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                    <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedEditorType === 'quill'
                        ? 'border-red-500 bg-red-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="editorType"
                        value="quill"
                        checked={selectedEditorType === 'quill'}
                        onChange={() => handleEditorTypeChange('quill')}
                        className="sr-only"
                      />
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                        selectedEditorType === 'quill' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-6 h-6 ${selectedEditorType === 'quill' ? 'text-red-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className={`text-sm font-medium ${selectedEditorType === 'quill' ? 'text-red-900' : 'text-gray-700'}`}>Rich Text Editor</span>
                      <span className="text-xs text-gray-500 text-center mt-1">Classic text editor</span>
                      {selectedEditorType === 'quill' && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </label>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedEditorType === 'unlayer'
                      ? '✨ Visual email builder with drag-and-drop components and pre-built templates'
                      : '📝 Classic text editor with formatting options and HTML support'
                    }
                  </p>
                </div>

                {/* Editor Launch Button */}
                <div className="pt-2">
                  <button
                    onClick={selectedEditorType === 'unlayer' ? openUnlayerEditor : openQuillEditor}
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Open {selectedEditorType === 'unlayer' ? 'Drag & Drop' : 'Rich Text'} Editor
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Column */}
          <div className="space-y-6">
            {/* Preview Section */}
            {data?.htmlContent && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Preview</h3>
                    <p className="text-sm text-gray-600 mt-1">Preview your email before sending</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-green-900">
                        Content Ready ({data.editorType === 'unlayer' ? 'Drag & Drop Editor' : 'Rich Text Editor'})
                      </h4>
                      <p className="text-xs text-green-700 mt-1">Your email content is ready to send</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={openPreviewModal}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Full Preview
                </button>
              </div>
            )}

            {/* Empty state when no content */}
            {!data?.htmlContent && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Preview</h3>
                    <p className="text-sm text-gray-600 mt-1">Preview your email before sending</p>
                  </div>
                </div>
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No content to preview yet</h4>
                  <p className="text-gray-500 mb-4">Create your email content first using the editor</p>
                  <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Choose an editor type above
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full h-full bg-white flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              {selectedEditor === 'quill' && (
                <h2 className="text-xl font-semibold">Rich Text Editor</h2>
              )}
              {selectedEditor === 'unlayer' && (
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-gray-900">Email Designer</h3>
                </div>
              )}
              <div className="flex items-center gap-3">
                {selectedEditor === 'quill' && (
                  <>
                    <button
                      onClick={handleModalClose}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleQuillSave}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Save Content
                    </button>
                  </>
                )}
                {selectedEditor === 'unlayer' && (
                  <>
                    <button
                      onClick={toggleHtmlView}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      {showHtml ? 'Show Editor' : 'View HTML'}
                    </button>

                    {htmlContent && (
                      <button
                        onClick={downloadHtml}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download HTML
                      </button>
                    )}

                    <button
                      onClick={handleUnlayerSave}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                      )}
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>

                    <button
                      onClick={handleModalClose}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                      title="Close editor (Esc)"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden">
              {selectedEditor === 'unlayer' && (
                <Suspense fallback={
                  <div className="h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading Email Editor...</p>
                    </div>
                  </div>
                }>
                  {showHtml ? (
                    <div className="h-full bg-gray-50 p-6 overflow-auto">
                      <div className="bg-white border rounded-lg p-4">
                        <h4 className="text-lg font-medium mb-4">HTML Output</h4>
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-100 p-4 rounded border overflow-auto max-h-96">
                          {htmlContent || 'No HTML content available'}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <UnlayerEmailEditor
                      ref={editorRef}
                      initialDesign={data?.design || null}
                      onSave={handleSaveFromEditor}
                      onHtmlChange={handleUnlayerHtmlChange}
                      onDesignChange={handleUnlayerDesignChange}
                      height="100%"
                      hideToolbar={true}
                    />
                  )}
                </Suspense>
              )}

              {selectedEditor === 'quill' && (
                <div className="h-full p-6">
                  <ReactQuill
                    theme="snow"
                    value={quillContent}
                    onChange={handleQuillChange}
                    modules={quillModules}
                    formats={quillFormats}
                    style={{ height: 'calc(100% - 42px)' }}
                    placeholder="Start writing your email content..."
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Email Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="w-full h-full bg-white flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold">Email Preview</h2>
                <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  {data?.editorType === 'unlayer' ? 'Drag & Drop Editor' : 'Rich Text Editor'}
                </span>
              </div>
              <button
                onClick={closePreviewModal}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                title="Close preview (Esc)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Full Page Email Preview */}
            <div className="flex-1 overflow-auto">
              {/* Email Header Simulation - Full Width */}
              <div className="bg-gray-100 p-6 border-b">
                <div className="max-w-4xl mx-auto">
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>From:</strong> {data?.fromName || data?.name || 'Your Name'} &lt;{data?.from || 'your@email.com'}&gt;</div>
                    <div><strong>To:</strong> recipient@example.com</div>
                    <div><strong>Subject:</strong> {data?.subject || 'Your campaign subject'}</div>
                  </div>
                </div>
              </div>

              {/* Email Content - Full Page */}
              <div className="bg-white min-h-full">
                {data?.htmlContent ? (
                  <div className="max-w-4xl mx-auto p-6">
                    <div
                      className="email-content bg-white shadow-sm border rounded-lg p-8 min-h-[800px]"
                      dangerouslySetInnerHTML={{ __html: data.htmlContent }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center min-h-[600px]">
                    <div className="text-center text-gray-500">
                      <svg className="w-24 h-24 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium mb-2">No content to preview yet</p>
                      <p className="text-sm">Create your email content using the editor above.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ScheduleReviewStep = ({ data, onChange }) => {
  const [previewSamples, setPreviewSamples] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTotal, setPreviewTotal] = useState(null);
  const [sendOption, setSendOption] = useState(data?.scheduledAt ? 'later' : 'now');
  const [scheduledDate, setScheduledDate] = useState(
    data?.scheduledAt ? new Date(data.scheduledAt).toISOString().slice(0, 16) : ''
  );

  const loadSample = async () => {
    setPreviewLoading(true);
    try {
      const resp = await audienceService.sample({ groups: data.groups || [], segments: data.segments || [], subscribers: data.subscribers || [], limit: 10 });
      setPreviewSamples(resp.sample || []);
      setPreviewTotal(resp.total != null ? resp.total : null);
    } catch (err) {
      console.error('Failed to load audience sample', err);
      setPreviewSamples([]);
      setPreviewTotal(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    loadSample();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.groups, data.segments, data.subscribers]);

  // Update campaign data when send option changes
  useEffect(() => {
    if (sendOption === 'now') {
      onChange({ scheduledAt: null });
    } else if (sendOption === 'later' && scheduledDate) {
      onChange({ scheduledAt: new Date(scheduledDate) });
    }
  }, [sendOption, scheduledDate, onChange]);

  const handleSendOptionChange = (option) => {
    setSendOption(option);
  };

  const handleDateChange = (e) => {
    setScheduledDate(e.target.value);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Review Column */}
        <div className="space-y-6">
          {/* Review Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Review</h3>
                <p className="text-sm text-gray-600 mt-1">Summary and final checks before send</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-md font-semibold text-blue-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Campaign Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Campaign:</span>
                    <span className="font-medium text-gray-900">{data.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">From:</span>
                    <span className="font-medium text-gray-900">{data.fromName || ''} &lt;{data.from}&gt;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subject:</span>
                    <span className="font-medium text-gray-900">{data.subject}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-md font-semibold text-green-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Recipients
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subscribers:</span>
                    <span className="font-medium text-gray-900">{data.subscribers ? data.subscribers.length : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Segments:</span>
                    <span className="font-medium text-gray-900">{data.segments ? data.segments.length : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Groups:</span>
                    <span className="font-medium text-gray-900">{data.groups ? data.groups.length : 0}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-green-900">Sample recipients</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">Up to 10 shown</span>
                      <button onClick={loadSample} className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-green-200 p-3 max-h-40 overflow-auto">
                    {previewLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-2"></div>
                        <span className="text-sm text-gray-600">Loading sample recipients...</span>
                      </div>
                    ) : previewSamples.length ? (
                      <ul className="space-y-2 text-sm">
                        {previewSamples.map((s) => (
                          <li key={s._id || s.id} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded">
                            <span className="font-medium text-gray-900">{s.email}</span>
                            <span className="text-xs text-gray-600">{[s.firstName, s.lastName].filter(Boolean).join(' ')}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-4 text-sm text-gray-500">No sample recipients available.</div>
                    )}
                  </div>

                  {previewTotal != null && (
                    <div className="mt-3 p-3 bg-green-100 rounded-lg">
                      <div className="text-sm text-green-800 font-medium text-center">
                        📊 Total deduped recipients: <strong className="text-green-900">{previewTotal.toLocaleString()}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Column */}
        <div className="space-y-6">
          {/* Schedule Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Schedule</h3>
                <p className="text-sm text-gray-600 mt-1">Choose when to send your campaign</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Send Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">When to send</label>
                <div className="space-y-3">
                  {/* Send Now Option */}
                  <div className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    sendOption === 'now'
                      ? 'border-red-500 bg-red-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      id="send-now"
                      name="send-option"
                      type="radio"
                      checked={sendOption === 'now'}
                      onChange={() => handleSendOptionChange('now')}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                      sendOption === 'now' ? 'border-red-500 bg-red-500' : 'border-gray-300'
                    }`}>
                      {sendOption === 'now' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label htmlFor="send-now" className={`block text-sm font-medium cursor-pointer ${
                        sendOption === 'now' ? 'text-red-900' : 'text-gray-700'
                      }`}>
                        Send immediately
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Campaign will be sent right after you click send</p>
                    </div>
                    {sendOption === 'now' && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Send Later Option */}
                  <div className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    sendOption === 'later'
                      ? 'border-red-500 bg-red-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input
                      id="send-later"
                      name="send-option"
                      type="radio"
                      checked={sendOption === 'later'}
                      onChange={() => handleSendOptionChange('later')}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                      sendOption === 'later' ? 'border-red-500 bg-red-500' : 'border-gray-300'
                    }`}>
                      {sendOption === 'later' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label htmlFor="send-later" className={`block text-sm font-medium cursor-pointer ${
                        sendOption === 'later' ? 'text-red-900' : 'text-gray-700'
                      }`}>
                        Schedule for later
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Choose a specific date and time to send</p>
                    </div>
                    {sendOption === 'later' && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date/Time Picker for Send Later */}
                {sendOption === 'later' && (
                  <div className="mt-4 ml-8">
                    <label htmlFor="scheduled-date" className="block text-sm font-medium text-gray-700 mb-3">
                      Select date and time
                    </label>
                    <div className="relative">
                      <input
                        type="datetime-local"
                        id="scheduled-date"
                        value={scheduledDate}
                        onChange={handleDateChange}
                        min={new Date().toISOString().slice(0, 16)}
                        className="block w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:border-red-500 focus:ring-red-500 focus:ring-2 focus:ring-opacity-20 transition-all duration-200 hover:border-gray-300 bg-white"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    {scheduledDate && new Date(scheduledDate) <= new Date() && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Please select a future date and time.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Schedule Summary */}
              <div className={`p-4 rounded-lg border transition-all duration-200 ${
                sendOption === 'now'
                  ? 'bg-green-50 border-green-200'
                  : sendOption === 'later' && scheduledDate && new Date(scheduledDate) > new Date()
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <h4 className={`text-sm font-medium mb-2 flex items-center ${
                  sendOption === 'now'
                    ? 'text-green-900'
                    : sendOption === 'later' && scheduledDate && new Date(scheduledDate) > new Date()
                    ? 'text-blue-900'
                    : 'text-gray-900'
                }`}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Schedule Summary
                </h4>
                <p className={`text-sm ${
                  sendOption === 'now'
                    ? 'text-green-700'
                    : sendOption === 'later' && scheduledDate && new Date(scheduledDate) > new Date()
                    ? 'text-blue-700'
                    : 'text-gray-600'
                }`}>
                  {sendOption === 'now'
                    ? '🚀 Your campaign will be sent immediately after you click "Send Campaign".'
                    : sendOption === 'later' && scheduledDate && new Date(scheduledDate) > new Date()
                    ? `📅 Your campaign will be sent on ${new Date(scheduledDate).toLocaleDateString()} at ${new Date(scheduledDate).toLocaleTimeString()}.`
                    : '⏰ Please select a date and time for your campaign.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const stepsMeta = [
  { id: 'setup-audience', title: 'Details', component: SetupAudienceStep },
  { id: 'content-design', title: 'Content', component: ContentDesignStep },
  { id: 'schedule-review', title: 'Review & Schedule', component: ScheduleReviewStep },
];

const EnhancedCampaignBuilder = ({ campaignId, onCancel = () => {}, onDirtyChange, fullscreenModal = false, showBreadcrumbs = false, onSave: onSaveProp }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [campaignData, setCampaignData] = useState(() => ({}));
  const [dirty, setDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showSetupValidation, setShowSetupValidation] = useState(false);
  const navigate = useNavigate();
  const editorRef = useRef(null);

  useEffect(() => {
    if (typeof onDirtyChange === 'function') onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  // Load existing campaign data if editing
  useEffect(() => {
    if (campaignId) {
      const loadCampaign = async () => {
        try {
          const campaign = await campaignService.getCampaignById(campaignId);
          // Map backend fields to frontend fields
          const mappedData = {
            ...campaign,
            from: campaign.fromEmail,
            subscribers: campaign.individualSubscribers || [],
            design: campaign.design, // Load the Unlayer design data
          };
          setCampaignData(mappedData);
        } catch (error) {
          console.error('Failed to load campaign:', error);
          toast.error('Failed to load campaign data');
        }
      };
      loadCampaign();
    }
  }, [campaignId]);

  const CurrentStepComponent = useMemo(() => stepsMeta[currentIndex].component, [currentIndex]);

  const goNext = useCallback(() => {
    // Validate Setup & Audience step before advancing
    if (currentIndex === 0) {
      const emailValid = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const setupOk = !!(campaignData.name && campaignData.from && campaignData.subject && emailValid(campaignData.from));
      if (!setupOk) {
        setShowSetupValidation(true);
        toast.error('Please fill in all required fields in Setup.');
        return;
      }

      // Check audience selection
      const subs = campaignData.subscribers || [];
      const segs = campaignData.segments || [];
      const groups = campaignData.groups || [];
      const hasRecipients = subs.length > 0 || segs.length > 0 || groups.length > 0;

      if (!hasRecipients) {
        toast.error('Please select recipients in the Audience section.');
        return;
      }
    }

    // Validate Review & Schedule step before allowing save
    if (currentIndex === 2) {
      // Check if send later is selected but no date is chosen
      if (campaignData.scheduledAt && new Date(campaignData.scheduledAt) <= new Date()) {
        toast.error('Please select a future date and time for sending your campaign.');
        return;
      }
    }

    setCurrentIndex((i) => Math.min(stepsMeta.length - 1, i + 1));
  }, [currentIndex, campaignData]);

  const goBack = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const goToStep = useCallback((targetIndex) => {
    // Allow going back to previous steps
    if (targetIndex < currentIndex) {
      setCurrentIndex(targetIndex);
      return;
    }

    // For going forward, validate each step up to the target
    for (let i = 0; i < targetIndex; i++) {
      if (i === 0) {
        const emailValid = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        const setupOk = !!(campaignData.name && campaignData.from && campaignData.subject && emailValid(campaignData.from));
        if (!setupOk) {
          setShowSetupValidation(true);
          toast.error('Please complete the Setup & Audience step first.');
          return;
        }

        // Check audience selection
        const subs = campaignData.subscribers || [];
        const segs = campaignData.segments || [];
        const groups = campaignData.groups || [];
        const hasRecipients = subs.length > 0 || segs.length > 0 || groups.length > 0;
        if (!hasRecipients) {
          toast.error('Please select recipients in the Audience section.');
          return;
        }
      }
      // Add validation for other steps if needed
    }

    setCurrentIndex(targetIndex);
  }, [currentIndex, campaignData]);

  const updateCampaign = useCallback((patch) => {
    setCampaignData((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }, []);

  const canAdvance = useMemo(() => {
    if (currentIndex === 0) {
      const emailValid = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const setupOk = !!(campaignData.name && campaignData.from && campaignData.subject && emailValid(campaignData.from));
      if (!setupOk) return false;

      // Check audience selection - require at least one recipient from any category
      const subs = campaignData.subscribers || [];
      const segs = campaignData.segments || [];
      const groups = campaignData.groups || [];
      const hasRecipients = subs.length > 0 || segs.length > 0 || groups.length > 0;
      return hasRecipients;
    }

    // For Review & Schedule step, validate scheduling
    if (currentIndex === 2) {
      // If scheduledAt exists, it must be in the future
      if (campaignData.scheduledAt && new Date(campaignData.scheduledAt) <= new Date()) {
        return false;
      }
      return true;
    }

    return true;
  }, [currentIndex, campaignData]);

  const onSave = useCallback(async () => {
    try {
      // legacy manual recipients guard removed per request

      const hasSubscribers = campaignData.subscribers && Array.isArray(campaignData.subscribers) && campaignData.subscribers.length > 0;
      const hasSegments = campaignData.segments && Array.isArray(campaignData.segments) && campaignData.segments.length > 0;
      const hasGroups = campaignData.groups && Array.isArray(campaignData.groups) && campaignData.groups.length > 0;
      if (!hasSubscribers && !hasSegments && !hasGroups) {
        toast.error('Please select recipients by choosing subscribers or segments in the Audience step before saving.');
        setCurrentIndex(1);
        return;
      }
      // If we're on the Content step or have an editor ref, attempt to export latest html/design
      // Note: Design and htmlContent are already updated when user saves in the editor modal

      // Map frontend field names to backend expected names
      const mappedData = {
        ...campaignData,
        fromEmail: campaignData.from,
        fromName: campaignData.fromName || campaignData.name, // Use campaign name as fallback for fromName
        individuals: campaignData.subscribers || [], // Map subscribers to individuals for backend
      };
      // Remove the frontend-only fields
      delete mappedData.from;
      delete mappedData.subscribers;

      if (campaignId) {
        await campaignService.updateCampaign(campaignId, mappedData);
        toast.success('Campaign updated');
      } else {
        await campaignService.createCampaign(mappedData);
        toast.success('Campaign created');
      }
      setDirty(false);
      if (typeof onSaveProp === 'function') onSaveProp(campaignData);
      navigate('/campaigns');
    } catch (err) {
      console.error('Failed to save campaign', err);
      toast.error(err.response?.data?.message || 'Failed to save campaign');
    }
  }, [campaignId, campaignData, navigate, onSaveProp]);

  const onSend = useCallback(async () => {
    try {
      // First ensure the campaign is saved
      const hasSubscribers = campaignData.subscribers && Array.isArray(campaignData.subscribers) && campaignData.subscribers.length > 0;
      const hasSegments = campaignData.segments && Array.isArray(campaignData.segments) && campaignData.segments.length > 0;
      const hasGroups = campaignData.groups && Array.isArray(campaignData.groups) && campaignData.groups.length > 0;
      if (!hasSubscribers && !hasSegments && !hasGroups) {
        toast.error('Please select recipients by choosing subscribers or segments in the Audience step before sending.');
        setCurrentIndex(1);
        return;
      }

      // Map frontend field names to backend expected names
      const mappedData = {
        ...campaignData,
        fromEmail: campaignData.from,
        fromName: campaignData.fromName || campaignData.name,
        individuals: campaignData.subscribers || [],
      };
      delete mappedData.from;
      delete mappedData.subscribers;

      // Save the campaign first if it's new or has changes
      let finalCampaignId = campaignId;
      if (!campaignId || dirty) {
        if (campaignId) {
          await campaignService.updateCampaign(campaignId, mappedData);
        } else {
          const created = await campaignService.createCampaign(mappedData);
          finalCampaignId = created._id;
        }
        setDirty(false);
      }

      // Now send the campaign
      await campaignService.sendCampaign(finalCampaignId);
      toast.success('Campaign sent successfully!');
      navigate('/campaigns');
    } catch (err) {
      console.error('Failed to send campaign', err);
      toast.error(err.response?.data?.message || 'Failed to send campaign');
    }
  }, [campaignId, campaignData, dirty, navigate]);

  const handleCancel = useCallback(() => {
    if (dirty) {
      setShowDiscardConfirm(true);
      return;
    }
    onCancel();
  }, [dirty, onCancel]);

  const confirmDiscard = useCallback(() => {
    setShowDiscardConfirm(false);
    onCancel();
  }, [onCancel]);

  const cancelDiscard = useCallback(() => {
    setShowDiscardConfirm(false);
  }, []);

  return (
  <div className={fullscreenModal ? 'w-full h-full' : 'max-w-7xl mx-auto'}>
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumbs + title row when page-level header is present */}
            <div className="flex items-center gap-4">
              {!showBreadcrumbs && (
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Create Campaign</h2>
                </div>
              )}

              {showBreadcrumbs && (
                <nav aria-label="Breadcrumb">
                  <div className="text-sm breadcrumbs">
                    <ul className="flex items-center gap-2">
                      {stepsMeta.map((s, idx) => (
                        <li key={s.id} className={`inline-flex items-center ${idx === currentIndex ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                          {idx === currentIndex ? (
                            <span className="flex items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                                idx === 0 ? 'bg-red-100 text-red-600' :
                                idx === 1 ? 'bg-blue-100 text-blue-600' :
                                'bg-green-100 text-green-600'
                              }`}>
                                {idx + 1}
                              </div>
                              {s.title}
                            </span>
                          ) : (
                            <button type="button" onClick={() => goToStep(idx)} className="hover:underline focus:outline-none flex items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                                idx === 0 ? 'bg-red-100 text-red-600' :
                                idx === 1 ? 'bg-blue-100 text-blue-600' :
                                'bg-green-100 text-green-600'
                              }`}>
                                {idx + 1}
                              </div>
                              {s.title}
                            </button>
                          )}
                          {idx < stepsMeta.length - 1 && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </nav>
              )}
            </div>

            <div>
              {showBreadcrumbs ? (
                <button onClick={onSave} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-sm hover:shadow-md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save
                </button>
              ) : (
                <button onClick={handleCancel} className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Discard confirmation modal - modern design */}
        {showDiscardConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Discard changes?</h3>
                    <p className="text-red-100 mt-1">This action cannot be undone</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-6">You have unsaved changes that will be lost if you continue. Are you sure you want to discard them and exit?</p>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={cancelDiscard}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    Keep editing
                  </button>
                  <button
                    onClick={confirmDiscard}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                  >
                    Discard changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="min-h-[400px] px-6 py-8">
          <CurrentStepComponent data={campaignData} onChange={updateCampaign} editorRef={editorRef} showValidation={showSetupValidation} />
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={goBack}
                disabled={currentIndex === 0}
                className={`inline-flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${
                  currentIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm border border-gray-200'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            </div>
            <div className="flex items-center space-x-3">
              {currentIndex === stepsMeta.length - 1 ? (
                <button
                  onClick={onSend}
                  disabled={!canAdvance}
                  className={`inline-flex items-center px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                    !canAdvance
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Campaign
                </button>
              ) : (
                <button
                  onClick={goNext}
                  disabled={!canAdvance}
                  className={`inline-flex items-center px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                    !canAdvance
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                  }`}
                >
                  Next
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              {!showBreadcrumbs && (
                <button
                  onClick={onSave}
                  className="inline-flex items-center px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 hover:shadow-sm border border-gray-200 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Draft
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCampaignBuilder;