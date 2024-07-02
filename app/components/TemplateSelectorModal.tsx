'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface TemplateSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  sectionType: string
  onSelectTemplate: (template: string) => void
}

interface Template {
  id: string
  name: string
  sections: Array<{
    htmlContent: string
    css: Array<{ cssFile: { content: string } }>
    js: Array<{ jsFile: { content: string } }>
  }>
}

export default function TemplateSelectorModal({ isOpen, onClose, sectionType, onSelectTemplate }: TemplateSelectorModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    // Assuming we want to use the first matching section's content
    const section = template.sections[0];
    const htmlContent = section.htmlContent;
    const cssContent = section.css[0]?.cssFile.content || '';
    const jsContent = section.js[0]?.jsFile.content || '';

    onSelectTemplate(`${htmlContent}\n\n<style>\n${cssContent}\n</style>\n\n<script>\n${jsContent}\n</script>`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose} />

        <div className="relative bg-[var(--bg-color)] rounded max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold mb-4 text-[var(--accent-color)]">{sectionType} Templates</h2>
          <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-[var(--secondary-color)]">
            <X size={24} className="text-[var(--accent-color)]" />
          </button>

          {loading && <p>Loading templates...</p>}
          {error && <p className="text-red-500">{error}</p>}
          
          <div className="space-y-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="luxury-panel w-full text-left p-4 rounded transition-all hover:scale-105"
              >
                {template.name}
              </button>
            ))}
          </div>

          {!loading && templates.length === 0 && (
            <p>No templates found for this section type.</p>
          )}
        </div>
      </div>
    </div>
  )
}