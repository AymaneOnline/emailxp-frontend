// emailxp/frontend/src/components/VisualAutomationBuilder.js

import React, { useState, useCallback, useEffect } from 'react';
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
import {
  Save,
  X,
  Plus,
  Mail,
  Clock,
  Users,
  Target,
  Zap,
  GitBranch,
  Settings,
  Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import automationService from '../services/automationService';
import { useSelector } from 'react-redux';

// Node types configuration
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

const VisualAutomationBuilder = ({ automationId, onSave, onCancel }) => {
  const { user } = useSelector((state) => state.auth);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [automation, setAutomation] = useState({
    name: '',
    description: '',
    isActive: false
  });
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [nodeModalData, setNodeModalData] = useState({});
  const [loading, setLoading] = useState(false);

  // Load automation if editing
  useEffect(() => {
    const loadAutomation = async () => {
      // Check if user is authenticated
      if (!user || !user.token) {
        console.error('User not authenticated');
        toast.error('Please log in to edit automations');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await automationService.getAutomation(automationId);
        
        // Set basic info
        setAutomation({
          name: response.automation.name,
          description: response.automation.description,
          isActive: response.automation.isActive
        });
        
        // Set nodes and edges
        setNodes(response.automation.nodes || []);
        setEdges(response.automation.edges || []);
      } catch (error) {
        console.error('Failed to load automation:', error);
        toast.error('Failed to load automation');
      } finally {
        setLoading(false);
      }
    };

    if (automationId) {
      loadAutomation();
    }
  }, [automationId, setNodes, setEdges, user]);

  // Available trigger types
  const triggerTypes = [
    { id: 'subscriber_added', label: 'Subscriber Added', description: 'When someone subscribes to a list' },
    { id: 'tag_added', label: 'Tag Added', description: 'When a tag is added to a subscriber' },
    { id: 'date_based', label: 'Date Based', description: 'On a specific date or anniversary' },
    { id: 'behavior', label: 'Behavior', description: 'Based on subscriber behavior' },
    { id: 'api_trigger', label: 'API Trigger', description: 'Triggered via API call' }
  ];

  // Available action types
  const actionTypes = [
    { id: 'send_email', label: 'Send Email', description: 'Send an email campaign' },
    { id: 'wait', label: 'Wait', description: 'Wait for a specified time' },
    { id: 'add_tag', label: 'Add Tag', description: 'Add a tag to subscriber' },
    { id: 'remove_tag', label: 'Remove Tag', description: 'Remove a tag from subscriber' },
    { id: 'condition', label: 'Condition', description: 'Branch based on conditions' }
  ];

  // Add a new node to the flow
  const addNode = useCallback((type, position, data = {}) => {
    const id = `${type}-${Date.now()}`;
    const newNode = {
      id,
      type,
      position,
      data: {
        ...data,
        id
      }
    };

    setNodes(nds => [...nds, newNode]);
    return newNode;
  }, [setNodes]);

  // Handle connection creation
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

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setNodeModalData(node.data);
    setShowNodeModal(true);
  }, []);

  // Save automation
  const saveAutomation = async () => {
    try {
      if (!automation.name.trim()) {
        toast.error('Please enter an automation name');
        return;
      }

      // Convert nodes and edges to automation structure
      const automationData = {
        ...automation,
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

      let result;
      if (automationId) {
        // Update existing automation
        result = await automationService.updateAutomation(automationId, automationData);
      } else {
        // Create new automation
        result = await automationService.createAutomation(automationData);
      }

      // Call save function if provided
      if (onSave) {
        await onSave(result.automation);
      }

      toast.success('Automation saved successfully');
    } catch (error) {
      console.error('Failed to save automation:', error);
      toast.error('Failed to save automation: ' + error.message);
    }
  };

  // Add trigger node
  const addTriggerNode = () => {
    const position = { x: 400, y: 50 };
    addNode('trigger', position, {
      label: 'Trigger',
      description: 'Select a trigger',
      triggerType: 'subscriber_added'
    });
  };

  // Add action node
  const addActionNode = () => {
    // Find a good position for the new node
    const lastNode = nodes.length > 0 ? nodes[nodes.length - 1] : null;
    const position = lastNode 
      ? { x: lastNode.position.x, y: lastNode.position.y + 150 }
      : { x: 400, y: 200 };

    addNode('action', position, {
      label: 'Action',
      description: 'Configure action',
      actionType: 'send_email'
    });
  };

  // Update node data
  const updateNodeData = (nodeId, data) => {
    setNodes(nds => 
      nds.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    );
  };

  // Delete selected node
  const deleteNode = (nodeId) => {
    // Remove node
    setNodes(nds => nds.filter(node => node.id !== nodeId));
    // Remove connected edges
    setEdges(eds => eds.filter(
      edge => edge.source !== nodeId && edge.target !== nodeId
    ));
  };

  // Render node configuration modal
  const renderNodeModal = () => {
    if (!showNodeModal || !selectedNode) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Configure {selectedNode.type === 'trigger' ? 'Trigger' : 
                       selectedNode.type === 'condition' ? 'Condition' : 'Action'}
            </h2>
            <button
              onClick={() => setShowNodeModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {selectedNode.type === 'trigger' && (
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Select Trigger Type
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {triggerTypes.map(trigger => (
                    <button
                      key={trigger.id}
                      onClick={() => {
                        const TriggerIcon = {
                          subscriber_added: Users,
                          tag_added: Target,
                          date_based: Clock,
                          behavior: Zap,
                          api_trigger: Settings
                        }[trigger.id] || Zap;
                        
                        updateNodeData(selectedNode.id, {
                          label: trigger.label,
                          description: trigger.description,
                          triggerType: trigger.id
                        });
                        setShowNodeModal(false);
                      }}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        nodeModalData.triggerType === trigger.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {React.createElement({
                          subscriber_added: Users,
                          tag_added: Target,
                          date_based: Clock,
                          behavior: Zap,
                          api_trigger: Settings
                        }[trigger.id] || Zap, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" })}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {trigger.label}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {trigger.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {selectedNode.type === 'action' && (
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Select Action Type
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {actionTypes.map(action => (
                    <button
                      key={action.id}
                      onClick={() => {
                        const ActionIcon = {
                          send_email: Mail,
                          wait: Clock,
                          add_tag: Target,
                          remove_tag: Target,
                          condition: GitBranch
                        }[action.id] || Settings;
                        
                        updateNodeData(selectedNode.id, {
                          label: action.label,
                          description: action.description,
                          actionType: action.id
                        });
                        setShowNodeModal(false);
                      }}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        nodeModalData.actionType === action.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {React.createElement({
                          send_email: Mail,
                          wait: Clock,
                          add_tag: Target,
                          remove_tag: Target,
                          condition: GitBranch
                        }[action.id] || Settings, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" })}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {action.label}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {action.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {selectedNode.type === 'condition' && (
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Configure Condition
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Condition Type
                    </label>
                    <select
                      value={nodeModalData.conditionType || 'tag_exists'}
                      onChange={(e) => updateNodeData(selectedNode.id, {
                        conditionType: e.target.value,
                        label: `Condition: ${e.target.options[e.target.selectedIndex].text}`
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="tag_exists">Has Tag</option>
                      <option value="opened_email">Opened Email</option>
                      <option value="clicked_link">Clicked Link</option>
                      <option value="custom_field">Custom Field</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Value
                    </label>
                    <input
                      type="text"
                      value={nodeModalData.conditionValue || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, {
                        conditionValue: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter condition value"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => deleteNode(selectedNode.id)}
              className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowNodeModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNodeModal(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - Modified for modal */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {automationId ? 'Edit Automation' : 'Create Automation'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Build automated email sequences with a visual workflow
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveAutomation}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Automation
          </button>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6 p-6">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      automation.isActive ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe what this automation does..."
                />
              </div>
            </div>
          </div>

          {/* Visual Builder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Automation Flow
              </h3>
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
            </div>
            
            <div className="h-[500px] border border-gray-200 dark:border-gray-700 rounded-lg">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
              >
                <Controls />
                <MiniMap />
                <Background variant="dots" gap={12} size={1} />
              </ReactFlow>
            </div>
            
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <p>Drag nodes to move them. Click on nodes to configure them. Connect nodes by dragging from the connection points.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Node Configuration Modal */}
      {renderNodeModal()}
    </div>
  );
};

export default VisualAutomationBuilder;
