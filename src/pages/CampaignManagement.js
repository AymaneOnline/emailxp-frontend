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

            const validCampaigns = campaignsData.filter(campaign =>
                campaign && campaign._id && typeof campaign._id === 'string' && campaign._id.length === 24
            );

            // Fetching stats for all campaigns concurrently
            const openStatsPromises = validCampaigns.map(campaign =>
                campaignService.getCampaignOpenStats(campaign._id)
            );
            const clickStatsPromises = validCampaigns.map(campaign =>
                campaignService.getCampaignClickStats(campaign._id)
            );

            const allOpenStats = await Promise.all(openStatsPromises);
            const allClickStatsResults = await Promise.all(clickStatsPromises);

            const openStatsMap = allOpenStats.reduce((acc, currentStat) => {
                // Ensure currentStat and campaignId exist before assigning
                if (currentStat && currentStat.campaignId) {
                    acc[currentStat.campaignId] = currentStat;
                }
                return acc;
            }, {});
            setCampaignOpenStats(openStatsMap);

            const clickStatsMap = allClickStatsResults.reduce((acc, currentStat) => {
                // Ensure currentStat and campaignId exist before assigning
                if (currentStat && currentStat.campaignId) {
                    acc[currentStat.campaignId] = currentStat;
                }
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
        <div className="main-content-container"> {/* Replaced inline style */}
            <h2 className="section-header"> {/* Replaced inline style */}
                Email Campaigns
                <Link to="/campaigns/new" className="btn btn-primary"> {/* Replaced inline style */}
                    Create New Campaign
                </Link>
            </h2>

            {error && <p className="error-message">{error}</p>} {/* Replaced inline style */}
            {successMessage && <p className="success-message">{successMessage}</p>} {/* Replaced inline style */}

            {campaigns.length === 0 ? (
                <p className="no-data-message"> {/* Replaced inline style */}
                    You don't have any email campaigns yet. Click "Create New Campaign" to get started!
                </p>
            ) : (
                <div className="table-responsive"> {/* Replaced inline style */}
                    <table className="data-table"> {/* Replaced inline style */}
                        <thead>
                            <tr> {/* Replaced inline style */}
                                <th>Campaign Name</th> {/* Replaced inline style */}
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
                                const openStats = campaignOpenStats[campaign._id] || { totalOpens: 0, uniqueOpens: 0 };
                                const clickStats = campaignClickStats[campaign._id] || { totalClicks: 0, uniqueClicks: 0 };

                                const targetList = lists.find(l => l._id === (campaign.list?._id || campaign.list));
                                const listIdForSend = campaign.list?._id || campaign.list;

                                return (
                                    <tr key={campaign._id}>
                                        <td>
                                            <Link to={`/campaigns/${campaign._id}`} className="link-primary"> {/* Replaced inline style */}
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
                                            Total: <strong>{openStats.totalOpens}</strong><br />
                                            Unique: <strong>{openStats.uniqueOpens}</strong>
                                        </td>
                                        <td>
                                            Total: <strong>{clickStats.totalClicks}</strong><br />
                                            Unique: <strong>{clickStats.uniqueClicks}</strong>
                                        </td>
                                        <td>{new Date(campaign.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="action-buttons-cell"> {/* Replaced inline style */}
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