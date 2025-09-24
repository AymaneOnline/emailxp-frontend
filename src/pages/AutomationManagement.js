// emailxp/frontend/src/pages/AutomationManagement.js

import React, { useState, useEffect, useCallback } from 'react';
import { H1, H3, Body } from '../components/ui/Typography';
import TabBar from '../components/ui/TabBar';
import PageContainer from '../components/layout/PageContainer';
import BehavioralTriggerManager from '../components/BehavioralTriggerManager';
import {
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Zap,
  TrendingUp,
  Calendar,
  Settings,
  Eye,
  Copy,
  Mail,
  Repeat,
  Clock,
  Users,
  Target,
  GitBranch
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { isOnboardingComplete } from '../utils/onboarding';
import automationService from '../services/automationService';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { createPortal } from 'react-dom';

// Node types configuration for the modal
const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode
};

// Trigger node component
function TriggerNode({ data }) {
  const triggerIcons = {
    subscriber_added: Users,
    tag_added: Target,
    date_based: Clock,
    behavior: Zap,
    api_trigger: Settings
  };
  
  const iconType = data.triggerType || 'subscriber_added';
  const TriggerIcon = triggerIcons[iconType] || Zap;
  
  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-500 shadow-lg">
      <div className="flex items-center space-x-2">
        <TriggerIcon className="w-5 h-5 text-blue-500" />
        <div className="font-medium text-gray-900 dark:text-white">
          {data.label}
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {data.description}
      </div>
      <div className="absolute top-0 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
  );
}

// Action node component
function ActionNode({ data }) {
  const actionIcons = {
    send_email: Mail,
    wait: Clock,
    add_tag: Target,
    remove_tag: Target,
    condition: GitBranch
  };
  
  const iconType = data.actionType || 'send_email';
  const ActionIcon = actionIcons[iconType] || Settings;
  
  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-500 shadow-lg">
      <div className="flex items-center space-x-2">
        <ActionIcon className="w-5 h-5 text-green-500" />
        <div className="font-medium text-gray-900 dark:text-white">
          {data.label}
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {data.description}
      </div>
      <div className="absolute top-0 -left-2 w-4 h-4 bg-green-500 rounded-full"></div>
      <div className="absolute top-0 -right-2 w-4 h-4 bg-green-500 rounded-full"></div>
    </div>
  );
}

// Condition node component
function ConditionNode({ data }) {
  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-purple-500 shadow-lg">
      <div className="flex items-center space-x-2">
        <GitBranch className="w-5 h-5 text-purple-500" />
        <div className="font-medium text-gray-900 dark:text-white">
          {data.label}
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {data.description}
      </div>
      <div className="absolute top-0 -left-2 w-4 h-4 bg-purple-500 rounded-full"></div>
      <div className="absolute top-0 -right-2 w-4 h-4 bg-purple-500 rounded-full"></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-4 h-4 bg-purple-500 rounded-full"></div>
    </div>
  );
}

const AutomationManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFlowModal, setShowFlowModal] = useState(false); // State for flow modal
  const [editingAutomation, setEditingAutomation] = useState(null); // State for current automation being edited
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const loadAutomations = useCallback(async () => {
    if (!user || !user.token) {
      setLoading(false);
      return;
    }
    if(!isOnboardingComplete(user)) { // skip while onboarding incomplete
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const params = {};
      if (selectedStatus !== 'all') params.status = selectedStatus;
      const response = await automationService.getAutomations(params) || {};
      const list = Array.isArray(response.automations) ? response.automations : [];
      setAutomations(list);
    } catch (error) {
      // Swallow 403 gracefully (already handled in service maybe returning [])
      console.error('Failed to load automations:', error?.message || error);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, user]);

  useEffect(() => {
    loadAutomations();
  }, [loadAutomations]);

  const handleCreateAutomation = () => {
    // Create a new automation
    const newAutomation = {
      name: 'New Automation',
      description: '',
      isActive: false,
      nodes: [],
      edges: []
    };
    setEditingAutomation(newAutomation);
    setShowFlowModal(true);
  };

  const handleEditAutomation = async (id) => {
    try {
      // Load the automation data
      const response = await automationService.getAutomation(id);
      setEditingAutomation(response.automation);
      
      // Set nodes and edges for the flow
      setNodes(response.automation.nodes || []);
      setEdges(response.automation.edges || []);
      
      setShowFlowModal(true);
    } catch (error) {
      console.error('Failed to load automation:', error);
      toast.error('Failed to load automation');
    }
  };

  const handleStartAutomation = async (id) => {
    try {
      await automationService.startAutomation(id);
      toast.success('Automation started successfully');
      loadAutomations(); // Refresh the list
    } catch (error) {
      console.error('Failed to start automation:', error);
      toast.error('Failed to start automation');
    }
  };

  const handlePauseAutomation = async (id) => {
    try {
      await automationService.pauseAutomation(id);
      toast.success('Automation paused successfully');
      loadAutomations(); // Refresh the list
    } catch (error) {
      console.error('Failed to pause automation:', error);
      toast.error('Failed to pause automation');
    }
  };

  const handleDuplicateAutomation = async (id) => {
    try {
      await automationService.duplicateAutomation(id);
      toast.success('Automation duplicated successfully');
      loadAutomations(); // Refresh the list
    } catch (error) {
      console.error('Failed to duplicate automation:', error);
      toast.error('Failed to duplicate automation');
    }
  };

  const handleDeleteAutomation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this automation?')) {
      return;
    }

    try {
      await automationService.deleteAutomation(id);
      toast.success('Automation deleted successfully');
      loadAutomations(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete automation:', error);
      toast.error('Failed to delete automation');
    }
  };

  // Handle connection creation in the flow modal
  const onConnect = useCallback((params) => {
    // Add custom marker for edges
    setEdges(eds => addEdge({
      ...params,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#94a3b8'
      },
      style: {
        strokeWidth: 2,
        stroke: '#94a3b8'
      }
    }, eds));
  }, [setEdges]);

  // Save the flow from the modal
  const saveFlow = async () => {
    try {
      const automationData = {
        ...editingAutomation,
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle
        }))
      };

      if (editingAutomation._id) {
        await automationService.updateAutomation(editingAutomation._id, automationData);
      } else {
        await automationService.createAutomation(automationData);
      }

      toast.success('Automation saved successfully');
      setShowFlowModal(false);
      setEditingAutomation(null);
      loadAutomations(); // Refresh the list
    } catch (error) {
      console.error('Failed to save automation:', error);
      toast.error('Failed to save automation: ' + error.message);
    }
  };

  // Close the flow modal
  const closeFlowModal = () => {
    setShowFlowModal(false);
    setEditingAutomation(null);
  };

  // Add trigger node
  const addTriggerNode = () => {
    const position = { x: 400, y: 50 };
    const id = `trigger-${Date.now()}`;
    const newNode = {
      id,
      type: 'trigger',
      position,
      data: {
        label: 'Trigger',
        description: 'Select a trigger',
        triggerType: 'subscriber_added'
      }
    };
    setNodes(nds => [...nds, newNode]);
  };

  // Add action node
  const addActionNode = () => {
    // Find a good position for the new node
    const lastNode = nodes.length > 0 ? nodes[nodes.length - 1] : null;
    const position = lastNode 
      ? { x: lastNode.position.x, y: lastNode.position.y + 150 }
      : { x: 400, y: 200 };

    const id = `action-${Date.now()}`;
    const newNode = {
      id,
      type: 'action',
      position,
      data: {
        label: 'Action',
        description: 'Configure action',
        actionType: 'send_email'
      }
    };
    setNodes(nds => [...nds, newNode]);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      paused: { color: 'bg-yellow-100 text-yellow-800', label: 'Paused' },
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      completed: { color: 'bg-purple-100 text-purple-800', label: 'Completed' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getAutomationTypeIcon = (type) => {
    const icons = {
      drip: TrendingUp,
      trigger: Zap,
      date_based: Calendar,
      immediate: Mail,
      recurring: Repeat
    };
    const IconComponent = icons[type] || Settings;
    return <IconComponent className="h-4 w-4" />;
  };

  const renderAutomationActions = (automation) => {
    const actions = [];

    if (automation.status === 'draft' || automation.status === 'paused') {
      actions.push(
        <button
          key="start"
          onClick={() => handleStartAutomation(automation._id)}
          className="p-1 text-green-600 hover:text-green-800"
          title="Start"
        >
          <Play className="h-4 w-4" />
        </button>
      );
    }

    if (automation.status === 'active') {
      actions.push(
        <button
          key="pause"
          onClick={() => handlePauseAutomation(automation._id)}
          className="p-1 text-yellow-600 hover:text-yellow-800"
          title="Pause"
        >
          <Pause className="h-4 w-4" />
        </button>
      );
    }

    actions.push(
      <button
        key="duplicate"
        onClick={() => handleDuplicateAutomation(automation._id)}
        className="p-1 text-blue-600 hover:text-blue-800"
        title="Duplicate"
      >
        <Copy className="h-4 w-4" />
      </button>
    );

    actions.push(
      <button
        key="delete"
        onClick={() => handleDeleteAutomation(automation._id)}
        className="p-1 text-red-600 hover:text-red-800"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    );

    return actions;
  };

  const [activeTab, setActiveTab] = useState('workflows');

  const loadingSpinner = (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple"></div>
    </div>
  );

  return (
    <PageContainer>
    <div className="space-y-6">
      <TabBar
        tabs={[
          { key: 'workflows', label: 'Workflows' },
          { key: 'behavioral', label: 'Behavioral Triggers' }
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />
      {activeTab === 'behavioral' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <BehavioralTriggerManager />
        </div>
      )}
      {activeTab === 'workflows' && (loading ? loadingSpinner : null)}
      {activeTab === 'workflows' && !loading && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <H1 className="mb-1 text-2xl">Automation Workflows</H1>
              <Body className="text-gray-600">Create and manage automated email sequences</Body>
            </div>
            <button
              onClick={handleCreateAutomation}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Automation</span>
            </button>
          </div>
          {/* Filters */}
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          {/* Automations List */}
          {automations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Zap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <H3 className="mb-2">No Automations</H3>
              <p className="text-gray-600 mb-4">
                Create your first automation workflow to engage your subscribers
              </p>
              <button
                onClick={handleCreateAutomation}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Automation</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Automation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {automations.map((automation) => (
                      <tr key={automation._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{automation.name}</div>
                            <div className="text-sm text-gray-500">{automation.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getAutomationTypeIcon(automation.type)}
                            <span className="text-sm text-gray-900 capitalize">{automation.type ? automation.type.replace('_', ' ') : 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(automation.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            <div>Sent: {automation.stats?.totalSent || 0}</div>
                            <div>Opened: {automation.stats?.totalOpened || 0}</div>
                            <div>Clicked: {automation.stats?.totalClicked || 0}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(automation.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-1">
                            <button onClick={() => handleEditAutomation(automation._id)} className="p-1 text-gray-600 hover:text-gray-800" title="Edit"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => handleEditAutomation(automation._id)} className="p-1 text-gray-600 hover:text-gray-800" title="View Details"><Eye className="h-4 w-4" /></button>
                            {renderAutomationActions(automation)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* React Flow Modal - Using Portal to avoid margin issues */}
      {showFlowModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <H3 className="text-lg font-bold !text-gray-900 dark:!text-white">
                {editingAutomation?._id ? 'Edit Automation Flow' : 'Create Automation Flow'}
              </H3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={closeFlowModal}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={saveFlow}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                >
                  Save
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={addTriggerNode}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Trigger
                  </button>
                  <button
                    onClick={addActionNode}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Action
                  </button>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Drag nodes to move them. Connect nodes by dragging from the connection points.
                </div>
              </div>
              
              {/* React Flow Editor */}
              <div className="h-[600px]">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  fitView
                  attributionPosition="bottom-left"
                >
                  <Controls />
                  <MiniMap />
                  <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
              </div>
            </div>
          </div>
        </div>,
        document.body // Render the modal directly into the body element
      )}
    </div>
    </PageContainer>
  );
};

export default AutomationManagement;