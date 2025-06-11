// emailxp/frontend/src/services/templateService.js

import axios from 'axios';

// Replace with your actual backend URL (e.g., 'http://localhost:5000' during development)
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';

// You might need to add headers for authentication if your API is protected
// const config = (token) => {
//     return {
//         headers: {
//             Authorization: `Bearer ${token}`,
//         },
//     };
// };

// --- Create Template ---
const createTemplate = async (templateData, token) => {
    // const response = await axios.post(`${API_URL}/templates`, templateData, config(token));
    const response = await axios.post(`${API_URL}/templates`, templateData); // For now, assuming no token needed
    return response.data;
};

// --- Get All Templates ---
const getTemplates = async (token) => {
    // const response = await axios.get(`${API_URL}/templates`, config(token));
    const response = await axios.get(`${API_URL}/templates`); // For now, assuming no token needed
    return response.data;
};

// --- Get Template by ID ---
const getTemplateById = async (id, token) => {
    // const response = await axios.get(`${API_URL}/templates/${id}`, config(token));
    const response = await axios.get(`${API_URL}/templates/${id}`); // For now, assuming no token needed
    return response.data;
};

// --- Update Template ---
const updateTemplate = async (id, templateData, token) => {
    // const response = await axios.put(`${API_URL}/templates/${id}`, templateData, config(token));
    const response = await axios.put(`${API_URL}/templates/${id}`, templateData); // For now, assuming no token needed
    return response.data;
};

// --- Delete Template ---
const deleteTemplate = async (id, token) => {
    // const response = await axios.delete(`${API_URL}/templates/${id}`, config(token));
    const response = await axios.delete(`${API_URL}/templates/${id}`); // For now, assuming no token needed
    return response.data;
};

const templateService = {
    createTemplate,
    getTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
};

export default templateService;