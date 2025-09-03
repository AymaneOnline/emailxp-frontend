import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Save, User, Mail, Tag, X } from 'lucide-react';
import subscriberService from '../services/subscriberService';
import groupService from '../services/groupService';
import tagService from '../services/tagService';

const SubscriberForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    // Form state
    const [formData, setFormData] = useState({
        groupIds: [],
        email: '',
        firstName: '',
        lastName: '',
        status: 'subscribed',
        tags: [],
        customFields: {}
    });

    // UI state
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [newTag, setNewTag] = useState('');
    const [newFieldKey, setNewFieldKey] = useState('');
    const [newFieldValue, setNewFieldValue] = useState('');

    useEffect(() => {
        loadGroups();
        if (isEditing) {
            loadSubscriber();
        }
    }, [isEditing, id]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadGroups = async () => {
        try {
            const fetchedGroups = await groupService.getGroups();
            setGroups(fetchedGroups);
        } catch (error) {
            console.error('Failed to load groups:', error);
            toast.error('Failed to load groups');
        }
    };

    const loadSubscriber = async () => {
        try {
            setLoading(true);
            const subscriber = await subscriberService.getSubscriber(id);

            // Derive first and last name from single name field if present
            let firstName = '';
            let lastName = '';
            if (subscriber.name && typeof subscriber.name === 'string') {
                const parts = subscriber.name.trim().split(/\s+/);
                firstName = parts.shift() || '';
                lastName = parts.join(' ') || '';
            }

            // Map existing tag IDs to names for the tags input chips
            let tagNames = [];
            try {
                const allTags = await tagService.getTags();
                if (Array.isArray(subscriber.tags)) {
                    tagNames = subscriber.tags
                        .map(t => {
                            const id = t && typeof t === 'object' ? t._id : t;
                            const match = allTags.find(tag => tag._id === id);
                            return match ? match.name : null;
                        })
                        .filter(Boolean);
                }
            } catch (e) {
                // If tags fail to load, fall back to empty list of tag names
                tagNames = [];
            }

            setFormData({
                groupIds: subscriber.groups ? subscriber.groups.map(group => group._id || group) : [],
                email: subscriber.email,
                firstName,
                lastName,
                status: subscriber.status,
                tags: tagNames,
                customFields: subscriber.customFields || {}
            });
        } catch (error) {
            console.error('Failed to load subscriber:', error);
            toast.error('Failed to load subscriber');
            navigate('/subscribers');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Groups are now optional

        if (formData.firstName && formData.firstName.length > 50) {
            newErrors.firstName = 'First name must be less than 50 characters';
        }

        if (formData.lastName && formData.lastName.length > 50) {
            newErrors.lastName = 'Last name must be less than 50 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleAddTag = () => {
        if (!newTag.trim()) return;
        
        if (formData.tags.includes(newTag.trim())) {
            toast.error('Tag already exists');
            return;
        }

        if (newTag.length > 30) {
            toast.error('Tag must be less than 30 characters');
            return;
        }

        setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, newTag.trim()]
        }));
        setNewTag('');
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleAddCustomField = () => {
        if (!newFieldKey.trim() || !newFieldValue.trim()) return;
        
        if (formData.customFields[newFieldKey]) {
            toast.error('Field already exists');
            return;
        }

        setFormData(prev => ({
            ...prev,
            customFields: {
                ...prev.customFields,
                [newFieldKey.trim()]: newFieldValue.trim()
            }
        }));
        setNewFieldKey('');
        setNewFieldValue('');
    };

    const handleRemoveCustomField = (fieldKey) => {
        setFormData(prev => {
            const newCustomFields = { ...prev.customFields };
            delete newCustomFields[fieldKey];
            return { ...prev, customFields: newCustomFields };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            // Convert tag names to IDs, create new tags if needed
            let allTags = await tagService.getTags();
            let tagIds = [];
            for (const tagName of formData.tags) {
                let tagObj = allTags.find(t => t.name === tagName);
                if (!tagObj) {
                    // Create new tag
                    tagObj = await tagService.createTag({ name: tagName });
                    allTags.push(tagObj);
                }
                tagIds.push(tagObj._id);
            }
            const submitData = { ...formData, tags: tagIds };
            if (isEditing) {
                await subscriberService.updateSubscriber(id, submitData);
                toast.success('Subscriber updated successfully');
            } else {
                await subscriberService.createSubscriber(submitData);
                toast.success('Subscriber created successfully');
            }
            navigate('/subscribers');
        } catch (error) {
            console.error('Failed to save subscriber:', error);
            toast.error(error.response?.data?.message || 'Failed to save subscriber');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/subscribers')}
                    className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Subscribers
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEditing ? 'Edit Subscriber' : 'Add New Subscriber'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Basic Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Email */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="subscriber@example.com"
                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                        errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                First Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="John"
                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                        errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                />
                            </div>
                            {errors.firstName && (
                                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                placeholder="Doe"
                                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                    errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                            />
                            {errors.lastName && (
                                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="subscribed">Subscribed</option>
                                <option value="unsubscribed">Unsubscribed</option>
                                <option value="bounced">Bounced</option>
                                <option value="complained">Complained</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tags Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Tags
                    </h2>
                    
                    {/* Existing Tags */}
                    {formData.tags.length > 0 && (
                        <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-sm rounded-full"
                                    >
                                        <Tag className="w-3 h-3 mr-1" />
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add New Tag */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a tag"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTag();
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleAddTag}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* Groups Section (moved under Tags) */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Groups (Optional)
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Groups are flexible labels. You can add subscribers to one or more groups or none at all. This does not affect subscription status.
                    </p>
                    {groups.length > 0 ? (
                        <div className="space-y-2">
                            {groups.map(group => (
                                <label key={group._id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.groupIds.includes(group._id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    groupIds: Array.from(new Set([...(prev.groupIds || []), group._id]))
                                                }));
                                            } else {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    groupIds: (prev.groupIds || []).filter(id => id !== group._id)
                                                }));
                                            }
                                        }}
                                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-900 dark:text-white">
                                        {group.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            No groups created yet. You can add this subscriber to groups later from the Subscribers page.
                        </div>
                    )}
                </div>

                {/* Custom Fields Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Custom Fields
                    </h2>
                    
                    {/* Existing Custom Fields */}
                    {Object.keys(formData.customFields).length > 0 && (
                        <div className="mb-4 space-y-2">
                            {Object.entries(formData.customFields).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <span className="font-medium text-gray-700 dark:text-gray-300 min-w-0 flex-1">
                                        {key}:
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400 min-w-0 flex-1">
                                        {value}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCustomField(key)}
                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add New Custom Field */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                            type="text"
                            value={newFieldKey}
                            onChange={(e) => setNewFieldKey(e.target.value)}
                            placeholder="Field name"
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <input
                            type="text"
                            value={newFieldValue}
                            onChange={(e) => setNewFieldValue(e.target.value)}
                            placeholder="Field value"
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <button
                            type="button"
                            onClick={handleAddCustomField}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Add Field
                        </button>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/subscribers')}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        {isEditing ? 'Update' : 'Create'} Subscriber
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubscriberForm;
