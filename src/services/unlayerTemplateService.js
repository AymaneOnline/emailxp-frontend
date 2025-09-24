// emailxp/frontend/src/services/unlayerTemplateService.js

import axios from 'axios';

const base = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
const UNLAYER_TEMPLATES_API = base ? `${base}/api/unlayer-templates` : '/api/unlayer-templates';
// Create axios instance with default config and auth
const unlayerAPI = axios.create({ baseURL: UNLAYER_TEMPLATES_API });

unlayerAPI.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user && user.token ? user.token : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fallback templates for when API is not available or configured
const FALLBACK_TEMPLATES = [
  {
    id: 'welcome-email',
    name: 'Welcome Email',
    description: 'A clean welcome email template perfect for onboarding new users',
    category: 'welcome',
    thumbnail: 'https://picsum.photos/600/400?random=1',
    design: {
      "counters": {
        "u_column": 4,
        "u_row": 4,
        "u_content_text": 2,
        "u_content_image": 2,
        "u_content_button": 1
      },
      "body": {
        "id": "fpHuT58wqj",
        "rows": [
          {
            "id": "Z_3cNIB5cG",
            "cells": [1],
            "columns": [
              {
                "id": "nkLnXE1MDV",
                "contents": [
                  {
                    "id": "Y1RrEq8TnU",
                    "type": "image",
                    "values": {
                      "containerPadding": "20px",
                      "anchor": "",
                      "src": {
                        "url": "https://assets.unlayer.com/projects/86916/1564926072775-welcome.png",
                        "width": 570,
                        "height": 130
                      },
                      "textAlign": "center",
                      "altText": "Welcome"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "QD5IlkS5Nv",
            "cells": [1],
            "columns": [
              {
                "id": "lcxDznNhT7",
                "contents": [
                  {
                    "id": "9HwTVVd8qM",
                    "type": "text",
                    "values": {
                      "containerPadding": "20px",
                      "anchor": "",
                      "fontSize": "24px",
                      "color": "#3AAEE0",
                      "textAlign": "center",
                      "lineHeight": "140%",
                      "linkStyle": {
                        "inherit": true,
                        "linkColor": "#0000ee",
                        "linkHoverColor": "#0000ee",
                        "linkUnderline": true,
                        "linkHoverUnderline": true
                      },
                      "text": "<p style=\"font-size: 14px; line-height: 140%;\"><span style=\"font-size: 24px; line-height: 33.6px;\"><strong><span style=\"line-height: 33.6px; font-size: 24px;\">Welcome to our community!</span></strong></span></p>"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "XJhR_d6sZp",
            "cells": [1],
            "columns": [
              {
                "id": "8-Bj8VmZKV",
                "contents": [
                  {
                    "id": "ezq9vB59iK",
                    "type": "text",
                    "values": {
                      "containerPadding": "20px",
                      "anchor": "",
                      "color": "#000000",
                      "textAlign": "left",
                      "lineHeight": "140%",
                      "linkStyle": {
                        "inherit": true,
                        "linkColor": "#0000ee",
                        "linkHoverColor": "#0000ee",
                        "linkUnderline": true,
                        "linkHoverUnderline": true
                      },
                      "text": "<p style=\"font-size: 14px; line-height: 140%;\">Hello {{firstName}},</p><p style=\"font-size: 14px; line-height: 140%;\"> </p><p style=\"font-size: 14px; line-height: 140%;\">Welcome to our platform! We're excited to have you on board and can't wait to help you get started.</p><p style=\"font-size: 14px; line-height: 140%;\"> </p><p style=\"font-size: 14px; line-height: 140%;\">To get you started, here are a few things you can do:</p>"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "8xGOhpGOhp",
            "cells": [1],
            "columns": [
              {
                "id": "5FsYMnGOhp",
                "contents": [
                  {
                    "id": "ButtonGOhp",
                    "type": "button",
                    "values": {
                      "containerPadding": "20px",
                      "anchor": "",
                      "href": {
                        "name": "web",
                        "values": {
                          "href": "{{unsubscribeUrl}}",
                          "target": "_blank"
                        }
                      },
                      "buttonColors": {
                        "color": "#FFFFFF",
                        "backgroundColor": "#3AAEE0",
                        "hoverColor": "#FFFFFF",
                        "hoverBackgroundColor": "#3AAEE0"
                      },
                      "size": {
                        "autoWidth": true,
                        "width": "100%"
                      },
                      "fontSize": "14px",
                      "textAlign": "center",
                      "lineHeight": "120%",
                      "padding": "10px 20px",
                      "border": {},
                      "borderRadius": "4px",
                      "text": "<p style=\"font-size: 14px; line-height: 16.8px;\"><strong>Get Started</strong></p>"
                    }
                  }
                ]
              }
            ]
          }
        ],
        "headers": [],
        "footers": [],
        "values": {
          "popupPosition": "center",
          "popupWidth": "600px",
          "popupHeight": "auto",
          "borderRadius": "0px",
          "contentAlign": "center",
          "contentVerticalAlign": "center",
          "contentWidth": "600px",
          "fontFamily": {
            "label": "Arial",
            "value": "arial,helvetica,sans-serif"
          },
          "textColor": "#000000",
          "backgroundColor": "#e7e7e7",
          "backgroundImage": {
            "url": "",
            "fullWidth": true,
            "repeat": false,
            "center": true,
            "cover": false
          },
          "linkStyle": {
            "body": true,
            "linkColor": "#0000ee",
            "linkHoverColor": "#0000ee",
            "linkUnderline": true,
            "linkHoverUnderline": true
          }
        }
      },
      "schemaVersion": 16
    }
  },
  {
    id: 'newsletter',
    name: 'Newsletter Template',
    description: 'Professional newsletter template for regular updates and announcements',
    category: 'newsletter',
    thumbnail: 'https://picsum.photos/600/400?random=2',
    design: {
      "counters": {
        "u_column": 6,
        "u_row": 6,
        "u_content_text": 4,
        "u_content_image": 3,
        "u_content_button": 2
      },
      "body": {
        "id": "newsletter_body",
        "rows": [
          {
            "id": "header_row",
            "cells": [1],
            "columns": [
              {
                "id": "header_column",
                "contents": [
                  {
                    "id": "logo_image",
                    "type": "image",
                    "values": {
                      "containerPadding": "20px",
                      "src": {
                        "url": "https://assets.unlayer.com/projects/86916/1564926072775-logo.png",
                        "width": 200,
                        "height": 60
                      },
                      "textAlign": "center",
                      "altText": "Newsletter Logo"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "title_row",
            "cells": [1],
            "columns": [
              {
                "id": "title_column",
                "contents": [
                  {
                    "id": "newsletter_title",
                    "type": "text",
                    "values": {
                      "containerPadding": "20px",
                      "fontSize": "28px",
                      "color": "#333333",
                      "textAlign": "center",
                      "lineHeight": "140%",
                      "text": "<p style=\"font-size: 14px; line-height: 140%;\"><span style=\"font-size: 28px; line-height: 39.2px;\"><strong>Weekly Newsletter</strong></span></p>"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "content_row",
            "cells": [2],
            "columns": [
              {
                "id": "main_content",
                "contents": [
                  {
                    "id": "main_article",
                    "type": "text",
                    "values": {
                      "containerPadding": "20px",
                      "text": "<h2>Featured Article</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>"
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "",
                  "padding": "0px",
                  "border": {},
                  "_meta": {
                    "htmlID": "u_column_2",
                    "htmlClassNames": "u_column"
                  }
                }
              },
              {
                "id": "sidebar_content",
                "contents": [
                  {
                    "id": "sidebar_image",
                    "type": "image",
                    "values": {
                      "containerPadding": "20px",
                      "src": {
                        "url": "https://assets.unlayer.com/projects/86916/1564926174654-news.jpg",
                        "width": 250,
                        "height": 150
                      },
                      "textAlign": "center",
                      "altText": "News Image"
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "",
                  "padding": "0px",
                  "border": {},
                  "_meta": {
                    "htmlID": "u_column_3",
                    "htmlClassNames": "u_column"
                  }
                }
              }
            ]
          }
        ],
        "values": {
          "contentWidth": "600px",
          "fontFamily": {
            "label": "Arial",
            "value": "arial,helvetica,sans-serif"
          },
          "textColor": "#000000",
          "backgroundColor": "#ffffff"
        }
      },
      "schemaVersion": 16
    }
  },
  {
    id: 'promotional',
    name: 'Promotional Campaign',
    description: 'Eye-catching promotional template perfect for sales and marketing campaigns',
    category: 'promotional',
    thumbnail: 'https://picsum.photos/600/400?random=3',
    design: {
      "counters": {
        "u_column": 5,
        "u_row": 5,
        "u_content_text": 3,
        "u_content_image": 2,
        "u_content_button": 3
      },
      "body": {
        "id": "promo_body",
        "rows": [
          {
            "id": "promo_header",
            "cells": [1],
            "columns": [
              {
                "id": "promo_header_col",
                "contents": [
                  {
                    "id": "promo_banner",
                    "type": "image",
                    "values": {
                      "containerPadding": "0px",
                      "src": {
                        "url": "https://assets.unlayer.com/projects/86916/1564926174654-sale-banner.jpg",
                        "width": 600,
                        "height": 200
                      },
                      "textAlign": "center",
                      "altText": "Sale Banner"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "promo_title",
            "cells": [1],
            "columns": [
              {
                "id": "promo_title_col",
                "contents": [
                  {
                    "id": "sale_title",
                    "type": "text",
                    "values": {
                      "containerPadding": "30px 20px 20px",
                      "fontSize": "32px",
                      "color": "#e74c3c",
                      "textAlign": "center",
                      "lineHeight": "140%",
                      "text": "<p style=\"text-align: center;\"><span style=\"font-size: 32px; color: #e74c3c;\"><strong>MEGA SALE</strong></span></p><p style=\"text-align: center;\"><span style=\"font-size: 24px; color: #333;\">Up to 50% Off</span></p>"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "promo_content",
            "cells": [1],
            "columns": [
              {
                "id": "promo_content_col",
                "contents": [
                  {
                    "id": "promo_text",
                    "type": "text",
                    "values": {
                      "containerPadding": "20px",
                      "text": "<p style=\"text-align: center; font-size: 16px; line-height: 140%;\">Don't miss out on our biggest sale of the year! Get incredible discounts on all your favorite products.</p>"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "promo_cta",
            "cells": [1],
            "columns": [
              {
                "id": "promo_cta_col",
                "contents": [
                  {
                    "id": "shop_now_btn",
                    "type": "button",
                    "values": {
                      "containerPadding": "20px",
                      "href": {
                        "name": "web",
                        "values": {
                          "href": "#",
                          "target": "_blank"
                        }
                      },
                      "buttonColors": {
                        "color": "#FFFFFF",
                        "backgroundColor": "#e74c3c",
                        "hoverColor": "#FFFFFF",
                        "hoverBackgroundColor": "#c0392b"
                      },
                      "size": {
                        "autoWidth": true,
                        "width": "200px"
                      },
                      "fontSize": "16px",
                      "textAlign": "center",
                      "lineHeight": "120%",
                      "padding": "15px 30px",
                      "borderRadius": "25px",
                      "text": "<p style=\"font-size: 16px;\"><strong>SHOP NOW</strong></p>"
                    }
                  }
                ]
              }
            ]
          }
        ],
        "values": {
          "contentWidth": "600px",
          "fontFamily": {
            "label": "Arial",
            "value": "arial,helvetica,sans-serif"
          },
          "textColor": "#000000",
          "backgroundColor": "#f8f9fa"
        }
      },
      "schemaVersion": 16
    }
  },
  {
    id: 'transactional',
    name: 'Order Confirmation',
    description: 'Clean transactional email template for order confirmations and receipts',
    category: 'transactional',
    thumbnail: 'https://picsum.photos/600/400?random=4',
    design: {
      "counters": {
        "u_column": 4,
        "u_row": 6,
        "u_content_text": 5,
        "u_content_button": 1
      },
      "body": {
        "id": "transaction_body",
        "rows": [
          {
            "id": "trans_header",
            "cells": [1],
            "columns": [
              {
                "id": "trans_header_col",
                "contents": [
                  {
                    "id": "order_title",
                    "type": "text",
                    "values": {
                      "containerPadding": "30px 20px 20px",
                      "fontSize": "24px",
                      "color": "#333333",
                      "textAlign": "center",
                      "text": "<h1 style=\"font-size: 24px; text-align: center;\">Order Confirmation</h1>"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "trans_content",
            "cells": [1],
            "columns": [
              {
                "id": "trans_content_col",
                "contents": [
                  {
                    "id": "order_details",
                    "type": "text",
                    "values": {
                      "containerPadding": "20px",
                      "text": "<p>Hi {{firstName}},</p><p>Thank you for your order! Your order #{{orderNumber}} has been confirmed and will be processed shortly.</p><h3>Order Details:</h3><table style=\"width: 100%; border-collapse: collapse;\"><tr><td style=\"border-bottom: 1px solid #ddd; padding: 10px;\"><strong>Item</strong></td><td style=\"border-bottom: 1px solid #ddd; padding: 10px;\"><strong>Quantity</strong></td><td style=\"border-bottom: 1px solid #ddd; padding: 10px;\"><strong>Price</strong></td></tr><tr><td style=\"border-bottom: 1px solid #ddd; padding: 10px;\">Sample Product</td><td style=\"border-bottom: 1px solid #ddd; padding: 10px;\">1</td><td style=\"border-bottom: 1px solid #ddd; padding: 10px;\">$29.99</td></tr></table>"
                    }
                  }
                ]
              }
            ]
          }
        ],
        "values": {
          "contentWidth": "600px",
          "fontFamily": {
            "label": "Arial",
            "value": "arial,helvetica,sans-serif"
          },
          "textColor": "#333333",
          "backgroundColor": "#ffffff"
        }
      },
      "schemaVersion": 16
    }
  },
  {
    id: 'announcement',
    name: 'Product Launch',
    description: 'Modern announcement template perfect for product launches and company updates',
    category: 'announcement',
    thumbnail: 'https://picsum.photos/600/400?random=5',
    design: {
      "counters": {
        "u_column": 4,
        "u_row": 5,
        "u_content_text": 3,
        "u_content_image": 1,
        "u_content_button": 2
      },
      "body": {
        "id": "announcement_body",
        "rows": [
          {
            "id": "announce_header",
            "cells": [1],
            "columns": [
              {
                "id": "announce_header_col",
                "contents": [
                  {
                    "id": "product_image",
                    "type": "image",
                    "values": {
                      "containerPadding": "20px",
                      "src": {
                        "url": "https://assets.unlayer.com/projects/86916/1564926174654-product-launch.jpg",
                        "width": 500,
                        "height": 250
                      },
                      "textAlign": "center",
                      "altText": "New Product"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "announce_title",
            "cells": [1],
            "columns": [
              {
                "id": "announce_title_col",
                "contents": [
                  {
                    "id": "launch_title",
                    "type": "text",
                    "values": {
                      "containerPadding": "20px",
                      "fontSize": "28px",
                      "color": "#2c3e50",
                      "textAlign": "center",
                      "text": "<h1 style=\"font-size: 28px; text-align: center; color: #2c3e50;\">Introducing Our Latest Innovation</h1>"
                    }
                  }
                ]
              }
            ]
          },
          {
            "id": "announce_content",
            "cells": [1],
            "columns": [
              {
                "id": "announce_content_col",
                "contents": [
                  {
                    "id": "launch_description",
                    "type": "text",
                    "values": {
                      "containerPadding": "20px",
                      "text": "<p style=\"font-size: 16px; line-height: 140%;\">We're excited to announce the launch of our newest product that will revolutionize the way you work. Built with cutting-edge technology and designed with you in mind.</p>"
                    }
                  }
                ]
              }
            ]
          }
        ],
        "values": {
          "contentWidth": "600px",
          "fontFamily": {
            "label": "Arial",
            "value": "arial,helvetica,sans-serif"
          },
          "textColor": "#333333",
          "backgroundColor": "#f4f4f4"
        }
      },
      "schemaVersion": 16
    }
  }
];

const TEMPLATE_CATEGORIES = [
  { value: '', label: 'All Templates', description: 'Browse all available templates' },
  { value: 'welcome', label: 'Welcome', description: 'Onboarding and welcome emails' },
  { value: 'newsletter', label: 'Newsletter', description: 'Regular updates and newsletters' },
  { value: 'promotional', label: 'Promotional', description: 'Sales and marketing campaigns' },
  { value: 'transactional', label: 'Transactional', description: 'Order confirmations and receipts' },
  { value: 'announcement', label: 'Announcement', description: 'Product launches and company updates' }
];

const unlayerTemplateService = {
  // Check if Unlayer API is configured and working
  checkApiHealth: async () => {
    try {
      const response = await unlayerAPI.get('/health/check');
      return response.data;
    } catch (error) {
      console.warn('Unlayer API health check failed:', error.message);
      return { configured: false, working: false };
    }
  },

  // Get all Unlayer templates (with fallback)
  getTemplates: async (params = {}) => {
    try {
      // First check if API is working
      const health = await unlayerTemplateService.checkApiHealth();
      
      if (health.working) {
        // Use real Unlayer API
        const response = await unlayerAPI.get('/', { params });
        return {
          templates: response.data.templates || [],
          total: response.data.total || 0,
          hasMore: response.data.hasMore || false
        };
      } else {
        // Fall back to mock templates
        console.warn('Using fallback templates - Unlayer API not available');
        return unlayerTemplateService.getFallbackTemplates(params);
      }
    } catch (error) {
      console.error('Error fetching templates from API, using fallback:', error);
      return unlayerTemplateService.getFallbackTemplates(params);
    }
  },

  // Fallback method using mock templates
  getFallbackTemplates: async (params = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredTemplates = [...FALLBACK_TEMPLATES];
    
    // Filter by category
    if (params.category) {
      filteredTemplates = filteredTemplates.filter(template => 
        template.category === params.category
      );
    }
    
    // Filter by search term
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(template =>
        template.name.toLowerCase().includes(searchTerm) ||
        template.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply limit and skip
    const limit = parseInt(params.limit) || 50;
    const skip = parseInt(params.offset) || 0;
    const paginatedTemplates = filteredTemplates.slice(skip, skip + limit);
    
    return {
      templates: paginatedTemplates,
      total: filteredTemplates.length,
      hasMore: (skip + paginatedTemplates.length) < filteredTemplates.length
    };
  },

  // Get template categories
  getCategories: async () => {
    try {
      const health = await unlayerTemplateService.checkApiHealth();
      
      if (health.working) {
        // Use real Unlayer API
        const response = await unlayerAPI.get('/meta/categories');
        return response.data;
      } else {
        // Fall back to default categories
        return TEMPLATE_CATEGORIES;
      }
    } catch (error) {
      console.error('Error fetching categories from API, using fallback:', error);
      return TEMPLATE_CATEGORIES;
    }
  },

  // Get template by ID
  getTemplateById: async (id) => {
    try {
      const health = await unlayerTemplateService.checkApiHealth();
      
      if (health.working) {
        // Use real Unlayer API
        const response = await unlayerAPI.get(`/${id}`);
        return response.data;
      } else {
        // Fall back to mock templates
        const template = FALLBACK_TEMPLATES.find(t => t.id === id);
        if (!template) {
          throw new Error('Template not found');
        }
        
        return {
          ...template,
          createdAt: new Date(Date.now() - Math.random() * 86400000 * 30),
          updatedAt: new Date(Date.now() - Math.random() * 86400000 * 7),
          stats: {
            timesUsed: Math.floor(Math.random() * 1000) + 50,
            lastUsed: new Date(Date.now() - Math.random() * 86400000 * 3)
          },
          type: 'unlayer',
          isActive: true,
          tags: [template.category, 'professional', 'responsive']
        };
      }
    } catch (error) {
      console.error('Error fetching template by ID from API:', error);
      
      // Fall back to mock templates
      const template = FALLBACK_TEMPLATES.find(t => t.id === id);
      if (!template) {
        throw new Error('Template not found');
      }
      
      return {
        ...template,
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 30),
        updatedAt: new Date(Date.now() - Math.random() * 86400000 * 7),
        stats: {
          timesUsed: Math.floor(Math.random() * 1000) + 50,
          lastUsed: new Date(Date.now() - Math.random() * 86400000 * 3)
        },
        type: 'unlayer',
        isActive: true,
        tags: [template.category, 'professional', 'responsive']
      };
    }
  },

  // Use template with enhanced export functionality
  useTemplate: async (id) => {
    try {
      const health = await unlayerTemplateService.checkApiHealth();
      
      if (health.working) {
        // First get the template
        const template = await unlayerTemplateService.getTemplateById(id);
        
        if (!template) {
          throw new Error('Template not found');
        }

        // Multi-tier export strategy
        let htmlContent = '';
        let exportSuccess = false;

        // Strategy 1: Try direct design export (most reliable)
        if (template.design && !exportSuccess) {
          try {
            console.log('Attempting design export for template:', id);
            const designResponse = await unlayerAPI.post('/export/design', {
              design: template.design,
              displayMode: 'email'
            });
            
            htmlContent = designResponse.data.html || designResponse.data.data?.html || '';
            if (htmlContent) {
              console.log('Design export successful');
              exportSuccess = true;
            }
          } catch (designExportError) {
            console.warn('Design export failed:', designExportError.message);
            if (designExportError.response) {
              console.warn('Design export error details:', designExportError.response.data);
            }
          }
        }

        // Strategy 2: Try template ID export (if design export failed)
        if (!exportSuccess) {
          try {
            console.log('Attempting template ID export for template:', id);
            const response = await unlayerAPI.post(`/${id}/export`, {
              displayMode: 'email'
            });
            
            htmlContent = response.data.html || response.data.data?.html || '';
            if (htmlContent) {
              console.log('Template ID export successful');
              exportSuccess = true;
            }
          } catch (exportError) {
            console.warn('Template ID export failed:', exportError.message);
            if (exportError.response) {
              console.warn('Template export error details:', exportError.response.data);
            }
          }
        }

        // Strategy 3: Generate comprehensive HTML from design (fallback)
        if (!exportSuccess || !htmlContent) {
          console.log('Using comprehensive HTML generation fallback');
          htmlContent = unlayerTemplateService.generateComprehensiveHtml(template.design);
        }
        
        return {
          message: 'Template ready to use',
          template: {
            _id: template.id,
            name: template.name,
            emailDesign: template.design,
            htmlContent: htmlContent,
            category: template.category,
            description: template.description
          }
        };
      } else {
        // Fall back to mock functionality
        const template = await unlayerTemplateService.getTemplateById(id);
        
        return {
          message: 'Template ready to use',
          template: {
            _id: template.id,
            name: template.name,
            emailDesign: template.design,
            htmlContent: unlayerTemplateService.generateComprehensiveHtml(template.design),
            category: template.category,
            description: template.description
          }
        };
      }
    } catch (error) {
      console.error('Error using template:', error);
      throw new Error(`Failed to use template: ${error.message}`);
    }
  },

  // Get popular templates
  getPopular: async (limit = 10) => {
    try {
      const health = await unlayerTemplateService.checkApiHealth();
      
      if (health.working) {
        // Use real Unlayer API with popular sorting
        const response = await unlayerAPI.get('/', {
          params: { 
            limit,
            sort: 'popular' // If supported by Unlayer API
          }
        });
        return response.data.templates || [];
      } else {
        // Fall back to mock templates
        const templatesWithStats = FALLBACK_TEMPLATES.map(template => ({
          ...template,
          stats: {
            timesUsed: Math.floor(Math.random() * 1000) + 100,
            lastUsed: new Date()
          }
        }));
        
        return templatesWithStats
          .sort((a, b) => b.stats.timesUsed - a.stats.timesUsed)
          .slice(0, limit);
      }
    } catch (error) {
      console.error('Error fetching popular templates:', error);
      
      // Fall back to mock templates
      const templatesWithStats = FALLBACK_TEMPLATES.map(template => ({
        ...template,
        stats: {
          timesUsed: Math.floor(Math.random() * 1000) + 100,
          lastUsed: new Date()
        }
      }));
      
      return templatesWithStats
        .sort((a, b) => b.stats.timesUsed - a.stats.timesUsed)
        .slice(0, limit);
    }
  },

  // Generate template thumbnail
  generateTemplateThumbnail: async (id) => {
    try {
      const health = await unlayerTemplateService.checkApiHealth();
      
      if (health.working) {
        // Use real Unlayer API to generate thumbnail
        const response = await unlayerAPI.post(`/${id}/thumbnail`, {
          fullPage: false // Generate a thumbnail, not full page
        });
        
        // Return the URL from the response
        return response.data.url || response.data.data?.url;
      } else {
        // Return null to use fallback preview generation
        return null;
      }
    } catch (error) {
      console.error('Error generating template thumbnail:', error);
      // Return null to use fallback preview generation
      return null;
    }
  },

  // Enhanced preview HTML generation for better element support
  generatePreviewHtml: (design) => {
    if (!design || !design.body) {
      return '<div style="padding: 20px; text-align: center; color: #999;">No preview available</div>';
    }

    const body = design.body;
    const bodyValues = body.values || {};
    const backgroundColor = bodyValues.backgroundColor || '#e7e7e7';
    const contentWidth = bodyValues.contentWidth || '600px';
    const fontFamily = bodyValues.fontFamily?.value || bodyValues.fontFamily || 'arial,helvetica,sans-serif';
    const textColor = bodyValues.textColor || '#000000';
    const linkColor = bodyValues.linkStyle?.linkColor || '#0000ee';

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Preview</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            background-color: ${backgroundColor}; 
            font-family: ${fontFamily}; 
            color: ${textColor}; 
            line-height: 1.6;
          }
          .email-container { 
            max-width: ${contentWidth}; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 8px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
          }
          .content-row { 
            display: table; 
            width: 100%; 
            table-layout: fixed;
          }
          .content-column { 
            display: table-cell; 
            vertical-align: top;
          }
          .content-block { 
            padding: 20px; 
          }
          img { 
            max-width: 100%; 
            height: auto; 
            display: block;
          }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 4px; 
            font-weight: bold;
            text-align: center;
          }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          a { color: ${linkColor}; }
          .social-icon {
            display: inline-block;
            width: 32px;
            height: 32px;
            margin: 0 5px;
            background-color: #333;
            border-radius: 50%;
            text-align: center;
            line-height: 32px;
            color: white;
            text-decoration: none;
            font-size: 16px;
          }
          .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 20px 0;
          }
          .video-placeholder {
            background: #f0f0f0;
            border: 2px dashed #ccc;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            color: #666;
          }
          .icon-placeholder {
            display: inline-block;
            width: 24px;
            height: 24px;
            background: #ddd;
            border-radius: 50%;
            text-align: center;
            line-height: 24px;
            margin: 0 5px;
          }
          @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; }
            .content-block { padding: 15px !important; }
            .content-column { display: block !important; width: 100% !important; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
    `;

    // Process rows with enhanced element support
    if (body.rows && Array.isArray(body.rows)) {
      body.rows.forEach((row, rowIndex) => {
        const rowStyle = row.values ? `background-color: ${row.values.backgroundColor || 'transparent'};` : '';
        
        if (row.columns && row.columns.length > 1) {
          // Multi-column row
          html += `<div class="content-row" style="${rowStyle}">`;
          
          row.columns.forEach((column, colIndex) => {
            const columnWidth = 100 / row.columns.length;
            html += `<div class="content-column" style="width: ${columnWidth}%;">`;
            
            if (column.contents && Array.isArray(column.contents)) {
              column.contents.forEach((content, contentIndex) => {
                html += renderEnhancedContent(content);
              });
            }
            
            html += '</div>';
          });
          
          html += '</div>';
        } else {
          // Single column row
          html += `<div class="content-block" style="${rowStyle}">`;
          
          if (row.columns && row.columns[0] && row.columns[0].contents) {
            row.columns[0].contents.forEach((content, contentIndex) => {
              html += renderEnhancedContent(content);
            });
          }
          
          html += '</div>';
        }
      });
    }

    html += `
        </div>
      </body>
      </html>
    `;

    return html;

    function renderEnhancedContent(content) {
      const values = content.values || {};
      const containerPadding = values.containerPadding || '0px';
      const textAlign = values.textAlign || 'left';
      const fontSize = values.fontSize || 'inherit';
      const color = values.color || 'inherit';
      const lineHeight = values.lineHeight || 'inherit';
      
      switch (content.type) {
        case 'text':
          return `<div style="padding: ${containerPadding}; text-align: ${textAlign}; font-size: ${fontSize}; color: ${color}; line-height: ${lineHeight};">${values.text || ''}</div>`;
        
        case 'image':
          if (values.src && values.src.url) {
            const width = values.src.width ? `width="${values.src.width}"` : '';
            const height = values.src.height ? `height="${values.src.height}"` : '';
            return `<div style="padding: ${containerPadding}; text-align: ${textAlign};"><img src="${values.src.url}" alt="${values.altText || ''}" ${width} ${height} style="max-width: 100%; height: auto;" /></div>`;
          }
          return `<div style="padding: ${containerPadding}; text-align: ${textAlign}; background: #f0f0f0; height: 200px; display: flex; align-items: center; justify-content: center; color: #666; border: 2px dashed #ccc; border-radius: 8px;">📷 Image Placeholder<br><small>Image not available</small></div>`;
        
        case 'button':
          const buttonColors = values.buttonColors || {};
          const backgroundColor = buttonColors.backgroundColor || '#3AAEE0';
          const buttonColor = buttonColors.color || '#FFFFFF';
          const href = values.href?.values?.href || '#';
          const buttonText = values.text || 'Button';
          const padding = values.padding || '12px 24px';
          const borderRadius = values.borderRadius || '4px';
          const buttonFontSize = values.fontSize || '14px';
          
          return `<div style="padding: ${containerPadding}; text-align: ${textAlign};"><a href="${href}" class="button" style="background-color: ${backgroundColor}; color: ${buttonColor}; padding: ${padding}; border-radius: ${borderRadius}; font-size: ${buttonFontSize}; text-decoration: none; display: inline-block;">${buttonText.replace(/<[^>]*>/g, '')}</a></div>`;
        
        case 'divider':
          const dividerColor = values.color || '#e0e0e0';
          const dividerHeight = values.borderWidth || '1px';
          return `<div style="padding: ${containerPadding};"><div class="divider" style="background-color: ${dividerColor}; height: ${dividerHeight};"></div></div>`;
        
        case 'spacer':
          const spacerHeight = values.height || '20px';
          return `<div style="height: ${spacerHeight};"></div>`;
        
        case 'social':
          const socialLinks = values.links || [];
          let socialHtml = `<div style="padding: ${containerPadding}; text-align: ${textAlign};">`;
          
          socialLinks.forEach(link => {
            const iconName = link.name || 'link';
            const url = link.url || '#';
            const icon = getEnhancedSocialIcon(iconName);
            socialHtml += `<a href="${url}" class="social-icon" style="display: inline-block; width: 32px; height: 32px; margin: 0 5px; background-color: #333; border-radius: 50%; text-align: center; line-height: 32px; color: white; text-decoration: none;">${icon}</a>`;
          });
          
          socialHtml += '</div>';
          return socialHtml;
        
        case 'html':
          return `<div style="padding: ${containerPadding};">${values.html || ''}</div>`;
        
        case 'video':
          const videoUrl = values.src?.url || values.url || '';
          const videoThumbnail = values.thumbnail || '';
          
          if (videoThumbnail) {
            return `<div style="padding: ${containerPadding}; text-align: ${textAlign};"><div class="video-placeholder" style="position: relative; background-image: url('${videoThumbnail}'); background-size: cover; background-position: center; height: 200px; border-radius: 8px; overflow: hidden;"><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.7); border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">▶</div></div></div>`;
          }
          return `<div style="padding: ${containerPadding}; text-align: ${textAlign};"><div class="video-placeholder"><div style="font-size: 48px; margin-bottom: 10px;">🎥</div><div>Video Content</div><small style="color: #999;">${videoUrl ? 'Click to play' : 'Video not available'}</small></div></div>`;
        
        case 'icon':
          const iconSrc = values.src?.url || '';
          const iconSize = values.size || '24px';
          const iconColor = values.color || '#333';
          
          if (iconSrc) {
            return `<div style="padding: ${containerPadding}; text-align: ${textAlign};"><img src="${iconSrc}" alt="${values.altText || 'Icon'}" style="width: ${iconSize}; height: ${iconSize}; display: inline-block;" /></div>`;
          }
          return `<div style="padding: ${containerPadding}; text-align: ${textAlign};"><div class="icon-placeholder" style="width: ${iconSize}; height: ${iconSize}; background: ${iconColor}; border-radius: 4px; display: inline-block;">⭐</div></div>`;
        
        case 'menu':
          const menuItems = values.items || [];
          let menuHtml = `<div style="padding: ${containerPadding}; text-align: ${textAlign};">`;
          
          menuItems.forEach((item, index) => {
            const separator = index < menuItems.length - 1 ? ' | ' : '';
            menuHtml += `<a href="${item.href || '#'}" style="color: ${linkColor}; text-decoration: none; margin: 0 10px;">${item.text || 'Menu Item'}</a>${separator}`;
          });
          
          menuHtml += '</div>';
          return menuHtml;
        
        case 'timer':
        case 'countdown':
          const targetDate = values.targetDate || new Date(Date.now() + 86400000).toISOString(); // 1 day from now
          return `<div style="padding: ${containerPadding}; text-align: ${textAlign};"><div style="background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-align: center;"><div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">⏰ COUNTDOWN</div><div style="font-size: 18px; color: #e74c3c;">Time Limited Offer</div></div></div>`;
        
        default:
          const contentText = values.text || values.html || values.content || 'Content Block';
          return `<div style="padding: ${containerPadding}; text-align: ${textAlign}; color: ${color}; font-size: ${fontSize};">${contentText}</div>`;
      }
    }
    
    function getEnhancedSocialIcon(name) {
      const icons = {
        'facebook': '📘',
        'twitter': '🐦',
        'instagram': '📷',
        'linkedin': '💼',
        'youtube': '📺',
        'email': '✉️',
        'website': '🌐',
        'github': '💻',
        'pinterest': '📌',
        'snapchat': '👻',
        'tiktok': '🎵',
        'whatsapp': '💬',
        'telegram': '✈️',
        'discord': '🎮',
        'reddit': '🤖',
        'link': '🔗'
      };
      return icons[name.toLowerCase()] || '🔗';
    }
  },

  // Generate comprehensive production-ready HTML from Unlayer design
  generateComprehensiveHtml: (design) => {
    if (!design || !design.body) {
      return '<div style="padding: 20px; text-align: center; color: #999;">No content available</div>';
    }

    const body = design.body;
    const bodyValues = body.values || {};
    const backgroundColor = bodyValues.backgroundColor || '#e7e7e7';
    const contentWidth = bodyValues.contentWidth || '600px';
    const fontFamily = bodyValues.fontFamily?.value || bodyValues.fontFamily || 'arial,helvetica,sans-serif';
    const textColor = bodyValues.textColor || '#000000';
    const linkColor = bodyValues.linkStyle?.linkColor || '#0000ee';

    // Build comprehensive email HTML with full Outlook compatibility
    let html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Template</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      background-color: ${backgroundColor};
      font-family: ${fontFamily};
      color: ${textColor};
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    td {
      border-collapse: collapse;
    }
    img {
      display: block;
      max-width: 100%;
      height: auto;
      border: 0;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    a {
      color: ${linkColor};
      text-decoration: underline;
    }
    .email-container {
      max-width: ${contentWidth};
      margin: 0 auto;
      background-color: #ffffff;
    }
    .button {
      display: inline-block;
      text-decoration: none;
      border-radius: 4px;
      text-align: center;
      font-weight: bold;
      border: 0;
      cursor: pointer;
    }
    .social-icon {
      display: inline-block;
      width: 32px;
      height: 32px;
      margin: 0 5px;
      border-radius: 50%;
      text-align: center;
      line-height: 32px;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      .mobile-full-width {
        width: 100% !important;
        display: block !important;
      }
      .mobile-hide {
        display: none !important;
      }
      .mobile-padding {
        padding: 15px !important;
      }
    }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${backgroundColor};">
    <tr>
      <td align="center" valign="top">
        <table class="email-container" width="${contentWidth}" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
`;

    // Process rows with full email client compatibility
    if (body.rows && Array.isArray(body.rows)) {
      body.rows.forEach((row, rowIndex) => {
        const rowValues = row.values || {};
        const rowBgColor = rowValues.backgroundColor || 'transparent';
        const rowPadding = rowValues.padding || '0';
        
        if (row.columns && row.columns.length > 1) {
          // Multi-column row - use table layout for compatibility
          html += `          <tr>
            <td style="background-color: ${rowBgColor}; padding: ${rowPadding};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
`;
          
          row.columns.forEach((column, colIndex) => {
            const columnValues = column.values || {};
            const columnWidth = Math.floor(100 / row.columns.length);
            const columnBgColor = columnValues.backgroundColor || 'transparent';
            const columnPadding = columnValues.padding || '20px';
            
            html += `                  <td width="${columnWidth}%" valign="top" style="background-color: ${columnBgColor}; padding: ${columnPadding};" class="mobile-full-width">
`;
            
            if (column.contents && Array.isArray(column.contents)) {
              column.contents.forEach((content) => {
                html += renderComprehensiveContent(content);
              });
            }
            
            html += `                  </td>
`;
          });
          
          html += `                </tr>
              </table>
            </td>
          </tr>
`;
        } else {
          // Single column row
          const columnValues = row.columns?.[0]?.values || {};
          const columnBgColor = columnValues.backgroundColor || rowBgColor;
          const columnPadding = columnValues.padding || '20px';
          
          html += `          <tr>
            <td style="background-color: ${columnBgColor}; padding: ${columnPadding};" class="mobile-padding">
`;
          
          if (row.columns && row.columns[0] && row.columns[0].contents) {
            row.columns[0].contents.forEach((content) => {
              html += renderComprehensiveContent(content);
            });
          }
          
          html += `            </td>
          </tr>
`;
        }
      });
    }

    html += `        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    return html;

    function renderComprehensiveContent(content) {
      const values = content.values || {};
      const containerPadding = values.containerPadding || '0px';
      const textAlign = values.textAlign || 'left';
      const fontSize = values.fontSize || 'inherit';
      const color = values.color || 'inherit';
      const lineHeight = values.lineHeight || 'inherit';
      
      switch (content.type) {
        case 'text':
          const textContent = values.text || '';
          return `              <div style="padding: ${containerPadding}; text-align: ${textAlign}; font-size: ${fontSize}; color: ${color}; line-height: ${lineHeight}; font-family: ${fontFamily};">
                ${textContent}
              </div>
`;
        
        case 'image':
          if (values.src && values.src.url) {
            const width = values.src.width || 'auto';
            const height = values.src.height || 'auto';
            const altText = values.altText || '';
            
            return `              <div style="padding: ${containerPadding}; text-align: ${textAlign};">
                <img src="${values.src.url}" alt="${altText}" width="${width}" height="${height}" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />
              </div>
`;
          }
          return `              <div style="padding: ${containerPadding}; text-align: ${textAlign}; background: #f0f0f0; padding: 20px; border: 2px dashed #ccc; border-radius: 8px; color: #666;">
                <div style="text-align: center; font-size: 24px; margin-bottom: 10px;">📷</div>
                <div style="text-align: center; font-size: 14px;">Image Placeholder</div>
                <div style="text-align: center; font-size: 12px; color: #999;">Image not available</div>
              </div>
`;
        
        case 'button':
          const buttonColors = values.buttonColors || {};
          const backgroundColor = buttonColors.backgroundColor || '#3AAEE0';
          const buttonColor = buttonColors.color || '#FFFFFF';
          const hoverColor = buttonColors.hoverBackgroundColor || backgroundColor;
          const href = values.href?.values?.href || '#';
          const target = values.href?.values?.target || '_self';
          const buttonText = values.text || 'Button';
          const padding = values.padding || '12px 24px';
          const borderRadius = values.borderRadius || '4px';
          const buttonFontSize = values.fontSize || '16px';
          const fontWeight = values.fontWeight || 'bold';
          
          return `              <div style="padding: ${containerPadding}; text-align: ${textAlign};">
                <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:40px;v-text-anchor:middle;width:200px;" arcsize="10%" stroke="f" fillcolor="${backgroundColor}">
                  <w:anchorlock/>
                  <center style="color:${buttonColor};font-family:${fontFamily};font-size:${buttonFontSize};font-weight:${fontWeight};">${buttonText.replace(/<[^>]*>/g, '')}</center>
                </v:roundrect>
                <![endif]-->
                <!--[if !mso]><!-- -->
                <a href="${href}" target="${target}" class="button" style="background-color: ${backgroundColor}; color: ${buttonColor}; padding: ${padding}; border-radius: ${borderRadius}; font-size: ${buttonFontSize}; font-weight: ${fontWeight}; text-decoration: none; display: inline-block; font-family: ${fontFamily}; border: 0; cursor: pointer; mso-hide: all;">
                  ${buttonText.replace(/<[^>]*>/g, '')}
                </a>
                <!--<![endif]-->
              </div>
`;
        
        case 'divider':
          const dividerColor = values.color || '#e0e0e0';
          const dividerHeight = values.borderWidth || '1px';
          const dividerWidth = values.width || '100%';
          
          return `              <div style="padding: ${containerPadding};">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 10px 0;">
                      <div style="background-color: ${dividerColor}; height: ${dividerHeight}; width: ${dividerWidth}; margin: 0 auto;"></div>
                    </td>
                  </tr>
                </table>
              </div>
`;
        
        case 'spacer':
          const spacerHeight = values.height || '20px';
          return `              <div style="height: ${spacerHeight}; line-height: ${spacerHeight}; font-size: 1px;">&nbsp;</div>
`;
        
        case 'social':
          const socialLinks = values.links || [];
          let socialHtml = `              <div style="padding: ${containerPadding}; text-align: ${textAlign};">
                <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                  <tr>
`;
          
          socialLinks.forEach((link, index) => {
            const iconName = link.name || 'link';
            const url = link.url || '#';
            const bgColor = link.backgroundColor || '#333333';
            const iconColor = link.color || '#ffffff';
            const icon = getComprehensiveSocialIcon(iconName);
            
            socialHtml += `                    <td style="padding: 0 5px;">
                      <a href="${url}" target="_blank" class="social-icon" style="display: inline-block; width: 32px; height: 32px; background-color: ${bgColor}; border-radius: 50%; text-align: center; line-height: 32px; color: ${iconColor}; text-decoration: none; font-size: 16px;">
                        ${icon}
                      </a>
                    </td>
`;
          });
          
          socialHtml += `                  </tr>
                </table>
              </div>
`;
          return socialHtml;
        
        case 'html':
          const htmlContent = values.html || '';
          return `              <div style="padding: ${containerPadding};">
                ${htmlContent}
              </div>
`;
        
        default:
          const contentText = values.text || values.html || 'Content Block';
          return `              <div style="padding: ${containerPadding}; text-align: ${textAlign}; color: ${color}; font-size: ${fontSize}; font-family: ${fontFamily};">
                ${contentText}
              </div>
`;
      }
    }
    
    function getComprehensiveSocialIcon(name) {
      const icons = {
        'facebook': '📘',
        'twitter': '🐦',
        'instagram': '📷',
        'linkedin': '💼',
        'youtube': '📺',
        'email': '✉️',
        'website': '🌐',
        'github': '💻',
        'pinterest': '📌',
        'snapchat': '👻',
        'tiktok': '🎵',
        'whatsapp': '💬',
        'telegram': '✈️',
        'discord': '🎮',
        'reddit': '🤖',
        'link': '🔗'
      };
      return icons[name.toLowerCase()] || '🔗';
    }
  },

  // Generate a visual thumbnail preview from Unlayer design (fallback)
  generateThumbnailPreview: (design) => {
    if (!design || !design.body) {
      return null;
    }

    const body = design.body;
    const bodyValues = body.values || {};
    const backgroundColor = bodyValues.backgroundColor || '#e7e7e7';
    const contentBg = '#ffffff';
    
    let previewContent = '';
    let blockCount = 0;
    const maxBlocks = 4; // Show up to 4 blocks for better preview
    
    if (body.rows && Array.isArray(body.rows)) {
      for (const row of body.rows) {
        if (blockCount >= maxBlocks) break;
        
        if (row.columns && Array.isArray(row.columns)) {
          for (const column of row.columns) {
            if (blockCount >= maxBlocks) break;
            
            if (column.contents && Array.isArray(column.contents)) {
              for (const content of column.contents) {
                if (blockCount >= maxBlocks) break;
                
                const values = content.values || {};
                
                switch (content.type) {
                  case 'paragraph':
                    // Handle modern Unlayer paragraph with textJson
                    if (values.textJson) {
                      try {
                        const textJsonData = JSON.parse(values.textJson);
                        const extractedText = unlayerTemplateService.extractTextFromLexicalForPreview(textJsonData);
                        if (extractedText) {
                          const cleanText = extractedText.trim().substring(0, 80);
                          if (cleanText) {
                            const fontSize = values.fontSize ? `font-size: ${values.fontSize};` : 'font-size: 11px;';
                            const color = values.color ? `color: ${values.color};` : 'color: #333;';
                            const textAlign = values.textAlign ? `text-align: ${values.textAlign};` : '';
                            previewContent += `<div style="padding: 6px 8px; ${fontSize} ${color} ${textAlign} line-height: 1.3; border-bottom: 1px solid #f0f0f0; word-wrap: break-word;">${cleanText}${extractedText.length > 80 ? '...' : ''}</div>`;
                            blockCount++;
                          }
                        }
                      } catch (e) {
                        console.warn('Error parsing textJson for thumbnail:', e);
                      }
                    }
                    break;
                  
                  case 'text':
                    let text = values.text || '';
                    // Clean HTML tags but preserve line breaks
                    text = text.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
                    const cleanText = text.trim().substring(0, 80);
                    if (cleanText) {
                      const fontSize = values.fontSize ? `font-size: ${values.fontSize};` : 'font-size: 11px;';
                      const color = values.color ? `color: ${values.color};` : 'color: #333;';
                      const textAlign = values.textAlign ? `text-align: ${values.textAlign};` : '';
                      previewContent += `<div style="padding: 6px 8px; ${fontSize} ${color} ${textAlign} line-height: 1.3; border-bottom: 1px solid #f0f0f0; word-wrap: break-word;">${cleanText}${text.length > 80 ? '...' : ''}</div>`;
                      blockCount++;
                    }
                    break;
                    
                  case 'image':
                    if (values.src && values.src.url) {
                      previewContent += `<div style="padding: 4px 8px; border-bottom: 1px solid #f0f0f0;"><div style="background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%); background-size: 8px 8px; background-position: 0 0, 0 4px, 4px -4px, -4px 0px; height: 32px; display: flex; align-items: center; justify-content: center; color: #666; font-size: 9px; border-radius: 3px; border: 1px solid #e0e0e0;">📷 Image</div></div>`;
                    } else {
                      previewContent += `<div style="padding: 4px 8px; border-bottom: 1px solid #f0f0f0;"><div style="background: #f8f8f8; height: 32px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 9px; border-radius: 3px; border: 1px dashed #ddd;">📷 Image</div></div>`;
                    }
                    blockCount++;
                    break;
                    
                  case 'button':
                    // Handle modern Unlayer button with textJson
                    let buttonText = '';
                    if (values.text) {
                      buttonText = values.text.replace(/<[^>]*>/g, '').substring(0, 15);
                    } else if (values.textJson) {
                      try {
                        const textJsonData = JSON.parse(values.textJson);
                        buttonText = unlayerTemplateService.extractTextFromLexicalForPreview(textJsonData).replace(/<[^>]*>/g, '').substring(0, 15);
                      } catch (e) {
                        console.warn('Error parsing button textJson for thumbnail:', e);
                      }
                    } else {
                      buttonText = 'Button';
                    }
                    
                    const buttonBg = values.buttonColors?.backgroundColor || '#3AAEE0';
                    const buttonColor = values.buttonColors?.color || '#FFFFFF';
                    previewContent += `<div style="padding: 6px 8px; text-align: center; border-bottom: 1px solid #f0f0f0;"><div style="background: ${buttonBg}; color: ${buttonColor}; padding: 4px 10px; border-radius: 3px; display: inline-block; font-size: 9px; font-weight: bold;">${buttonText}</div></div>`;
                    blockCount++;
                    break;
                    
                  case 'social':
                    const socialLinks = values.links || [];
                    if (socialLinks.length > 0) {
                      let socialIcons = '';
                      socialLinks.slice(0, 4).forEach(link => {
                        socialIcons += '🔗 ';
                      });
                      previewContent += `<div style="padding: 6px 8px; text-align: center; border-bottom: 1px solid #f0f0f0; font-size: 10px;">${socialIcons.trim()}</div>`;
                      blockCount++;
                    }
                    break;
                    
                  case 'divider':
                    const dividerColor = values.color || '#e0e0e0';
                    previewContent += `<div style="padding: 6px 8px; border-bottom: 1px solid #f0f0f0;"><div style="height: 1px; background: ${dividerColor}; margin: 4px 0;"></div></div>`;
                    blockCount++;
                    break;
                    
                  case 'html':
                    const htmlText = (values.html || '').replace(/<[^>]*>/g, '').substring(0, 60);
                    if (htmlText.trim()) {
                      previewContent += `<div style="padding: 6px 8px; font-size: 10px; color: #666; border-bottom: 1px solid #f0f0f0; font-style: italic;">${htmlText}${values.html && values.html.length > 60 ? '...' : ''}</div>`;
                      blockCount++;
                    }
                    break;
                }
              }
            }
          }
        }
      }
    }
    
    if (!previewContent) {
      previewContent = '<div style="padding: 20px; text-align: center; color: #999; font-size: 11px;">Email Template<br><small>No content to preview</small></div>';
    }
    
    return `
      <div style="background: ${backgroundColor}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 6px; box-sizing: border-box;">
        <div style="background: ${contentBg}; width: 100%; max-width: 180px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; border: 1px solid #e0e0e0;">
          ${previewContent}
        </div>
      </div>
    `;
  },

  // Helper function to extract text from Lexical editor format for thumbnail preview
  extractTextFromLexicalForPreview: (lexicalData) => {
    if (!lexicalData || !lexicalData.root || !lexicalData.root.children) {
      return '';
    }

    let text = '';
    
    const processNode = (node) => {
      if (node.type === 'paragraph' && node.children) {
        node.children.forEach(child => {
          if (child.type === 'extended-text' && child.text) {
            text += child.text + ' ';
          } else if (child.children) {
            child.children.forEach(processNode);
          }
        });
        text += '\n';
      } else if (node.type === 'extended-text' && node.text) {
        text += node.text + ' ';
      } else if (node.children) {
        node.children.forEach(processNode);
      }
    };

    lexicalData.root.children.forEach(processNode);
    
    return text.trim();
  }
};

export default unlayerTemplateService;