import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { H1, Body } from '../components/ui/Typography';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import subscriberService from '../services/subscriberService';
import { Loader2, Users, Eye, MousePointerClick, Edit, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

function SubscriberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subscriber, setSubscriber] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const s = await subscriberService.getSubscriber(id);
        setSubscriber(s);
  const a = await subscriberService.getSubscriberActivity(id);
  // Normalize activity to an array. Some API responses return an object.
  let normalized = [];
  if (Array.isArray(a)) normalized = a;
  else if (a && Array.isArray(a.activities)) normalized = a.activities;
  else if (a && Array.isArray(a.events)) normalized = a.events;
  else if (a && Array.isArray(a.data)) normalized = a.data;
  setActivity(normalized);
      } catch (e) {
        console.error('Failed to load subscriber details', e);
        toast.error('Failed to load subscriber');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <H1 className="text-2xl">{subscriber?.email || 'Subscriber'}</H1>
          <Body className="text-gray-500">Detailed information and activity for this subscriber.</Body>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/subscribers/edit/${subscriber?._id || id}`} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Edit className="w-4 h-4 mr-2"/> Edit
          </Link>
          <button onClick={() => navigate(-1)} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{subscriber?.name || subscriber?.email}</h3>
                    <div className="text-sm text-gray-500 mt-1">{subscriber?.firstName || ''} {subscriber?.lastName || ''}</div>
                    <div className="mt-2"><StatusBadge status={subscriber?.status} /></div>
                  </div>
                  <div className="text-sm text-gray-500 text-right">
                    <div className="text-xs">Subscribed</div>
                    <div className="font-medium">{new Date(subscriber?.subscriptionDate || subscriber?.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {subscriber?.groups && subscriber.groups.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {subscriber.groups.map((g, i) => (<span key={i} className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded text-xs">{typeof g === 'string' ? g : g.name}</span>))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card id="activity">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Activity Timeline</h4>
                  <a href={`#activity`} className="text-sm text-gray-600">View full activity</a>
                </div>
              </CardHeader>
              <CardContent>
                {(!Array.isArray(activity) || activity.length === 0) ? (
                  <div className="text-sm text-gray-500">No activity found for this subscriber.</div>
                ) : (
                  <ul className="space-y-3">
                    {activity.map((a, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <div className="w-3 h-3 rounded-full bg-gray-300 mt-2" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{a.type}</div>
                          <div className="text-xs text-gray-500">{new Date(a.date).toLocaleString()}</div>
                          {a.campaign && (
                            <div className="text-xs text-gray-600">Campaign: {(() => {
                              const campaignId = a.campaignId || (a.campaign && a.campaign._id) || (typeof a.campaign === 'string' && a.campaign.match(/^[0-9a-fA-F]{24}$/) ? a.campaign : null);
                              const campaignName = typeof a.campaign === 'string' ? a.campaign : a.campaign && a.campaign.name ? a.campaign.name : a.campaign;
                              return campaignId ? <Link to={`/campaigns/details/${campaignId}`} className="text-red-600 hover:underline"><strong>{campaignName}</strong></Link> : <strong>{campaignName}</strong>;
                            })()}</div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <StatCard title="Opens" value={subscriber?.opensCount ?? subscriber?.opens ?? 0} delta={subscriber?.opensDelta ?? subscriber?.opensDeltaPercent ?? subscriber?.opens_change_percent} icon={Eye} />
            <StatCard title="Clicks" value={subscriber?.clicksCount ?? subscriber?.clicks ?? 0} delta={subscriber?.clicksDelta ?? subscriber?.clicksDeltaPercent ?? subscriber?.clicks_change_percent} icon={MousePointerClick} />
            <StatCard title="Campaigns" value={subscriber?.campaignCount ?? '-'} icon={Users} />

            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Contact</div>
                  <div className="text-xs text-gray-500">ID: {subscriber?._id}</div>
                </div>
                <div className="text-sm text-gray-700">{subscriber?.firstName} {subscriber?.lastName}</div>
                <div className="text-sm text-gray-700">{subscriber?.email}</div>
                {subscriber?.phone && <div className="text-sm text-gray-700">{subscriber.phone}</div>}
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(-1)}>Back</Button>
                  <Link to={`/subscribers/edit/${subscriber?._id || id}`} className="ml-auto"><Button size="sm">Edit</Button></Link>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}

export default SubscriberDetails;
