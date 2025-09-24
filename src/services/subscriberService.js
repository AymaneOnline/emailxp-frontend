import axios from 'axios';

const API_URL = '/api/subscribers';

// Get all subscribers with filtering and pagination
const getSubscribers = async (params = {}) => {
    try {
        console.log('Calling getSubscribers with params:', params);
        const response = await axios.get(API_URL, { params });
        console.log('getSubscribers response:', response.data);
        return response.data.subscribers || response.data;
    } catch (error) {
        if (error?.response?.status === 403) {
            // Unverified / onboarding state – return empty list silently
            return [];
        }
        console.error('getSubscribers error:', error.response?.data || error.message);
        throw error;
    }
};

// Get subscribers by group (for backward compatibility)
const getSubscribersByGroup = async (groupId, params = {}) => {
    if (groupId) {
        const response = await axios.get(`${API_URL}/group/${groupId}`, { params });
        // Return just the subscribers array, not the entire response object
        return response.data.subscribers || response.data;
    }
    // If no groupId, get all subscribers
    return getSubscribers(params);
};

// Get single subscriber
const getSubscriber = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

// Create new subscriber
const createSubscriber = async (subscriberData) => {
    try {
        console.log('Creating subscriber with data:', subscriberData);
        const response = await axios.post(API_URL, subscriberData);
        console.log('createSubscriber response:', response.data);
        return response.data;
    } catch (error) {
        console.error('createSubscriber error:', error.response?.data || error.message);
        throw error;
    }
};

// Update subscriber
const updateSubscriber = async (id, subscriberData) => {
    const response = await axios.put(`${API_URL}/${id}`, subscriberData);
    return response.data;
};

// Delete subscriber
const deleteSubscriber = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

// Add subscriber to a group
const addSubscriberToGroup = async (subscriberId, groupId) => {
    const response = await axios.post(`${API_URL}/${subscriberId}/groups/${groupId}`);
    return response.data;
};

// Remove subscriber from a group
const removeSubscriberFromGroup = async (subscriberId, groupId) => {
    const response = await axios.delete(`${API_URL}/${subscriberId}/groups/${groupId}`);
    return response.data;
};

// Bulk import subscribers
const bulkImportSubscribers = async ({ subscribers, groupIds = [], overwriteExisting = false }) => {
    try {
        const response = await axios.post(`${API_URL}/import`, {
            subscribers: subscribers.map(sub => ({
                ...sub,
                status: sub.status || 'subscribed'
            })),
            groupIds,
            overwriteExisting
        });
        return response.data;
    } catch (error) {
        console.error('bulkImportSubscribers error:', error.response?.data || error.message);
        throw error;
    }
};

// Get subscriber statistics
const getSubscriberStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats`);
        return response.data;
    } catch (error) {
        if (error?.response?.status === 403) {
            return null;
        }
        throw error;
    }
};

// Export subscribers (to CSV format)
const exportSubscribers = async (params = {}) => {
    const subscribers = await getSubscribers({ ...params, limit: 1000 });
    
    if (subscribers.length === 0) {
        throw new Error('No subscribers to export');
    }

    // Convert to CSV format
    const headers = ['Email', 'First Name', 'Last Name', 'Status', 'Subscription Date', 'Groups'];
    const csvData = [
        headers.join(','),
        ...subscribers.map(subscriber => [
            subscriber.email,
            subscriber.firstName || '',
            subscriber.lastName || '',
            subscriber.status,
            new Date(subscriber.subscriptionDate).toLocaleDateString(),
            subscriber.groups ? subscriber.groups.map(g => g.name || g).join(';') : ''
        ].map(field => `"${field}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `subscribers_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { message: 'Export completed successfully' };
};

// Get subscriber activity
const getSubscriberActivity = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/activity`);
    return response.data;
};

// Parse CSV for import
const parseCSV = (csvText) => {
    console.log('Parsing CSV:', csvText);
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    console.log('Headers:', headers);
    const emailIndex = headers.findIndex(h => h.includes('email'));
    
    if (emailIndex === -1) {
        throw new Error('CSV file must contain an email column');
    }

    const firstNameIndex = headers.findIndex(h => h.includes('first') && h.includes('name'));
    const lastNameIndex = headers.findIndex(h => h.includes('last') && h.includes('name'));
    const statusIndex = headers.findIndex(h => h.includes('status'));
    // tags removed
    const groupsIndex = headers.findIndex(h => h.includes('group'));

    const subscribers = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
        try {
            const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
            
            if (values.length < headers.length) {
                errors.push({ row: i + 1, error: 'Insufficient columns' });
                continue;
            }

            const email = values[emailIndex];
            if (!email || !email.includes('@')) {
                errors.push({ row: i + 1, error: 'Invalid email address' });
                continue;
            }

            // tags removed
            
            const subscriber = {
                email,
                firstName: firstNameIndex >= 0 ? values[firstNameIndex] : '',
                lastName: lastNameIndex >= 0 ? values[lastNameIndex] : '',
                status: statusIndex >= 0 ? values[statusIndex] : 'subscribed',
                groups: groupsIndex >= 0 ? values[groupsIndex].split(';').map(g => g.trim()).filter(g => g) : []
            };
            
            console.log('Processed subscriber:', subscriber);

            // Validate status
            if (!['subscribed', 'unsubscribed'].includes(subscriber.status)) {
                subscriber.status = 'subscribed';
            }

            subscribers.push(subscriber);
        } catch (error) {
            errors.push({ row: i + 1, error: error.message });
        }
    }

    return { subscribers, errors };
};

// Segment subscribers (advanced filter)
const segmentSubscribers = async (body = {}) => {
    try {
        const response = await axios.post(`${API_URL}/segment`, body);
        return response.data;
    } catch (error) {
        console.error('segmentSubscribers error:', error.response?.data || error.message);
        throw error;
    }
};

const subscriberService = {
    getSubscribers,
    getSubscribersByGroup,
    getSubscriber,
    createSubscriber,
    updateSubscriber,
    deleteSubscriber,
    bulkImportSubscribers,
    getSubscriberStats,
    exportSubscribers,
    parseCSV,
    segmentSubscribers,
    getSubscriberActivity,
    addSubscriberToGroup,
    removeSubscriberFromGroup,
    bulkUpdateStatus: async (ids, status) => {
        const response = await axios.post(`${API_URL}/bulk/status`, { ids, status });
        return response.data;
    },
    exportSelected: async (ids) => {
        const response = await axios.post(`${API_URL}/bulk/export`, { ids }, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `subscribers_selected_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return { message: 'Selected subscribers exported' };
    },
    // Test function
    testAPI: async () => {
        try {
            const response = await axios.get(`${API_URL}/test`);
            console.log('Test API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Test API error:', error.response?.data || error.message);
            throw error;
        }
    }
};

export default subscriberService;