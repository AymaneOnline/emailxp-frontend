import {
  Mail,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Target
} from 'lucide-react';

  const stats = [
    {
      name: 'Total Campaigns',
      stat: dashboardStats?.totalCampaigns || 0,
      icon: Mail,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Subscribers',
      stat: dashboardStats?.totalActiveSubscribers || 0,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Emails Sent',
      stat: dashboardStats?.emailsSent || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      name: 'Pending Campaigns',
      stat: dashboardStats?.pendingCampaigns || 0,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      name: 'Behavioral Triggers',
      stat: triggerStats?.activeTriggers || 0,
      icon: Target,
      color: 'bg-indigo-500',
    },
  ];