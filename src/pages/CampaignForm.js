// emailxp/frontend/src/pages/CampaignForm.js

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import campaignService from '../services/campaignService';
import listService from '../services/listService';
import templateService from '../services/templateService';

// Import ReactQuill and its styles
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // For the default "snow" theme

function CampaignForm() {
    const { id: campaignId } = useParams(); // Get campaign ID if in edit mode
    const navigate = useNavigate();

    const isEditing = !!campaignId; // True if campaignId exists (means we are editing)

    const [campaignData, setCampaignData] = useState({
        name: '',
        subject: '',
        list: '', // Will store list._id
        htmlContent: '',
        scheduledAt: '', // Date and time string
        status: 'draft', // Default to draft for new campaigns
        template: '' // Will store template._id
    });
    const [lists, setLists] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Quill modules (toolbar options) - These are unchanged from your original as they are Quill's internal config
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'video'],
            ['clean']
        ],
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
                    list: campaignToEdit.list?._id || '', // Use _id
                    htmlContent: campaignToEdit.htmlContent || '',
                    scheduledAt: campaignToEdit.scheduledAt ? new Date(campaignToEdit.scheduledAt).toISOString().slice(0, 16) : '', // Format for datetime-local input
                    status: campaignToEdit.status || 'draft',
                    template: campaignToEdit.template?._id || '' // Use _id
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

    // Handle Quill content changes
    const handleQuillChange = (content) => {
        setCampaignData(prev => ({ ...prev, htmlContent: content }));
    };

    const handleApplyTemplate = (e) => {
        const selectedTemplateId = e.target.value;
        const selectedTemplate = templates.find(t => t._id === selectedTemplateId);
        if (selectedTemplate) {
            setCampaignData(prev => ({
                ...prev,
                template: selectedTemplateId, // Set the template ID
                htmlContent: selectedTemplate.htmlContent // Apply template content
            }));
        } else {
            setCampaignData(prev => ({
                ...prev,
                template: '', // Clear template ID
                htmlContent: '' // Clear content if no template selected or invalid
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage(null);
        setError(null);

        // Basic validation
        if (!campaignData.name || !campaignData.subject || !campaignData.list || !campaignData.htmlContent) {
            setError('Please fill in all required fields (Name, Subject, Target List, Email Content).');
            return;
        }

        // --- NEW LOGIC: Determine status based on scheduledAt ---
        let newStatus = campaignData.status;
        if (campaignData.scheduledAt && new Date(campaignData.scheduledAt) > new Date()) {
            newStatus = 'scheduled'; // If scheduled date is in the future, set status to scheduled
        } else if (newStatus === 'scheduled' && !campaignData.scheduledAt) {
            // If it was scheduled but scheduledAt was cleared, revert to draft
            newStatus = 'draft';
        }
        // If status was already 'sent', 'sending', 'failed', 'cancelled', keep it.
        // Otherwise, if scheduledAt is past, it's a draft until manually sent.
        if (newStatus !== 'scheduled' && campaignData.status !== 'sent' && campaignData.status !== 'sending' && campaignData.status !== 'failed' && campaignData.status !== 'cancelled') {
             newStatus = 'draft';
        }
        // --- END NEW LOGIC ---

        const payload = {
            ...campaignData,
            status: newStatus, // <--- Use the determined status
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
                            disabled={isEditing && campaignData.status !== 'draft'} // Disable status change if not draft and editing
                        >
                            {/* Only 'draft' can be manually set if it's a new campaign or existing draft */}
                            <option value="draft">Draft</option>
                            {/* Allow 'scheduled' if editing an already scheduled campaign or if it was just scheduled */}
                            {isEditing && campaignData.status === 'scheduled' && <option value="scheduled">Scheduled</option>}
                            {/* Display read-only statuses if they are set by the system */}
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
                            theme="snow"
                            value={campaignData.htmlContent}
                            onChange={handleQuillChange}
                            modules={quillModules}
                            formats={quillFormats}
                            className="quill-editor-full-height"
                        />
                    </div>

                    <div className="button-group-form margin-top-large">
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            {isEditing ? 'Update Campaign' : 'Create Campaign'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/campaigns')}
                            className="btn btn-secondary"
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