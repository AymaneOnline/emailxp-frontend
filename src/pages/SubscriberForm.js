// emailxp/frontend/src/pages/SubscriberForm.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import listService from '../services/listService';

const SubscriberForm = () => {
    const { listId, subscriberId } = useParams();
    const navigate = useNavigate();

    // --- UPDATED DEFAULT STATUS TO 'subscribed' ---
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [status, setStatus] = useState('subscribed'); // Changed 'active' to 'subscribed'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (subscriberId) {
            setIsEditing(true);
            setError("Edit functionality for subscribers is not fully implemented yet.");
            console.log("Attempting to edit subscriber ID:", subscriberId);
        } else {
            setIsEditing(false);
        }
    }, [subscriberId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!email.trim()) {
            setError('Email is required.');
            setLoading(false);
            return;
        }

        const subscriberData = { email, firstName, lastName, status };

        try {
            if (isEditing) {
                setError("Editing subscribers is not yet fully functional.");
            } else {
                await listService.addSubscriber(listId, subscriberData);
                alert('Subscriber added successfully!');
            }
            navigate(`/lists/${listId}/subscribers`);
        } catch (err) {
            console.error(`Error ${isEditing ? 'updating' : 'adding'} subscriber:`, err.response?.data || err.message);
            // Check for specific duplicate email error message from backend if applicable
            if (err.response && err.response.data && err.response.data.message && err.response.data.message.includes('duplicate key error')) {
                 setError('A subscriber with this email already exists in this list.');
            } else {
                setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} subscriber.`);
            }
        } finally {
            setLoading(false);
        }
    };

    if (isEditing && error && error !== "Edit functionality for subscribers is not fully implemented yet.") {
        return (
            <div className="main-content-container">
                <p className="error-message">Error: {error}</p>
                <button onClick={() => navigate(`/lists/${listId}/subscribers`)} className="btn btn-secondary margin-top-large">
                    Back to Subscribers
                </button>
            </div>
        );
    }


    return (
        <div className="main-content-container">
            <h2 className="section-header">{isEditing ? 'Edit Subscriber' : 'Add New Subscriber'}</h2>
            <form onSubmit={handleSubmit} className="form-card">
                {error && <p className="text-red margin-bottom-small">Error: {error}</p>}

                <div className="form-group">
                    <label htmlFor="email" className="form-label">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-input"
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="firstName" className="form-label">First Name (optional):</label>
                    <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="form-input"
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="lastName" className="form-label">Last Name (optional):</label>
                    <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="form-input"
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="status" className="form-label">Status:</label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="form-select"
                        disabled={loading}
                    >
                        {/* --- UPDATED OPTION VALUES TO MATCH BACKEND ENUM --- */}
                        <option value="subscribed">Subscribed</option> {/* Changed 'Active' to 'Subscribed' */}
                        <option value="unsubscribed">Unsubscribed</option>
                        <option value="bounced">Bounced</option>
                        <option value="complaint">Complaint</option> {/* Changed 'Complained' to 'Complaint' */}
                    </select>
                </div>
                <div className="button-group-form">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : (isEditing ? 'Update Subscriber' : 'Add Subscriber')}
                    </button>
                    <button type="button" onClick={() => navigate(`/lists/${listId}/subscribers`)} className="btn btn-secondary" disabled={loading}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubscriberForm;