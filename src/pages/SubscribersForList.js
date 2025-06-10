import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import listService from '../services/listService'; // This is correct, uses listService

function SubscribersForList() {
    const { listId } = useParams(); // Get listId from URL
    const navigate = useNavigate();
    const [listName, setListName] = useState('');
    const [subscribers, setSubscribers] = useState([]);
    const [newSubscriberEmail, setNewSubscriberEmail] = useState('');
    const [newSubscriberName, setNewSubscriberName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memoize fetchListDataAndSubscribers using useCallback
    const fetchListDataAndSubscribers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const listData = await listService.getListById(listId);
            setListName(listData.name); // Set list name for display

            // This line already uses listService, which is correctly imported.
            const data = await listService.getSubscribers(listId);
            setSubscribers(data);
        } catch (err) {
            console.error('Error fetching list or subscribers:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to fetch list/subscribers. Ensure you have access and login again.');
            if (err.response && (err.response.status === 401 || err.response.status === 404)) {
                // If unauthorized or list not found, go back to list management or login
                localStorage.removeItem('user'); // Clear invalid token
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [listId, navigate]); // Dependencies for useCallback: listId and navigate

    useEffect(() => {
        fetchListDataAndSubscribers();
    }, [fetchListDataAndSubscribers]); // Dependency for useEffect: the memoized function

    const handleAddSubscriber = async (e) => {
        e.preventDefault();
        setError(null);
        if (!newSubscriberEmail) {
            alert('Subscriber email cannot be empty');
            return;
        }
        try {
            await listService.addSubscriber(listId, { email: newSubscriberEmail, name: newSubscriberName });
            setNewSubscriberEmail('');
            setNewSubscriberName('');
            fetchListDataAndSubscribers(); // Re-fetch subscribers
        } catch (err) {
            console.error('Error adding subscriber:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to add subscriber.');
        }
    };

    const handleDeleteSubscriber = async (subscriberId) => {
        if (window.confirm('Are you sure you want to remove this subscriber?')) {
            setError(null);
            try {
                await listService.deleteSubscriber(listId, subscriberId);
                fetchListDataAndSubscribers(); // Re-fetch subscribers
            } catch (err) {
                console.error('Error deleting subscriber:', err.response?.data || err.message);
                setError(err.response?.data?.message || 'Failed to remove subscriber.');
            }
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading subscribers...</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '20px auto', border: '1px solid #eee', borderRadius: '8px', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' }}>
            <button onClick={() => navigate('/lists')} style={{ marginBottom: '20px', padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                &larr; Back to Lists
            </button>
            <h2>Subscribers for "{listName}"</h2>

            {error && <p style={{ color: 'red', marginBottom: '15px' }}>Error: {error}</p>}

            <form onSubmit={handleAddSubscriber} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <h3>Add New Subscriber</h3>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="newSubscriberEmail" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                    <input
                        type="email"
                        id="newSubscriberEmail"
                        value={newSubscriberEmail}
                        onChange={(e) => setNewSubscriberEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="newSubscriberName" style={{ display: 'block', marginBottom: '5px' }}>Name (optional):</label>
                    <input
                        type="text"
                        id="newSubscriberName"
                        value={newSubscriberName}
                        onChange={(e) => setNewSubscriberName(e.target.value)}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Add Subscriber
                </button>
            </form>

            {subscribers.length === 0 ? (
                <p>This list has no subscribers yet. Add one above!</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Email</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Name</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Added On</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscribers.map((subscriber) => (
                            <tr key={subscriber._id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{subscriber.email}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{subscriber.name}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{subscriber.status}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(subscriber.createdAt).toLocaleDateString()}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {/* Edit functionality can be added here as a modal or separate page */}
                                    <button
                                        onClick={() => handleDeleteSubscriber(subscriber._id)}
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

export default SubscribersForList;