import React from 'react';
import { CheckCircle, XCircle, Clock, Send, Edit, AlertTriangle, Pause, UserCheck, UserX } from 'lucide-react';

const MAP = {
  // Campaign lifecycle
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Edit },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Clock },
  sending: { label: 'Sending', color: 'bg-yellow-100 text-yellow-800', icon: Send },
  sent: { label: 'Sent', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-200 text-gray-700', icon: XCircle },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: XCircle },
  paused: { label: 'Paused', color: 'bg-orange-100 text-orange-800', icon: Pause },
  warning: { label: 'Warning', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  // Subscriber statuses
  subscribed: { label: 'Subscribed', color: 'bg-green-100 text-green-800', icon: UserCheck },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  unsubscribed: { label: 'Unsubscribed', color: 'bg-gray-100 text-gray-700', icon: UserX },
  bounced: { label: 'Bounced', color: 'bg-red-100 text-red-800', icon: XCircle },
  complained: { label: 'Complained', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle }
};

export function StatusBadge({ status, className = '' }) {
  const cfg = MAP[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color} ${className}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {cfg.label}
    </span>
  );
}

export default StatusBadge;
