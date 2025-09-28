import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Mail } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import TabBar from '../components/ui/TabBar';
import subscriberService from '../services/subscriberService';
import groupService from '../services/groupService';

// Clean, single SubscriberForm — "Add or create a group" visible by default.
const SubscriberForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

    const [formData, setFormData] = useState({ groupIds: [], email: '', firstName: '', lastName: '', status: 'subscribed', customFields: [] });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showGroupDropdown, setShowGroupDropdown] = useState(true);
  const [groupQuery, setGroupQuery] = useState('');
  const groupDropdownRef = useRef(null);
  const [activeTab, setActiveTab] = useState('single');

  const loadGroups = useCallback(async () => { try { const fetched = await groupService.getGroups(); const list = Array.isArray(fetched) ? fetched : (fetched?.groups || []); setGroups(list || []); } catch (e) { console.error(e); setGroups([]); } }, []);
  const loadSubscriber = useCallback(async () => { if (!id) return; try { setLoading(true); const s = await subscriberService.getSubscriber(id); setFormData({ groupIds: s.groups ? s.groups.map(g=>g._id||g) : [], email: s.email||'', firstName: s.firstName||'', lastName: s.lastName||'', customFields: s.customFields || [] }); } catch (e) { console.error(e); } finally { setLoading(false); } }, [id]);

  useEffect(() => { loadGroups(); if (isEditing) loadSubscriber(); const onDoc = e => { if (groupDropdownRef.current && !groupDropdownRef.current.contains(e.target)) setShowGroupDropdown(false); }; document.addEventListener('click', onDoc); return () => document.removeEventListener('click', onDoc); }, [isEditing, loadGroups, loadSubscriber]);

  const handleInputChange = e => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

  const addCustomField = () => { setFormData(prev => ({ ...prev, customFields: [...prev.customFields, { name: '', value: '' }] })); };

  const handleCustomFieldChange = (index, key, value) => {
    setFormData(prev => {
      const next = Array.isArray(prev.customFields) ? [...prev.customFields] : [];
      next[index] = { ...(next[index] || {}), [key]: value };
      return { ...prev, customFields: next };
    });
  };

  const removeCustomField = (index) => {
    setFormData(prev => ({ ...prev, customFields: prev.customFields.filter((_, i) => i !== index) }));
  };

  const handleAddExistingGroup = async (g) => { setFormData(prev => ({ ...prev, groupIds: [...new Set([...(prev.groupIds||[]), g._id])] })); setShowGroupDropdown(false); setGroupQuery(''); try { if (isEditing) await subscriberService.addSubscriberToGroup(id, g._id); await loadGroups(); } catch (e) { console.error(e); } };
  const handleCreateGroup = async (name) => { if (!name) return; try { const created = await groupService.createGroup({ name }); const cg = created && created._id ? created : (created?.group || created); setGroups(prev => [...prev, cg]); setFormData(prev => ({ ...prev, groupIds: [...new Set([...(prev.groupIds||[]), cg._id || cg.id])] })); setShowGroupDropdown(false); setGroupQuery(''); if (isEditing) await subscriberService.addSubscriberToGroup(id, cg._id || cg.id); } catch (e) { console.error(e); toast.error('Failed to create group'); } };

  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); try { if (isEditing) await subscriberService.updateSubscriber(id, formData); else await subscriberService.createSubscriber(formData); toast.success('Saved'); navigate('/subscribers'); } catch (e) { console.error(e); toast.error('Save failed'); } finally { setLoading(false); } };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Subscriber</h1>
          <button onClick={() => navigate('/subscribers')} className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>

        <TabBar
          tabs={[
            { key: 'single', label: 'Add Single Subscriber' },
            { key: 'csv', label: 'Import CSV/TXT File' },
            { key: 'paste', label: 'Copy/Paste from Excel' }
          ]}
          active={activeTab}
          onChange={setActiveTab}
        />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {activeTab === 'single' && (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Subscriber Details Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscriber Details</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                        placeholder="Enter first name"
                      />
                    </div>

                    {/* Custom fields (dynamic) */}
                    {Array.isArray(formData.customFields) && formData.customFields.length > 0 && (
                      <div className="space-y-3">
                        {formData.customFields.map((cf, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                            <input
                              type="text"
                              placeholder="Field name"
                              value={cf.name || ''}
                              onChange={e => handleCustomFieldChange(idx, 'name', e.target.value)}
                              className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                            />
                            <input
                              type="text"
                              placeholder="Value"
                              value={cf.value || ''}
                              onChange={e => handleCustomFieldChange(idx, 'value', e.target.value)}
                              className="col-span-6 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeCustomField(idx)}
                              className="col-span-1 text-red-600 hover:text-red-800"
                              aria-label={`Remove custom field ${idx}`}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <button
                        type="button"
                        onClick={addCustomField}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        Add More Field
                      </button>
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="border-t border-gray-200"></div>

                {/* Add to Group Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add to Group</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Groups</label>
                    <div className="relative">
                      <input
                        ref={groupDropdownRef}
                        value={groupQuery}
                        onChange={e => setGroupQuery(e.target.value)}
                        onFocus={() => setShowGroupDropdown(true)}
                        placeholder="Search or create group"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                      />
                      {showGroupDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {groups.filter(g => g.name.toLowerCase().includes(groupQuery.trim().toLowerCase())).map(g => (
                            <div key={g._id} className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                              <span className="text-gray-900">{g.name}</span>
                              <button
                                type="button"
                                onClick={() => handleAddExistingGroup(g)}
                                className="text-red-600 hover:text-red-700 font-medium text-sm"
                              >
                                Add
                              </button>
                            </div>
                          ))}
                          {groupQuery.trim().length > 1 && !groups.some(g => g.name.toLowerCase() === groupQuery.trim().toLowerCase()) && (
                            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Create "{groupQuery.trim()}"</span>
                                <button
                                  type="button"
                                  onClick={() => handleCreateGroup(groupQuery.trim())}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors duration-200"
                                >
                                  Create
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {formData.groupIds.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {formData.groupIds.map(id => {
                          const group = groups.find(g => g._id === id);
                          return group ? (
                            <span key={id} className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                              {group.name}
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, groupIds: prev.groupIds.filter(gid => gid !== id) }))}
                                className="ml-2 text-red-600 hover:text-red-800"
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/subscribers')}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Subscriber'}
                  </button>
                </div>
              </form>
            )}        {activeTab === 'csv' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Import CSV/TXT File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-400 transition-colors duration-200">
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  id="csv-file"
                />
                <label htmlFor="csv-file" className="cursor-pointer">
                  <div className="text-gray-600 mb-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-1">Drop your CSV/TXT file here</p>
                  <p className="text-sm text-gray-500">or click to browse files</p>
                </label>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200">
                Import File
              </button>
            </div>
          </div>
        )}

        {activeTab === 'paste' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Copy/Paste from Excel</label>
              <textarea
                placeholder="Paste your Excel data here (CSV format)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 h-32 resize-none"
                rows="8"
              />
            </div>
            <div className="flex justify-end">
              <button type="button" className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200">
                Import Data
              </button>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default SubscriberForm;

