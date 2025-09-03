// emailxp/frontend/src/components/EnhancedCampaignBuilder.js

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Users, 
  Calendar, 
  Eye, 
  Send, 
  Save, 
  ArrowLeft, 
  ArrowRight,
  TestTube,
  Clock,
  Target,
  Palette,
  Settings,
  CheckCircle,
  AlertCircle,
  X,
  User,
  Pencil
} from 'lucide-react';
import { toast } from 'react-toastify';
import AudienceSelector from './AudienceSelector';
import EnhancedDragDropEditor from './EnhancedDragDropEditor';
import templateService from '../services/templateService';
import campaignService from '../services/campaignService';

const STEPS = [
  { id: 'setup', title: 'Campaign Setup', icon: Settings },
  { id: 'audience', title: 'Select Audience', icon: Target },
  { id: 'content', title: 'Design Content', icon: Palette },
  { id: 'schedule', title: 'Schedule & Send', icon: Calendar },
  { id: 'review', title: 'Review & Launch', icon: CheckCircle }
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' }
];

// Helper function to generate HTML from blocks
const generateHTMLFromBlocks = (blocks = []) => {
  if (!blocks || blocks.length === 0) {
    return '<div style="padding: 20px; text-align: center; color: #666;">No content available</div>';
  }

  const blockHTML = blocks.map(block => {
    switch (block.type) {
      case 'text':
        return `<p style="${styleObjectToString(block.content?.styles || {})}">${block.content?.text || ''}</p>`;
      case 'heading':
        const level = block.content?.level || 'h2';
        return `<${level} style="${styleObjectToString(block.content?.styles || {})}">${block.content?.text || ''}</${level}>`;
      case 'image':
        const imgStyle = `width: ${block.content?.width || '100%'}; height: auto; display: block;`;
        const img = `<img src="${block.content?.src || ''}" alt="${block.content?.alt || ''}" style="${imgStyle}">`;
        return block.content?.link ? `<a href="${block.content.link}">${img}</a>` : img;
      case 'button':
        return `<div style="text-align: center; padding: 10px 0;">
          <a href="${block.content?.link || '#'}" style="${styleObjectToString(block.content?.styles || {})}">${block.content?.text || 'Button'}</a>
        </div>`;
      case 'divider':
        return `<hr style="border: none; border-top: 1px ${block.content?.style || 'solid'} ${block.content?.color || '#cccccc'}; width: ${block.content?.width || '100%'}; margin: 20px auto;">`;
      case 'spacer':
        return `<div style="height: ${block.content?.height || '20px'};"></div>`;
      default:
        return '';
    }
  }).join('\n');

  return `
<div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
  ${blockHTML}
</div>`;
};

const styleObjectToString = (styles) => {
  return Object.entries(styles)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');
};

