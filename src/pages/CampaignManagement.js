// src/pages/CampaignManagement.js

import React, { useState, useEffect, useCallback } from 'react';
import campaignService from '../services/campaignService';
import listService from '../services/listService';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function CampaignManagement() {
    const [campaigns, setCampaigns] = useState([]);
    const [lists, setLists] = useState([]);
    const [newCampaignData, setNewCampaignData] = useState({
        name: '',
        subject: '',
        htmlContent: '',
        plainTextContent: '',
        list: '',
        scheduledAt: '', // ADDED: New field for scheduling
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [campaignOpenStats, setCampaignOpenStats] = useState({});
    const [campaignClickStats, setCampaignClickStats] = useState({});
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [campaignsData, listsData] = await Promise.all([
                campaignService.getCampaigns(),
                listService.getLists()
            ]);

            setCampaigns(campaignsData);
            setLists(listsData);

            if (listsData.length > 0) {
                setNewCampaignData(prev => ({ ...prev, list: listsData[0]._id }));
            } else {
                setNewCampaignData(prev => ({ ...prev, list: '' }));
            }

            const validCampaigns = campaignsData.filter(campaign =>
                campaign && campaign._id && typeof campaign._id === 'string' && campaign._id.length === 24
            );

            const openStatsPromises = validCampaigns.map(campaign => campaignService.getCampaignOpenStats(campaign._id));
            const clickStatsPromises = validCampaigns.map(campaign => campaignService.getCampaignClickStats(campaign._id));

            const allOpenStats = await Promise.all(openStatsPromises);
            const allClickStatsResults = await Promise.all(clickStatsPromises);

            const openStatsMap = allOpenStats.reduce((acc, currentStat) => {
                acc[currentStat.campaignId] = currentStat;
                return acc;
            }, {});
            setCampaignOpenStats(openStatsMap);

            const clickStatsMap = allClickStatsResults.reduce((acc, currentStat) => {
                acc[currentStat.campaignId] = currentStat;
                return acc;
            }, {});
            setCampaignClickStats(clickStatsMap);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Failed to fetch data. Please login again.');
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('user');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCampaignData({ ...newCampaignData, [name]: value });
    };

    const handleQuillChange = (content) => {
        setNewCampaignData(prev => ({ ...prev, htmlContent: content, plainTextContent: content.replace(/<[^>]*>/g, '') }));
    };

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        // Determine campaign status based on scheduledAt
        let campaignStatus = 'draft';
        let scheduledDate = null;

        if (newCampaignData.scheduledAt) {
            scheduledDate = new Date(newCampaignData.scheduledAt);
            if (isNaN(scheduledDate.getTime())) {
                alert('Invalid date/time for scheduling.');
                return;
            }
            if (scheduledDate <= new Date()) {
                alert('Scheduled date/time must be in the future.');
                return;
            }
            campaignStatus = 'scheduled';
        }

        const campaignToCreate = {
            ...newCampaignData,
            status: campaignStatus, // Set status here
            scheduledAt: scheduledDate, // Pass parsed date or null
        };

        if (!campaignToCreate.name || !campaignToCreate.subject || !campaignToCreate.htmlContent || !campaignToCreate.list) {
            alert('Please fill in all required fields (Name, Subject, HTML Content, and select a List).');
            return;
        }

        try {
            await campaignService.createCampaign(campaignToCreate); // Send the modified object
            setNewCampaignData({
                name: '',
                subject: '',
                htmlContent: '',
                plainTextContent: '',
                list: lists.length > 0 ? lists[0]._id : '',
                scheduledAt: '', // Reset scheduledAt input
            });
            setSuccessMessage(`Campaign created successfully! Status: ${campaignStatus}`);
            await fetchData();
        } catch (err) {
            console.error('Error creating campaign:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to create campaign.');
        }
    };

    const handleDeleteCampaign = async (campaignId) => {
        if (window.confirm('Are you sure you want to delete this campaign? This action will also delete all associated open and click events.')) {
            setError(null);
            setSuccessMessage(null);
            try {
                await campaignService.deleteCampaign(campaignId);
                setSuccessMessage('Campaign deleted successfully!');
                await fetchData();
            } catch (err) {
                console.error('Error deleting campaign:', err.response?.data || err.message);
                setError(err.response?.data?.message || 'Failed to delete campaign.');
            }
        }
    };

    const handleSendCampaign = async (campaignId, campaignName, listName, subscriberCount) => {
        if (subscriberCount === 0) {
            alert(`The list "${listName}" has no subscribers. Please add subscribers to the list before sending this campaign.`);
            return;
        }
        if (!window.confirm(`Are you sure you want to send "${campaignName}" to ${listName} (${subscriberCount} subscribers)? This action cannot be undone.`)) {
            return;
        }

        setError(null);
        setSuccessMessage(null);
        try {
            const response = await campaignService.sendCampaign(campaignId);
            setSuccessMessage(`Campaign "${campaignName}" sending initiated! Total: ${response.totalSubscribers} subscribers. (Updates will appear shortly)`);
            await fetchData();
        } catch (err) {
            console.error('Error sending campaign:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to send campaign.');
        }
    };

    if (loading) {
        return (
            <div style={{
                textAlign: 'center',
                marginTop: '50px',
                fontSize: '1.2em',
                color: '#555',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px'
            }}>
                <div className="spinner" style={{
                    border: '4px solid rgba(0, 0, 0, 0.1)',
                    borderLeftColor: '#007bff',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '15px'
                }}></div>
                <p>Loading campaigns and statistics...</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '20px auto', border: '1px solid #eee', borderRadius: '8px', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' }}>
            <h2>Email Campaigns</h2>

            {error && <p style={{ color: 'red', marginBottom: '15px' }}>Error: {error}</p>}
            {successMessage && <p style={{ color: 'green', marginBottom: '15px' }}>{successMessage}</p>}

            <form onSubmit={handleCreateCampaign} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <h3>Create New Campaign</h3>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Campaign Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={newCampaignData.name}
                        onChange={handleInputChange}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="subject" style={{ display: 'block', marginBottom: '5px' }}>Subject:</label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={newCampaignData.subject}
                        onChange={handleInputChange}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="list" style={{ display: 'block', marginBottom: '5px' }}>Target List:</label>
                    <select
                        id="list"
                        name="list"
                        value={newCampaignData.list}
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
                {/* ADDED: Scheduled At input */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="scheduledAt" style={{ display: 'block', marginBottom: '5px' }}>Schedule Send Time (Optional):</label>
                    <input
                        type="datetime-local"
                        id="scheduledAt"
                        name="scheduledAt"
                        value={newCampaignData.scheduledAt}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                    <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                        Leave blank to create as a draft. Select a future date/time to schedule.
                    </small>
                </div>
                {/* END ADDED */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Email HTML Content:</label>
                    <ReactQuill
                        theme="snow"
                        value={newCampaignData.htmlContent}
                        onChange={handleQuillChange}
                        style={{ height: '200px', marginBottom: '40px' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}>
                    Create Campaign
                </button>
            </form>

            {campaigns.length === 0 ? (
                <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '1.1em', color: '#666' }}>
                    You don't have any email campaigns yet. Use the form above to **create your first campaign!**
                </p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Campaign Name</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Subject</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Target List</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Opens (Total/Unique)</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Clicks (Total/Unique)</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Created At</th>
                                {/* ADDED: New Header for Scheduled At */}
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Scheduled At</th>
                                {/* END ADDED */}
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map((campaign) => {
                                const openStats = campaignOpenStats[campaign._id] || { totalOpens: 0, uniqueOpens: 0 };
                                const clickStats = campaignClickStats[campaign._id] || { totalClicks: 0, uniqueClicks: 0 };

                                const targetList = lists.find(l => l._id === (campaign.list && campaign.list._id));
                                const subscriberCount = targetList?.subscribers?.length || 0;

                                return (
                                    <tr key={campaign._id}>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{campaign.name}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{campaign.subject}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                            {campaign.list ? campaign.list.name : 'N/A'}
                                        </td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{campaign.status}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                            Total: <strong>{openStats.totalOpens}</strong><br/>
                                            Unique: <strong>{openStats.uniqueOpens}</strong>
                                        </td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                            Total: <strong>{clickStats.totalClicks}</strong><br/>
                                            Unique: <strong>{clickStats.uniqueClicks}</strong>
                                        </td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(campaign.createdAt).toLocaleDateString()}</td>
                                        {/* ADDED: Display Scheduled At */}
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                            {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : 'N/A'}
                                        </td>
                                        {/* END ADDED */}
                                        <td style={{ border: '1px solid #ddd', padding: '8px', whiteSpace: 'nowrap' }}>
                                            <button
                                                onClick={() => handleDeleteCampaign(campaign._id)}
                                                style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
                                            >
                                                Delete
                                            </button>
                                            {/* 'Send' button only for 'draft' campaigns. Scheduled campaigns are sent by backend. */}
                                            {campaign.status === 'draft' ? (
                                                <button
                                                    onClick={() => handleSendCampaign(campaign._id, campaign.name, campaign.list?.name || 'Unknown List', subscriberCount)}
                                                    style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    Send Now
                                                </button>
                                            ) : (
                                                <span style={{ color: '#6c757d', marginLeft: '10px', fontWeight: 'bold' }}>{campaign.status.toUpperCase()}</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default CampaignManagement;