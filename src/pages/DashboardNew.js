import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageHeader } from '../components/ui/PageHeader';
import DashboardTabs from '../components/DashboardTabs';
// Removed unused icon imports (were not referenced)
import DashboardTimeframeSelect from '../components/DashboardTimeframeSelect';
import OnboardingChecklist from '../components/OnboardingChecklist';
import ProfileCompletionModal from '../components/ProfileCompletionModal';
import useQueryParamState from '../hooks/useQueryParamState';
import { useDashboardOverview, useAncillaryDashboardData } from '../hooks/useDashboardQueries';
import PanelErrorBoundary from '../components/dashboard/PanelErrorBoundary';
import useDashboardLiveUpdates from '../hooks/useDashboardLiveUpdates';
import { isOnboardingComplete } from '../utils/onboarding';
import devLog from '../utils/devLog';
import useReducedMotion from '../hooks/useReducedMotion';
import DomainStatusBanner from '../components/DomainStatusBanner';
import PageContainer from '../components/layout/PageContainer';

export default function DashboardNew() {
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useQueryParamState('tab', 'overview');
  const [timeframe, setTimeframe] = useState('30d');
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    devLog('🔄 showProfileModal changed to:', showProfileModal);
  }, [showProfileModal]);

  const { data: overviewPayload, isLoading: overviewLoading, error: overviewError } = useDashboardOverview(timeframe);
  const { subscriberStats, automationStats, /* campaignStats */ loading: ancillaryLoading } = useAncillaryDashboardData(true);

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  useEffect(() => { if (overviewError) toast.error('Failed to load overview metrics'); }, [overviewError]);
  const liveEnabled = !!user && isOnboardingComplete(user);
  useDashboardLiveUpdates(liveEnabled);

  const overview = overviewPayload?.overview || null;
  const quickStats = overviewPayload || null;
  const topCampaignsMemo = useMemo(()=> quickStats?.topCampaigns || [], [quickStats]);
  const prefersReducedMotion = useReducedMotion();

  const metricsLoading = overviewLoading || ancillaryLoading;

  // Distinguish between email verification and profile completion so we can tailor UI
  const needsEmailVerification = !!user && !user.isVerified;
  const needsProfileCompletion = !!user && user.isVerified && !user.isProfileComplete;
  const onboardingIncomplete = needsEmailVerification || needsProfileCompletion;
  devLog('📊 onboardingIncomplete:', onboardingIncomplete, 'needsEmailVerification:', needsEmailVerification, 'needsProfileCompletion:', needsProfileCompletion);
  const domainNeedsAttention = !!user && user.isVerified && !user.hasVerifiedDomain;

  // Defer panel lazy imports until onboarding complete to reduce initial bundle
  const [panelsReady, setPanelsReady] = useState(false);
  useEffect(() => { if (!onboardingIncomplete) setPanelsReady(true); }, [onboardingIncomplete]);

  // Confetti removed per user preference

  // (early onboarding-only return removed) render handled in the main return below so the
  // ProfileCompletionModal can always be mounted by the root component when needed.

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'campaigns', label: 'Campaigns' },
    { key: 'subscribers', label: 'Subscribers' },
    { key: 'automation', label: 'Automation' }
  ];

  const OverviewPanel = panelsReady ? React.lazy(()=>import('./dashboard-panels/OverviewPanel')) : null;
  const CampaignsPanel = panelsReady ? React.lazy(()=>import('./dashboard-panels/CampaignsPanel')) : null;
  const SubscribersPanel = panelsReady ? React.lazy(()=>import('./dashboard-panels/SubscribersPanel')) : null;
  
  const AutomationPanel = panelsReady ? React.lazy(()=>import('./dashboard-panels/AutomationPanel')) : null;

  function renderOverview() { if(!OverviewPanel) return null; return <PanelErrorBoundary><OverviewPanel overview={overview} subscriberStats={subscriberStats} quickStats={quickStats} metricsLoading={metricsLoading} setActiveTab={setActiveTab} /></PanelErrorBoundary>; }
  function renderCampaigns() { if(!CampaignsPanel) return null; return <PanelErrorBoundary><CampaignsPanel overview={overview} topCampaigns={topCampaignsMemo} recentActivity={quickStats?.recentActivity||[]} metricsLoading={metricsLoading} navigate={navigate} setActiveTab={setActiveTab} /></PanelErrorBoundary>; }
  function renderSubscribers() { if(!SubscribersPanel) return null; return <PanelErrorBoundary><SubscribersPanel subscriberStats={subscriberStats} metricsLoading={metricsLoading} /></PanelErrorBoundary>; }
  
  function renderAutomation() { if(!AutomationPanel) return null; return <PanelErrorBoundary><AutomationPanel automationStats={automationStats} metricsLoading={metricsLoading} /></PanelErrorBoundary>; }

  let body;
  switch (activeTab) {
    case 'overview': body = renderOverview(); break;
    case 'campaigns': body = renderCampaigns(); break;
    case 'subscribers': body = renderSubscribers(); break;
    
    case 'automation': body = renderAutomation(); break;
    default: body = null;
  }

  return (
    <>
      {onboardingIncomplete ? (
        <div aria-label="dashboard-onboarding" className={`relative ${prefersReducedMotion ? '' : 'transition-opacity duration-700'}`}>
          <div className="max-w-5xl mx-auto">
            <div className={`bg-white border border-gray-200 rounded-xl shadow-sm p-5 md:p-6 mb-6 mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${prefersReducedMotion ? '' : 'transition-opacity duration-500'}`}>
              <div className="space-y-2 max-w-2xl">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome to Email<span className="text-primary-red">XP</span></h1>
                {needsEmailVerification && (
                  <p className="text-sm text-gray-600">Verify your email address to unlock the platform and begin completing your profile.</p>
                )}
                {needsProfileCompletion && (
                  <p className="text-sm text-gray-600">Complete your profile to unlock live metrics, segmentation insights, automation analytics & deliverability monitoring.</p>
                )}
              </div>
            </div>
            {/* Removed preview skeleton after verification to reduce confusion */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                <OnboardingChecklist 
                  compact 
                  showProfileModal={showProfileModal}
                  setShowProfileModal={setShowProfileModal}
                />
              </div>
              {/* Unlock Teaser Panel */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-gray-800 tracking-wide uppercase">What You Unlock</h2>
                <ul className="space-y-3 text-xs text-gray-600">
                  <li className="flex items-start"><span className="mt-0.5 mr-2 text-primary-red">•</span> Real-time performance stream (opens, clicks, conversions)</li>
                  <li className="flex items-start"><span className="mt-0.5 mr-2 text-primary-red">•</span> Advanced segmentation & behavioral triggers</li>
                  <li className="flex items-start"><span className="mt-0.5 mr-2 text-primary-red">•</span> Deliverability & domain health diagnostics</li>
                  <li className="flex items-start"><span className="mt-0.5 mr-2 text-primary-red">•</span> Automation journey analytics & A/B testing</li>
                </ul>
                <div className="mt-auto pt-2">
                  {needsEmailVerification && (
                    <p className="text-[11px] text-gray-500 leading-relaxed">We keep the full dashboard locked until you verify your email to protect analytic precision.</p>
                  )}
                  {needsProfileCompletion && (
                    <p className="text-[11px] text-gray-500 leading-relaxed">Almost there — finish profile details to unlock the full dashboard experience.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Blurred preview placeholder */}
          {/* Removed blurred backdrop for profile completion stage */}
        </div>
      ) : (
        <PageContainer className={`space-y-6 ${prefersReducedMotion ? '' : 'transition-opacity duration-700'}`} aria-label="dashboard-root">
          {domainNeedsAttention && <DomainStatusBanner />}
          <PageHeader
            title="Dashboard"
            description="Key performance metrics across your email marketing stack"
          />
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <DashboardTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
            <DashboardTimeframeSelect value={timeframe} onChange={setTimeframe} />
          </div>
          <Suspense fallback={<PanelSkeleton />}>{body}</Suspense>
        </PageContainer>
      )}
  {devLog('🎪 About to render ProfileCompletionModal with isOpen:', showProfileModal)}
      <ProfileCompletionModal
        key={showProfileModal ? 'open' : 'closed'}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
}

// Panel skeleton component
function PanelSkeleton(){
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-6 gap-4">
      {Array.from({length:6}).map((_,i)=>(
        <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 animate-pulse">
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="mt-6 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="mt-2 h-2 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  );
}
