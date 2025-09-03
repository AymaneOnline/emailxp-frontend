// emailxp/frontend/src/components/TemplateSharing.js

import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Users, 
  Globe, 
  Lock, 
  Mail, 
  X, 
  Check,
  Eye,
  Edit,
  Shield,
  Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import templateSharingService from '../services/templateSharingService';

const TemplateSharing = ({ template, isOpen, onClose, onUpdate }) => {
  const [shareEmails, setShareEmails] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('view');
  const [sharedUsers, setSharedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(template?.isPublic || false);

  useEffect(() => {
    if (template && isOpen) {
      setIsPublic(template.isPublic || false);
      setSharedUsers(template.sharing?.sharedWith || []);
    }
  }, [template, isOpen]);

  const handleShare = async () => {
    if (!shareEmails.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }

    const emails = shareEmails
      .split(',')
      .map(email => email.trim())
      .filter(email => email);

    if (emails.length === 0) {
      toast.error('Please enter valid email addresses');
      return;
    }

    try {
      setLoading(true);
      const response = await templateSharingService.shareTemplate(
        template._id, 
        emails, 
        selectedPermission
      );

      if (response.shared.length > 0) {
        toast.success(`Template shared with ${response.shared.length} user(s)`);
      }

      if (response.notFound.length > 0) {
        toast.warning(`${response.notFound.length} email(s) not found: ${response.notFound.join(', ')}`);
      }

      // Refresh shared users list
      const updatedTemplate = await templateSharingService.getTemplateShares(template._id);
      setSharedUsers(updatedTemplate.sharing?.sharedWith || []);
      setShareEmails('');
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error sharing template:', error);
      toast.error('Failed to share template');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccess = async (userId) => {
    try {
      await templateSharingService.removeAccess(template._id, userId);
      setSharedUsers(prev => prev.filter(user => user.user._id !== userId));
      toast.success('Access removed successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error removing access:', error);
      toast.error('Failed to remove access');
    }
  };

  const handleUpdatePermissions = async (userId, newPermissions) => {
    try {
      await templateSharingService.updatePermissions(template._id, userId, newPermissions);
      setSharedUsers(prev => 
        prev.map(user => 
          user.user._id === userId 
            ? { ...user, permissions: newPermissions }
            : user
        )
      );
      toast.success('Permissions updated successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    }
  };

  const handleTogglePublic = async () => {
    try {
      if (isPublic) {
        await templateSharingService.makePrivate(template._id);
        setIsPublic(false);
        toast.success('Template made private');
      } else {
        await templateSharingService.makePublic(template._id);
        setIsPublic(true);
        toast.success('Template made public');
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error toggling public status:', error);
      toast.error('Failed to update template visibility');
    }
  };

  const getPermissionIcon = (permission) => {
    switch (permission) {
      case 'view': return <Eye className="h-4 w-4" />;
      case 'edit': return <Edit className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getPermissionColor = (permission) => {
    switch (permission) {
      case 'view': return 'text-blue-600 bg-blue-100';
      case 'edit': return 'text-green-600 bg-green-100';
      case 'admin': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Share2 className="h-6 w-6 text-primary-red" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Share Template</h2>
              <p className="text-sm text-gray-600">{template?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {isPublic ? (
                <Globe className="h-5 w-5 text-green-600" />
              ) : (
                <Lock className="h-5 w-5 text-gray-600" />
              )}
              <div>
                <h3 className="font-medium text-gray-900">
                  {isPublic ? 'Public Template' : 'Private Template'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isPublic 
                    ? 'Anyone can view and use this template'
                    : 'Only you and shared users can access this template'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={handleTogglePublic}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isPublic
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isPublic ? 'Make Private' : 'Make Public'}
            </button>
          </div>

          {/* Share with Users */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Share with Specific Users</span>
            </h3>

            <div className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter email addresses (comma separated)"
                  value={shareEmails}
                  onChange={(e) => setShareEmails(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent"
                />
              </div>
              <select
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-red focus:border-transparent"
              >
                <option value="view">View Only</option>
                <option value="edit">Can Edit</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={handleShare}
                disabled={loading}
                className="px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sharing...' : 'Share'}
              </button>
            </div>
          </div>

          {/* Current Shares */}
          {sharedUsers.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Shared With</h3>
              <div className="space-y-3">
                {sharedUsers.map((share, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-red text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {share.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{share.email}</p>
                        <p className="text-sm text-gray-600">
                          Shared {new Date(share.sharedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={share.permissions}
                        onChange={(e) => handleUpdatePermissions(share.user._id || share.user, e.target.value)}
                        className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-red focus:border-transparent"
                      >
                        <option value="view">View Only</option>
                        <option value="edit">Can Edit</option>
                        <option value="admin">Admin</option>
                      </select>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getPermissionColor(share.permissions)}`}>
                        {getPermissionIcon(share.permissions)}
                        <span className="capitalize">{share.permissions}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveAccess(share.user._id || share.user)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Remove access"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Permission Explanations */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Permission Levels</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span><strong>View Only:</strong> Can view and use the template</span>
              </div>
              <div className="flex items-center space-x-2">
                <Edit className="h-4 w-4" />
                <span><strong>Can Edit:</strong> Can view, use, and modify the template</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span><strong>Admin:</strong> Full access including sharing and deletion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSharing;