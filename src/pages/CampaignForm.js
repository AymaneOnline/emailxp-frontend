// emailxp/frontend/src/pages/CampaignForm.js
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import listService from '../services/listService';
import templateService from '../services/templateService';
import campaignService from '../services/campaignService';
import { useNavigate, useParams } from 'react-router-dom'; // NEW: Import useParams

function CampaignForm() { // Removed campaignToEdit, onSuccess, onError, initialLists props
    const [campaignData, setCampaignData] = useState({
        name: '',
        subject: '',
        htmlContent: '',
        plainTextContent: '',
        list: '',
        scheduledAt: '',
        templateId: '',
    });
    const [lists, setLists] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loadingFormDependencies, setLoadingFormDependencies] = useState(true); // Combined loading state
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const navigate = useNavigate();
    const { id: campaignIdParam } = useParams(); // Get ID from URL if in edit mode

    // Fetch lists, templates, and existing campaign data (if in edit mode)
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoadingFormDependencies(true);
                setError(null);
                setSuccess(null); // Clear messages on load

                const [fetchedLists, fetchedTemplates] = await Promise.all([
                    listService.getLists(),
                    templateService.getTemplates()
                ]);

                setLists(fetchedLists);
                setTemplates(fetchedTemplates);

                // If campaignIdParam exists, fetch campaign data for editing
                if (campaignIdParam) {
                    const fetchedCampaign = await campaignService.getCampaignById(campaignIdParam);
                    setCampaignData({
                        name: fetchedCampaign.name || '',
                        subject: fetchedCampaign.subject || '',
                        htmlContent: fetchedCampaign.htmlContent || '',
                        plainTextContent: fetchedCampaign.plainTextContent || '',
                        list: fetchedCampaign.list?._id || '', // Use _id if populated
                        scheduledAt: fetchedCampaign.scheduledAt ? new Date(fetchedCampaign.scheduledAt).toISOString().slice(0, 16) : '',
                        templateId: fetchedCampaign.template?._id || '', // Set existing template
                    });
                } else {
                    // For new campaign, pre-select the first list if available
                    if (fetchedLists.length > 0) {
                        setCampaignData(prev => ({ ...prev, list: fetchedLists[0]._id }));
                    }
                }
            } catch (err) {
                console.error('Error fetching form dependencies:', err);
                setError(err.response?.data?.message || 'Failed to load form data.');
            } finally {
                setLoadingFormDependencies(false);
            }
        };

        fetchAllData();
    }, [campaignIdParam]); // Rerun if campaignIdParam changes

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCampaignData({ ...campaignData, [name]: value });
    };

    const handleQuillChange = (content) => {
        setCampaignData(prev => ({ ...prev, htmlContent: content, plainTextContent: content.replace(/<[^>]*>/g, '') }));
    };

    const handleTemplateSelect = (e) => {
        const selectedTemplateId = e.target.value;
        setCampaignData(prev => ({ ...prev, templateId: selectedTemplateId }));

        if (selectedTemplateId) {
            const selectedTemplate = templates.find(t => t._id === selectedTemplateId);
            if (selectedTemplate) {
                setCampaignData(prev => ({
                    ...prev,
                    subject: selectedTemplate.subject,
                    htmlContent: selectedTemplate.htmlContent,
                    plainTextContent: selectedTemplate.plainTextContent || selectedTemplate.htmlContent.replace(/<[^>]*>/g, '')
                }));
            }
        } else {
            setCampaignData(prev => ({
                ...prev,
                subject: '',
                htmlContent: '',
                plainTextContent: '',
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let campaignStatus = 'draft';
        let scheduledDate = null;

        if (campaignData.scheduledAt) {
            scheduledDate = new Date(campaignData.scheduledAt);
            if (isNaN(scheduledDate.getTime())) {
                setError('Invalid date/time for scheduling.');
                return;
            }
            if (scheduledDate <= new Date()) {
                setError('Scheduled date/time must be in the future.');
                return;
            }
            campaignStatus = 'scheduled';
        }

        const dataToSubmit = {
            ...campaignData,
            status: campaignStatus,
            scheduledAt: scheduledDate,
            templateId: campaignData.templateId || null, 
        };

        if (!dataToSubmit.name || !dataToSubmit.list) {
            setError('Please fill in campaign name and select a list.');
            return;
        }

        if (!dataToSubmit.templateId) {
            if (!dataToSubmit.subject || !dataToSubmit.htmlContent) {
                setError('Please provide subject and HTML content, or select a template.');
                return;
            }
        }

        setError(null);
        setSuccess(null);
        setLoadingFormDependencies(true); // Use this for form submission loading

        try {
            if (campaignIdParam) {
                await campaignService.updateCampaign(campaignIdParam, dataToSubmit);
                setSuccess('Campaign updated successfully!');
            } else {
                await campaignService.createCampaign(dataToSubmit);
                setSuccess('Campaign created successfully!');
            }
            // Navigate back to the campaign list page after success
            navigate('/campaigns'); 
        } catch (err) {
            console.error('Error submitting campaign:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to save campaign.');
        } finally {
            setLoadingFormDependencies(false);
        }
    };

    if (loadingFormDependencies) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2em', color: '#555' }}>
                Loading campaign form...
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h3>{campaignIdParam ? 'Edit Campaign' : 'Create New Campaign'}</h3>
            
            {error && <p style={{ color: 'red', marginBottom: '15px' }}>Error: {error}</p>}
            {success && <p style={{ color: 'green', marginBottom: '15px' }}>{success}</p>}

            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Campaign Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={campaignData.name}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="templateId" style={{ display: 'block', marginBottom: '5px' }}>Use Template (Optional):</label>
                <select
                    id="templateId"
                    name="templateId"
                    value={campaignData.templateId}
                    onChange={handleTemplateSelect}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                    <option value="">-- Do Not Use Template --</option>
                    {templates.map(template => (
                        <option key={template._id} value={template._id}>{template.name} ({template.subject})</option>
                    ))}
                </select>
                {templates.length === 0 && (
                    <p style={{marginTop: '5px', color: '#ffc107'}}>No templates available. Create templates first from the "Templates" page.</p>
                )}
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="subject" style={{ display: 'block', marginBottom: '5px' }}>Subject:</label>
                <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={campaignData.subject}
                    onChange={handleInputChange}
                    required={!campaignData.templateId}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="list" style={{ display: 'block', marginBottom: '5px' }}>Target List:</label>
                <select
                    id="list"
                    name="list"
                    value={campaignData.list}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                    <option value="">-- Select a List --</option>
                    {lists.map(list => (
                        <option key={list._id} value={list._id}>{list.name}</option>
                    ))}
                </select>
                {lists.length === 0 && (
                    <p style={{marginTop: '5px', color: '#ffc107'}}>No lists available. Please create a list first from the "Lists" page.</p>
                )}
            </div>
            
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="scheduledAt" style={{ display: 'block', marginBottom: '5px' }}>Schedule Send Time (Optional):</label>
                <input
                    type="datetime-local"
                    id="scheduledAt"
                    name="scheduledAt"
                    value={campaignData.scheduledAt}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                    Leave blank to create as a draft. Select a future date/time to schedule.
                </small>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email HTML Content:</label>
                <ReactQuill
                    theme="snow"
                    value={campaignData.htmlContent}
                    onChange={handleQuillChange}
                    style={{ height: '200px', marginBottom: '40px' }}
                    required={!campaignData.templateId}
                />
            </div>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}>
                {campaignIdParam ? 'Update Campaign' : 'Create Campaign'}
            </button>
            <button
                type="button"
                onClick={() => navigate('/campaigns')}
                style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px', marginLeft: '10px' }}
            >
                Cancel
            </button>
        </form>
    );
}

export default CampaignForm;