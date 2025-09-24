// PublicLandingPage.js - Display public landing pages

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // still used for public form submission without auth
import api from '../services/api';

class FormRenderer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
      submitted: false
    };
  }

  handleInputChange = (fieldId, value) => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [fieldId]: value
      }
    }));
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!this.props.form) {
      console.error('No form found');
      return;
    }
    
    try {
      await axios.post(`/api/forms/${this.props.form._id}/submit`, this.state.formData);
      this.setState({ submitted: true });
      
      // Record conversion for the landing page
      if (this.props.landingPageId) {
        try {
          await api.post(`/landing-pages/${this.props.landingPageId}/conversion`);
        } catch (conversionError) {
          console.error('Error recording conversion:', conversionError);
        }
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Failed to submit form. Please try again.');
    }
  };

  renderField = (field) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'date':
      case 'number':
        return (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              id={field.id}
              name={field.id}
              placeholder={field.placeholder}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={this.state.formData[field.id] || ''}
              onChange={(e) => this.handleInputChange(field.id, e.target.value)}
            />
          </div>
        );
      case 'textarea':
        return (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id={field.id}
              name={field.id}
              placeholder={field.placeholder}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={this.state.formData[field.id] || ''}
              onChange={(e) => this.handleInputChange(field.id, e.target.value)}
              rows="4"
            />
          </div>
        );
      case 'checkbox':
        return (
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                id={field.id}
                name={field.id}
                required={field.required}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                checked={!!this.state.formData[field.id]}
                onChange={(e) => this.handleInputChange(field.id, e.target.checked)}
              />
              <span className="ml-2 text-gray-700">{field.label} {field.required && <span className="text-red-500">*</span>}</span>
            </label>
          </div>
        );
      case 'select':
        return (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              id={field.id}
              name={field.id}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={this.state.formData[field.id] || ''}
              onChange={(e) => this.handleInputChange(field.id, e.target.value)}
            >
              <option value="">Select an option</option>
              {(field.options || []).map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  render() {
    if (this.state.submitted) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Thank You!</h2>
          <p className="text-green-600 mb-6">
            Your form has been submitted successfully.
          </p>
          <button
            onClick={() => this.setState({ submitted: false, formData: {} })}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Submit Another Response
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={this.handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">{this.props.form.name}</h3>
        <p className="text-gray-600 mb-4">{this.props.form.description}</p>
        {this.props.form.fields.map(field => (
          <div key={field.id}>
            {this.renderField(field)}
          </div>
        ))}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit
          </button>
        </div>
      </form>
    );
  }
}

const PublicLandingPage = () => {
  const { slug } = useParams();
  const [landingPage, setLandingPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLandingPage = async () => {
      try {
        setLoading(true);
  const response = await api.get(`/landing-pages/public/${slug}`);
        setLandingPage(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching landing page:', err);
        setError('Failed to load landing page');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchLandingPage();
    }
  }, [slug]);

  // Set SEO metadata
  useEffect(() => {
    if (landingPage) {
      document.title = landingPage.seo?.title || landingPage.name;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.content = landingPage.seo?.description || '';
      } else {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        metaDescription.content = landingPage.seo?.description || '';
        document.head.appendChild(metaDescription);
      }
    }
  }, [landingPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!landingPage) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Page Not Found</h2>
          <p className="text-gray-600">The requested landing page could not be found.</p>
        </div>
      </div>
    );
  }

  // If there's a form integration, we need to inject it into the HTML
  const renderLandingPageWithForm = () => {
    if (landingPage.htmlContent && landingPage.formIntegration) {
      // We'll look for a placeholder in the HTML where the form should be inserted
      // This is a simplified approach - in a real implementation, you might use a more robust method
      const formPlaceholder = '<!-- FORM_PLACEHOLDER -->';
      
      if (landingPage.htmlContent.includes(formPlaceholder)) {
        // Split the HTML at the placeholder
        const parts = landingPage.htmlContent.split(formPlaceholder);
        
        return (
          <div>
            <div dangerouslySetInnerHTML={{ __html: parts[0] }} />
            <div className="max-w-2xl mx-auto my-8">
              <FormRenderer form={landingPage.formIntegration} landingPageId={landingPage._id} />
            </div>
            <div dangerouslySetInnerHTML={{ __html: parts[1] }} />
          </div>
        );
      }
    }
    
    // If no form placeholder or no form integration, render as is
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: landingPage.htmlContent }} 
      />
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {landingPage.htmlContent ? (
        renderLandingPageWithForm()
      ) : (
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-center mb-8">{landingPage.name}</h1>
          <p className="text-center text-gray-600">This landing page is under construction.</p>
        </div>
      )}
    </div>
  );
};

export default PublicLandingPage;