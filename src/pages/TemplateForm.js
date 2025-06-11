// emailxp/frontend/src/pages/TemplateForm.js

import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill'; // For rich text editing
import 'react-quill/dist/quill.snow.css'; // Quill's CSS for 'snow' theme
import templateService from '../services/templateService';
import { useNavigate, useParams } from 'react-router-dom'; // useParams for edit mode

const TemplateForm = () => {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [plainTextContent, setPlainTextContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const navigate = useNavigate();
    const { id } = useParams(); // Get ID from URL if in edit mode

    // Fetch existing template data if in edit mode (ID exists)
    useEffect(() => {
        if (id) {
            const fetchTemplate = async () => {
                try {
                    setLoading(true);
                    const data = await templateService.getTemplateById(id);
                    setName(data.name);
                    setSubject(data.subject);
                    setHtmlContent(data.htmlContent);
                    setPlainTextContent(data.plainTextContent || ''); // Handle potential null/undefined
                    setLoading(false);
                } catch (err) {
                    console.error('Error fetching template for edit:', err);
                    setError('Failed to load template for editing.');
                    setLoading(false);
                }
            };
            fetchTemplate();
        }
    }, [id]); // Rerun if ID changes (though unlikely for a single form)

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission

        // Basic validation
        if (!name || !subject || !htmlContent) {
            setError('Please fill in all required fields: Name, Subject, and HTML Content.');
            return;
        }

        setError(null); // Clear previous errors
        setSuccess(null); // Clear previous success messages
        setLoading(true);

        const templateData = {
            name,
            subject,
            htmlContent,
            plainTextContent,
        };

        try {
            if (id) {
                // Update existing template
                await templateService.updateTemplate(id, templateData);
                setSuccess('Template updated successfully!');
                navigate('/templates'); // Go back to list after update
            } else {
                // Create new template
                await templateService.createTemplate(templateData);
                setSuccess('Template created successfully!');
                // Optionally clear form or navigate
                setName('');
                setSubject('');
                setHtmlContent('');
                setPlainTextContent('');
                navigate('/templates'); // Go back to list after creation
            }
        } catch (err) {
            console.error('Error saving template:', err);
            // Axios errors from backend have response.data for custom messages
            setError(err.response?.data?.message || 'Failed to save template. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Quill modules (toolbar options)
    const modules = {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ size: [] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' },
            { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video'
    ];

    if (loading && id) { // Only show loading when fetching existing template
        return <div>Loading template data...</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>{id ? 'Edit Template' : 'Create New Template'}</h2>

            {error && <p style={styles.errorMessage}>{error}</p>}
            {success && <p style={styles.successMessage}>{success}</p>}

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label htmlFor="name" style={styles.label}>Template Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label htmlFor="subject" style={styles.label}>Subject:</label>
                    <input
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>HTML Content:</label>
                    <ReactQuill
                        theme="snow" // 'snow' is a clean theme
                        value={htmlContent}
                        onChange={setHtmlContent}
                        modules={modules}
                        formats={formats}
                        style={styles.quillEditor}
                    />
                </div>

                <div style={styles.formGroup}>
                    <label htmlFor="plainTextContent" style={styles.label}>Plain Text Content (Optional):</label>
                    <textarea
                        id="plainTextContent"
                        value={plainTextContent}
                        onChange={(e) => setPlainTextContent(e.target.value)}
                        rows="5"
                        style={styles.textarea}
                        placeholder="Automatically generated from HTML content if left empty, or provide custom plain text."
                    ></textarea>
                </div>

                <button type="submit" disabled={loading} style={styles.submitButton}>
                    {loading ? 'Saving...' : (id ? 'Update Template' : 'Create Template')}
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/templates')}
                    disabled={loading}
                    style={{...styles.submitButton, ...styles.cancelButton}}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '800px',
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
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    formGroup: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: 'bold',
        color: '#555',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '1em',
        boxSizing: 'border-box', // Include padding in width
    },
    textarea: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '1em',
        minHeight: '100px',
        boxSizing: 'border-box',
    },
    quillEditor: {
        height: '250px', // Adjust height as needed
        marginBottom: '50px', // Make space for Quill toolbar below
    },
    submitButton: {
        padding: '12px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '1.1em',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        alignSelf: 'center', // Center the button
        width: 'fit-content',
        marginTop: '20px',
    },
    submitButtonHover: {
        backgroundColor: '#0056b3',
    },
    cancelButton: {
        backgroundColor: '#6c757d', // Grey for cancel
        marginLeft: '10px',
    },
    cancelButtonHover: {
        backgroundColor: '#5a6268',
    },
    errorMessage: {
        color: 'red',
        backgroundColor: '#ffe0e0',
        border: '1px solid red',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '15px',
        textAlign: 'center',
    },
    successMessage: {
        color: 'green',
        backgroundColor: '#e0ffe0',
        border: '1px solid green',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '15px',
        textAlign: 'center',
    },
};

export default TemplateForm;