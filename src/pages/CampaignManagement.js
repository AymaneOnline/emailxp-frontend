// emailxp/frontend/src/pages/CampaignManagement.js

import React, { useState, useEffect, useCallback } from 'react';
import campaignService from '../services/campaignService';
import listService from '../services/listService';
import { useNavigate, Link } from 'react-router-dom';

// TOP LEVEL LOG
console.log('CampaignManagement.js (Module Load): Initializing component.');

function CampaignManagement() {
    const [campaigns, setCampaigns] = useState([]);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [campaignAnalytics, setCampaignAnalytics] = useState({});
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        console.log('[CampaignManagement] Fetching initial campaign and list data...');
        try {
            const [campaignsData, listsData] = await Promise.all([
                campaignService.getCampaigns(),
                listService.getLists()
            ]);

            setCampaigns(campaignsData);
            setLists(listsData);
            console.log('[CampaignManagement] Campaigns fetched:', campaignsData);
            console.log('[CampaignManagement] Lists fetched:', listsData);

            const validCampaigns = campaignsData.filter(campaign =>
                campaign && campaign._id && typeof campaign._id === 'string' && campaign._id.length === 24
            );
            console.log(`[CampaignManagement] Found ${validCampaigns.length} valid campaigns for analytics.`);

            const analyticsPromises = validCampaigns.map(async (campaign) => {
                try {
                    // This is where getCampaignAnalytics is called
                    const analytics = await campaignService.getCampaignAnalytics(campaign._id);
                    console.log(`[CampaignManagement] Analytics for campaign ${campaign._id}:`, analytics);
                    return analytics;
                } catch (analyticError) {
                    console.error(`[CampaignManagement] Error fetching analytics for campaign ${campaign._id} (${campaign.name}):`, analyticError.response?.data || analyticError.message);
                    return {
                        campaignId: campaign._id,
                        name: campaign.name,
                        emailsSent: campaign.emailsSuccessfullySent || 0,
                        totalOpens: 0,
                        uniqueOpens: 0,
                        totalClicks: 0,
                        uniqueClicks: 0,
                        openRate: 0,
                        clickRate: 0,
                        error: 'Analytics unavailable for this campaign.'
                    };
                }
            });

            const allAnalyticsResults = await Promise.all(analyticsPromises);

            const combinedAnalyticsMap = allAnalyticsResults.reduce((acc, currentAnalytics) => {
                if (currentAnalytics && currentAnalytics.campaignId) {
                    acc[currentAnalytics.campaignId] = currentAnalytics;
                }
                return acc;
            }, {});
            setCampaignAnalytics(combinedAnalyticsMap);
            console.log('[CampaignManagement] Combined analytics map:', combinedAnalyticsMap);

        } catch (err) {
            console.error('[CampaignManagement] Error fetching main data:', err);
            setError(err.response?.data?.message || 'Failed to fetch data. Please login again.');
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('user');
                navigate('/login');
            }
        } finally {
            setLoading(false);
            console.log('[CampaignManagement] Data fetching complete.');
        }
    }, [navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteCampaign = async (campaignId) => {
        if (window.confirm('Are you sure you want to delete this campaign? This action will also delete all associated open and click events.')) {
            setError(null);
            setSuccessMessage(null);
            console.log(`[CampaignManagement] Deleting campaign ID: ${campaignId}`);
            try {
                await campaignService.deleteCampaign(campaignId);
                setSuccessMessage('Campaign deleted successfully!');
                fetchData();
            } catch (err) {
                console.error('[CampaignManagement] Error deleting campaign:', err.response?.data || err.message);
                setError(err.response?.data?.message || 'Failed to delete campaign.');
            }
        }
    };

    const handleSendCampaign = async (campaignId, campaignName, listId) => {
        const targetList = lists.find(l => l._id === (listId));
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
        console.log(`[CampaignManagement] Sending campaign ID: ${campaignId}, Name: "${campaignName}" to list ID: ${listId}`);
        try {
            const response = await campaignService.sendCampaign(campaignId);
            setSuccessMessage(`Campaign "${campaignName}" sending initiated! Total: ${response.totalSubscribers} subscribers. (Updates will appear shortly)`);
            fetchData();
        } catch (err) {
            console.error('[CampaignManagement] Error sending campaign:', err.response?.data || err.message);
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