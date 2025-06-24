// emailxp/frontend/src/pages/CampaignDetails.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import campaignService from '../services/campaignService';
import listService from '../services/listService';
import CampaignTimeSeriesChart from '../components/CampaignTimeSeriesChart'; // NEW IMPORT

function CampaignDetails() {
    const { id: campaignId } = useParams();
    const navigate = useNavigate();

    const [campaign, setCampaign] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [listDetails, setListDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeSeriesData, setTimeSeriesData] = useState([]);
    const [timeSeriesPeriod, setTimeSeriesPeriod] = useState('daily');

    const fetchCampaignData = useCallback(async () => {
        setLoading(true);
        setError(null);

        if (!campaignId || campaignId === 'undefined' || campaignId === 'null') {
            setError('Invalid Campaign ID provided in the URL.');
            setLoading(false);
            return;
        }

        try {
            const fetchedCampaign = await campaignService.getCampaignById(campaignId);
            setCampaign(fetchedCampaign);

            if (fetchedCampaign.list && fetchedCampaign.list._id) {
                const listData = await listService.getListById(fetchedCampaign.list._id);
                setListDetails(listData);
            }

            const fetchedAnalytics = await campaignService.getCampaignAnalytics(campaignId);
            setAnalytics(fetchedAnalytics);

            // Fetch time-series data here, as it's specific to this campaign's analytics
            const fetchedTimeSeries = await campaignService.getCampaignAnalyticsTimeSeries(campaignId, timeSeriesPeriod);
            setTimeSeriesData(fetchedTimeSeries);

        } catch (err) {
            console.error('Error fetching campaign details or analytics:', err);
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
    }, [campaignId, navigate, timeSeriesPeriod]);

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

    if (!campaign || !analytics) {
        return (
            <div className="no-data-container">
                <p>Campaign not found or no data available.</p>
                <Link to="/campaigns" className="btn btn-primary margin-top-large">
                    Back to Campaigns
                </Link>
            </div>
        );
    }

    const totalSubscribers = listDetails?.subscribers?.length || 0;
    const totalEmailsSent = analytics.emailsSent || 0;
    const uniqueOpens = analytics.uniqueOpens || 0;
    const totalOpens = analytics.totalOpens || 0;
    const uniqueClicks = analytics.uniqueClicks || 0;
    const totalClicks = analytics.totalClicks || 0;
    const openRate = analytics.openRate;
    const clickRate = analytics.clickRate;
    const clickThroughRate = uniqueOpens > 0 ? (uniqueClicks / uniqueOpens * 100).toFixed(2) : 0;

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
                    {campaign.status === 'sent' && campaign.lastSentAt && (
                        <p><strong>Sent At:</strong> {new Date(campaign.lastSentAt).toLocaleString()}</p>
                    )}
                    {campaign.status === 'sent' && (
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

            {/* NEW SECTION FOR ANALYTICS CHARTS */}
            <div className="chart-section margin-top-large">
                <h3 className="section-header">Engagement Over Time</h3>
                <div className="chart-period-selector flex justify-end gap-4 mb-4">
                    <button
                        onClick={() => setTimeSeriesPeriod('daily')}
                        className={`btn ${timeSeriesPeriod === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => setTimeSeriesPeriod('weekly')}
                        className={`btn ${timeSeriesPeriod === 'weekly' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        Weekly
                    </button>
                </div>
                {/* Use the new CampaignTimeSeriesChart component */}
                <CampaignTimeSeriesChart
                    timeSeriesData={timeSeriesData}
                    timeSeriesPeriod={timeSeriesPeriod}
                    isLoading={loading} // Pass loading state if you want component to handle its own loading indicator
                    isError={!!error}   // Pass error state
                />
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