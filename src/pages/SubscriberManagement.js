// emailxp/frontend/src/pages/SubscriberManagement.js

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import listService from '../services/listService';

const SubscriberManagement = () => {
    const { listId } = useParams();
    const navigate = useNavigate();

    const [subscribers, setSubscribers] = useState([]);
    const [listName, setListName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSubscribers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await listService.getListById(listId);
            setListName(list.name);

            const fetchedSubscribers = await listService.getSubscribers(listId);
            setSubscribers(fetchedSubscribers);
        } catch (err) {
            console.error('Error fetching subscribers or list:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to load subscribers. Please try again.');
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('user');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [listId, navigate]);

    useEffect(() => {
        if (listId) {
            fetchSubscribers();
        } else {
            setError('No list ID provided.');
            setLoading(false);
        }
    }, [listId, fetchSubscribers]);

    const handleDeleteSubscriber = async (subscriberIdToDelete) => {
        if (window.confirm('Are you sure you want to delete this subscriber?')) {
            setError(null);
            try {
                await listService.deleteSubscriber(listId, subscriberIdToDelete);
                alert('Subscriber deleted successfully!');
                fetchSubscribers(); // Re-fetch to update the list
            } catch (err) {
                console.error('Error deleting subscriber:', err.response?.data || err.message);
                setError(err.response?.data?.message || 'Failed to delete subscriber.');
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading subscribers...</p>
            </div>
        );
    }

    if (error && error !== "Edit functionality for subscribers is not fully implemented yet.") { // Filter out the specific edit error
        return (
            <div className="main-content-container">
                <p className="error-message">Error: {error}</p>
                <button onClick={() => navigate('/lists')} className="btn btn-secondary margin-top-large">
                    Back to Lists
                </button>
            </div>
        );
    }

    return (
        <div className="main-content-container">
            <h2 className="section-header-no-btn">Subscribers for: {listName}</h2>
            <div className="button-group-top">
                <Link to="/lists" className="btn btn-secondary">
                    Back to Lists
                </Link>
                {/* Add New Subscriber Button */}
                <Link to={`/lists/${listId}/subscribers/new`} className="btn btn-primary margin-left-small">
                    Add New Subscriber
                </Link>
            </div>

            {error && error === "Edit functionality for subscribers is not fully implemented yet." && // Display only if it's the specific edit error
                <p className="text-red margin-bottom-small">Note: {error}</p>
            }


            {subscribers.length === 0 ? (
                <p className="text-center text-muted margin-top-large">No subscribers found for this list. Click "Add New Subscriber" to add one.</p>
            ) : (
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Status</th>
                                <th>Added On</th>
                                <th>Actions</th> {/* <--- UNCOMMENTED ACTIONS */}
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((subscriber) => (
                                <tr key={subscriber._id}>
                                    <td>{subscriber.email}</td>
                                    <td>{subscriber.firstName || '-'}</td>
                                    <td>{subscriber.lastName || '-'}</td>
                                    <td className={`status-badge status-${subscriber.status ? subscriber.status.toLowerCase() : 'unknown'}`}>
                                        {subscriber.status || 'Unknown'}
                                    </td>
                                    <td>{new Date(subscriber.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="button-group-inline">
                                            {/* Link to Edit Subscriber (currently only add is fully functional in form) */}
                                            {/* <button onClick={() => navigate(`/lists/${listId}/subscribers/edit/${subscriber._id}`)} className="btn btn-sm btn-secondary margin-right-small">Edit</button> */}
                                            <button onClick={() => handleDeleteSubscriber(subscriber._id)} className="btn btn-sm btn-danger">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SubscriberManagement;