// emailxp/frontend/src/components/AutomationBuilder.js

import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  Plus,
  Mail,
  Clock,
  Users,
  Filter,
  ArrowRight,
  ArrowDown,
  Settings,
  Play,
  Pause,
  Trash2,
  Copy,
  Edit,
  Save,
  X,
  Calendar,
  Target,
  Zap,
  GitBranch,
  Timer,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import automationService from '../services/automationService';
import templateService from '../services/templateService';

const AutomationBuilder = forwardRef(({ automationId, onSave, onCancel, fullScreen = false }, ref) => {
  const navigate = useNavigate();

  const [automation, setAutomation] = useState({
    name: '',
    description: '',
    isActive: false,
    trigger: null,
    actions: []
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [showVersions, setShowVersions] = useState(false);
  const [versionApplying, setVersionApplying] = useState(false);

  const [showActionModal, setShowActionModal] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [selectedActionType, setSelectedActionType] = useState(null);

  // Simple template selector used in action config
  const TemplateSelector = ({ value, onChange }) => {
    const [templates, setTemplates] = useState([]);

    useEffect(() => {
      let mounted = true;
      (async () => {
        try {
          const res = await templateService.getTemplates({ page: 1, limit: 200 });
          if (!mounted) return;
          // templateService returns { templates, total, page, pages } in many places
          const list = res.templates || res;
          setTemplates(list);
        } catch (err) {
          console.error('Failed to load templates for selector', err);
        }
      })();

      return () => { mounted = false; };
    }, []);

    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <option value="">Choose a template...</option>
        {templates.map(t => (
          <option key={t._id || t.id} value={t._id || t.id}>{t.name || t.title || `Template ${t._id || t.id}`}</option>
        ))}
      </select>
    );
  };

  const TRIGGER_TYPES = [
    { id: 'subscriber_added', label: 'Subscriber Added', description: 'When someone subscribes to a list', icon: Users },
    { id: 'tag_added', label: 'Tag Added', description: 'When a tag is added', icon: Target },
    { id: 'date_based', label: 'Date Based', description: 'On a specific date', icon: Calendar },
    { id: 'behavior', label: 'Behavior', description: 'Based on subscriber behavior', icon: Zap },
    { id: 'api_trigger', label: 'API Trigger', description: 'Triggered via API', icon: Settings }
  ];

  const ACTION_TYPES = [
    { id: 'send_email', label: 'Send Email', description: 'Send an email campaign', icon: Mail },
    { id: 'send_template', label: 'Send Template (Triggered)', description: 'Send a template to the triggering subscriber', icon: Mail },
    { id: 'wait', label: 'Wait', description: 'Wait for a specified time', icon: Clock },
    { id: 'add_tag', label: 'Add Tag', description: 'Add a tag to subscriber', icon: Target },
    { id: 'remove_tag', label: 'Remove Tag', description: 'Remove a tag from subscriber', icon: Target },
    { id: 'condition', label: 'Condition', description: 'Branch based on conditions', icon: GitBranch }
  ];

  // Icon fallback: if an icon import is missing, use a simple fallback
  const FallbackIcon = ({ className = '' }) => (
    <span className={`inline-block ${className}`}>🔧</span>
  );

  const getIcon = (Icon) => {
    if (!Icon) return FallbackIcon;
    return Icon;
  };

  const saveAutomation = async () => {
    try {
      setSaving(true);

      if (!automation.name?.trim()) {
        toast.error('Please enter an automation name');
        return;
      }

      if (!automation.trigger) {
        toast.error('Please select a trigger');
        return;
      }

      if (!automation.actions || automation.actions.length === 0) {
        toast.error('Please add at least one action');
        return;
      }

      let result;
      if (automationId) {
        result = await automationService.updateAutomation(automationId, automation);
      } else {
        result = await automationService.createAutomation(automation);
      }

      toast.success('Automation saved successfully');
      if (onSave) onSave(result);
    } catch (error) {
      console.error('Failed to save automation:', error);
      toast.error('Failed to save automation');
    } finally {
      setSaving(false);
    }
  };

  // expose save to parent modals so they can call Save from a top bar
  useImperativeHandle(ref, () => ({
    save: saveAutomation
  }));

  

  // Allow adding action with a provided config (used by modal when creating new actions)
  const addAction = (type, position = -1, providedConfig) => {
    const cfg = providedConfig || getDefaultActionConfig(type);
    const newAction = {
      id: Date.now() + Math.random(),
      type,
      config: cfg,
      position: position === -1 ? automation.actions.length : position
    };

    const newActions = [...automation.actions];
    if (position === -1) {
      newActions.push(newAction);
    } else {
      newActions.splice(position, 0, newAction);
    }

    // Update positions
    newActions.forEach((action, index) => {
      action.position = index;
    });

    setAutomation(prev => ({ ...prev, actions: newActions }));
    setShowActionModal(false);
  };

  const getDefaultActionConfig = (type) => {
    switch (type) {
      case 'send_email':
        return { campaignId: null, template: null };
      case 'send_template':
        return { templateId: null, subjectOverride: '', fromEmail: '', fromName: '' };
      case 'wait':
        return { duration: 1, unit: 'days' };
      case 'add_tag':
      case 'remove_tag':
        return { tagId: null };
      case 'condition':
        return { 
          type: 'tag_exists', 
          value: '', 
          trueActions: [], 
          falseActions: [] 
        };
      default:
        return {};
    }
  };

  const updateAction = (actionId, config) => {
    setAutomation(prev => ({
      ...prev,
      actions: prev.actions.map(action =>
        action.id === actionId ? { ...action, config } : action
      )
    }));
  };

  const removeAction = (actionId) => {
    setAutomation(prev => ({
      ...prev,
      actions: prev.actions.filter(action => action.id !== actionId)
    }));
  };

  const duplicateAction = (actionId) => {
    const actionToDuplicate = automation.actions.find(a => a.id === actionId);
    if (actionToDuplicate) {
      const newAction = {
        ...actionToDuplicate,
        id: Date.now() + Math.random(),
        position: actionToDuplicate.position + 1
      };
      
      const newActions = [...automation.actions];
      newActions.splice(actionToDuplicate.position + 1, 0, newAction);
      
      // Update positions
      newActions.forEach((action, index) => {
        action.position = index;
      });
      
      setAutomation(prev => ({ ...prev, actions: newActions }));
    }
  };

  const renderTriggerSelector = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Choose a Trigger
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Select what will start this automation sequence
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRIGGER_TYPES.map(trigger => {
          const TriggerIcon = getIcon(trigger.icon);
          const isSelected = automation.trigger?.type === trigger.id;
          
          return (
            <button
              key={trigger.id}
              onClick={() => setAutomation(prev => ({
                ...prev,
                trigger: { type: trigger.id, config: {} }
              }))}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                isSelected
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <TriggerIcon className={`w-6 h-6 ${
                  isSelected ? 'text-red-600' : 'text-gray-400'
                }`} />
                <div>
                  <div className={`font-medium ${
                    isSelected ? 'text-red-900 dark:text-red-100' : 'text-gray-900 dark:text-white'
                  }`}>
                    {trigger.label}
                  </div>
                  <div className={`text-sm ${
                    isSelected ? 'text-red-700 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {trigger.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderActionCard = (action, index) => {
  const actionType = ACTION_TYPES.find(t => t.id === action.type);
  const ActionIcon = getIcon(actionType?.icon || Settings);

    return (
      <div key={action.id} className="relative">
        {/* Connection Line */}
        {index > 0 && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <ArrowDown className="w-5 h-5 text-gray-400" />
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <ActionIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                {actionType?.label || 'Unknown Action'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setEditingAction(action);
                  setSelectedActionType(action.type);
                  setShowActionModal(true);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => duplicateAction(action.id)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeAction(action.id)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {renderActionSummary(action)}
          </div>
        </div>
        
        {/* Add Action Button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => {
              setEditingAction(null);
              setSelectedActionType(null);
              setShowActionModal(true);
            }}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Action
          </button>
        </div>
      </div>
    );
  };

  const renderActionSummary = (action) => {
    switch (action.type) {
      case 'send_email':
        return action.config.campaignId ? 'Send selected email' : 'No email selected';
      case 'send_template':
        return action.config.templateId ? `Send template ${action.config.templateId}` : 'No template selected';
      case 'wait':
        return `Wait ${action.config.duration} ${action.config.unit}`;
      case 'add_tag':
        return action.config.tagId ? 'Add selected tag' : 'No tag selected';
      case 'remove_tag':
        return action.config.tagId ? 'Remove selected tag' : 'No tag selected';
      case 'condition':
        return `If ${action.config.type} then...`;
      default:
        return 'Configure this action';
    }
  };

  const renderActionModal = () => {
    if (!showActionModal) return null;

    return (
      <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingAction ? 'Edit Action' : 'Add Action'}
            </h2>
            <button
              onClick={() => setShowActionModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {!selectedActionType ? (
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Choose Action Type
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {ACTION_TYPES.map(actionType => {
                    const ActionIcon = getIcon(actionType.icon);
                    return (
                      <button
                        key={actionType.id}
                        onClick={() => {
                          setSelectedActionType(actionType.id);
                          // create a temporary editingAction so the config form is editable
                          setEditingAction({ id: `new-${Date.now()}`, type: actionType.id, config: getDefaultActionConfig(actionType.id) });
                        }}
                        className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-left hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <ActionIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {actionType.label}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {actionType.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <button
                    onClick={() => setSelectedActionType(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">
                    Configure {ACTION_TYPES.find(t => t.id === selectedActionType)?.label}
                  </h3>
                </div>
                
                {renderActionConfig(selectedActionType, editingAction?.config || {})}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowActionModal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            {selectedActionType && (
              <button
                onClick={() => {
                  if (editingAction) {
                    const exists = automation.actions.some(a => a.id === editingAction.id);
                    if (exists) {
                      // Update existing action
                      updateAction(editingAction.id, editingAction.config);
                    } else {
                      // Add new action with the edited config
                      addAction(selectedActionType, -1, editingAction.config);
                    }
                  } else {
                    // Fallback: add default
                    addAction(selectedActionType);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                {editingAction ? (automation.actions.some(a => a.id === editingAction.id) ? 'Update Action' : 'Add Action') : 'Add Action'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderJsonEditor = () => {
    if (!showJsonEditor) return null;

    const applyJson = () => {
      try {
        const parsed = JSON.parse(jsonText);
        // Basic validation
        const errors = [];
        if (!parsed.trigger) errors.push('Missing required field: trigger');
        if (!Array.isArray(parsed.actions)) errors.push('Actions must be an array');
        if (!parsed.name || typeof parsed.name !== 'string' || !parsed.name.trim()) errors.push('Automation must have a name');

        if (errors.length > 0) {
          setJsonError(errors.join('; '));
          return;
        }

        setAutomation(parsed);
        setShowJsonEditor(false);
        setJsonError('');
        toast.success('JSON applied to builder');
      } catch (err) {
        setJsonError(err.message || 'Invalid JSON');
      }
    };

    return (
      <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Automation JSON</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowJsonEditor(false)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={applyJson}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Apply JSON
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-end mb-2 space-x-2">
              <button
                onClick={() => {
                  // copy to clipboard
                  if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(jsonText).then(() => toast.success('Copied JSON to clipboard'))
                      .catch(() => toast.error('Failed to copy'));
                  } else {
                    // fallback
                    const ta = document.createElement('textarea');
                    ta.value = jsonText;
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand('copy'); toast.success('Copied JSON to clipboard'); } catch (e) { toast.error('Failed to copy'); }
                    document.body.removeChild(ta);
                  }
                }}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50"
              >
                Copy JSON
              </button>
            </div>

            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm font-mono text-gray-900 dark:text-white"
            />
            {jsonError && <div className="text-red-600 mt-2">{jsonError}</div>}
          </div>
        </div>
      </div>
    );
  };

  const renderVersionsModal = () => {
    if (!showVersions) return null;

    const versions = automation.versions || [];

    const restoreLocal = (ver) => {
      try {
        // Apply the saved snapshot locally
        const snapshot = ver.changes;
        setAutomation(prev => ({ ...prev, ...snapshot }));
        setShowVersions(false);
        toast.success(`Restored version ${ver.version} locally`);
      } catch (err) {
        toast.error('Failed to restore version');
      }
    };

    const restoreAndSave = async (ver) => {
      if (!automation.id && !automation._id) {
        toast.error('Save the automation first before restoring to backend');
        return;
      }

      setVersionApplying(true);
      try {
        const snapshot = ver.changes;
        // Merge snapshot into current automation object and save
        const merged = { ...automation, ...snapshot };
        const id = automation._id || automation.id;
        const result = id
          ? await automationService.updateAutomation(id, merged)
          : await automationService.createAutomation(merged);

        setAutomation(result.automation || result);
        setShowVersions(false);
        toast.success(`Restored version ${ver.version} and saved`);
      } catch (err) {
        console.error('Failed to restore and save version', err);
        toast.error('Failed to restore and save version');
      } finally {
        setVersionApplying(false);
      }
    };

    return (
      <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Automation History</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowVersions(false)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {versions.length === 0 ? (
              <div className="text-center text-gray-500">No versions available</div>
            ) : (
              versions.slice().reverse().map((ver) => (
                <div key={ver.version} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Version {ver.version}</div>
                      <div className="text-sm text-gray-500">By: {ver.user || 'Unknown'} • {new Date(ver.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => restoreLocal(ver)} className="px-3 py-1 border rounded text-sm">Restore Locally</button>
                      <button onClick={() => restoreAndSave(ver)} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Restore & Save</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderActionConfig = (actionType, config) => {
    switch (actionType) {
      case 'send_email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Email Campaign
              </label>
              <select
                value={config.campaignId || ''}
                onChange={(e) => {
                  const newConfig = { ...config, campaignId: e.target.value };
                  if (editingAction) {
                    setEditingAction({ ...editingAction, config: newConfig });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Choose a campaign...</option>
                {/* Add campaign options here */}
              </select>
            </div>
          </div>
        );
      case 'send_template':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Template
              </label>
              <TemplateSelector
                value={config.templateId || ''}
                onChange={(val) => {
                  const newConfig = { ...config, templateId: val };
                  if (editingAction) setEditingAction({ ...editingAction, config: newConfig });
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject override</label>
                <input
                  value={config.subjectOverride || ''}
                  onChange={(e) => editingAction && setEditingAction({ ...editingAction, config: { ...config, subjectOverride: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From Email</label>
                <input
                  value={config.fromEmail || ''}
                  onChange={(e) => editingAction && setEditingAction({ ...editingAction, config: { ...config, fromEmail: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        );
        
      case 'wait':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.duration || 1}
                  onChange={(e) => {
                    const newConfig = { ...config, duration: parseInt(e.target.value) };
                    if (editingAction) {
                      setEditingAction({ ...editingAction, config: newConfig });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unit
                </label>
                <select
                  value={config.unit || 'days'}
                  onChange={(e) => {
                    const newConfig = { ...config, unit: e.target.value };
                    if (editingAction) {
                      setEditingAction({ ...editingAction, config: newConfig });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Configuration for this action type is not yet implemented.
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const containerClass = fullScreen ? 'min-h-[calc(100vh-96px)] w-full space-y-6' : 'max-w-4xl mx-auto space-y-6';
  const headerTitleClass = fullScreen ? 'text-3xl font-extrabold text-gray-900 dark:text-white' : 'text-2xl font-bold text-gray-900 dark:text-white';

  return (
    <div className={containerClass}>
      {/* Visual builder promo removed; step-list builder is the default */}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={headerTitleClass}>
            {automationId ? 'Edit Automation' : 'Create Automation'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Build automated email sequences that engage your subscribers
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              setJsonText(JSON.stringify(automation, null, 2));
              setJsonError('');
              setShowJsonEditor(true);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            View JSON
          </button>
          <button
            onClick={() => setShowVersions(true)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            History
          </button>
          <button
            onClick={saveAutomation}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Automation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Automation Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Automation Name *
            </label>
            <input
              type="text"
              value={automation.name}
              onChange={(e) => setAutomation(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., Welcome Series"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setAutomation(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  automation.isActive ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    automation.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {automation.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={automation.description}
              onChange={(e) => setAutomation(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Describe what this automation does..."
            />
          </div>
        </div>
      </div>

      {/* Trigger */}
      {renderTriggerSelector()}

      {/* Actions */}
      {automation.trigger && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Automation Flow
          </h3>
          
          <div className="space-y-6">
            {automation.actions.length === 0 ? (
              <div className="text-center py-12">
                <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No actions yet
                </h4>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Add your first action to start building your automation flow
                </p>
                <button
                  onClick={() => {
                    setEditingAction(null);
                    setSelectedActionType(null);
                    setShowActionModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add First Action
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {automation.actions.map((action, index) => renderActionCard(action, index))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Modal */}
      {renderActionModal()}
    </div>
  );
});

export default AutomationBuilder;