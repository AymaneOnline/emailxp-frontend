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
    const [analytics, setAnalytics] = useState(null); // <--- NEW STATE: to hold combined analytics
    const [listDetails, setListDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCampaignData = useCallback(async () => {
        setLoading(true);
        setError(null);

        if (!campaignId || campaignId === 'undefined' || campaignId === 'null') {
            setError('Invalid Campaign ID provided in the URL.');
            setLoading(false);
            return;
        }

        try {
            // Fetch campaign basic details
            const fetchedCampaign = await campaignService.getCampaignById(campaignId);
            setCampaign(fetchedCampaign);

            // Fetch list details if a list is associated
            if (fetchedCampaign.list && fetchedCampaign.list._id) {
                const listData = await listService.getListById(fetchedCampaign.list._id);
                setListDetails(listData);
            }

            // --- CRITICAL CHANGE: Use the new combined analytics endpoint ---
            const fetchedAnalytics = await campaignService.getCampaignAnalytics(campaignId);
            setAnalytics(fetchedAnalytics); // Store the combined analytics data
            // --- END CRITICAL CHANGE ---

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

    if (!campaign || !analytics) { // Ensure analytics data is also loaded
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

    // --- CRITICAL CHANGE: Get stats directly from the new analytics state ---
    const totalEmailsSent = analytics.totalEmailsSent || 0; // The count from the backend
    const uniqueOpens = analytics.uniqueOpens || 0;
    const totalOpens = analytics.totalOpens || 0;
    const uniqueClicks = analytics.uniqueClicks || 0;
    const totalClicks = analytics.totalClicks || 0;

    // The rates are now directly from the backend, more consistent
    const openRate = analytics.openRate;
    const clickRate = analytics.clickRate;
    const clickThroughRate = analytics.clickThroughRate;
    // --- END CRITICAL CHANGE ---

    return (
        <div className="main-content-container">
            <h2 className="section-header">
                Campaign Details: {campaign.name}
            </h2>

            <div className="campaign-details-grid margin-bottom-large">
                <div className="info-card">
                    <h3>Campaign Information</h3>
                    <p><strong>Subject:</strong> {campaign.subject}</p>
                    <p><strong>Target List:</strong> {campaign.list?.name || 'N/A'} ({totalSubscribers} subscribers)</p>
                    <p><strong>Status:</strong> {campaign.status}</p>
                    <p><strong>Created:</strong> {new Date(campaign.createdAt).toLocaleString()}</p>
                    <p><strong>Scheduled:</strong> {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : 'Not Scheduled'}</p>
                    <p><strong>Template Used:</strong> {campaign.template?.name || 'No Template'}</p>
                    {campaign.status === 'sent' && analytics.sentAt && (
                        <p><strong>Sent At:</strong> {new Date(analytics.sentAt).toLocaleString()}</p>
                    )}
                    {campaign.status === 'sent' && (
                        // MODIFIED LINE: Using the 'totalEmailsSent' variable
                        <p><strong>Emails Sent:</strong> {totalEmailsSent}</p>
                    )}
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
                <iframe
                    title="Email Content Preview"
                    srcDoc={campaign.htmlContent}
                    className="email-iframe-content"
                />
            </div>

            <Link to="/campaigns" className="btn btn-primary margin-top-large">
                Back to Campaigns List
            </Link>
        </div>
    );
}

export default CampaignDetails;