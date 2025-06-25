// emailxp/frontend/src/pages/CampaignForm.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import campaignService from '../services/campaignService';
import listService from '../services/listService';
import templateService from '../services/templateService';
import axios from 'axios';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function CampaignForm() {
    const { id: campaignId } = useParams();
    const navigate = useNavigate();

    const isEditing = !!campaignId;

    const quillRef = useRef(null);
    const fileInputRef = useRef(null); // Ref for the hidden file input

    const [campaignData, setCampaignData] = useState({
        name: '',
        subject: '',
        list: '',
        htmlContent: '',
        scheduledAt: '',
        status: 'draft',
        template: ''
    });
    const [lists, setLists] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Custom image handler for Quill
    const imageHandler = useCallback(() => {
        console.log('[CampaignForm] imageHandler triggered.');
        if (fileInputRef.current) {
            fileInputRef.current.click(); // Trigger the hidden file input click
            console.log('[CampaignForm] Hidden file input triggered.');
        } else {
            console.warn('[CampaignForm] fileInputRef.current is null. File input not ready.');
        }
    }, []);

    // Function to handle file selection from the hidden input
    const handleFileChange = useCallback(async (event) => {
        console.log('[CampaignForm] handleFileChange triggered.');
        const file = event.target.files ? event.target.files[0] : null;

        // Declare editor, range, and tempText at a higher scope within this function
        let editor;
        let range;
        let tempText;

        if (!file) {
            console.warn('[CampaignForm] No file selected or file is null after selection.');
            return;
        }
        console.log(`[CampaignForm] File selected: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const API_UPLOAD_URL = process.env.REACT_APP_BACKEND_URL ?
                                 `${process.env.REACT_APP_BACKEND_URL}/api/upload/image` :
                                 'http://localhost:5000/api/upload/image';

            console.log(`[CampaignForm] Attempting to upload to: ${API_UPLOAD_URL}`);

            const user = JSON.parse(localStorage.getItem('user'));
            const authHeader = user && user.token ? `Bearer ${user.token}` : '';
            if (!authHeader) {
                console.error('[CampaignForm] User token not found. Cannot upload image without authentication.');
                setError('Authentication token missing. Please log in again.');
                return;
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: authHeader,
                },
            };

            editor = quillRef.current.getEditor(); // Assign editor here
            range = editor.getSelection();         // Assign range here
            tempText = 'Uploading image...';      // Assign tempText here

            editor.insertText(range.index, tempText);
            editor.setSelection(range.index + tempText.length);

            console.log('[CampaignForm] Sending axios POST request for image upload...');
            const response = await axios.post(API_UPLOAD_URL, formData, config);
            console.log('[CampaignForm] Image upload response received:', response.data);
            const imageUrl = response.data.imageUrl;

            editor.deleteText(range.index, tempText.length);
            editor.insertEmbed(range.index, 'image', imageUrl);
            editor.setSelection(range.index + 1);
            
            setSuccessMessage('Image uploaded and inserted successfully!');

        } catch (uploadError) {
            console.error('[CampaignForm] Error during image upload (catch block):', uploadError.response?.data || uploadError.message || uploadError);
            setError(uploadError.response?.data?.message || 'Failed to upload image. Please try again.');
            
            // Only attempt to remove tempText if editor, range, and tempText were successfully defined
            if (editor && range && tempText) {
                // Ensure tempText removal handles cases where cursor moved
                editor.deleteText(range.index, tempText.length); // Delete from original insertion point
            }
        } finally {
            // Reset the file input value to allow uploading the same file again
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
        }
    }, []); // Dependencies for useCallback

    const quillModules = {
        toolbar: {
            container: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
    };

    const quillFormats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video'
    ];

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [fetchedLists, fetchedTemplates] = await Promise.all([
                listService.getLists(),
                templateService.getTemplates()
            ]);
            setLists(fetchedLists);
            setTemplates(fetchedTemplates);

            if (isEditing) {
                const campaignToEdit = await campaignService.getCampaignById(campaignId);
                setCampaignData({
                    name: campaignToEdit.name || '',
                    subject: campaignToEdit.subject || '',
                    list: campaignToEdit.list?._id || '',
                    htmlContent: campaignToEdit.htmlContent || '',
                    scheduledAt: campaignToEdit.scheduledAt ? new Date(campaignToEdit.scheduledAt).toISOString().slice(0, 16) : '',
                    status: campaignToEdit.status || 'draft',
                    template: campaignToEdit.template?._id || ''
                });
            }
        } catch (err) {
            console.error('Error fetching data for campaign form:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to load form data. Please try again.');
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('user');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [campaignId, isEditing, navigate]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCampaignData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuillChange = (content) => {
        setCampaignData(prev => ({ ...prev, htmlContent: content }));
    };

    const handleApplyTemplate = (e) => {
        const selectedTemplateId = e.target.value;
        const selectedTemplate = templates.find(t => t._id === selectedTemplateId);
        if (selectedTemplate) {
            setCampaignData(prev => ({
                ...prev,
                template: selectedTemplateId,
                htmlContent: selectedTemplate.htmlContent
            }));
        } else {
            setCampaignData(prev => ({
                ...prev,
                template: '',
                htmlContent: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage(null);
        setError(null);
        setIsSubmitting(true);

        if (!campaignData.name || !campaignData.subject || !campaignData.list || !campaignData.htmlContent) {
            setError('Please fill in all required fields (Name, Subject, Target List, Email Content).');
            setIsSubmitting(false);
            return;
        }

        let newStatus = campaignData.status;
        if (campaignData.scheduledAt && new Date(campaignData.scheduledAt) > new Date()) {
            newStatus = 'scheduled';
        } else if (newStatus === 'scheduled' && !campaignData.scheduledAt) {
            newStatus = 'draft';
        }
        if (newStatus !== 'scheduled' && campaignData.status !== 'sent' && campaignData.status !== 'sending' && campaignData.status !== 'failed' && campaignData.status !== 'cancelled') {
            newStatus = 'draft';
        }

        const payload = {
            ...campaignData,
            status: newStatus,
            list: campaignData.list || null,
            template: campaignData.template || null,
            scheduledAt: campaignData.scheduledAt ? new Date(campaignData.scheduledAt).toISOString() : null,
        };

        try {
            if (isEditing) {
                await campaignService.updateCampaign(campaignId, payload);
                setSuccessMessage('Campaign updated successfully!');
            } else {
                await campaignService.createCampaign(payload);
                setSuccessMessage('Campaign created successfully!');
            }
            setTimeout(() => {
                navigate('/campaigns');
            }, 1500);
        } catch (err) {
            console.error('Error saving campaign:', err.response?.data || err.message);
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} campaign.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading campaign form...</p>
            </div>
        );
    }

    return (
        <div className="main-content-container">
            <h2 className="section-header-no-btn">{isEditing ? 'Edit Campaign' : 'Create New Campaign'}</h2>

            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            <form onSubmit={handleSubmit} className="form-grid-layout">
                <div className="form-column">
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">Campaign Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={campaignData.name}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="subject" className="form-label">Subject:</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={campaignData.subject}
                            onChange={handleInputChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="list" className="form-label">Target List:</label>
                        <select
                            id="list"
                            name="list"
                            value={campaignData.list}
                            onChange={handleInputChange}
                            required
                            className="form-input form-select"
                        >
                            <option value="">Select a List</option>
                            {lists.map(list => (
                                <option key={list._id} value={list._id}>{list.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="template" className="form-label">Apply Template:</label>
                        <select
                            id="template"
                            name="template"
                            value={campaignData.template}
                            onChange={handleApplyTemplate}
                            className="form-input form-select"
                        >
                            <option value="">No Template</option>
                            {templates.map(template => (
                                <option key={template._id} value={template._id}>{template.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="scheduledAt" className="form-label">Schedule Send Time (Optional):</label>
                        <input
                            type="datetime-local"
                            id="scheduledAt"
                            name="scheduledAt"
                            value={campaignData.scheduledAt}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                        {campaignData.scheduledAt && new Date(campaignData.scheduledAt) <= new Date() && (
                            <p className="form-help-text text-red">Scheduled time is in the past. Campaign will be saved as Draft.</p>
                        )}
                        {campaignData.scheduledAt && new Date(campaignData.scheduledAt) > new Date() && (
                            <p className="form-help-text text-green">Campaign will be scheduled for sending.</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="status" className="form-label">Current Status:</label>
                        <select
                            id="status"
                            name="status"
                            value={campaignData.status}
                            onChange={handleInputChange}
                            className="form-input form-select"
                            disabled={isEditing && campaignData.status !== 'draft'}
                        >
                            <option value="draft">Draft</option>
                            {isEditing && campaignData.status === 'scheduled' && <option value="scheduled">Scheduled</option>}
                            {isEditing && campaignData.status === 'sending' && <option value="sending">Sending</option>}
                            {isEditing && campaignData.status === 'sent' && <option value="sent">Sent</option>}
                            {isEditing && campaignData.status === 'cancelled' && <option value="cancelled">Cancelled</option>}
                            {isEditing && campaignData.status === 'failed' && <option value="failed">Failed</option>}
                        </select>
                        {isEditing && campaignData.status !== 'draft' && (
                            <p className="form-help-text">Status can only be changed manually if campaign is a 'draft'. It's usually set by the system for scheduled/sent campaigns.</p>
                        )}
                    </div>

                    <h3 className="form-sub-header">Email Content:</h3>
                    <div className="form-group editor-container">
                        <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={campaignData.htmlContent}
                            onChange={handleQuillChange}
                            modules={quillModules}
                            formats={quillFormats}
                            className="quill-editor-full-height"
                        />
                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }} // Keep it hidden
                            accept="image/*"
                        />
                    </div>

                    <div className="button-group-form margin-top-large">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Campaign' : 'Create Campaign')}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/campaigns')}
                            className="btn btn-secondary"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                <div className="preview-column">
                    <h3 className="form-sub-header">Live HTML Preview:</h3>
                    <div className="preview-box">
                        <iframe
                            title="Email Content Preview"
                            srcDoc={campaignData.htmlContent}
                            className="preview-iframe"
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}

export default CampaignForm;