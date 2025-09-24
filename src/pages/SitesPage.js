// SitesPage.js - Manage landing pages and websites

import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/ui/PageHeader';
import { H2, H3, Body } from '../components/ui/Typography';
import { Plus, Edit, Eye, Trash2, Globe, Link, Calendar, User } from 'lucide-react';
import LandingPageBuilder from '../components/LandingPageBuilder';
import api from '../services/api';

const SitesPage = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingSite, setEditingSite] = useState(null);

  // Fetch landing pages from API
  useEffect(() => {
    const fetchLandingPages = async () => {
      try {
        setLoading(true);
  const response = await api.get('/landing-pages');
        setSites(response.data.landingPages);
        setError(null);
      } catch (err) {
        console.error('Error fetching landing pages:', err);
        setError('Failed to load landing pages');
      } finally {
        setLoading(false);
      }
    };

    fetchLandingPages();
  }, []);

  const handleCreateSite = () => {
    setEditingSite(null);
    setShowBuilder(true);
  };

  const handleEditSite = (siteId) => {
    const site = sites.find(s => s._id === siteId);
    setEditingSite(site);
    setShowBuilder(true);
  };

  const handleViewSite = (site) => {
    // Open site in new tab (using the slug for the URL)
    const siteUrl = `${window.location.origin}/landing/${site.slug}`;
    window.open(siteUrl, '_blank');
  };

  const handleDeleteSite = async (siteId) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      try {
  await api.delete(`/landing-pages/${siteId}`);
        setSites(sites.filter(site => site._id !== siteId));
      } catch (err) {
        console.error('Error deleting landing page:', err);
        alert('Failed to delete landing page');
      }
    }
  };

  const handleSaveSite = async (data) => {
    try {
      if (editingSite) {
        // Update existing landing page
  const response = await api.put(`/landing-pages/${editingSite._id}`, data);
        setSites(sites.map(site => 
          site._id === editingSite._id ? response.data : site
        ));
      } else {
        // Create new landing page
  const response = await api.post('/landing-pages', data);
        setSites([...sites, response.data]);
      }
      setShowBuilder(false);
      setEditingSite(null);
    } catch (err) {
      console.error('Error saving landing page:', err);
      alert('Failed to save landing page');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  return (
    <PageContainer>
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Sites & Landing Pages"
        description="Create and manage your landing pages and websites"
        actions={<button onClick={handleCreateSite} className="inline-flex items-center px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700 transition-colors"><Plus className="w-4 h-4 mr-2" />Create New Site</button>}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Sites List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <H2 className="mb-0">Your Sites</H2>
        </div>
        <div className="divide-y divide-gray-200">
          {sites.map((site) => (
            <div key={site._id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-red bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary-red" />
                  </div>
                  <div>
                    <H3 className="mb-0">{site.name}</H3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center">
                        <Link className="w-4 h-4 mr-1" />
                        <span>{site.slug}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Created {new Date(site.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span>{site.visits} visits</span>
                      </div>
                      {site.formIntegration && (
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Form: {site.formIntegration?.name || 'Integrated'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    site.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {site.status}
                  </span>
                  <button
                    onClick={() => handleViewSite(site)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    title="View site"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditSite(site._id)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    title="Edit site"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSite(site._id)}
                    className="p-2 text-gray-500 hover:text-red-600"
                    title="Delete site"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {sites.length === 0 && !loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <H3 className="mb-1">No sites yet</H3>
          <Body className="text-gray-500 mb-6">Get started by creating your first landing page or website.</Body>
          <button
            onClick={handleCreateSite}
            className="inline-flex items-center px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Site
          </button>
        </div>
      )}

      {/* Landing Page Builder Modal */}
      {showBuilder && (
        <LandingPageBuilder
          isOpen={showBuilder}
          onClose={() => {
            setShowBuilder(false);
            setEditingSite(null);
          }}
          initialDesign={editingSite ? editingSite.design : null}
          initialData={editingSite || {}}
          onSave={handleSaveSite}
        />
      )}
    </div>
    </PageContainer>
  );
};

export default SitesPage;