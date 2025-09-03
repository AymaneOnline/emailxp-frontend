// emailxp/frontend/src/services/fileService.js

import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL
    ? `${process.env.REACT_APP_BACKEND_URL}/api/files`
    : 'http://localhost:5000/api/files';

// Helper to get auth header
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.token ? { Authorization: `Bearer ${user.token}` } : {};
};

// Upload a new file
const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file); // 'file' must match the field name in multer setup on backend

    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...getAuthHeader(),
        },
    };

    const response = await axios.post(`${API_URL}/upload`, formData, config);
    return response.data.file; // Return the created file object
};

// Get all files for the authenticated user
const getFiles = async () => {
    const config = {
        headers: getAuthHeader(),
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

// Delete a file by its publicId
const deleteFile = async (publicId) => {
    const config = {
        headers: getAuthHeader(),
    };
    const response = await axios.delete(`${API_URL}/${publicId}`, config);
    return response.data;
};

const fileService = {
    uploadFile,
    getFiles,
    deleteFile,
};

export default fileService;
