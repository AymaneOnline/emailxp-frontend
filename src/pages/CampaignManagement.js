// emailxp/frontend/src/pages/CampaignManagement.js

import React, { useState, useEffect, useCallback } from 'react';
import campaignService from '../services/campaignService';
import listService from '../services/listService';
import { useNavigate, Link } from 'react-router-dom';

function CampaignManagement() {
    const [campaigns, setCampaigns] = useState([]);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    // Remove individual open/click stats states, we'll use a combined one
    const [campaignAnalytics, setCampaignAnalytics] = useState({}); // New state for combined analytics
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

            const validCampaigns = campaignsData.filter(campaign =>
                campaign && campaign._id && typeof campaign._id === 'string' && campaign._id.length === 24
            );

            // --- OLD CODE (REMOVED) ---
            // const openStatsPromises = validCampaigns.map(campaign =>
            //     campaignService.getCampaignOpenStats(campaign._id)
            // );
            // const clickStatsPromises = validCampaigns.map(campaign =>
            //     campaignService.getCampaignClickStats(campaign._id)
            // );
            // const allOpenStats = await Promise.all(openStatsPromises);
            // const allClickStatsResults = await Promise.all(clickStatsPromises);
            // ... (rest of old stats processing) ...
            // --- END OLD CODE ---

            // --- NEW CODE: Fetch combined analytics for all campaigns concurrently ---
            const analyticsPromises = validCampaigns.map(campaign =>
                campaignService.getCampaignAnalytics(campaign._id) // Call the new consolidated service
            );

            const allAnalyticsResults = await Promise.all(analyticsPromises);

            const combinedAnalyticsMap = allAnalyticsResults.reduce((acc, currentAnalytics) => {
                // The backend now returns { totalOpens, uniqueOpens, totalClicks, uniqueClicks, etc. }
                // So, we map it directly by campaignId
                if (currentAnalytics && currentAnalytics.campaignId) {
                    acc[currentAnalytics.campaignId] = currentAnalytics;
                }
                return acc;
            }, {});
            setCampaignAnalytics(combinedAnalyticsMap); // Set the combined analytics state

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

    const handleDeleteCampaign = async (campaignId) => {
        if (window.confirm('Are you sure you want to delete this campaign? This action will also delete all associated open and click events.')) {
            setError(null);
            setSuccessMessage(null);
            try {
                await campaignService.deleteCampaign(campaignId);
                setSuccessMessage('Campaign deleted successfully!');
                fetchData();
            } catch (err) {
                console.error('Error deleting campaign:', err.response?.data || err.message);
                setError(err.response?.data?.message || 'Failed to delete campaign.');
            }
        }
    };

    const handleSendCampaign = async (campaignId, campaignName, listId) => {
        const targetList = lists.find(l => l._id === listId);
        const subscriberCount = targetList?.subscribers?.length || 0;

        if (subscriberCount === 0) {
            alert(`The list "${targetList?.name || 'Unknown List'}" has no subscribers. Please add subscribers to the list before sending this campaign.`);
            return;
        }

        if (!window.confirm(`Are you sure you want to send "${campaignName}" to ${targetList?.name || 'Unknown List'} (${subscriberCount} subscribers)? This action cannot be undone.`)) {
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
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading campaigns and statistics...</p>
            </div>
        );
    }

    return (
        <div className="main-content-container">
            <h2 className="section-header">
                Email Campaigns
                <Link to="/campaigns/new" className="btn btn-primary">
                    Create New Campaign
                </Link>
            </h2>

            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            {campaigns.length === 0 ? (
                <p className="no-data-message">
                    You don't have any email campaigns yet. Click "Create New Campaign" to get started!
                </p>
            ) : (
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Campaign Name</th>
                                <th>Subject</th>
                                <th>Target List</th>
                                <th>Status</th>
                                <th>Opens (Total/Unique)</th>
                                <th>Clicks (Total/Unique)</th>
                                <th>Created At</th>
                                <th>Scheduled At</th>
                                <th className="actions-column">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map((campaign) => {
                                // Use the combined analytics for display
                                const analytics = campaignAnalytics[campaign._id] || { totalOpens: 0, uniqueOpens: 0, totalClicks: 0, uniqueClicks: 0 };

                                const targetList = lists.find(l => l._id === (campaign.list?._id || campaign.list));
                                const listIdForSend = campaign.list?._id || campaign.list;

                                return (
                                    <tr key={campaign._id}>
                                        <td>
                                            <Link to={`/campaigns/${campaign._id}`} className="link-primary">
                                                {campaign.name}
                                            </Link>
                                        </td>
                                        <td>{campaign.subject}</td>
                                        <td>
                                            {targetList ? `${targetList.name} (${targetList.subscribers?.length || 0} subscribers)` : 'N/A'}
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${campaign.status.toLowerCase()}`}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td>
                                            Total: <strong>{analytics.totalOpens}</strong><br />
                                            Unique: <strong>{analytics.uniqueOpens}</strong>
                                        </td>
                                        <td>
                                            Total: <strong>{analytics.totalClicks}</strong><br />
                                            Unique: <strong>{analytics.uniqueClicks}</strong>
                                        </td>
                                        <td>{new Date(campaign.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="action-buttons-cell">
                                            <Link
                                                to={`/campaigns/edit/${campaign._id}`}
                                                className="btn btn-sm btn-info"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteCampaign(campaign._id)}
                                                className="btn btn-sm btn-danger margin-left-sm"
                                            >
                                                Delete
                                            </button>
                                            {campaign.status === 'draft' ? (
                                                <button
                                                    onClick={() => handleSendCampaign(campaign._id, campaign.name, listIdForSend)}
                                                    className="btn btn-sm btn-success margin-left-sm"
                                                >
                                                    Send Now
                                                </button>
                                            ) : (
                                                <span className={`status-badge status-${campaign.status.toLowerCase()} margin-left-sm`}>
                                                    {campaign.status.toUpperCase()}
                                                </span>
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