// emailxp/frontend/src/pages/TemplateForm.js

import React, { useState, useEffect, useRef } from 'react';
import { Palette, Code, Type, Wand2, CheckCircle, X, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import FormField from '../components/ui/FormField';
import UnlayerEmailEditorModal from '../components/UnlayerEmailEditorModal';
import PageContainer from '../components/layout/PageContainer';
import templateService from '../services/templateService';
import { useNavigate, useParams } from 'react-router-dom';

const TemplateForm = () => {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [plainTextContent, setPlainTextContent] = useState('');
    const [emailDesign, setEmailDesign] = useState(null);
    const [showTextEditorModal, setShowTextEditorModal] = useState(false);
    const [modalTextContent, setModalTextContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showEmailEditor, setShowEmailEditor] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [editorType, setEditorType] = useState(null); // 'visual' or 'text'
    const [showEditorSelection, setShowEditorSelection] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const autosaveTimer = useRef(null);

    const navigate = useNavigate();
    const { id } = useParams(); // Get ID from URL if in edit mode

    // Fetch existing template data if in edit mode (ID exists)
    useEffect(() => {
        if (id) {
            const fetchTemplate = async () => {
                try {
                    setLoading(true);
                    const data = await templateService.getTemplateById(id);
                    setName(data.name);
                    setSubject(data.subject);
                    setHtmlContent(data.htmlContent);
                    // Show preview by default when loading existing template
                    if (data.htmlContent) setPreviewMode(true);
                    setPlainTextContent(data.plainTextContent || '');
                    setEmailDesign(data.emailDesign || null);
                    // Set editor type based on existing content
                    if (data.emailDesign) {
                        setEditorType('visual');
                    } else if (data.htmlContent) {
                        setEditorType('text');
                    }
                    setLoading(false);
                } catch (err) {
                    console.error('Error fetching template for edit:', err);
                    setError('Failed to load template for editing.');
                    setLoading(false);
                }
            };
            fetchTemplate();
        }
    }, [id]);

    const performSave = async (opts={navigateAfter:true, allowCreate:true}) => {
        if (!name || !subject) return; // minimal guard
        const templateData = { name, subject, htmlContent, plainTextContent, emailDesign };

        // Ensure saved data satisfies backend compliance for footer/unsubscribe.
        // If the drag-and-drop `structure` exists, make sure it contains a footer block.
        // If only `htmlContent` exists (visual editor output), append a minimal footer to the HTML
        // so the backend pre-validate accepts the template without overwriting the html content.
        const footerHtmlSnippet = `<footer style="font-size:12px;color:#666;padding:20px 0;text-align:center">You are receiving this email because you subscribed. <a href="{{unsubscribeUrl}}">Unsubscribe</a></footer>`;

        if (templateData.structure && Array.isArray(templateData.structure.blocks) && templateData.structure.blocks.length > 0) {
            const blocks = templateData.structure.blocks;
            const hasFooter = blocks.some(b => b && b.type === 'footer' && /\{\{\s*unsubscribeUrl\s*\}\}/i.test((b.content?.text || '') + ''));
            if (!hasFooter) {
                blocks.push({ id: `footer-${Date.now()}`, type: 'footer', content: { text: footerHtmlSnippet }, styles: {} });
            }
            templateData.structure.blocks = blocks;
        } else if (templateData.htmlContent && typeof templateData.htmlContent === 'string') {
            // If htmlContent is present (from visual editor), ensure it contains the unsubscribe token.
            if (!/\{\{\s*unsubscribeUrl\s*\}\}/i.test(templateData.htmlContent)) {
                // If there's a closing </body> tag, insert before it; otherwise append
                if (/<\/body>/i.test(templateData.htmlContent)) {
                    templateData.htmlContent = templateData.htmlContent.replace(/<\/body>/i, `${footerHtmlSnippet}</body>`);
                } else {
                    templateData.htmlContent = templateData.htmlContent + footerHtmlSnippet;
                }
            }
        } else {
            // No structure and no htmlContent: ensure structure exists with a footer so backend validation passes
            templateData.structure = { blocks: [{ id: `footer-${Date.now()}`, type: 'footer', content: { text: footerHtmlSnippet }, styles: {} }] };
        }
        let result = null;
        try {
            setSaving(true);
            if (id) {
                result = await templateService.updateTemplate(id, templateData);
            } else {
                // Only create when allowed (explicit submit). Autosave should not create new templates.
                if (opts.allowCreate) {
                    result = await templateService.createTemplate(templateData);
                } else {
                    // Skip creation during autosave for new templates
                    return null;
                }
            }
            setDirty(false);
            // Only navigate after a successful create/update
            if (!id && opts.navigateAfter) {
                navigate('/templates');
            }
            return result;
        } catch (err) {
            console.error('Autosave error:', err);
            // Re-throw so callers (like explicit form submit) can handle and show errors
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission

        // Basic validation
        if (!name || !subject) {
            setError('Please fill in template name and subject.');
            return;
        }

        if (!htmlContent && editorType) {
            setError('Please create some email content using the selected editor.');
            return;
        }

        setError(null); // Clear previous errors
        setSuccess(null); // Clear previous success messages
        setLoading(true);

        try {
            await performSave();
            setSuccess(id ? 'Template updated successfully!' : 'Template created successfully!');
            // After updating an existing template, navigate back to the templates list
            if (id) {
                navigate('/templates');
            }
            if (!id) {
                setName('');
                setSubject('');
                setHtmlContent('');
                setPlainTextContent('');
                setEmailDesign(null);
                setEditorType(null);
            }
        } catch (err) {
            // Handle Mongo duplicate key error (name uniqueness)
            const serverMsg = err.response?.data?.message;
            if (err?.response?.status === 500 && serverMsg && /duplicate key/i.test(serverMsg)) {
                setError('Template name already exists. Please choose a different name.');
                try { toast.error('Template name already exists. Please choose a different name.'); } catch (e) {}
            } else {
                setError(serverMsg || err.message || 'Failed to save template. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Email editor handlers
    const handleEmailEditorSave = (data) => {
        if (data.design) {
            setEmailDesign(data.design);
        }
        if (data.html) {
            setHtmlContent(data.html);
            // When user saves from the visual designer, show preview by default
            setPreviewMode(true);
        }
        toast.success('Email template saved successfully!');
        // Ensure modal is closed if still open
        setShowEmailEditor(false);
    };

    const markDirty = () => setDirty(true);
    const scheduleAutosave = () => {
        if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
        autosaveTimer.current = setTimeout(async () => {
            if (dirty) {
                    try {
                    await performSave({navigateAfter:false, allowCreate:false});
                } catch (err) {
                    console.error('Autosave failed:', err);
                    const msg = err?.response?.data?.message || err?.message || 'Autosave failed';
                    setError(msg);
                    try { toast.error(msg); } catch (e) { /* ignore */ }
                }
            }
        }, 1200);
    };

    useEffect(() => {
        if (dirty) scheduleAutosave();
        return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, subject, htmlContent, plainTextContent, emailDesign]);

    const handleEmailDesignChange = (design) => { setEmailDesign(design); markDirty(); };

    const handleEmailHtmlChange = (html) => { setHtmlContent(html); markDirty(); };

    const openEmailEditor = () => {
        if (editorType === 'visual') {
            setShowEmailEditor(true);
        } else if (editorType === 'text') {
            // Text editor is inline, no modal needed
            return;
        } else {
            setShowEditorSelection(true);
        }
    };

    const selectEditorType = (type) => {
    setEditorType(type); markDirty();
        setShowEditorSelection(false);
        if (type === 'visual') {
            setShowEmailEditor(true);
        }
        if (type === 'text') {
            // For new templates, open the rich text editor in a modal
            if (!id) {
                // initialize modal with current content
                setModalTextContent(htmlContent || '');
                setShowTextEditorModal(true);
            }
        }
    };

    const resetEditor = () => {
    setEditorType(null); markDirty();
        setHtmlContent('');
        setEmailDesign(null);
    };

    const togglePreview = () => {
        setPreviewMode(!previewMode);
    };

    // Ensure preview HTML includes a compliant footer with unsubscribeUrl
    const getPreviewHtml = () => {
        const raw = htmlContent || '';
        // Simple check for unsubscribe token
        const hasUnsubscribe = /\{\{\s*unsubscribeUrl\s*\}\}/i.test(raw);
        if (hasUnsubscribe) return raw;

        // Append a minimal footer if missing
    const footerHtml = `
<footer style="font-size:12px;color:#666;padding:20px 0;text-align:center">You are receiving this email because you subscribed. <a href="{{unsubscribeUrl}}">Unsubscribe</a></footer>`;

        // If there's a closing body tag, insert before it
        if (/</i.test(raw) && /<\/body>/i.test(raw)) {
            return raw.replace(/<\/body>/i, `${footerHtml}</body>`);
        }
        return raw + footerHtml;
    };

    if (loading && id) { // Only show loading when fetching existing template
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading template data...</p>
            </div>
        );
    }

    return (
        <PageContainer>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/templates')} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </button>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{id ? 'Edit Template' : 'Create Template'}</h1>
                    </div>
                    <div />
                </div>

                {/* Error and Success Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <div className="flex items-center">
                            <X className="w-5 h-5 text-red-500 mr-2" />
                            <p className="text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    </div>
                )}
                
                {success && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                            <p className="text-green-700 dark:text-green-300">{success}</p>
                        </div>
                    </div>
                )}

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Unified Card: Basic Information + Content Creation */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                                    <Type className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                Template Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField id="name" label="Template Name" required description="A descriptive internal name.">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => { setName(e.target.value); markDirty(); }}
                                        required
                                        placeholder="Enter template name..."
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                                    />
                                </FormField>
                                <FormField id="subject" label="Email Subject" required description="Visible to recipients.">
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => { setSubject(e.target.value); markDirty(); }}
                                        required
                                        placeholder="Enter email subject..."
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                                    />
                                </FormField>
                            </div>
                            <div className="mt-4 text-sm text-gray-500 flex items-center space-x-3">
                              {dirty && <span className="text-amber-600">Unsaved changes…</span>}
                              {saving && <span className="text-blue-600 flex items-center"><svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" fill="none"/></svg>Saving…</span>}
                              {!dirty && !saving && <span className="text-green-600">All changes saved</span>}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 p-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                                    <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                Email Content
                            </h2>

                            { !editorType ? (
                                <div className="space-y-6">
                                    <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                                        Choose how you'd like to create your email template
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div onClick={() => selectEditorType('visual')} className="cursor-pointer p-6 rounded-xl border">
                                            <h3 className="font-semibold">Visual Builder</h3>
                                            <p className="text-sm text-gray-500">Drag & drop components to create emails visually.</p>
                                        </div>
                                        <div onClick={() => selectEditorType('text')} className="cursor-pointer p-6 rounded-xl border">
                                            <h3 className="font-semibold">Text Editor</h3>
                                            <p className="text-sm text-gray-500">Rich text editor with HTML support.</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                                {editorType === 'visual' ? <Wand2 className="w-4 h-4 text-red-600" /> : <Code className="w-4 h-4 text-blue-600" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{editorType === 'visual' ? 'Visual Builder' : 'Text Editor'}</p>
                                                <p className="text-sm text-gray-500">{editorType === 'visual' ? 'Drag & drop email designer' : 'Rich text with HTML support'}</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={resetEditor} className="text-sm text-gray-500">Switch Editor</button>
                                    </div>

                                    {editorType === 'visual' ? (
                                        <div>
                                            <div className="flex items-center space-x-3 mb-4">
                                                <button type="button" onClick={openEmailEditor} className="px-4 py-2 bg-red-600 text-white rounded">Open Designer</button>
                                                {htmlContent && <button type="button" onClick={togglePreview} className="px-4 py-2 border rounded">{previewMode ? 'Show HTML' : 'Preview'}</button>}
                                            </div>
                                            {htmlContent ? (
                                                previewMode ? (
                                                    <div className="p-6" dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} />
                                                ) : (
                                                    <textarea value={htmlContent} readOnly className="w-full h-48 p-4" />
                                                )
                                            ) : (
                                                <div className="p-6 border-dashed border rounded text-center">No design yet</div>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <ReactQuill theme="snow" value={htmlContent} onChange={(v) => { setHtmlContent(v); markDirty(); }} style={{ minHeight: 300 }} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end pt-6">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {id ? 'Updating...' : 'Creating...'}
                                </div>
                            ) : (
                                id ? 'Update Template' : 'Create Template'
                            )}
                        </button>
                    </div>
                </form>
                {/* Editor Selection Modal */}
                {showEditorSelection && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Choose Your Editor
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Select the editing experience that works best for you
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Visual Editor */}
                                <div 
                                    onClick={() => selectEditorType('visual')}
                                    className="group cursor-pointer bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-700 rounded-xl p-6 hover:border-red-400 dark:hover:border-red-500 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-red-100 dark:bg-red-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                                            <Wand2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Visual Builder
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            Drag & drop interface with pre-built components
                                        </p>
                                    </div>
                                </div>

                                {/* Text Editor */}
                                <div 
                                    onClick={() => selectEditorType('text')}
                                    className="group cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                                            <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Text Editor
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            Rich text editor with HTML support
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center">
                                <button
                                    onClick={() => setShowEditorSelection(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Unlayer Email Editor Modal */}
                <UnlayerEmailEditorModal
                    isOpen={showEmailEditor}
                    onClose={() => setShowEmailEditor(false)}
                    initialDesign={emailDesign}
                    onSave={handleEmailEditorSave}
                    onDesignChange={handleEmailDesignChange}
                    onHtmlChange={handleEmailHtmlChange}
                />
                {/* Rich Text Editor Modal (for text editor flow on new templates) */}
                {showTextEditorModal && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm">
                        {/* Quill tweaks: ensure the Quill wrapper and its container/editor use full height so scrolling only appears when content overflows */}
                        <style>{`.template-text-editor, .template-text-editor .ql-editor { height: 100% !important; } .template-text-editor .ql-container { height: 95% !important; } .template-text-editor .ql-editor { min-height: 120px; max-height: calc(100vh - 300px); overflow: auto; }`}</style>
                        <div className="flex flex-col w-full h-full">
                            {/* Header */}
                            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Text Editor</h3>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => { setHtmlContent(modalTextContent); setShowTextEditorModal(false); markDirty(); }}
                                        className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Save
                                    </button>
                                    <button onClick={() => setShowTextEditorModal(false)} className="p-2 text-gray-500 hover:text-gray-700" aria-label="Close">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Editor area */}
                            <div className="p-6 flex-1 overflow-hidden bg-white dark:bg-gray-900">
                                <div className="h-full flex flex-col">
                                    <div className="flex-1 min-h-0">
                                        <ReactQuill
                                            theme="snow"
                                            value={modalTextContent}
                                            onChange={(val) => setModalTextContent(val)}
                                            className="template-text-editor"
                                            style={{ height: '100%' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer removed: Save/Close live in header */}
                        </div>
                    </div>
                )}

            </div>
        </PageContainer>

    );

};

export default TemplateForm;