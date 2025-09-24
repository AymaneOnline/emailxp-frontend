import React from 'react';
import { Eye, Trash2, Star } from 'lucide-react';

export default function TemplateCard({ template, categories, onPreview, onDelete, unlayerTemplateService }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow" aria-label={`template-card-${template.id || template._id}`}> 
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative group rounded-lg overflow-hidden">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = unlayerTemplateService.generateThumbnailPreview(template.design) || `
                <div class=\"w-full h-full flex items-center justify-center\">
                  <div class=\"text-center\">
                    <div class=\"w-12 h-12 text-gray-400 mx-auto mb-2\">🎨</div>
                    <p class=\"text-gray-500 text-sm\">Unlayer Template</p>
                  </div>
                </div>`;
            }}
          />
        ) : (
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{
              __html: unlayerTemplateService.generateThumbnailPreview(template.design) || `
                <div class=\"w-full h-full flex items-center justify-center\">
                  <div class=\"text-center\">
                    <div class=\"w-12 h-12 text-gray-400 mx-auto mb-2\">🎨</div>
                    <p class=\"text-gray-500 text-sm\">Unlayer Template</p>
                  </div>
                </div>`
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
          <button
            onClick={() => onPreview(template)}
            className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            title="Preview template in editor"
            aria-label={`Preview template ${template.name} in editor`}
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(template)}
            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            title="Delete template"
            aria-label={`Delete template ${template.name}`}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-900 truncate">{template.name}</h3>
          <div className="flex items-center space-x-1 ml-2">
            {template.isPopular && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
            <span className="text-xs text-gray-500">{Math.floor(Math.random() * 500) + 100} uses</span>
          </div>
        </div>
        {template.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {categories.find(cat => cat.value === template.category)?.label || template.category}
            </span>
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">Unlayer Template</span>
          </div>
        </div>
      </div>
    </div>
  );
}
