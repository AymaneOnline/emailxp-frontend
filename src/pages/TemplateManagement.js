// emailxp/frontend/src/pages/TemplateManagement.js

import React, { useState, useEffect } from 'react';
import templateService from '../services/templateService'; // Path remains correct: ../services
import { Link, useNavigate } from 'react-router-dom';

const TemplateManagement = () => { // <--- Component name changed here
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
        if (window.confirm('Are you sure you want to delete this template?')) {
            try {
                setLoading(true);
                await templateService.deleteTemplate(id);
                setTemplates(templates.filter(template => template._id !== id));
                setLoading(false);
                alert('Template deleted successfully!');
            } catch (err) {
                console.error('Error deleting template:', err);
                setError('Failed to delete template. Please try again.');
                setLoading(false);
            }
        }
    };

    if (loading) {
        return <div>Loading templates...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Error: {error}</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Email Templates</h2>
            <Link to="/templates/new" style={styles.createButton}>Create New Template</Link>

            {templates.length === 0 ? (
                <p>No templates found. Create one!</p>
            ) : (
                <ul style={styles.templateList}>
                    {templates.map((template) => (
                        <li key={template._id} style={styles.templateItem}>
                            <h3 style={styles.templateName}>{template.name}</h3>
                            <p style={styles.templateSubject}>Subject: {template.subject}</p>
                            <p style={styles.templateDate}>Created: {new Date(template.createdAt).toLocaleDateString()}</p>
                            <div style={styles.buttonGroup}>
                                <Link to={`/templates/${template._id}`} style={styles.actionButton}>View</Link>
                                <Link to={`/templates/edit/${template._id}`} style={styles.actionButton}>Edit</Link>
                                <button
                                    onClick={() => handleDelete(template._id)}
                                    style={{ ...styles.actionButton, ...styles.deleteButton }}
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

const styles = {
    container: {
        padding: '20px',
        maxWidth: '900px',
        margin: '20px auto',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    heading: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '25px',
    },
    createButton: {
        display: 'block',
        width: '200px',
        padding: '10px 15px',
        margin: '0 auto 30px auto',
        backgroundColor: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        textAlign: 'center',
        fontSize: '1em',
        transition: 'background-color 0.2s',
    },
    createButtonHover: {
        backgroundColor: '#0056b3',
    },
    templateList: {
        listStyle: 'none',
        padding: '0',
    },
    templateItem: {
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    templateName: {
        margin: '0',
        color: '#007bff',
        fontSize: '1.4em',
    },
    templateSubject: {
        margin: '0',
        color: '#555',
        fontSize: '0.9em',
    },
    templateDate: {
        margin: '0',
        color: '#777',
        fontSize: '0.8em',
    },
    buttonGroup: {
        marginTop: '10px',
        display: 'flex',
        gap: '10px',
    },
    actionButton: {
        padding: '8px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        textDecoration: 'none',
        color: 'white',
        backgroundColor: '#6c757d', // Grey for general actions
        fontSize: '0.9em',
        transition: 'background-color 0.2s',
    },
    actionButtonHover: {
        backgroundColor: '#5a6268',
    },
    deleteButton: {
        backgroundColor: '#dc3545', // Red for delete
    },
    deleteButtonHover: {
        backgroundColor: '#c82333',
    },
};

export default TemplateManagement; // <--- Export name also changed here