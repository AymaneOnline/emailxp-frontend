// emailxp/frontend/src/components/AnalyticsDashboard.js

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Spinner from './Spinner'; // Assuming Spinner is correctly located
import campaignService from '../services/campaignService'; // Import campaignService

function AnalyticsDashboard({ user }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            if (!user || !user.token) {
                setError('User not authenticated. Please log in.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                // Use campaignService to fetch dashboard stats
                const response = await campaignService.getDashboardStats();
                setStats(response); // Backend directly returns the object, not wrapped in 'data'
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                const message = (err.response && err.response.data && err.response.data.message) || err.message || err.toString();
                setError(message);
                toast.error(`Dashboard Error: ${message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, [user]);

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return (
            <div className="container p-4">
                <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }

    // Check if stats and performance object exist before rendering
    if (!stats || !stats.performance) {
        return (
            <div className="container p-4">
                <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
                <p>No data available. Send some campaigns or check your backend.</p>
            </div>
        );
    }

    // Destructure performance for easier access
    const { performance } = stats;

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Overall Campaign Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Campaigns */}
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Total Campaigns</h3>
                    <p className="text-5xl font-extrabold text-blue-600">{stats.totalCampaigns || 0}</p>
                </div>
                {/* Campaigns Sent */}
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Campaigns Sent</h3>
                    <p className="text-5xl font-extrabold text-indigo-600">{stats.campaignsSent || 0}</p>
                </div>
                {/* Total Lists */}
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Total Lists</h3>
                    <p className="text-5xl font-extrabold text-purple-600">{stats.totalLists || 0}</p>
                </div>
                {/* Total Subscribers */}
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Total Subscribers</h3>
                    <p className="text-5xl font-extrabold text-pink-600">{stats.totalSubscribers || 0}</p>
                </div>

                {/* Performance Section */}
                <div className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Emails Sent */}
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Total Emails Sent</h3>
                        <p className="text-5xl font-extrabold text-green-600">{performance.totalEmailsSent || 0}</p>
                    </div>
                    {/* Overall Open Rate */}
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Overall Open Rate</h3>
                        <p className="text-5xl font-extrabold text-blue-600">{performance.openRate || 0}%</p>
                        <p className="text-sm text-gray-500 mt-2">({performance.uniqueOpens || 0} unique opens / {performance.totalOpens || 0} total opens)</p>
                    </div>
                    {/* Overall Click Rate */}
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Overall Click Rate</h3>
                        <p className="text-5xl font-extrabold text-red-600">{performance.clickRate || 0}%</p>
                        <p className="text-sm text-gray-500 mt-2">({performance.uniqueClicks || 0} unique clicks / {performance.totalClicks || 0} total clicks)</p>
                    </div>
                    {/* Total Bounced */}
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Total Bounced</h3>
                        <p className="text-5xl font-extrabold text-orange-600">{performance.totalBounced || 0}</p>
                    </div>
                    {/* Total Unsubscribed */}
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Total Unsubscribed</h3>
                        <p className="text-5xl font-extrabold text-gray-600">{performance.totalUnsubscribed || 0}</p>
                    </div>
                     {/* Total Complaints */}
                     <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Total Complaints</h3>
                        <p className="text-5xl font-extrabold text-yellow-600">{performance.totalComplaints || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsDashboard;