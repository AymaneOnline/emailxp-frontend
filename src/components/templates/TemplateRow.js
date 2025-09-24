import React from 'react';
import { Eye, Trash2, Star } from 'lucide-react';

export default function TemplateRow({ template, categories, onPreview, onDelete, unlayerTemplateService, generateTemplatePreview }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow" aria-label={`template-row-${template.id || template._id}`}> 
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-24 h-18 bg-gray-100 rounded border overflow-hidden flex-shrink-0 relative group">
            {template.thumbnail ? (
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = unlayerTemplateService.generateThumbnailPreview(template.design) || `<div style=\"display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 16px;\">📎</div>`;
                }}
              />
            ) : (
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{
                  __html: unlayerTemplateService.generateThumbnailPreview(template.design) || generateTemplatePreview(template) || `<div style=\"display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 16px;\">📧</div>`
                }}
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1">
              <button
                onClick={() => onPreview(template)}
                className="p-1 bg-white text-gray-700 rounded hover:bg-gray-100 transition-colors"
                title="Preview template in editor"
                aria-label={`Preview template ${template.name} in editor`}
              >
                <Eye className="h-3 w-3" />
              </button>
              <button
                onClick={() => onDelete(template)}
                className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                title="Delete template"
                aria-label={`Delete template ${template.name}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="font-medium text-gray-900">{template.name}</h3>
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {categories.find(cat => cat.value === template.category)?.label || template.category}
              </span>
              {template.type === 'system' && (
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">System</span>
              )}
              {template.isPopular && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
            </div>
            {template.description && (
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span>Used {template.stats?.timesUsed || 0} times</span>
              <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2" />
      </div>
    </div>
  );
}
