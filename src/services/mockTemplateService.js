// Mock template service for testing
const mockTemplates = [
  {
    _id: '1',
    name: 'Welcome Email',
    description: 'A warm welcome email for new subscribers',
    category: 'welcome',
    type: 'system',
    structure: {
      blocks: [
        {
          id: 'block-1',
          type: 'heading',
          content: {
            text: 'Welcome to Our Community!',
            level: 'h1',
            styles: {
              fontSize: '32px',
              fontFamily: 'Arial, sans-serif',
              color: '#333333',
              fontWeight: 'bold',
              textAlign: 'center',
              padding: '20px 0 10px 0'
            }
          }
        },
        {
          id: 'block-2',
          type: 'text',
          content: {
            text: 'Thank you for joining us! We are excited to have you as part of our community.',
            styles: {
              fontSize: '16px',
              fontFamily: 'Arial, sans-serif',
              color: '#333333',
              lineHeight: '1.6',
              textAlign: 'center',
              padding: '10px 0'
            }
          }
        },
        {
          id: 'block-3',
          type: 'button',
          content: {
            text: 'Get Started',
            link: 'https://example.com/get-started',
            styles: {
              backgroundColor: '#007cba',
              color: '#ffffff',
              fontSize: '16px',
              fontFamily: 'Arial, sans-serif',
              padding: '12px 24px',
              borderRadius: '4px',
              textDecoration: 'none',
              display: 'inline-block',
              textAlign: 'center',
              margin: '20px 0'
            }
          }
        }
      ],
      settings: {
        backgroundColor: '#f4f4f4',
        contentWidth: 600,
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        lineHeight: 1.6,
        textColor: '#333333'
      }
    },
    tags: ['welcome', 'onboarding'],
    stats: { timesUsed: 15, lastUsed: new Date() },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    name: 'Newsletter Template',
    description: 'A clean newsletter template for regular updates',
    category: 'newsletter',
    type: 'system',
    structure: {
      blocks: [
        {
          id: 'block-1',
          type: 'heading',
          content: {
            text: 'Monthly Newsletter',
            level: 'h2',
            styles: {
              fontSize: '28px',
              fontFamily: 'Arial, sans-serif',
              color: '#333333',
              fontWeight: 'bold',
              textAlign: 'left',
              padding: '20px 0 10px 0'
            }
          }
        },
        {
          id: 'block-2',
          type: 'text',
          content: {
            text: 'Here are the latest updates and news from our team.',
            styles: {
              fontSize: '16px',
              fontFamily: 'Arial, sans-serif',
              color: '#333333',
              lineHeight: '1.6',
              textAlign: 'left',
              padding: '10px 0'
            }
          }
        }
      ],
      settings: {
        backgroundColor: '#ffffff',
        contentWidth: 600,
        fontFamily: 'Arial, sans-serif',
        fontSize: 16,
        lineHeight: 1.6,
        textColor: '#333333'
      }
    },
    tags: ['newsletter', 'updates'],
    stats: { timesUsed: 8, lastUsed: new Date() },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockTemplateService = {
  getTemplates: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ templates: mockTemplates, total: mockTemplates.length });
      }, 500);
    });
  },

  getTemplateById: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const template = mockTemplates.find(t => t._id === id);
        if (template) {
          resolve(template);
        } else {
          reject(new Error('Template not found'));
        }
      }, 300);
    });
  },

  createTemplate: async (templateData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTemplate = {
          _id: Date.now().toString(),
          ...templateData,
          type: 'user',
          stats: { timesUsed: 0, lastUsed: null },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockTemplates.push(newTemplate);
        resolve(newTemplate);
      }, 500);
    });
  },

  updateTemplate: async (id, templateData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockTemplates.findIndex(t => t._id === id);
        if (index !== -1) {
          mockTemplates[index] = {
            ...mockTemplates[index],
            ...templateData,
            updatedAt: new Date()
          };
          resolve(mockTemplates[index]);
        } else {
          reject(new Error('Template not found'));
        }
      }, 500);
    });
  },

  deleteTemplate: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockTemplates.findIndex(t => t._id === id);
        if (index !== -1) {
          mockTemplates.splice(index, 1);
          resolve({ message: 'Template deleted successfully' });
        } else {
          reject(new Error('Template not found'));
        }
      }, 300);
    });
  },

  duplicateTemplate: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const template = mockTemplates.find(t => t._id === id);
        if (template) {
          const duplicated = {
            ...template,
            _id: Date.now().toString(),
            name: `${template.name} (Copy)`,
            type: 'user',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          mockTemplates.push(duplicated);
          resolve(duplicated);
        } else {
          reject(new Error('Template not found'));
        }
      }, 500);
    });
  },

  exportTemplate: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const template = mockTemplates.find(t => t._id === id);
        if (template) {
          resolve({
            template: {
              name: template.name,
              description: template.description,
              category: template.category,
              structure: template.structure,
              tags: template.tags,
              exportedAt: new Date(),
              version: '1.0'
            }
          });
        } else {
          reject(new Error('Template not found'));
        }
      }, 300);
    });
  },

  getCategories: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { value: 'newsletter', label: 'Newsletter', description: 'Regular updates and news' },
          { value: 'promotional', label: 'Promotional', description: 'Sales and marketing campaigns' },
          { value: 'transactional', label: 'Transactional', description: 'Order confirmations, receipts' },
          { value: 'welcome', label: 'Welcome', description: 'New subscriber onboarding' },
          { value: 'announcement', label: 'Announcement', description: 'Important updates and news' },
          { value: 'custom', label: 'Custom', description: 'Custom templates' }
        ]);
      }, 200);
    });
  }
};

export default mockTemplateService;