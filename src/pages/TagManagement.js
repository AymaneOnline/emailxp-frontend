import React, { useState, useEffect } from 'react';
import tagService from '../services/tagService';
import { toast } from 'react-toastify';

const TagManagement = () => {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState({ name: '', color: '#3B82F6', description: '' });
  const [editingTag, setEditingTag] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadTags = async () => {
    setLoading(true);
    try {
      const data = await tagService.getTags();
      setTags(data);
    } catch (error) {
      toast.error('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await tagService.createTag(newTag);
      toast.success('Tag created');
      setNewTag({ name: '', color: '#3B82F6', description: '' });
      loadTags();
    } catch (error) {
      toast.error('Failed to create tag');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await tagService.updateTag(editingTag._id, editingTag);
      toast.success('Tag updated');
      setEditingTag(null);
      loadTags();
    } catch (error) {
      toast.error('Failed to update tag');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tag?')) return;
    try {
      await tagService.deleteTag(id);
      toast.success('Tag deleted');
      loadTags();
    } catch (error) {
      toast.error('Failed to delete tag');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Tags</h1>
      <form onSubmit={editingTag ? handleUpdate : handleCreate} className="mb-6 space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={editingTag ? editingTag.name : newTag.name}
            onChange={e => editingTag ? setEditingTag({ ...editingTag, name: e.target.value }) : setNewTag({ ...newTag, name: e.target.value })}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Color</label>
          <input
            type="color"
            value={editingTag ? editingTag.color : newTag.color}
            onChange={e => editingTag ? setEditingTag({ ...editingTag, color: e.target.value }) : setNewTag({ ...newTag, color: e.target.value })}
            className="w-16 h-8 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            type="text"
            value={editingTag ? editingTag.description : newTag.description}
            onChange={e => editingTag ? setEditingTag({ ...editingTag, description: e.target.value }) : setNewTag({ ...newTag, description: e.target.value })}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="flex space-x-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {editingTag ? 'Update Tag' : 'Create Tag'}
          </button>
          {editingTag && (
            <button type="button" onClick={() => setEditingTag(null)} className="px-4 py-2 border rounded hover:bg-gray-100">
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Your Tags</h2>
        {loading ? (
          <div>Loading...</div>
        ) : tags.length === 0 ? (
          <div>No tags found.</div>
        ) : (
          <ul className="space-y-2">
            {tags.map(tag => (
              <li key={tag._id} className="flex items-center justify-between p-2 border rounded">
                <span className="flex items-center">
                  <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: tag.color }}></span>
                  <span className="font-medium mr-2">{tag.name}</span>
                  <span className="text-xs text-gray-500">{tag.description}</span>
                </span>
                <span className="flex items-center space-x-2">
                  <button onClick={() => setEditingTag(tag)} className="text-blue-600 hover:underline text-sm">Edit</button>
                  <button onClick={() => handleDelete(tag._id)} className="text-red-600 hover:underline text-sm">Delete</button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TagManagement;
