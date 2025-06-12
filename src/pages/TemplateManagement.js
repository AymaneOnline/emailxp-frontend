// emailxp/frontend/src/pages/TemplateManagement.js

import React, { useState, useEffect } from 'react';
import templateService from '../services/templateService';
import { Link, useNavigate } from 'react-router-dom';

const TemplateManagement = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true);
                const data = await templateService.getTemplates();
                setTemplates(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching templates:', err);
                setError('Failed to load templates. Please try again.');
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    const handleDelete = async (id) => {
        // IMPORTANT: Replace window.confirm() with a custom modal/message box in a production app.
        if (window.confirm('Are you sure you want to delete this template?')) {
            try {
                setLoading(true);
                await templateService.deleteTemplate(id);
                setTemplates(templates.filter(template => template._id !== id));
                setLoading(false);
                // IMPORTANT: Replace alert() with a custom notification system in a production app.
                alert('Template deleted successfully!');
            } catch (err) {
                console.error('Error deleting template:', err);
                setError('Failed to delete template. Please try again.');
                setLoading(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading templates...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="text-red">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="main-content-container"> {/* Applying global container style */}
            <h2 className="section-header">Email Templates</h2> {/* Applying global header style */}
            <Link to="/templates/new" className="btn btn-primary create-template-btn margin-bottom-large">
                Create New Template
            </Link>

            {templates.length === 0 ? (
                <p className="text-center text-muted margin-top-large">No templates found. Create one!</p>
            ) : (
                <ul className="template-list"> {/* New class for the template list */}
                    {templates.map((template) => (
                        <li key={template._id} className="template-item"> {/* New class for each template item */}
                            <h3 className="template-name">{template.name}</h3> {/* New class for template name */}
                            <p className="template-subject">Subject: {template.subject}</p> {/* New class for subject */}
                            <p className="template-date">Created: {new Date(template.createdAt).toLocaleDateString()}</p> {/* New class for date */}
                            <div className="button-group"> {/* New class for button group */}
                                <Link to={`/templates/${template._id}`} className="btn btn-secondary">View</Link>
                                <Link to={`/templates/edit/${template._id}`} className="btn btn-secondary">Edit</Link>
                                <button
                                    onClick={() => handleDelete(template._id)}
                                    className="btn btn-danger"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TemplateManagement;