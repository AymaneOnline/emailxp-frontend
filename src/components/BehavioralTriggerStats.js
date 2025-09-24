// emailxp/frontend/src/components/BehavioralTriggerStats.js

import React, { useState, useEffect } from 'react';
import { Target, Play, Pause, BarChart } from 'lucide-react';
import behavioralTriggerService from '../services/behavioralTriggerService';

const BehavioralTriggerStats = () => {
  const [stats, setStats] = useState({
    totalTriggers: 0,
    activeTriggers: 0,
    totalFired: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await behavioralTriggerService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load behavioral trigger stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Target className="w-5 h-5 mr-2 text-indigo-500" />
          Behavioral Triggers
        </h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg mx-auto mb-2">
            <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTriggers}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg mx-auto mb-2">
            <Play className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeTriggers}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg mx-auto mb-2">
            <BarChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalFired}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Sent</p>
        </div>
      </div>
    </div>
  );
};

export default BehavioralTriggerStats;