import React, { useState, useEffect, useCallback } from 'react';
import listService from '../services/listService';
import { useNavigate } from 'react-router-dom';

function ListManagement() {
    const [lists, setLists] = useState([]);
    const [newListName, setNewListName] = useState('');
    const [newListDescription, setNewListDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Memoize fetchLists using useCallback
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
    }, [navigate]); // Dependencies: only navigate, as state setters are stable

    useEffect(() => {
        fetchLists();
    }, [fetchLists]);

    const handleCreateList = async (e) => {
        e.preventDefault();
        setError(null);
        // IMPORTANT: Replace alert() with a custom modal/message box in a production app.
        if (!newListName) {
            alert('List name cannot be empty');
            return;
        }
        try {
            await listService.createList({ name: newListName, description: newListDescription });
            setNewListName('');
            setNewListDescription('');
            fetchLists(); // Re-fetch lists to update the UI
        } catch (err) {
            console.error('Error creating list:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to create list.');
        }
    };

    const handleDeleteList = async (listId) => {
        // IMPORTANT: Replace window.confirm() with a custom modal/message box in a production app.
        if (window.confirm('Are you sure you want to delete this list and all its subscribers?')) {
            setError(null);
            try {
                await listService.deleteList(listId);
                fetchLists(); // Re-fetch lists
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
        <div className="main-content-container"> {/* Applying global container style */}
            <h2>Email Lists</h2>

            {error && <p className="text-red margin-bottom-small">Error: {error}</p>}

            <form onSubmit={handleCreateList} className="form-card margin-bottom-large"> {/* New form container style */}
                <h3>Create New List</h3>
                <div className="form-group">
                    <label htmlFor="newListName" className="form-label">List Name:</label>
                    <input
                        type="text"
                        id="newListName"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="newListDescription" className="form-label">Description (optional):</label>
                    <textarea
                        id="newListDescription"
                        value={newListDescription}
                        onChange={(e) => setNewListDescription(e.target.value)}
                        rows="3"
                        className="form-textarea"
                    ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                    Create List
                </button>
            </form>

            {lists.length === 0 ? (
                <p className="text-center margin-top-large text-muted">
                    You don't have any email lists yet. Create one above!
                </p>
            ) : (
                <div style={{ overflowX: 'auto' }}> {/* Keep overflowX for table responsiveness if needed */}
                    <table className="data-table"> {/* Applying global table style */}
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
                                    <td style={{ whiteSpace: 'nowrap' }}> {/* Keep white-space to prevent wrapping buttons */}
                                        <button
                                            onClick={() => navigate(`/lists/${list._id}/subscribers`)}
                                            className="btn btn-success margin-right-small"
                                        >
                                            View Subscribers
                                        </button>
                                        {/* Edit functionality can be added here as a modal or separate page */}
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