// emailxp/frontend/src/pages/SubscriberForm.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import listService from '../services/listService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SubscriberForm() {
    const { listId, subscriberId } = useParams(); // Get both listId and subscriberId
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        status: 'subscribed' // Default for new subscribers
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // New state to track mode

    useEffect(() => {
        // If subscriberId exists in the URL, we are in edit mode
        if (subscriberId) {
            setIsEditing(true);
            const fetchSubscriber = async () => {
                setLoading(true);
                setError(null);
                try {
                    const data = await listService.getSubscriberById(listId, subscriberId);
                    setFormData(data); // Pre-fill the form with existing data
                } catch (err) {
                    console.error('Error fetching subscriber:', err);
                    setError(err.response?.data?.message || 'Failed to load subscriber data.');
                    toast.error('Failed to load subscriber for editing.');
                    if (err.response && err.response.status === 401) {
                        localStorage.removeItem('user');
                        navigate('/login');
                    } else {
                        navigate(`/lists/${listId}/subscribers`); // Redirect back if error
                    }
                } finally {
                    setLoading(false);
                }
            };
            fetchSubscriber();
        } else {
            setIsEditing(false);
            setFormData({ // Reset form for new creation if no subscriberId
                email: '',
                firstName: '',
                lastName: '',
                status: 'subscribed'
            });
        }
    }, [listId, subscriberId, navigate]); // Re-run effect if listId or subscriberId changes

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditing) {
                // Update existing subscriber
                await listService.updateSubscriber(listId, subscriberId, formData);
                toast.success('Subscriber updated successfully!');
            } else {
                // Add new subscriber
                await listService.addSubscriberToList(listId, formData);
                toast.success('Subscriber added successfully!');
            }
            // Navigate back to the subscribers list for the current list
            navigate(`/lists/${listId}/subscribers`);
        } catch (err) {
            console.error('Error saving subscriber:', err.response?.data || err.message);
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} subscriber.`);
            toast.error(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} subscriber.`);
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('user');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) { // Show loading only when fetching existing data for edit
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading subscriber data...</p>
            </div>
        );
    }

    if (error && isEditing) { // Display error if failed to load subscriber for edit
        return (
            <div className="error-container">
                <h3>Error</h3>
                <p>{error}</p>
                <button onClick={() => navigate(`/lists/${listId}/subscribers`)} className="btn btn-primary margin-top-large">
                    Back to Subscribers
                </button>
            </div>
        );
    }

    return (
        <div className="form-card">
            <h2 className="section-header">{isEditing ? 'Edit Subscriber' : 'Add New Subscriber'}</h2>
            <p className="text-muted">For List ID: {listId}</p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="firstName">First Name (optional):</label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName">Last Name (optional):</label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="status">Status:</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="form-select"
                        required
                    >
                        <option value="subscribed">Subscribed</option>
                        <option value="unsubscribed">Unsubscribed</option>
                        <option value="bounced">Bounced</option>
                        <option value="complaint">Complaint</option>
                    </select>
                </div>
                {error && <p className="error-message">{error}</p>}
                <div className="button-group-form">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Subscriber' : 'Add Subscriber')}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/lists/${listId}/subscribers`)}
                        className="btn btn-secondary"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SubscriberForm;