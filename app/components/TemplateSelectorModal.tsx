'use client'

import React, { useState, useEffect } from 'react'
import { Dialog } from "@headlessui/react"
import { X, Search, Loader2 } from 'lucide-react'

interface TemplateSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  sectionType: string
  onSelectTemplate: (templateName: string, templateContent: { 
    html: string, 
    css: string, 
    js: string,
    globalCss?: string,
    globalJs?: string
  }) => void
  isLoading?: boolean
}

interface Template {
  id: string
  name: string
  sections: Array<{
    htmlContent: string
    css: Array<{ cssFile: { content: string } }>
    js: Array<{ jsFile: { content: string } }>
  }>
  globalCss?: Array<{ cssFile: { content: string } }>
  globalJs?: Array<{ jsFile: { content: string } }>
}

export default function TemplateSelectorModal({ isOpen, onClose, sectionType, onSelectTemplate, isLoading = false }: TemplateSelectorModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, sectionType]);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/templates/by-section?type=${encodeURIComponent(sectionType)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      setError('Failed to load templates. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: Template) => {
    const section = template.sections[0];
    const htmlContent = section.htmlContent;
    const cssContent = section.css[0]?.cssFile.content || '';
    const jsContent = section.js[0]?.jsFile.content || '';
    const globalCssContent = template.globalCss?.[0]?.cssFile?.content || '';
    const globalJsContent = template.globalJs?.[0]?.jsFile?.content || '';

    onSelectTemplate(template.name, {
      html: htmlContent,
      css: cssContent,
      js: jsContent,
      globalCss: globalCssContent,
      globalJs: globalJsContent
    });
    onClose();
  };

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="luxury-panel w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-2xl font-bold mb-6 text-[var(--accent-color)]">
            Select {sectionType} Template
          </Dialog.Title>
  
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--accent-color)]"
              size={20}
            />
          </div>
  
          {isLoading || loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-color)]" />
            </div>
          ) : (
            <>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              
              <div className="grid grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="bg-[var(--secondary-color)] p-4 rounded cursor-pointer hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] transition-colors duration-200 flex items-center justify-center"
                  >
                    <h3 className="text-lg font-semibold text-center truncate">
                      {template.name}
                    </h3>
                  </div>
                ))}
              </div>
  
              {filteredTemplates.length === 0 && (
                <p className="text-center text-gray-400 mt-6">No templates found</p>
              )}
            </>
          )}
  
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-[var(--secondary-color)]"
          >
            <X size={24} className="text-[var(--accent-color)]" />
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}