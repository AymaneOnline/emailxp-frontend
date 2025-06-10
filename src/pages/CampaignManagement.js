import React, { useState, useEffect } from 'react';
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
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null); // New state for success messages
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
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
            }
        } catch (err) {
            console.error('Error fetching campaigns or lists:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to fetch campaigns or lists. Please login again.');
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('user');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

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
        setSuccessMessage(null); // Clear previous messages
        if (!newCampaignData.name || !newCampaignData.subject || !newCampaignData.htmlContent || !newCampaignData.list) {
            alert('Please fill in all required fields (Name, Subject, HTML Content, and select a List).');
            return;
        }
        try {
            await campaignService.createCampaign(newCampaignData);
            setNewCampaignData({
                name: '',
                subject: '',
                htmlContent: '',
                plainTextContent: '',
                list: lists.length > 0 ? lists[0]._id : '',
            });
            setSuccessMessage('Campaign created successfully!');
            fetchData();
        } catch (err) {
            console.error('Error creating campaign:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to create campaign.');
        }
    };

    const handleDeleteCampaign = async (campaignId) => {
        if (window.confirm('Are you sure you want to delete this campaign?')) {
            setError(null);
            setSuccessMessage(null); // Clear previous messages
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

    // --- NEW FUNCTION: Handle Send Campaign ---
    const handleSendCampaign = async (campaignId, campaignName, listName, subscriberCount) => {
        if (subscriberCount === 0) {
            alert(`The list "${listName}" has no subscribers. Please add subscribers to the list before sending this campaign.`);
            return;
        }
        if (!window.confirm(`Are you sure you want to send "${campaignName}" to ${listName} (${subscriberCount} subscribers)? This action cannot be undone.`)) {
            return;
        }

        setError(null);
        setSuccessMessage(null); // Clear previous messages
        try {
            const response = await campaignService.sendCampaign(campaignId);
            setSuccessMessage(`Campaign "${campaignName}" sending initiated! Check subscriber emails. (Total: ${response.totalSubscribers})`);
            fetchData(); // Re-fetch to update campaign status (e.g., to 'sending' or 'sent')
        } catch (err) {
            console.error('Error sending campaign:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to send campaign.');
        }
    };
    // --- END NEW FUNCTION ---


    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading campaigns...</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '20px auto', border: '1px solid #eee', borderRadius: '8px', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' }}>
            <h2>Email Campaigns</h2>

            {error && <p style={{ color: 'red', marginBottom: '15px' }}>Error: {error}</p>}
            {successMessage && <p style={{ color: 'green', marginBottom: '15px' }}>{successMessage}</p>} {/* Display success messages */}

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
                <p>You don't have any email campaigns yet. Create one above!</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Campaign Name</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Subject</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Target List</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Created At</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.map((campaign) => (
                            <tr key={campaign._id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{campaign.name}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{campaign.subject}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {/* Get the list name directly from populated campaign.list.name */}
                                    {campaign.list ? campaign.list.name : 'N/A'}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{campaign.status}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(campaign.createdAt).toLocaleDateString()}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {/* <button style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button> */}
                                    <button
                                        onClick={() => handleDeleteCampaign(campaign._id)}
                                        style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
                                    >
                                        Delete
                                    </button>
                                    {/* NEW SEND BUTTON */}
                                    {campaign.status === 'draft' || campaign.status === 'paused' ? (
                                        <button
                                            onClick={() => {
                                                console.log("--- Send button clicked for campaign:", campaign.name, "---");
                                                console.log("Campaign's list ID:", campaign.list?._id);
                                                console.log("All lists in state:", lists);

                                                const targetList = lists.find(l => l._id === (campaign.list && campaign.list._id));
                                                console.log("Found targetList:", targetList);

                                                const subscriberCount = targetList?.subscribers?.length || 0;
                                                console.log("Calculated subscriberCount:", subscriberCount);

                                                const listName = campaign.list?.name || 'Unknown List';

                                                handleSendCampaign(campaign._id, campaign.name, listName, subscriberCount);
                                            }}
                                            style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Send
                                        </button>
                                    ) : (
                                        <span style={{ color: '#6c757d', marginLeft: '10px' }}>{campaign.status}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default CampaignManagement;