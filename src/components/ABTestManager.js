// emailxp/frontend/src/components/ABTestManager.js

import React, { useState, useEffect } from 'react';
import { 
  TestTube, 
  Play, 
  StopCircle, 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import abTestService from '../services/abTestService';
import { formatDate } from '../utils/dateUtils';

const ABTestManager = () => {
  const [abTests, setAbTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedABTest, setSelectedABTest] = useState(null);

  // Load A/B tests on component mount
  useEffect(() => {
    loadABTests();
  }, []);

  const loadABTests = async () => {
    try {
      setLoading(true);
      const data = await abTestService.getABTests();
      setAbTests(data);
    } catch (error) {
      console.error('Failed to load A/B tests:', error);
      toast.error('Failed to load A/B tests');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (abTestId) => {
    try {
      await abTestService.startABTest(abTestId);
      toast.success('A/B test started successfully');
      loadABTests();
    } catch (error) {
      console.error('Failed to start A/B test:', error);
      toast.error(error.response?.data?.message || 'Failed to start A/B test');
    }
  };

  const handleStopTest = async (abTestId) => {
    if (!window.confirm('Are you sure you want to stop this A/B test?')) {
      return;
    }
    
    try {
      await abTestService.stopABTest(abTestId);
      toast.success('A/B test stopped successfully');
      loadABTests();
    } catch (error) {
      console.error('Failed to stop A/B test:', error);
      toast.error(error.response?.data?.message || 'Failed to stop A/B test');
    }
  };

  const handleDeclareWinner = async (abTestId) => {
    try {
      await abTestService.declareWinner(abTestId);
      toast.success('Winner declared successfully');
      loadABTests();
    } catch (error) {
      console.error('Failed to declare winner:', error);
      toast.error(error.response?.data?.message || 'Failed to declare winner');
    }
  };

  const handleDeleteTest = async (abTestId) => {
    if (!window.confirm('Are you sure you want to delete this A/B test?')) {
      return;
    }
    
    try {
      await abTestService.deleteABTest(abTestId);
      toast.success('A/B test deleted successfully');
      loadABTests();
    } catch (error) {
      console.error('Failed to delete A/B test:', error);
      toast.error(error.response?.data?.message || 'Failed to delete A/B test');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestTypeLabel = (testType) => {
    switch (testType) {
      case 'subject': return 'Subject Line';
      case 'content': return 'Email Content';
      case 'sender': return 'Sender Name';
      default: return testType;
    }
  };

  const getWinnerCriteriaLabel = (criteria) => {
    switch (criteria) {
      case 'open_rate': return 'Open Rate';
      case 'click_rate': return 'Click Rate';
      default: return criteria;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A/B Tests</h1>
          <p className="text-gray-600">Manage and analyze your email A/B tests</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-600"
        >
          <Plus className="h-4 w-4" />
          <span>Create A/B Test</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TestTube className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-2xl font-semibold text-gray-900">{abTests.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Running</p>
              <p className="text-2xl font-semibold text-gray-900">
                {abTests.filter(t => t.status === 'running').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {abTests.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Edit className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-semibold text-gray-900">
                {abTests.filter(t => t.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* A/B Tests List */}
      {abTests.length === 0 ? (
        <div className="text-center py-12">
          <TestTube className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No A/B tests yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first A/B test to optimize your email campaigns
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-600 mx-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create A/B Test</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {abTests.map(abTest => (
            <div key={abTest._id} className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {abTest.name}
                  </h3>
                  {abTest.description && (
                    <p className="text-sm text-gray-600 mb-2">{abTest.description}</p>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(abTest.status)}`}>
                      {abTest.status.charAt(0).toUpperCase() + abTest.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getTestTypeLabel(abTest.testType)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={() => setSelectedABTest(abTest)}
                    className="p-1 text-gray-400 hover:text-primary-red"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {abTest.status === 'draft' && (
                    <button
                      onClick={() => handleStartTest(abTest._id)}
                      className="p-1 text-gray-400 hover:text-green-500"
                      title="Start test"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  {abTest.status === 'running' && (
                    <>
                      <button
                        onClick={() => handleStopTest(abTest._id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                        title="Stop test"
                      >
                        <StopCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeclareWinner(abTest._id)}
                        className="p-1 text-gray-400 hover:text-purple-500"
                        title="Declare winner"
                      >
                        <Trophy className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {abTest.status !== 'running' && (
                    <button
                      onClick={() => handleDeleteTest(abTest._id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Delete test"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Test Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{abTest.testPercentage}% test group</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <span>Winner by: {getWinnerCriteriaLabel(abTest.winnerCriteria)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Created: {formatDate(abTest.createdAt)}</span>
                </div>
              </div>

              {/* Variants Preview */}
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Variants:</h4>
                <div className="space-y-2">
                  {abTest.variants.slice(0, 2).map((variant, index) => (
                    <div key={variant._id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{variant.name}</span>
                      <span className="text-gray-500">
                        {abTest.variants.length > 2 && index === 1 ? `+${abTest.variants.length - 2} more` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* A/B Test Details Modal */}
      {selectedABTest && (
        <ABTestDetailsModal 
          abTest={selectedABTest} 
          onClose={() => setSelectedABTest(null)} 
        />
      )}

      {/* Create A/B Test Form */}
      {showCreateForm && (
        <CreateABTestForm 
          onClose={() => setShowCreateForm(false)} 
          onSuccess={() => {
            setShowCreateForm(false);
            loadABTests();
          }} 
        />
      )}
    </div>
  );
};

// A/B Test Details Modal Component
const ABTestDetailsModal = ({ abTest, onClose }) => {
  const getVariantRate = (variant, rateType) => {
    if (variant.sentCount === 0) return 0;
    if (rateType === 'open') {
      return ((variant.openCount / variant.sentCount) * 100).toFixed(2);
    } else if (rateType === 'click') {
      return ((variant.clickCount / variant.sentCount) * 100).toFixed(2);
    }
    return 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">A/B Test Details: {abTest.name}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Test Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{abTest.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Test Type:</span>
                  <span className="font-medium">{abTest.testType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Winner Criteria:</span>
                  <span className="font-medium">{abTest.winnerCriteria}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Test Percentage:</span>
                  <span className="font-medium">{abTest.testPercentage}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Timing</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{formatDate(abTest.createdAt)}</span>
                </div>
                {abTest.startDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Started:</span>
                    <span className="font-medium">{formatDate(abTest.startDate)}</span>
                  </div>
                )}
                {abTest.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ended:</span>
                    <span className="font-medium">{formatDate(abTest.endDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Variants Performance</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opens</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {abTest.variants.map((variant) => (
                    <tr key={variant._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {variant.name}
                        {abTest.winnerVariant && abTest.winnerVariant.toString() === variant._id.toString() && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Winner
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variant.sentCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variant.openCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getVariantRate(variant, 'open')}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variant.clickCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getVariantRate(variant, 'click')}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create A/B Test Form Component
const CreateABTestForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    testType: 'subject',
    winnerCriteria: 'open_rate',
    testPercentage: 50,
    variants: [
      { name: 'Variant A', subject: '', htmlContent: '', fromName: '', fromEmail: '' },
      { name: 'Variant B', subject: '', htmlContent: '', fromName: '', fromEmail: '' }
    ]
  });
  const [campaignData, setCampaignData] = useState({
    name: '',
    subject: '',
    fromName: '',
    fromEmail: '',
    htmlContent: ''
  });
  const [saving, setSaving] = useState(false);

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { name: `Variant ${String.fromCharCode(65 + formData.variants.length)}`, subject: '', htmlContent: '', fromName: '', fromEmail: '' }
      ]
    });
  };

  const removeVariant = (index) => {
    if (formData.variants.length <= 2) {
      toast.error('At least two variants are required');
      return;
    }
    
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('A/B test name is required');
      return;
    }
    
    if (!campaignData.name.trim()) {
      toast.error('Campaign name is required');
      return;
    }
    
    setSaving(true);
    try {
      await abTestService.createABTest(campaignData, formData);
      toast.success('A/B test created successfully');
      onSuccess();
    } catch (error) {
      console.error('Failed to create A/B test:', error);
      toast.error(error.response?.data?.message || 'Failed to create A/B test');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Create A/B Test</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto max-h-[80vh]">
          <div className="space-y-6">
            {/* A/B Test Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">A/B Test Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    A/B Test Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
                    placeholder="e.g., Subject Line Test"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
                    placeholder="Brief description of the test"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Type
                  </label>
                  <select
                    value={formData.testType}
                    onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  >
                    <option value="subject">Subject Line</option>
                    <option value="content">Email Content</option>
                    <option value="sender">Sender Name</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Winner Criteria
                  </label>
                  <select
                    value={formData.winnerCriteria}
                    onChange={(e) => setFormData({ ...formData, winnerCriteria: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  >
                    <option value="open_rate">Open Rate</option>
                    <option value="click_rate">Click Rate</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Percentage
                  </label>
                  <select
                    value={formData.testPercentage}
                    onChange={(e) => setFormData({ ...formData, testPercentage: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  >
                    <option value={10}>10%</option>
                    <option value={25}>25%</option>
                    <option value={50}>50%</option>
                    <option value={75}>75%</option>
                    <option value={90}>90%</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Campaign Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Campaign Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={campaignData.name}
                    onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
                    placeholder="e.g., Summer Sale Campaign"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={campaignData.fromName}
                    onChange={(e) => setCampaignData({ ...campaignData, fromName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
                    placeholder="e.g., Your Company"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Email
                  </label>
                  <input
                    type="email"
                    value={campaignData.fromEmail}
                    onChange={(e) => setCampaignData({ ...campaignData, fromEmail: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
                    placeholder="e.g., newsletter@yourcompany.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={campaignData.subject}
                    onChange={(e) => setCampaignData({ ...campaignData, subject: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
                    placeholder="e.g., Don't miss our summer sale!"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Content
                </label>
                <textarea
                  value={campaignData.htmlContent}
                  onChange={(e) => setCampaignData({ ...campaignData, htmlContent: e.target.value })}
                  rows={6}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  placeholder="Enter your email content here..."
                />
              </div>
            </div>
            
            {/* Variants */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Test Variants</h4>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center space-x-1 text-sm text-primary-red hover:text-red-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Variant</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.variants.map((variant, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">Variant {variant.name.split(' ')[1]}</h5>
                      {formData.variants.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    {formData.testType === 'subject' && (
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject Line
                        </label>
                        <input
                          type="text"
                          value={variant.subject}
                          onChange={(e) => handleVariantChange(index, 'subject', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
                          placeholder="e.g., Don't miss our summer sale!"
                        />
                      </div>
                    )}
                    
                    {formData.testType === 'content' && (
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Content
                        </label>
                        <textarea
                          value={variant.htmlContent}
                          onChange={(e) => handleVariantChange(index, 'htmlContent', e.target.value)}
                          rows={4}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
                          placeholder="Enter variant content here..."
                        />
                      </div>
                    )}
                    
                    {formData.testType === 'sender' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              From Name
                            </label>
                            <input
                              type="text"
                              value={variant.fromName}
                              onChange={(e) => handleVariantChange(index, 'fromName', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
                              placeholder="e.g., Your Company"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              From Email
                            </label>
                            <input
                              type="email"
                              value={variant.fromEmail}
                              onChange={(e) => handleVariantChange(index, 'fromEmail', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
                              placeholder="e.g., newsletter@yourcompany.com"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-red text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create A/B Test</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ABTestManager;