// emailxp/frontend/src/pages/ListForm.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import listService from '../services/listService';

const ListForm = () => {
    const { id } = useParams(); // Get ID from URL for editing
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (id) {
            setIsEditing(true);
            const fetchList = async () => {
                setLoading(true);
                setError(null);
                try {
                    const list = await listService.getListById(id);
                    setName(list.name);
                    setDescription(list.description || '');
                } catch (err) {
                    console.error('Error fetching list for edit:', err.response?.data || err.message);
                    setError(err.response?.data?.message || 'Failed to load list details for editing.');
                    if (err.response && err.response.status === 401) {
                        localStorage.removeItem('user');
                        navigate('/login');
                    }
                } finally {
                    setLoading(false);
                }
            };
            fetchList();
        } else {
            setIsEditing(false);
            // Reset form for new list creation
            setName('');
            setDescription('');
        }
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!name.trim()) {
            setError('List name cannot be empty.');
            setLoading(false);
            return;
        }

        const listData = { name, description };

        try {
            if (isEditing) {
                await listService.updateList(id, listData);
                alert('List updated successfully!'); // Consider a better notification
                navigate('/lists'); // Go back to list management after update
            } else {
                const newList = await listService.createList(listData); // Capture the response which should contain the new list's ID
                alert('List created successfully!'); // Consider a better notification
                // --- NEW REDIRECTION LOGIC ---
                if (newList && newList._id) {
                    navigate(`/lists/${newList._id}/subscribers/new`); // Redirect to add subscribers for the new list
                } else {
                    navigate('/lists'); // Fallback if ID is not returned
                }
                // --- END NEW REDIRECTION LOGIC ---
            }
        } catch (err) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} list:`, err.response?.data || err.message);
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} list.`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading list details...</p>
            </div>
        );
    }

    return (
        <div className="main-content-container">
            <h2 className="section-header">{isEditing ? 'Edit List' : 'Create New List'}</h2>
            <form onSubmit={handleSubmit} className="form-card">
                {error && <p className="text-red margin-bottom-small">Error: {error}</p>}

                <div className="form-group">
                    <label htmlFor="name" className="form-label">List Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="form-input"
                        disabled={loading}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description" className="form-label">Description (optional):</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="3"
                        className="form-textarea"
                        disabled={loading}
                    ></textarea>
                </div>
                <div className="button-group-form">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : (isEditing ? 'Update List' : 'Create List')}
                    </button>
                    <button type="button" onClick={() => navigate('/lists')} className="btn btn-secondary" disabled={loading}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ListForm;