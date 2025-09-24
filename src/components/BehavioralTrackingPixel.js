// emailxp/frontend/src/components/BehavioralTrackingPixel.js

import React, { useEffect } from 'react';
import behavioralTriggerService from '../services/behavioralTriggerService';

const BehavioralTrackingPixel = ({ 
  userId, 
  subscriberId, 
  eventType, 
  customEventType, 
  target, 
  data,
  sessionId 
}) => {
  useEffect(() => {
    if (userId && subscriberId && eventType) {
      // Track the behavioral event
      const trackEvent = async () => {
        try {
          await behavioralTriggerService.trackEvent({
            userId,
            subscriberId,
            eventType,
            customEventType,
            target,
            data,
            sessionId
          });
        } catch (error) {
          console.error('Failed to track behavioral event:', error);
        }
      };
      
      trackEvent();
    }
  }, [userId, subscriberId, eventType, customEventType, target, data, sessionId]);
  
  // This component doesn't render anything visible
  return null;
};

export default BehavioralTrackingPixel;