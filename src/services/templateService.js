// emailxp/frontend/src/services/templateService.js

import axios from 'axios';

// Ensure API_URL is just the base domain (e.g., http://localhost:5000 or https://your-backend.railway.app)
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Helper to construct full API URLs
const getFullApiUrl = (path) => {
    // URL constructor handles potential trailing slashes on API_BASE_URL
    return new URL(path, API_BASE_URL).toString();
};

const getTemplates = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.get(getFullApiUrl('/api/templates'), config);
    return response.data;
};

const createTemplate = async (templateData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.post(getFullApiUrl('/api/templates'), templateData, config);
    return response.data;
};

const getTemplateById = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.get(getFullApiUrl(`/api/templates/${id}`), config);
    return response.data;
};

const updateTemplate = async (id, templateData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.put(getFullApiUrl(`/api/templates/${id}`), templateData, config);
    return response.data;
};

const deleteTemplate = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.delete(getFullApiUrl(`/api/templates/${id}`), config);
    return response.data;
};

const templateService = {
    getTemplates,
    createTemplate,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
};

export default templateService;