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
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading template data...</p>
            </div>
        );
    }

    return (
        <div className="main-content-container"> {/* Replaced styles.container */}
            <h2 className="section-header">{id ? 'Edit Template' : 'Create New Template'}</h2> {/* Replaced styles.heading */}

            {error && <p className="error-message">{error}</p>} {/* New error message class */}
            {success && <p className="success-message">{success}</p>} {/* New success message class */}

            <form onSubmit={handleSubmit} className="form-card"> {/* Replaced styles.form with form-card */}
                <div className="form-group"> {/* Replaced styles.formGroup */}
                    <label htmlFor="name" className="form-label">Template Name:</label> {/* Replaced styles.label */}
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>

                <div className="form-group"> {/* Replaced styles.formGroup */}
                    <label htmlFor="subject" className="form-label">Subject:</label> {/* Replaced styles.label */}
                    <input
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>

                <div className="form-group"> {/* Replaced styles.formGroup */}
                    <label className="form-label">HTML Content:</label> {/* Replaced styles.label */}
                    <ReactQuill
                        theme="snow" // 'snow' is a clean theme
                        value={htmlContent}
                        onChange={setHtmlContent}
                        modules={modules}
                        formats={formats}
                        className="quill-editor"
                    />
                </div>

                <div className="form-group"> {/* Replaced styles.formGroup */}
                    <label htmlFor="plainTextContent" className="form-label margin-top-large">Plain Text Content (Optional):</label> {/* Replaced styles.label */}
                    <textarea
                        id="plainTextContent"
                        value={plainTextContent}
                        onChange={(e) => setPlainTextContent(e.target.value)}
                        rows="5"
                        className="form-textarea"
                        placeholder="Automatically generated from HTML content if left empty, or provide custom plain text."
                    ></textarea>
                </div>

                <div className="button-group-form"> {/* New class for the form buttons */}
                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? 'Saving...' : (id ? 'Update Template' : 'Create Template')}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/templates')}
                        disabled={loading}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TemplateForm;