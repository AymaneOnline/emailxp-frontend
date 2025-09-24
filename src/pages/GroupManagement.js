// emailxp/frontend/src/pages/GroupManagement.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import groupService from '../services/groupService';
import { toast } from 'react-toastify';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Skeleton } from '../components/ui/Skeleton';

function GroupManagement() {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const data = await groupService.getGroups();
            setGroups(data);
        } catch (err) {
            console.error('Error fetching groups:', err);
            setError('Failed to load groups');
            toast.error('Failed to load groups');
        } finally {
            setLoading(false);
        }
    };

    const requestDeleteGroup = (group) => setDeleteTarget(group);
    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await groupService.deleteGroup(deleteTarget._id);
            setGroups(prev => prev.filter(g => g._id !== deleteTarget._id));
            toast.success('Group deleted successfully');
        } catch (err) {
            console.error('Error deleting group:', err);
            toast.error('Failed to delete group');
        } finally {
            setDeleteTarget(null);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Groups" description="Organize subscribers into logical collections" actions={<Button onClick={() => navigate('/groups/new')}>New Group</Button>} />
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                            <div className="flex justify-between mb-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-16" /></div>
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Groups" description="Organize subscribers into logical collections" actions={<Button onClick={() => navigate('/groups/new')}>New Group</Button>} />
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>
            )}
            {groups.length === 0 ? (
                <EmptyState
                  title="No groups yet"
                  description="Create groups to segment subscribers and target campaigns more effectively."
                  actionLabel="Create Group"
                  onAction={() => navigate('/groups/new')}
                />
            ) : (
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribers</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {groups.map(group => (
                                <tr key={group._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{group.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{group.description || '—'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{group.subscribers ? group.subscribers.length : 0}</td>
                                    <td className="px-6 py-4 text-right text-sm flex items-center justify-end gap-3">
                                        <Button variant="ghost" size="sm" aria-label={`Edit group ${group.name}`} onClick={() => navigate(`/groups/edit/${group._id}`)}>Edit</Button>
                                        <Button variant="ghost" size="sm" aria-label={`View subscribers in ${group.name}`} onClick={() => navigate(`/groups/${group._id}/subscribers`)}>View</Button>
                                        <Button variant="danger" size="sm" aria-label={`Delete group ${group.name}`} onClick={() => requestDeleteGroup(group)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <ConfirmDialog
              open={!!deleteTarget}
              title="Delete Group"
              description={`Are you sure you want to delete the group "${deleteTarget?.name}"? This action cannot be undone.`}
              confirmLabel="Delete"
              onConfirm={confirmDelete}
              onCancel={() => setDeleteTarget(null)}
              variant="danger"
            />
        </div>
    );
}

export default GroupManagement;