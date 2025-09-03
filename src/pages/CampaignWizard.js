// emailxp/frontend/src/pages/CampaignWizard.js

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import groupService from '../services/groupService';
import campaignService from '../services/campaignService';
import AudienceSelector from '../components/AudienceSelector';
import DragDropEmailEditor from '../components/DragDropEmailEditor';
import templateService from '../services/templateService';

// Minimal timezone list for fixed-time scheduling
const TIMEZONES = [
  'UTC',
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const StepHeader = ({ step, steps }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        {steps.map((label, idx) => (
          <div key={label} className="flex items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${idx <= step ? 'bg-primary-red' : 'bg-gray-300'}`}>
              {idx + 1}
            </div>
            <span className={`ml-2 mr-4 ${idx === step ? 'font-semibold text-gray-800' : ''}`}>{label}</span>
            {idx < steps.length - 1 && <div className="h-px w-8 bg-gray-300" />}
          </div>
        ))}
      </div>
    </div>
  );
};

function CampaignWizard() {
  const navigate = useNavigate();
  const { id } = useParams(); // Campaign ID for editing
  const isEditMode = !!id;

  const steps = ['Details', 'Content', 'Schedule', 'Review'];
  const [step, setStep] = useState(0);

  // Data
  const [groups, setGroups] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingCampaign, setLoadingCampaign] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const [form, setForm] = useState({
    name: '',
    subject: '',
    fromName: '',
    fromEmail: '',
    groups: [], // array of selected group ids
    segments: [], // array of selected segment ids
    individuals: [], // array of selected individual subscriber ids
    htmlContent: '',
    selectedTemplateId: null, // track selected template
    // Scheduling
    sendOption: 'now', // 'now' | 'schedule'
    scheduleType: 'fixed', // 'fixed' | 'subscriber_local'
    scheduledAt: '', // datetime-local string
    scheduleTimezone: 'UTC',
  });

  const groupIdToName = useMemo(() => {
    const map = {};
    groups.forEach(g => { map[g._id] = g.name; });
    return map;
  }, [groups]);

  // Load templates
  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await templateService.getTemplates({ limit: 20 });
      setTemplates(response.templates || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Use template
  const applyTemplate = async (template) => {
    try {
      const templateData = await templateService.useTemplate(template._id);
      setForm({
        ...form,
        htmlContent: templateData.template.htmlContent,
        selectedTemplateId: template._id,
      });
      setShowTemplateSelector(false);
    } catch (error) {
      console.error('Error using template:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadGroups = async () => {
      try {
        setLoadingGroups(true);
        const res = await groupService.getGroups();
        if (!isMounted) return;
        setGroups(res || []);
      } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to load groups');
        setGroups([]);
      } finally {
        if (isMounted) setLoadingGroups(false);
      }
    };
    loadGroups();
    return () => { isMounted = false; };
  }, []);

  // Load campaign data for editing
  useEffect(() => {
    if (!isEditMode) return;
    
    let isMounted = true;
    const loadCampaign = async () => {
      try {
        setLoadingCampaign(true);
        const campaign = await campaignService.getCampaignById(id);
        if (!isMounted) return;
        
        // Convert campaign data to form format
        setForm({
          name: campaign.name || '',
          subject: campaign.subject || '',
          fromName: campaign.fromName || '',
          fromEmail: campaign.fromEmail || '',
          groups: campaign.groups || (campaign.group ? [campaign.group] : []),
          segments: campaign.segments || [],
          individuals: campaign.individuals || [],
          htmlContent: campaign.htmlContent || '',
          selectedTemplateId: campaign.template?._id || campaign.template || null,
          sendOption: campaign.status === 'scheduled' ? 'schedule' : 'now',
          scheduleType: campaign.scheduleType || 'fixed',
          scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0, 16) : '',
          scheduleTimezone: campaign.scheduleTimezone || 'UTC',
        });
      } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to load campaign');
        navigate('/campaigns');
      } finally {
        if (isMounted) setLoadingCampaign(false);
      }
    };
    
    loadCampaign();
    return () => { isMounted = false; };
  }, [id, isEditMode, navigate]);

  // Navigation between steps with validation
  const canProceedFromStep = (currentStep) => {
    if (currentStep === 0) {
      if (!form.name || !form.subject) return false;
      // At least one recipient selection method required
      if ((!form.groups || form.groups.length === 0) && 
          (!form.segments || form.segments.length === 0) && 
          (!form.individuals || form.individuals.length === 0)) {
        return false;
      }
      // Sender info optional; backend falls back to user info
      return true;
    }
    if (currentStep === 1) {
      return !!form.htmlContent && form.htmlContent.trim().length > 0;
    }
    if (currentStep === 2) {
      if (form.sendOption === 'now') return true;
      if (!form.scheduledAt) return false;
      if (form.scheduleType === 'fixed' && !form.scheduleTimezone) return false;
      return true;
    }
    return true;
  };

  const next = () => {
    if (!canProceedFromStep(step)) {
      toast.error('Please complete the required fields before continuing.');
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
    if (!canProceedFromStep(3)) {
      toast.error('Please complete all required fields.');
      return;
    }

    // Ensure at least one recipient selection method
    if ((!form.groups || form.groups.length === 0) && 
        (!form.segments || form.segments.length === 0) && 
        (!form.individuals || form.individuals.length === 0)) {
      toast.error('At least one recipient selection is required.');
      return;
    }

    const payload = {
      name: form.name,
      subject: form.subject,
      fromName: form.fromName || undefined,
      fromEmail: form.fromEmail || undefined,
      htmlContent: form.htmlContent,
      groups: form.groups,
      segments: form.segments,
      individuals: form.individuals,
      template: form.selectedTemplateId || null,
    };

    // Backend compatibility: set primary group if groups exist
    if (form.groups && form.groups.length > 0) {
      payload.group = form.groups[0];
    }

    if (form.sendOption === 'schedule') {
      payload.scheduledAt = form.scheduledAt; // datetime-local string; backend will parse
      payload.scheduleType = form.scheduleType;
      if (form.scheduleType === 'fixed') {
        payload.scheduleTimezone = form.scheduleTimezone;
      }
    }

    setSaving(true);
    try {
      if (isEditMode) {
        // Update existing campaign
        await campaignService.updateCampaign(id, payload);
        if (form.sendOption === 'now') {
          await campaignService.sendCampaign(id);
          toast.success('Campaign updated and sent successfully.');
        } else {
          toast.success('Campaign updated successfully.');
        }
      } else {
        // Create new campaign
        const created = await campaignService.createCampaign(payload);
        if (form.sendOption === 'now') {
          await campaignService.sendCampaign(created._id);
          toast.success('Campaign sent successfully.');
        } else {
          toast.success('Campaign scheduled successfully.');
        }
      }
      navigate('/campaigns');
    } catch (e) {
      console.error('Error creating/updating/sending campaign', e);
      toast.error(e.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} campaign`);
    } finally {
      setSaving(false);
    }
  };

  // Render steps
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Campaign name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Spring Promo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject line</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Save 20% today"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">From name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red"
                  value={form.fromName}
                  onChange={(e) => setForm({ ...form, fromName: e.target.value })}
                  placeholder="Your Name or Brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">From email</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red"
                  value={form.fromEmail}
                  onChange={(e) => setForm({ ...form, fromEmail: e.target.value })}
                  placeholder="you@domain.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Recipients</label>
              <AudienceSelector
                selectedGroups={form.groups}
                selectedSegments={form.segments}
                selectedIndividuals={form.individuals}
                onSelectionChange={(selection) => {
                  setForm({
                    ...form,
                    groups: selection.groups,
                    segments: selection.segments,
                    individuals: selection.individuals
                  });
                }}
                showRecipientCount={true}
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Email Content</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setShowTemplateSelector(true);
                    loadTemplates();
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                >
                  Choose Template
                </button>
                <div className="text-xs text-gray-500">
                  Use the drag-and-drop editor or switch to HTML mode
                </div>
              </div>
            </div>

            {/* Template Selector Modal */}
            {showTemplateSelector && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-full overflow-auto">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-medium">Choose a Template</h3>
                    <button
                      onClick={() => setShowTemplateSelector(false)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-4">
                    {loadingTemplates ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading templates...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map(template => (
                          <div key={template._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-video bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-400 text-sm">{template.name}</span>
                            </div>
                            <div className="p-3">
                              <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
                              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {template.category}
                                </span>
                                <button
                                  onClick={() => applyTemplate(template)}
                                  className="px-3 py-1 bg-primary-red text-white rounded text-sm hover:bg-red-600"
                                >
                                  Use Template
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <DragDropEmailEditor
              value={form.htmlContent}
              onChange={(html) => setForm({ ...form, htmlContent: html })}
              className="min-h-[400px]"
            />
            
            {/* Fallback to ReactQuill for advanced users */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-700 font-medium">Advanced: Edit HTML directly</summary>
              <div className="mt-3">
                <ReactQuill 
                  value={form.htmlContent} 
                  onChange={(v) => setForm({ ...form, htmlContent: v })}
                  theme="snow"
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'color': [] }, { 'background': [] }],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      [{ 'align': [] }],
                      ['link', 'image'],
                      ['clean']
                    ],
                  }}
                />
              </div>
            </details>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="h-4 w-4 text-primary-red"
                  checked={form.sendOption === 'now'}
                  onChange={() => setForm({ ...form, sendOption: 'now' })}
                />
                <span className="ml-2">Send now</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="h-4 w-4 text-primary-red"
                  checked={form.sendOption === 'schedule'}
                  onChange={() => setForm({ ...form, sendOption: 'schedule' })}
                />
                <span className="ml-2">Schedule for later</span>
              </label>
            </div>

            {form.sendOption === 'schedule' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date & time</label>
                  <input
                    type="datetime-local"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red"
                    value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  />
                </div>

                <div className="space-y-2 p-4 border rounded">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-primary-red"
                      checked={form.scheduleType === 'subscriber_local'}
                      onChange={() => setForm({ ...form, scheduleType: 'subscriber_local' })}
                    />
                    <span className="ml-2">Send based on subscriber’s local time</span>
                  </label>

                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="h-4 w-4 text-primary-red"
                      checked={form.scheduleType === 'fixed'}
                      onChange={() => setForm({ ...form, scheduleType: 'fixed' })}
                    />
                    <span className="ml-2">Send at a specific timezone</span>
                  </label>

                  {form.scheduleType === 'fixed' && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700">Timezone</label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red"
                        value={form.scheduleTimezone}
                        onChange={(e) => setForm({ ...form, scheduleTimezone: e.target.value })}
                      >
                        {TIMEZONES.map(tz => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <p><span className="font-medium">Name:</span> {form.name}</p>
                <p><span className="font-medium">Subject:</span> {form.subject}</p>
                <p><span className="font-medium">From:</span> {form.fromName || 'Default'} &lt;{form.fromEmail || 'Account email'}&gt;</p>
                <div>
                  <span className="font-medium">Recipients:</span>
                  <div className="mt-1 text-sm">
                    {form.groups.length > 0 && (
                      <div>Groups: {form.groups.map(id => groupIdToName[id]).filter(Boolean).join(', ')}</div>
                    )}
                    {form.segments.length > 0 && (
                      <div>Segments: {form.segments.length} selected</div>
                    )}
                    {form.individuals.length > 0 && (
                      <div>Individual: {form.individuals.length} subscribers</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded">
                <p><span className="font-medium">Delivery:</span> {form.sendOption === 'now' ? 'Send now' : 'Scheduled'}</p>
                {form.sendOption === 'schedule' && (
                  <>
                    <p><span className="font-medium">Date/Time:</span> {form.scheduledAt || '-'}</p>
                    <p><span className="font-medium">Mode:</span> {form.scheduleType === 'subscriber_local' ? 'Subscriber local time' : 'Fixed timezone'}</p>
                    {form.scheduleType === 'fixed' && (
                      <p><span className="font-medium">Timezone:</span> {form.scheduleTimezone}</p>
                    )}
                  </>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Content preview</h4>
              <div className="p-4 border rounded bg-white max-h-64 overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: form.htmlContent }} />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Show loading state while loading campaign data
  if (loadingCampaign) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red mx-auto mb-4"></div>
              <p className="text-gray-600">Loading campaign...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <header className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Campaign' : 'Create Campaign'}</h1>
      </header>

      <div className="bg-white rounded-xl shadow p-6">
        <StepHeader step={step} steps={steps} />
        {renderStep()}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={step === 0 ? () => navigate('/campaigns') : back}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            disabled={saving}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="px-6 py-2 bg-primary-red text-white rounded-md hover:bg-custom-red-hover"
              disabled={saving}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-primary-red text-white rounded-md hover:bg-custom-red-hover"
              disabled={saving}
            >
              {saving ? 'Processing...' : 
                isEditMode ? 
                  (form.sendOption === 'now' ? 'Update & Send' : 'Update & Schedule') :
                  (form.sendOption === 'now' ? 'Confirm & Send' : 'Confirm & Schedule')
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CampaignWizard;
