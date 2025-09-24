// emailxp/frontend/src/components/PersonalizedContentPreview.js

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { 
  User, 
  Eye, 
  Zap,
  Star,
  TrendingUp
} from 'lucide-react';

/**
 * Personalized Content Preview Component
 * Shows how content will be personalized for different subscriber segments
 */
function PersonalizedContentPreview({ campaignId, subscribers }) {
  const [personalizedPreviews, setPersonalizedPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);

  // For demo purposes, we'll use mock data
  // In a real implementation, this would fetch actual personalized content
  useEffect(() => {
    generatePersonalizedPreviews();
  }, [campaignId, subscribers, selectedSubscriber, generatePersonalizedPreviews]);

  const generatePersonalizedPreviews = async () => {
    if (!campaignId || !subscribers || subscribers.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would call an API to get personalized previews
      // For now, we'll generate mock data
      const mockPreviews = subscribers.slice(0, 3).map((subscriber, index) => ({
        id: subscriber._id,
        name: `${subscriber.firstName || subscriber.name || 'Subscriber'} ${subscriber.lastName || ''}`.trim() || 'Unnamed Subscriber',
        email: subscriber.email,
        preview: generateMockPreview(subscriber),
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        engagementLevel: ['high', 'medium', 'low'][index % 3]
      }));
      
      setPersonalizedPreviews(mockPreviews);
      
      // Select the first subscriber by default
      if (mockPreviews.length > 0 && !selectedSubscriber) {
        setSelectedSubscriber(mockPreviews[0]);
      }
    } catch (err) {
      console.error('Failed to generate personalized previews:', err);
      setError('Failed to generate previews');
    } finally {
      setLoading(false);
    }
  };

  const generateMockPreview = (subscriber) => {
    // This would be replaced with actual personalized content generation
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">
          Hello ${subscriber.firstName || subscriber.name || 'there'}!
        </h1>
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          We've curated some special content just for you based on your interests.
        </p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; font-size: 20px; margin-bottom: 15px;">Recommended for You</h2>
          <p style="color: #666; font-size: 14px; line-height: 1.5;">
            Based on your recent activity, we think you'll love these articles:
          </p>
          <ul style="color: #666; font-size: 14px; line-height: 1.5; padding-left: 20px; margin: 15px 0;">
            <li>5 Tips for Better Email Engagement</li>
            <li>How to Personalize Your Marketing Campaigns</li>
            <li>Latest Industry Trends You Should Know</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://example.com/explore" 
             style="background: #e63946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Explore Recommendations
          </a>
        </div>
      </div>
    `;
  };

  const getEngagementColor = (level) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red"></div>
        <span className="ml-2">Generating personalized previews...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="mr-2" />
            Personalized Content Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="mr-2" />
          Personalized Content Preview
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {personalizedPreviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">No personalized previews available</p>
            <p className="text-sm">Select subscribers to see how content will be personalized</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Subscriber Selection */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Preview for Subscriber
              </h4>
              <div className="flex flex-wrap gap-2">
                {personalizedPreviews.map((preview) => (
                  <Button
                    key={preview.id}
                    variant={selectedSubscriber?.id === preview.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSubscriber(preview)}
                    className="flex items-center"
                  >
                    <User className="w-4 h-4 mr-1" />
                    {preview.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Preview Content */}
            {selectedSubscriber && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{selectedSubscriber.name}</div>
                      <div className="text-sm text-gray-600">{selectedSubscriber.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getEngagementColor(selectedSubscriber.engagementLevel)}>
                      {selectedSubscriber.engagementLevel} engagement
                    </Badge>
                    <Badge variant="secondary">
                      <Star className="w-3 h-3 mr-1" />
                      {selectedSubscriber.score}% match
                    </Badge>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-gray-900">Personalized Preview</h5>
                    <div className="flex items-center text-sm text-gray-500">
                      <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                      AI-Personalized
                    </div>
                  </div>
                  
                  <div 
                    className="bg-white border rounded p-4 min-h-[200px]"
                    dangerouslySetInnerHTML={{ __html: selectedSubscriber.preview }}
                  />
                </div>
                
                {/* Personalization Insights */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Personalization Insights
                    </h4>
                  </div>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Content personalized based on subscriber interests</li>
                    <li>• Dynamic blocks adjusted for {selectedSubscriber.name.split(' ')[0]}'s preferences</li>
                    <li>• Recommendations based on engagement history</li>
                    <li>• Subject line optimized for {selectedSubscriber.name.split(' ')[0]}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PersonalizedContentPreview;