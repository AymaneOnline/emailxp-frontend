import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import listService from '../services/listService';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';
import 'react-toastify/dist/ReactToastify.css';

function SubscriberManagement() {
    const { listId } = useParams();
    const navigate = useNavigate();

    const [listDetails, setListDetails] = useState(null);
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Removed: Add Subscriber Modal States (showAddModal, newSubscriberData)
    // Removed: Handlers for Add Subscriber Modal (handleAddModalOpen, handleAddModalClose, handleAddSubscriberChange, handleAddSubscriberSubmit)

    // Delete Subscriber Confirm Modal States
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [subscriberToDelete, setSubscriberToDelete] = useState(null);


    const fetchSubscribers = useCallback(async () => {
        setLoading(true);
        setError(null);

        if (!listId || listId === 'undefined' || listId === 'null') {
            setError('Invalid List ID provided in the URL.');
            setLoading(false);
            return;
        }

        try {
            const listData = await listService.getListById(listId);
            setListDetails(listData);

            const filters = { search: searchTerm, status: statusFilter };
            const filteredSubscribers = await listService.getSubscribersByList(listId, filters);
            setSubscribers(filteredSubscribers);

        } catch (err) {
            console.error('Error fetching list or subscribers:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to load list or subscribers.');
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('user');
                navigate('/login');
            } else if (err.response && err.response.status === 404) {
                setError('List not found.');
            }
        } finally {
            setLoading(false);
        }
    }, [listId, navigate, searchTerm, statusFilter]);

    useEffect(() => {
        fetchSubscribers();
    }, [fetchSubscribers]);

    // Handlers for Delete Subscriber Confirm Modal
    const handleDeleteConfirmOpen = (subscriber) => {
        setSubscriberToDelete(subscriber);
        setShowConfirmModal(true);
    };

    const handleDeleteConfirmClose = () => {
        setSubscriberToDelete(null);
        setShowConfirmModal(false);
    };

    const handleDeleteSubscriber = async () => {
        if (!subscriberToDelete) return;

        try {
            await listService.deleteSubscriber(listId, subscriberToDelete._id);
            toast.success('Subscriber deleted successfully!');
            handleDeleteConfirmClose();
            fetchSubscribers(); // Re-fetch subscribers
        } catch (err) {
            console.error('Error deleting subscriber:', err.response?.data || err.message);
            toast.error(err.response?.data?.message || 'Failed to delete subscriber.');
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('user');
                navigate('/login');
            }
        }
    };

    const handleApplyFilters = () => {
        fetchSubscribers(); // Re-fetch with current filter states
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        fetchSubscribers(); // Explicitly call fetch to re-fetch with cleared filters
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading subscribers...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h3>Error Loading List or Subscribers</h3>
                <p>{error}</p>
                <Link to="/lists" className="btn btn-primary margin-top-large">
                    Back to Lists
                </Link>
            </div>
        );
    }

    if (!listDetails) {
        return (
            <div className="no-data-container">
                <p>List not found or no details available.</p>
                <Link to="/lists" className="btn btn-primary margin-top-large">
                    Back to Lists
                </Link>
            </div>
        );
    }

    return (
        <div className="main-content-container">
            <h2 className="section-header">
                Subscribers for: {listDetails.name}
            </h2>
            <p className="text-muted">{listDetails.description}</p>

            <div className="filter-section form-card margin-bottom-large">
                <h3>Filter Subscribers</h3>
                <div className="filter-inputs">
                    <div className="form-group">
                        <label htmlFor="searchTerm">Search:</label>
                        <input
                            type="text"
                            id="searchTerm"
                            className="form-input"
                            placeholder="Email, First Name, Last Name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="statusFilter">Status:</label>
                        <select
                            id="statusFilter"
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="subscribed">Subscribed</option>
                            <option value="unsubscribed">Unsubscribed</option>
                            <option value="bounced">Bounced</option>
                            <option value="complaint">Complaint</option>
                        </select>
                    </div>
                </div>
                <div className="filter-actions">
                    <button onClick={handleApplyFilters} className="btn btn-primary margin-right-small">Apply Filters</button>
                    <button onClick={handleClearFilters} className="btn btn-secondary">Clear Filters</button>
                </div>
            </div>

            <button onClick={() => navigate(`/lists/${listId}/subscribers/new`)} className="btn btn-primary margin-bottom-large">
                Add New Subscriber
            </button>

            {subscribers.length === 0 ? (
                <p className="text-center text-muted">
                    No subscribers found for this list.
                </p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((subscriber) => (
                                <tr key={subscriber._id}>
                                    <td>{subscriber.email}</td>
                                    <td>{subscriber.firstName}</td>
                                    <td>{subscriber.lastName}</td>
                                    <td>{subscriber.status}</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        <button
                                            onClick={() => navigate(`/lists/${listDetails._id}/subscribers/edit/${subscriber._id}`)}
                                            className="btn btn-info btn-small margin-right-small"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteConfirmOpen(subscriber)}
                                            className="btn btn-danger btn-small"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Link to="/lists" className="btn btn-secondary margin-top-large">
                Back to Lists
            </Link>

            <ConfirmModal
                show={showConfirmModal}
                onClose={handleDeleteConfirmClose}
                onConfirm={handleDeleteSubscriber}
                message={`Are you sure you want to delete subscriber "${subscriberToDelete?.email}"?`}
            />
        </div>
    );
}

export default SubscriberManagement;