const EnhancedCampaignBuilder = ({ campaignId, onSave, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Campaign form data
  const [campaignData, setCampaignData] = useState({
    // Setup
    name: '',
    subject: '',
    preheader: '',
    fromName: '',
    fromEmail: '',
    replyTo: '',
    
    // A/B Testing
    enableABTest: false,
    abTestType: 'subject', // 'subject', 'content', 'sender'
    abTestPercentage: 50,
    abTestWinnerCriteria: 'open_rate', // 'open_rate', 'click_rate'
    abTestDuration: 4, // hours
    
    // Audience
    selectedGroups: [],
    selectedSegments: [],
    selectedIndividuals: [],
    excludeGroups: [],
    excludeSegments: [],
    
    // Content
    htmlContent: '',
    plainTextContent: '',
    blocks: [],
    template: null,
    
    // Scheduling
    sendOption: 'now', // 'now', 'schedule', 'optimal'
    scheduledAt: '',
    scheduleType: 'fixed', // 'fixed', 'subscriber_local'
    scheduleTimezone: 'UTC',
    
    // Advanced options
    trackOpens: true,
    trackClicks: true,
    enableUnsubscribe: true,
    customUnsubscribeUrl: '',
    tags: []
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await templateService.getTemplates({ limit: 50 });
        setTemplates(response.templates || []);
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    };
    loadTemplates();
  }, []);

  // Load existing campaign if editing
  useEffect(() => {
    if (campaignId) {
      loadCampaign();
    }
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const campaign = await campaignService.getCampaignById(campaignId);
      
      setCampaignData({
        ...campaignData,
        name: campaign.name || '',
        subject: campaign.subject || '',
        preheader: campaign.preheader || '',
        fromName: campaign.fromName || '',
        fromEmail: campaign.fromEmail || '',
        replyTo: campaign.replyTo || '',
        selectedGroups: campaign.groups || [],
        selectedSegments: campaign.segments || [],
        selectedIndividuals: campaign.individualSubscribers || [],
        htmlContent: campaign.htmlContent || '',
        plainTextContent: campaign.plainTextContent || '',
        sendOption: campaign.status === 'scheduled' ? 'schedule' : 'now',
        scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0, 16) : '',
        scheduleType: campaign.scheduleType || 'fixed',
        scheduleTimezone: campaign.scheduleTimezone || 'UTC'
      });
    } catch (error) {
      console.error('Failed to load campaign:', error);
      toast.error('Failed to load campaign data');
    } finally {
      setLoading(false);
    }
  };

  // Validation
  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 0: // Setup
        if (!campaignData.name.trim()) errors.name = 'Campaign name is required';
        if (!campaignData.subject.trim()) errors.subject = 'Subject line is required';
        break;
        
      case 1: // Audience
        if (campaignData.selectedGroups.length === 0 && 
            campaignData.selectedSegments.length === 0 && 
            campaignData.selectedIndividuals.length === 0) {
          errors.audience = 'Please select at least one audience';
        }
        break;
        
      case 2: // Content
        if (!campaignData.htmlContent.trim()) {
          errors.content = 'Email content is required';
        }
        break;
        
      case 3: // Schedule
        if (campaignData.sendOption === 'schedule' && !campaignData.scheduledAt) {
          errors.schedule = 'Please select a send time';
        }
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  // Template handling
  const applyTemplate = async (template) => {
    try {
      const templateData = await templateService.useTemplate(template._id);
      setCampaignData(prev => ({
        ...prev,
        htmlContent: templateData.template.htmlContent,
        template: template._id
      }));
      setShowTemplateSelector(false);
      toast.success('Template applied successfully');
    } catch (error) {
      console.error('Failed to use template:', error);
      toast.error('Failed to apply template');
    }
  };

  // Test email
  const sendTestEmail = async () => {
    if (!testEmailRecipient.trim()) {
      toast.error('Please enter a test email address');
      return;
    }

    try {
      setSendingTest(true);
      // Create a temporary campaign for testing
      const testCampaign = await campaignService.createCampaign({
        ...campaignData,
        name: `TEST: ${campaignData.name}`,
        status: 'draft'
      });
      
      await campaignService.sendTestEmail(testCampaign._id, testEmailRecipient);
      toast.success(`Test email sent to ${testEmailRecipient}`);
      setTestEmailRecipient('');
    } catch (error) {
      console.error('Failed to send test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  // Save campaign
  const saveCampaign = async (sendNow = false) => {
    if (!validateStep(currentStep)) return;

    try {
      setSaving(true);
      
      const payload = {
        name: campaignData.name,
        subject: campaignData.subject,
        preheader: campaignData.preheader,
        fromName: campaignData.fromName || undefined,
        fromEmail: campaignData.fromEmail || undefined,
        replyTo: campaignData.replyTo || undefined,
        htmlContent: campaignData.htmlContent,
        plainTextContent: campaignData.plainTextContent,
        groups: campaignData.selectedGroups,
        segments: campaignData.selectedSegments,
        individuals: campaignData.selectedIndividuals,
        template: campaignData.template
      };

      // Add scheduling info
      if (campaignData.sendOption === 'schedule') {
        payload.scheduledAt = campaignData.scheduledAt;
        payload.scheduleType = campaignData.scheduleType;
        payload.scheduleTimezone = campaignData.scheduleTimezone;
      }

      let result;
      if (campaignId) {
        result = await campaignService.updateCampaign(campaignId, payload);
      } else {
        result = await campaignService.createCampaign(payload);
      }

      // Send if requested
      if (sendNow) {
        await campaignService.sendCampaign(result._id || campaignId);
        toast.success('Campaign sent successfully!');
      } else if (campaignData.sendOption === 'schedule') {
        toast.success('Campaign scheduled successfully!');
      } else {
        toast.success('Campaign saved successfully!');
      }

      if (onSave) onSave(result);
    } catch (error) {
      console.error('Failed to save campaign:', error);
      toast.error('Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderSetupStep();
      case 1:
        return renderAudienceStep();
      case 2:
        return renderContentStep();
      case 3:
        return renderScheduleStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderSetupStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Campaign Details
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Campaign Name *
            </label>
            <input
              type="text"
              value={campaignData.name}
              onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., Spring Sale Newsletter"
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject Line *
            </label>
            <input
              type="text"
              value={campaignData.subject}
              onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., Save 30% on Spring Collection"
            />
            {validationErrors.subject && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.subject}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preheader Text
            </label>
            <input
              type="text"
              value={campaignData.preheader}
              onChange={(e) => setCampaignData(prev => ({ ...prev, preheader: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Preview text that appears after the subject line"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This text appears in the inbox preview. Keep it under 90 characters.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
          Sender Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Name
            </label>
            <input
              type="text"
              value={campaignData.fromName}
              onChange={(e) => setCampaignData(prev => ({ ...prev, fromName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Your Company"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Email
            </label>
            <input
              type="email"
              value={campaignData.fromEmail}
              onChange={(e) => setCampaignData(prev => ({ ...prev, fromEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="hello@yourcompany.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reply-To Email
            </label>
            <input
              type="email"
              value={campaignData.replyTo}
              onChange={(e) => setCampaignData(prev => ({ ...prev, replyTo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="support@yourcompany.com"
            />
          </div>
        </div>
      </div>

      {/* A/B Testing Section */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <TestTube className="w-5 h-5 text-gray-400" />
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            A/B Testing (Optional)
          </h4>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={campaignData.enableABTest}
              onChange={(e) => setCampaignData(prev => ({ ...prev, enableABTest: e.target.checked }))}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable A/B Testing
            </span>
          </label>
          
          {campaignData.enableABTest && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Type
                </label>
                <select
                  value={campaignData.abTestType}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, abTestType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="subject">Subject Line</option>
                  <option value="content">Email Content</option>
                  <option value="sender">Sender Name</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Test Percentage
                  </label>
                  <select
                    value={campaignData.abTestPercentage}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, abTestPercentage: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value={10}>10%</option>
                    <option value={25}>25%</option>
                    <option value={50}>50%</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Winner Criteria
                  </label>
                  <select
                    value={campaignData.abTestWinnerCriteria}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, abTestWinnerCriteria: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="open_rate">Open Rate</option>
                    <option value="click_rate">Click Rate</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAudienceStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Select Your Audience
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Choose who will receive this campaign. You can select groups, segments, or individual subscribers.
        </p>
      </div>

      <AudienceSelector
        selectedGroups={campaignData.selectedGroups}
        selectedSegments={campaignData.selectedSegments}
        selectedIndividuals={campaignData.selectedIndividuals}
        onSelectionChange={(selection) => {
          setCampaignData(prev => ({
            ...prev,
            selectedGroups: selection.groups || [],
            selectedSegments: selection.segments || [],
            selectedIndividuals: selection.individuals || []
          }));
        }}
        showRecipientCount={true}
      />

      {validationErrors.audience && (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">{validationErrors.audience}</p>
        </div>
      )}
    </div>
  );

  const renderContentStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Design Your Email
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create your email content using our drag-and-drop editor or choose from templates.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTemplateSelector(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Palette className="w-4 h-4 mr-2" />
            Use Template
          </button>
          
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              previewMode
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {previewMode ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>From:</strong> {campaignData.fromName || 'Your Name'} &lt;{campaignData.fromEmail || 'your@email.com'}&gt;
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {campaignData.subject || 'Your Subject Line'}
              </div>
              {campaignData.preheader && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {campaignData.preheader}
                </div>
              )}
            </div>
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: campaignData.htmlContent || '<p>No content yet. Switch to edit mode to add content.</p>' }}
            />
          </div>
        </div>
      ) : (
        <div className="h-96">
          <EnhancedDragDropEditor
            initialBlocks={campaignData.blocks || []}
            onBlocksChange={(blocks) => {
              setCampaignData(prev => ({ 
                ...prev, 
                blocks,
                htmlContent: generateHTMLFromBlocks(blocks)
              }));
            }}
            onPreview={(blocks) => {
              setCampaignData(prev => ({ 
                ...prev, 
                blocks,
                htmlContent: generateHTMLFromBlocks(blocks)
              }));
            }}
          />
          
          {validationErrors.content && (
            <div className="flex items-center space-x-2 text-red-600 mt-4">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{validationErrors.content}</p>
            </div>
          )}
        </div>
      )}

      {/* Test Email Section */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Send Test Email
        </h4>
        <div className="flex items-center space-x-3">
          <input
            type="email"
            value={testEmailRecipient}
            onChange={(e) => setTestEmailRecipient(e.target.value)}
            placeholder="test@example.com"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
          />
          <button
            onClick={sendTestEmail}
            disabled={sendingTest || !testEmailRecipient.trim()}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {sendingTest ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Test
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderScheduleStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Schedule Your Campaign
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Choose when to send your campaign to maximize engagement.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="sendOption"
              value="now"
              checked={campaignData.sendOption === 'now'}
              onChange={(e) => setCampaignData(prev => ({ ...prev, sendOption: e.target.value }))}
              className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Send Now</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Send immediately after review
              </div>
            </div>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="sendOption"
              value="schedule"
              checked={campaignData.sendOption === 'schedule'}
              onChange={(e) => setCampaignData(prev => ({ ...prev, sendOption: e.target.value }))}
              className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Schedule for Later</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Choose a specific date and time
              </div>
            </div>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="sendOption"
              value="optimal"
              checked={campaignData.sendOption === 'optimal'}
              onChange={(e) => setCampaignData(prev => ({ ...prev, sendOption: e.target.value }))}
              className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Send at Optimal Time</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                AI will determine the best time based on subscriber behavior
              </div>
            </div>
          </label>
        </div>
      </div>

      {campaignData.sendOption === 'schedule' && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Send Date & Time
            </label>
            <input
              type="datetime-local"
              value={campaignData.scheduledAt}
              onChange={(e) => setCampaignData(prev => ({ ...prev, scheduledAt: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min={new Date().toISOString().slice(0, 16)}
            />
            {validationErrors.schedule && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.schedule}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Schedule Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="scheduleType"
                  value="fixed"
                  checked={campaignData.scheduleType === 'fixed'}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, scheduleType: e.target.value }))}
                  className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Fixed Time</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Send at the same time for all subscribers
                  </div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="scheduleType"
                  value="subscriber_local"
                  checked={campaignData.scheduleType === 'subscriber_local'}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, scheduleType: e.target.value }))}
                  className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Subscriber Local Time</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Send based on each subscriber's timezone
                  </div>
                </div>
              </label>
            </div>
          </div>

          {campaignData.scheduleType === 'fixed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timezone
              </label>
              <select
                value={campaignData.scheduleTimezone}
                onChange={(e) => setCampaignData(prev => ({ ...prev, scheduleTimezone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Review & Launch
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Review your campaign details before sending.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Campaign Summary</h4>
          
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Campaign Name</div>
              <div className="font-medium text-gray-900 dark:text-white">{campaignData.name}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Subject Line</div>
              <div className="font-medium text-gray-900 dark:text-white">{campaignData.subject}</div>
            </div>
            
            {campaignData.preheader && (
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Preheader</div>
                <div className="font-medium text-gray-900 dark:text-white">{campaignData.preheader}</div>
              </div>
            )}
            
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">From</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {campaignData.fromName || 'Default Name'} &lt;{campaignData.fromEmail || 'default@email.com'}&gt;
              </div>
            </div>
          </div>
        </div>

        {/* Audience Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Audience</h4>
          
          <div className="space-y-3">
            {campaignData.selectedGroups.length > 0 && (
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Groups</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {campaignData.selectedGroups.length} group(s) selected
                </div>
              </div>
            )}
            
            {campaignData.selectedSegments.length > 0 && (
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Segments</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {campaignData.selectedSegments.length} segment(s) selected
                </div>
              </div>
            )}
            
            {campaignData.selectedIndividuals.length > 0 && (
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Individual Subscribers</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {campaignData.selectedIndividuals.length} subscriber(s) selected
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Schedule</h4>
          
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Send Option</div>
              <div className="font-medium text-gray-900 dark:text-white">
                {campaignData.sendOption === 'now' && 'Send Now'}
                {campaignData.sendOption === 'schedule' && 'Scheduled'}
                {campaignData.sendOption === 'optimal' && 'Optimal Time'}
              </div>
            </div>
            
            {campaignData.sendOption === 'schedule' && (
              <>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Send Time</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {new Date(campaignData.scheduledAt).toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Schedule Type</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {campaignData.scheduleType === 'fixed' ? 'Fixed Time' : 'Subscriber Local Time'}
                  </div>
                </div>
                
                {campaignData.scheduleType === 'fixed' && (
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Timezone</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {TIMEZONES.find(tz => tz.value === campaignData.scheduleTimezone)?.label || campaignData.scheduleTimezone}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* A/B Testing Summary */}
        {campaignData.enableABTest && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">A/B Testing</h4>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Test Type</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {campaignData.abTestType === 'subject' && 'Subject Line'}
                  {campaignData.abTestType === 'content' && 'Email Content'}
                  {campaignData.abTestType === 'sender' && 'Sender Name'}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Test Percentage</div>
                <div className="font-medium text-gray-900 dark:text-white">{campaignData.abTestPercentage}%</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Winner Criteria</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {campaignData.abTestWinnerCriteria === 'open_rate' ? 'Open Rate' : 'Click Rate'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Final Actions */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Ready to Launch?
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Once you launch this campaign, it cannot be edited. Make sure all details are correct.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {campaignId ? 'Edit Campaign' : 'Create Campaign'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {campaignId ? 'Update your existing campaign' : 'Build and send your email campaign'}
          </p>
        </div>
        
        <button
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </button>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => goToStep(index)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : isCompleted
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{step.title}</span>
                </button>
                
                {index < STEPS.length - 1 && (
                  <div className="w-8 h-px bg-gray-300 dark:bg-gray-600 mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => saveCampaign(false)}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </>
            )}
          </button>

          {currentStep === STEPS.length - 1 ? (
            <button
              onClick={() => saveCampaign(campaignData.sendOption === 'now')}
              disabled={saving}
              className="inline-flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {campaignData.sendOption === 'now' ? 'Sending...' : 'Saving...'}
                </>
              ) : (
                <>
                  {campaignData.sendOption === 'now' ? (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Campaign
                    </>
                  ) : campaignData.sendOption === 'schedule' ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Schedule Campaign
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Campaign
                    </>
                  )}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Choose a Template
              </h2>
              <button
                onClick={() => setShowTemplateSelector(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No templates available
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Create some templates first to use them in your campaigns
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => applyTemplate(template)}
                    >
                      <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Mail className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {template.name}
                        </h3>
                        {template.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCampaignBuilder;