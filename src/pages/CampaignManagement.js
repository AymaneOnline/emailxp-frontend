// src/pages/CampaignManagement.js

import React, { useState, useEffect, useCallback } from 'react';
import campaignService from '../services/campaignService';
import listService from '../services/listService';
import { useNavigate, Link } from 'react-router-dom'; // NEW: Import Link
// Removed: ReactQuill, 'react-quill/dist/quill.snow.css' as form is now external
// Removed: CampaignForm import, as it's now rendered via Routes in App.js
// Removed: templateService import, as CampaignManagement no longer passes templates directly to form

function CampaignManagement() {
    const [campaigns, setCampaigns] = useState([]);
    const [lists, setLists] = useState([]); // Still need lists for displaying list names in table
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
            // Fetch all campaigns and lists concurrently
            const [campaignsData, listsData] = await Promise.all([
                campaignService.getCampaigns(),
                listService.getLists()
            ]);

            setCampaigns(campaignsData);
            setLists(listsData);

            // Refresh stats for all campaigns
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

    // Removed: handleFormSuccess and handleFormError as CampaignForm handles its own navigation now
    // Removed: newCampaignData, handleInputChange, handleQuillChange, handleCreateCampaign, editingCampaign, handleEditCampaign, handleCancelEdit

    const handleDeleteCampaign = async (campaignId) => {
        if (window.confirm('Are you sure you want to delete this campaign? This action will also delete all associated open and click events.')) {
            setError(null);
            setSuccessMessage(null);
            try {
                await campaignService.deleteCampaign(campaignId);
                setSuccessMessage('Campaign deleted successfully!');
                fetchData(); // Refresh data after deletion
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
            fetchData();
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
            <h2 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Email Campaigns
                <Link to="/campaigns/new" style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none' }}>
                    Create New Campaign
                </Link>
            </h2>

            {error && <p style={{ color: 'red', marginBottom: '15px' }}>Error: {error}</p>}
            {successMessage && <p style={{ color: 'green', marginBottom: '15px' }}>{successMessage}</p>}

            {/* REMOVED: The CampaignForm component was here */}
            {/* REMOVED: The Cancel Edit button was here */}

            {campaigns.length === 0 ? (
                <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '1.1em', color: '#666' }}>
                    You don't have any email campaigns yet. Click "Create New Campaign" to get started!
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
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Scheduled At</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map((campaign) => {
                                const openStats = campaignOpenStats[campaign._id] || { totalOpens: 0, uniqueOpens: 0 };
                                const clickStats = campaignClickStats[campaign._id] || { totalClicks: 0, uniqueClicks: 0 };

                                const targetList = lists.find(l => l._id === (campaign.list?._id || campaign.list));
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
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                            {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : 'N/A'}
                                        </td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px', whiteSpace: 'nowrap' }}>
                                            {/* NEW: Link to edit page instead of calling handleEditCampaign */}
                                            <Link
                                                to={`/campaigns/edit/${campaign._id}`}
                                                style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px', textDecoration: 'none' }}
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteCampaign(campaign._id)}
                                                style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
                                            >
                                                Delete
                                            </button>
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