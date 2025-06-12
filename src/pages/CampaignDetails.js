// emailxp/frontend/src/pages/CampaignDetails.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import campaignService from '../services/campaignService';
import listService from '../services/listService';
// Removed: import './CampaignDetails.css'; // This line should already be removed

function CampaignDetails() {
    const { id: campaignId } = useParams(); // Get the campaign ID from the URL
    const navigate = useNavigate();

    const [campaign, setCampaign] = useState(null);
    const [openStats, setOpenStats] = useState(null);
    const [clickStats, setClickStats] = useState(null);
    const [listDetails, setListDetails] = useState(null); // State for list details
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCampaignData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedCampaign = await campaignService.getCampaignById(campaignId);
            setCampaign(fetchedCampaign);

            // Fetch list details if a list is associated
            if (fetchedCampaign.list && fetchedCampaign.list._id) { // Check if list exists and has an ID
                const listData = await listService.getListById(fetchedCampaign.list._id);
                setListDetails(listData);
            }

            // Fetch open and click stats for this specific campaign
            const fetchedOpenStats = await campaignService.getCampaignOpenStats(campaignId);
            const fetchedClickStats = await campaignService.getCampaignClickStats(campaignId);

            setOpenStats(fetchedOpenStats);
            setClickStats(fetchedClickStats);

        } catch (err) {
            console.error('Error fetching campaign details:', err);
            setError(err.response?.data?.message || 'Failed to load campaign details.');
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('user');
                navigate('/login');
            } else if (err.response && err.response.status === 404) {
                setError('Campaign not found.');
            }
        } finally {
            setLoading(false);
        }
    }, [campaignId, navigate]);

    useEffect(() => {
        fetchCampaignData();
    }, [fetchCampaignData]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading campaign details and analytics...</p>
                {/* The @keyframes for spinner is already in App.css, so we don't need this inline style block */}
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h3>Error Loading Campaign</h3>
                <p>{error}</p>
                <Link to="/campaigns" className="btn btn-primary margin-top-large">
                    Back to Campaigns
                </Link>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="no-data-container">
                <p>Campaign not found or no data available.</p>
                <Link to="/campaigns" className="btn btn-primary margin-top-large">
                    Back to Campaigns
                </Link>
            </div>
        );
    }

    // Get totalSubscribers from fetched listDetails
    const totalSubscribers = listDetails?.subscribers?.length || 0;

    const uniqueOpens = openStats?.uniqueOpens || 0;
    const totalOpens = openStats?.totalOpens || 0;
    const uniqueClicks = clickStats?.uniqueClicks || 0;
    const totalClicks = clickStats?.totalClicks || 0;

    // Calculate rates. Ensure consistency with toFixed(2)
    const openRate = totalSubscribers > 0 ? ((uniqueOpens / totalSubscribers) * 100).toFixed(2) : '0.00';
    const clickRate = totalSubscribers > 0 ? ((uniqueClicks / totalSubscribers) * 100).toFixed(2) : '0.00';
    const clickThroughRate = uniqueOpens > 0 ? ((uniqueClicks / uniqueOpens) * 100).toFixed(2) : '0.00';


    return (
        <div className="main-content-container"> {/* Using the general container class */}
            <h2 className="section-header">
                Campaign Details: {campaign.name}
            </h2>

            <div className="campaign-details-grid margin-bottom-large"> {/* Added margin-bottom-large for spacing */}
                <div className="info-card">
                    <h3>Campaign Information</h3>
                    <p><strong>Subject:</strong> {campaign.subject}</p>
                    <p><strong>Target List:</strong> {campaign.list?.name || 'N/A'} ({totalSubscribers} subscribers)</p>
                    <p><strong>Status:</strong> {campaign.status}</p>
                    <p><strong>Created:</strong> {new Date(campaign.createdAt).toLocaleString()}</p>
                    <p><strong>Scheduled:</strong> {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : 'Not Scheduled'}</p>
                    <p><strong>Template Used:</strong> {campaign.template?.name || 'No Template'}</p>
                </div>
                <div className="stats-grid">
                    <h3>Engagement Statistics</h3>
                    <div className="stat-item">
                        <h4>Opens</h4>
                        <p className="stat-value">{uniqueOpens} <small>Unique</small></p>
                        <p className="stat-subtext">({totalOpens} Total)</p>
                        <p className="stat-rate">{openRate}% <small>Open Rate</small></p>
                    </div>
                    <div className="stat-item">
                        <h4>Clicks</h4>
                        <p className="stat-value">{uniqueClicks} <small>Unique</small></p>
                        <p className="stat-subtext">({totalClicks} Total)</p>
                        <p className="stat-rate">{clickRate}% <small>Click Rate</small></p>
                    </div>
                    {uniqueOpens > 0 && (
                        <div className="stat-item full-width">
                            <h4>Click-Through Rate (CTR)</h4>
                            <p className="stat-rate">{clickThroughRate}% <small>(Clicks per Unique Open)</small></p>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="section-header">Email Content Preview</h3>
            <div className="email-preview-frame">
                {/* Using an iframe for safer HTML rendering */}
                <iframe
                    title="Email Content Preview"
                    srcDoc={campaign.htmlContent}
                    className="email-iframe-content" // Added a class for potential future styling if needed
                />
            </div>

            <Link to="/campaigns" className="btn btn-primary margin-top-large">
                Back to Campaigns List
            </Link>
        </div>
    );
}

export default CampaignDetails;