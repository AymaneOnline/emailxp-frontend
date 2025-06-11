// emailxp/frontend/src/pages/TemplateView.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import templateService from '../services/templateService';

const TemplateView = () => {
    const { id } = useParams(); // Get the template ID from the URL
    const navigate = useNavigate();
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                setLoading(true);
                const data = await templateService.getTemplateById(id);
                setTemplate(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching template:', err);
                setError('Failed to load template details. Please try again.');
                setLoading(false);
            }
        };

        if (id) {
            fetchTemplate();
        } else {
            setError('No template ID provided.');
            setLoading(false);
        }
    }, [id]); // Re-fetch if ID changes

    if (loading) {
        return <div style={styles.container}>Loading template details...</div>;
    }

    if (error) {
        return <div style={{ ...styles.container, color: 'red' }}>Error: {error}</div>;
    }

    if (!template) {
        return <div style={styles.container}>Template not found.</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Template: {template.name}</h2>
            <p style={styles.detail}><strong>Subject:</strong> {template.subject}</p>
            <p style={styles.detail}><strong>Created At:</strong> {new Date(template.createdAt).toLocaleDateString()}</p>
            {template.updatedAt && (
                <p style={styles.detail}><strong>Last Updated:</strong> {new Date(template.updatedAt).toLocaleDateString()}</p>
            )}

            <div style={styles.contentSection}>
                <h3 style={styles.subHeading}>HTML Content Preview:</h3>
                {/* DANGER: Using dangerouslySetInnerHTML. Be careful with untrusted input. */}
                {/* For production, sanitize HTML if user-provided content is allowed. */}
                <div style={styles.htmlPreview} dangerouslySetInnerHTML={{ __html: template.htmlContent }}></div>
            </div>

            <div style={styles.contentSection}>
                <h3 style={styles.subHeading}>Plain Text Content:</h3>
                <pre style={styles.plainText}>{template.plainTextContent || 'No plain text content provided.'}</pre>
            </div>

            <div style={styles.buttonGroup}>
                <button onClick={() => navigate(`/templates/edit/${template._id}`)} style={styles.editButton}>Edit Template</button>
                <button onClick={() => navigate('/templates')} style={styles.backButton}>Back to Templates</button>
            </div>
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
        fontFamily: 'Arial, sans-serif',
    },
    heading: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '25px',
    },
    subHeading: {
        color: '#444',
        borderBottom: '1px solid #eee',
        paddingBottom: '5px',
        marginBottom: '15px',
    },
    detail: {
        fontSize: '1em',
        marginBottom: '10px',
        color: '#555',
    },
    contentSection: {
        marginTop: '30px',
        marginBottom: '30px',
        border: '1px solid #e0e0e0',
        padding: '15px',
        borderRadius: '5px',
        backgroundColor: '#fff',
    },
    htmlPreview: {
        border: '1px solid #ccc',
        padding: '15px',
        minHeight: '150px',
        backgroundColor: '#fff',
        overflowY: 'auto',
        maxHeight: '400px',
    },
    plainText: {
        border: '1px solid #ccc',
        padding: '15px',
        minHeight: '100px',
        backgroundColor: '#f0f0f0',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap', // Preserve whitespace and wrap text
        maxHeight: '200px',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        marginTop: '30px',
    },
    editButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.2s',
    },
    editButtonHover: {
        backgroundColor: '#0056b3',
    },
    backButton: {
        padding: '10px 20px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.2s',
    },
    backButtonHover: {
        backgroundColor: '#5a6268',
    },
};

export default TemplateView;