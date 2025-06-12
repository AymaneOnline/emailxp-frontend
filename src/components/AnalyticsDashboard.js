// emailxp/frontend/src/components/AnalyticsDashboard.js

import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux'; // <--- REMOVE THIS IMPORT
import axios from 'axios';
import { toast } from 'react-toastify'; // Make sure you have react-toastify installed and set up in App.js if not already.
import Spinner from './Spinner'; // Assuming you have a Spinner component

// Receive 'user' as a prop
function AnalyticsDashboard({ user }) {
    // const { user } = useSelector((state) => state.auth); // <--- REMOVE OR COMMENT OUT THIS LINE
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            // Check if user and token exist from the prop
            if (!user || !user.token) {
                setError('User not authenticated. Please log in.');
                setLoading(false);
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            try {
                setLoading(true);
                setError(null); // Clear previous errors
                const response = await axios.get('/api/campaigns/dashboard-stats', config);
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                // Handle various error responses
                const message = (err.response && err.response.data && err.response.data.message) || err.message || err.toString();
                setError(message);
                toast.error(`Dashboard Error: ${message}`); // More specific toast
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, [user]); // Re-run if user prop changes

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

    if (!stats) {
        return (
            <div className="container p-4">
                <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
                <p>No data available. Send some campaigns!</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Overall Campaign Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Campaigns Sent */}
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Total Campaigns Sent</h3>
                    <p className="text-5xl font-extrabold text-blue-600">{stats.totalCampaignsSent}</p>
                </div>

                {/* Total Emails Sent */}
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Total Emails Sent</h3>
                    <p className="text-5xl font-extrabold text-green-600">{stats.totalEmailsSent}</p>
                </div>

                {/* Overall Open Rate */}
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Overall Open Rate</h3>
                    <p className="text-5xl font-extrabold text-purple-600">{stats.overallOpenRate}%</p>
                    <p className="text-sm text-gray-500 mt-2">({stats.totalUniqueOpens} unique opens)</p>
                </div>

                {/* Overall Click Rate */}
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Overall Click Rate</h3>
                    <p className="text-5xl font-extrabold text-red-600">{stats.overallClickRate}%</p>
                    <p className="text-sm text-gray-500 mt-2">({stats.totalUniqueClicks} unique clicks)</p>
                </div>
            </div>

            {/* You can add more sections here later, e.g., charts, recent campaign summaries */}
        </div>
    );
}

export default AnalyticsDashboard;