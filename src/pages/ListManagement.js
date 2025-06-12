// emailxp/frontend/src/pages/ListManagement.js

import React, { useState, useEffect, useCallback } from 'react';
import listService from '../services/listService';
import { useNavigate, Link } from 'react-router-dom'; // Added Link for the "Create New List" button

function ListManagement() {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchLists = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listService.getLists();
            setLists(data);
        } catch (err) {
            console.error('Error fetching lists:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to fetch lists. Please login again.');
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('user');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchLists();
    }, [fetchLists]);

    const handleDeleteList = async (listId) => {
        if (window.confirm('Are you sure you want to delete this list and all its subscribers?')) {
            setError(null);
            try {
                await listService.deleteList(listId);
                fetchLists(); // Re-fetch lists
                alert('List deleted successfully!'); // Consider a better notification
            } catch (err) {
                console.error('Error deleting list:', err.response?.data || err.message);
                setError(err.response?.data?.message || 'Failed to delete list.');
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading lists...</p>
            </div>
        );
    }

    return (
        <div className="main-content-container">
            <h2 className="section-header">Email Lists</h2>
            {/* Link to create new list */}
            <Link to="/lists/new" className="btn btn-primary create-list-btn margin-bottom-large">
                Create New List
            </Link>

            {error && <p className="text-red margin-bottom-small">Error: {error}</p>}

            {lists.length === 0 ? (
                <p className="text-center margin-top-large text-muted">
                    You don't have any email lists yet. Create one above!
                </p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>List Name</th>
                                <th>Description</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lists.map((list) => (
                                <tr key={list._id}>
                                    <td>{list.name}</td>
                                    <td>{list.description}</td>
                                    <td>{new Date(list.createdAt).toLocaleDateString()}</td>
                                    <td style={{ whiteSpace: 'nowrap' }}>
                                        {/* Link to View Subscribers */}
                                        <button
                                            onClick={() => navigate(`/lists/${list._id}/subscribers`)}
                                            className="btn btn-success margin-right-small"
                                        >
                                            View Subscribers
                                        </button>
                                        {/* Link to Edit List */}
                                        <button
                                            onClick={() => navigate(`/lists/edit/${list._id}`)} // <--- UPDATED TO NAVIGATE TO EDIT FORM
                                            className="btn btn-secondary margin-right-small"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteList(list._id)}
                                            className="btn btn-danger"
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
        </div>
    );
}

export default ListManagement;