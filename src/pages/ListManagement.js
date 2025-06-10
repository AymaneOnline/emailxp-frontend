import React, { useState, useEffect } from 'react';
import listService from '../services/listService';
import { useNavigate } from 'react-router-dom';

function ListManagement() {
    const [lists, setLists] = useState([]);
    const [newListName, setNewListName] = useState('');
    const [newListDescription, setNewListDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLists();
    }, []);

    const fetchLists = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listService.getLists();
            setLists(data);
        } catch (err) {
            console.error('Error fetching lists:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to fetch lists. Please login again.');
            // If it's an authorization error, redirect to login
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('user'); // Clear invalid token
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateList = async (e) => {
        e.preventDefault();
        setError(null);
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
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading lists...</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '20px auto', border: '1px solid #eee', borderRadius: '8px', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' }}>
            <h2>Email Lists</h2>

            {error && <p style={{ color: 'red', marginBottom: '15px' }}>Error: {error}</p>}

            <form onSubmit={handleCreateList} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <h3>Create New List</h3>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="newListName" style={{ display: 'block', marginBottom: '5px' }}>List Name:</label>
                    <input
                        type="text"
                        id="newListName"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="newListDescription" style={{ display: 'block', marginBottom: '5px' }}>Description (optional):</label>
                    <textarea
                        id="newListDescription"
                        value={newListDescription}
                        onChange={(e) => setNewListDescription(e.target.value)}
                        rows="3"
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    ></textarea>
                </div>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Create List
                </button>
            </form>

            {lists.length === 0 ? (
                <p>You don't have any email lists yet. Create one above!</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>List Name</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Description</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Created At</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lists.map((list) => (
                            <tr key={list._id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{list.name}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{list.description}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(list.createdAt).toLocaleDateString()}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <button
                                        onClick={() => navigate(`/lists/${list._id}/subscribers`)}
                                        style={{ marginRight: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        View Subscribers
                                    </button>
                                    {/* Edit functionality can be added here as a modal or separate page */}
                                    <button
                                        onClick={() => handleDeleteList(list._id)}
                                        style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ListManagement;