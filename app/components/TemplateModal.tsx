// app/components/TemplateModal.tsx
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { X, Trash2, ArrowLeftRight, ChevronUp, ChevronDown } from 'lucide-react';
import ParseTemplateModal from './ParseTemplateModal';
import ReactMarkdown from 'react-markdown';

type ModalMode = 'add' | 'edit';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  templateId?: string;
}

interface SectionItem {
  id: string;
  type: string;
  html: string;
  css: string;
  js: string;
}

const allSectionTypes = [
  'Hero', 'About Team', 'Featured Listings', 'Featured Neighborhoods',
  'Our Stats', 'Latest Blogs', 'Buy a home CTA', 'Sell a home CTA',
  'Home worth CTA', 'Contact information / form', 'Combined CTA',
  'Social Feeds', 'Action Bar', 'Lifestyles', 'Latest Listings'
];

const DraggableSection = ({ id, type, index, moveSectionItem, removeSection, sectionsLength }) => {
  const ref = useRef(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'section',
    item: { id, index, type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: 'section',
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveSectionItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  }));

  drag(drop(ref));

  const moveUp = () => {
    if (index > 0) {
      moveSectionItem(index, index - 1);
    }
  };

  const moveDown = () => {
    if (index < sectionsLength - 1) {
      moveSectionItem(index, index + 1);
    }
  };

  return (
    <div 
      ref={ref} 
      className={`p-2 mb-2 luxury-panel cursor-move ${isDragging ? 'opacity-50' : ''} hover:bg-[var(--secondary-color)] transition-colors`}
    >
      <div className="flex justify-between items-center">
        <span>{type}</span>
        <div className="flex items-center">
          <button
            onClick={moveUp}
            disabled={index === 0}
            className={`p-1 rounded-full ${index === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)]'}`}
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={moveDown}
            disabled={index === sectionsLength - 1}
            className={`p-1 rounded-full ${index === sectionsLength - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)]'}`}
          >
            <ChevronDown size={16} />
          </button>
          <ArrowLeftRight size={16} className="mx-2 text-[var(--accent-color)]" />
          <button
            onClick={() => removeSection(id)}
            className="p-1 rounded-full hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)]"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const AvailableSection = ({ type, addSection, isUsed }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'availableSection',
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  if (isUsed) return null;

  return (
    <div
      ref={drag}
      className={`p-2 mb-2 luxury-panel cursor-move ${isDragging ? 'opacity-50' : ''} hover:bg-[var(--secondary-color)] transition-colors`}
    >
      {type}
    </div>
  );
};

const SafeMarkdown = ({ children }) => {
  if (!children || typeof children !== 'string' || children.trim() === '') {
    return <p className="italic text-gray-500">No content</p>;
  }
  try {
    return <ReactMarkdown>{children}</ReactMarkdown>;
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return <p className="italic text-red-500">Error rendering content</p>;
  }
};

export default function TemplateModal({ isOpen, onClose, mode, templateId }: TemplateModalProps) {
  const [step, setStep] = useState(0);
  const [templateName, setTemplateName] = useState('');
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [globalCss, setGlobalCss] = useState('');
  const [globalJs, setGlobalJs] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isParseModalOpen, setIsParseModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const addSection = useCallback((type: string) => {
    const newSection = {
      id: Date.now().toString(),
      type,
      html: '',
      css: '',
      js: '',
    };
    setSections(prevSections => {
      const newSections = [...prevSections, newSection];
      setSelectedSectionIndex(newSections.length - 1);  // Select the newly added section
      return newSections;
    });
  }, []);

  const removeSection = useCallback((id: string) => {
    setSections(prevSections => prevSections.filter(section => section.id !== id));
  }, []);

  const moveSectionItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setSections((prevSections) => {
      const newSections = [...prevSections];
      const [reorderedItem] = newSections.splice(dragIndex, 1);
      newSections.splice(hoverIndex, 0, reorderedItem);
      return newSections;
    });
  }, []);

  const handleParseTemplate = (parsedSections: ParsedSection[], name: string) => {
    setTemplateName(name);
    setSections(parsedSections);
    setStep(3); // Skip to the global CSS/JS step
    setIsParseModalOpen(false);
  };

  const validateStep = async () => {
    setError(null);
    switch (step) {
      case 0:
        if (!templateName.trim()) {
          setError("Template name is required.");
          return false;
        }
        // Check if template name already exists (case-insensitive)
        const response = await fetch(`/api/templates/check-name?name=${encodeURIComponent(templateName.trim().toLowerCase())}`);
        const { exists } = await response.json();
        if (exists) {
          setError("A template with this name already exists.");
          return false;
        }
        break;
      case 1:
        if (sections.length === 0) {
          setError("At least one section is required.");
          return false;
        }
        break;
      case 2:
        if (sections.some(section => !section.type)) {
          setError("All sections must have a type assigned.");
          return false;
        }
        break;
    }
    return true;
  };

  const handleNextStep = async () => {
    if (await validateStep()) {
      if (step === 1) {
        setStep(3); // Skip step 2
      } else {
        setStep(step + 1);
      }
    }
  };

  useEffect(() => {
    if (mode === 'edit' && isOpen) {
      fetchTemplates();
    } else {
      // Reset state for new template
      setTemplateName('');
      setSections([]);
      setGlobalCss('');
      setGlobalJs('');
      setStep(0);
    }
  }, [mode, isOpen]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }
      const data = await response.json();
      setTemplateName(data.name);
      setSections(data.sections);
      setGlobalCss(data.globalCss);
      setGlobalJs(data.globalJs);
      setStep(1); // Skip the naming step for editing
    } catch (error) {
      console.error('Error fetching template:', error);
      setError('Failed to fetch template. Please try again.');
    }
  };

  const handleTemplateSelect = async (template) => {
    setSelectedTemplate(template);
    try {
      const response = await fetch(`/api/templates/${template.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched template data:', data);
        setTemplateName(data.name);
        if (Array.isArray(data.sections)) {
          setSections(data.sections.map(section => ({
            id: section.id,
            type: section.type || section.section?.name,
            html: section.htmlContent || section.html || '',
            css: section.css?.[0]?.cssFile?.content || section.css || '',
            js: section.js?.[0]?.jsFile?.content || section.js || '',
          })));
        } else {
          console.error('Sections data is not an array:', data.sections);
          setSections([]);
        }
        setGlobalCss(data.globalCss?.[0]?.cssFile?.content || data.globalCss || '');
        setGlobalJs(data.globalJs?.[0]?.jsFile?.content || data.globalJs || '');
        console.log('Processed sections:', sections);
        setSelectedSectionIndex(0);
      } else {
        throw new Error('Failed to fetch template details');
      }
    } catch (error) {
      console.error('Error fetching template details:', error);
      setError('Failed to fetch template details. Please try again.');
    }
  };

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...sections];
    updatedSections[index][field] = value;
    setSections(updatedSections);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await validateStep()) {
      try {
        const url = mode === 'edit' && selectedTemplate 
          ? `/api/templates/${selectedTemplate.id}` 
          : '/api/templates';
        const method = mode === 'edit' ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: templateName,
            sections: sections.map(section => ({
              type: section.type,
              html: section.html,
              css: section.css,
              js: section.js,  // Make sure this is included
            })),
            globalCss,
            globalJs,
          }),
        });
  
        if (!response.ok) {
          throw new Error(`Failed to ${mode} template`);
        }
  
        const data = await response.json();
        console.log(`Template ${mode}d:`, data);
        onClose();
      } catch (error) {
        console.error(`Error ${mode}ing template:`, error);
        setError(`Failed to ${mode} template. Please try again.`);
      }
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateName,
          sections,
          globalCss,
          globalJs,
        }),
      });

      if (response.ok) {
        onClose();
      } else {
        throw new Error('Failed to update template');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      setError('Failed to update template. Please try again.');
    }
  };

  const getAvailableSectionTypes = useCallback(() => {
    const usedTypes = new Set(sections.map(section => section.type));
    return allSectionTypes.filter(type => !usedTypes.has(type));
  }, [sections]);

  

  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);

  const renderStep = () => {
    switch (step) {
      case 0:
  if (mode === 'edit' && !selectedTemplate) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">Select a template to edit:</h3>
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className="block w-full text-left p-2 hover:bg-[var(--secondary-color)] mb-2"
          >
            {template.name}
          </button>
        ))}
      </div>
    );
  } else if (mode === 'edit' && selectedTemplate) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">Editing: {selectedTemplate.name}</h3>
        <div className="flex space-x-4">
          <div className="w-1/3 border-r pr-4">
            <h4 className="font-semibold mb-2">Sections:</h4>
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setSelectedSectionIndex(index)}
                className={`block w-full text-left p-2 mb-2 rounded ${selectedSectionIndex === index ? 'bg-[var(--accent-color)] text-[var(--bg-color)]' : 'hover:bg-[var(--secondary-color)]'}`}
              >
                {section.type || `Section ${index + 1}`}
              </button>
            ))}
            <div className="relative">
              <button
                onClick={() => {
                  const availableTypes = getAvailableSectionTypes();
                  if (availableTypes.length > 0) {
                    addSection(availableTypes[0]);
                    setSelectedSectionIndex(sections.length);
                  }
                }}
                className="w-full p-2 mt-4 bg-[var(--accent-color)] text-[var(--bg-color)] rounded"
                disabled={getAvailableSectionTypes().length === 0}
              >
                Add New Section
              </button>
              {getAvailableSectionTypes().length === 0 && (
                <p className="text-sm text-red-500 mt-2">All section types are in use</p>
              )}
            </div>
          </div>
          <div className="w-2/3">
            {selectedSectionIndex !== null && sections[selectedSectionIndex] && (
              <div>
                <h4 className="font-semibold mb-2">Editing: {sections[selectedSectionIndex].type || `Section ${selectedSectionIndex + 1}`}</h4>
                <select
                  value={sections[selectedSectionIndex].type}
                  onChange={(e) => handleSectionChange(selectedSectionIndex, 'type', e.target.value)}
                  className="w-full p-2 mb-4 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
                >
                  <option value="">Select section type</option>
                  {getAvailableSectionTypes().concat(sections[selectedSectionIndex].type).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {['html', 'css', 'js'].map(field => (
                  <div key={field} className="mb-4">
                    <h5 className="font-semibold capitalize mb-2">{field}:</h5>
                    <textarea
                      value={sections[selectedSectionIndex][field] || ''}
                      onChange={(e) => handleSectionChange(selectedSectionIndex, field, e.target.value)}
                      className="w-full h-48 p-2 border rounded bg-[var(--secondary-color)] text-[var(--text-color)]"
                    />
                  </div>
                ))}
                <button
                  onClick={() => removeSection(sections[selectedSectionIndex].id)}
                  className="p-2 bg-red-500 text-white rounded flex items-center"
                >
                  <Trash2 size={16} className="mr-2" /> Delete Section
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8">
          <h4 className="font-semibold mb-2">Global Styles and Scripts</h4>
          <div className="mb-4">
            <h5 className="font-semibold mb-2">Global CSS:</h5>
            <textarea
              value={globalCss}
              onChange={(e) => setGlobalCss(e.target.value)}
              className="w-full h-48 p-2 border rounded bg-[var(--secondary-color)] text-[var(--text-color)]"
            />
          </div>
          <div className="mb-4">
            <h5 className="font-semibold mb-2">Global JavaScript:</h5>
            <textarea
              value={globalJs}
              onChange={(e) => setGlobalJs(e.target.value)}
              className="w-full h-48 p-2 border rounded bg-[var(--secondary-color)] text-[var(--text-color)]"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="mt-4 p-2 bg-[var(--accent-color)] text-[var(--bg-color)] rounded"
        >
          Save Changes
        </button>
      </div>
    );
  } else {
    return (
      <div>
        <input
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Template Name"
          className="w-full p-2 mb-4 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
        />
        <div className="flex justify-between">
          <button onClick={handleNextStep} className="luxury-button">Next</button>
          <button onClick={() => setIsParseModalOpen(true)} className="luxury-button">Parse Template</button>
        </div>
      </div>
    );
  }
      case 1:
        return (
          <DndProvider backend={HTML5Backend}>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <h3 className="text-lg mb-2 text-[var(--accent-color)]">Available Sections</h3>
                <div 
                  className="min-h-[400px] p-2 luxury-panel"
                  ref={availableDrop}
                >
                  {allSectionTypes.map((type) => (
                    <AvailableSection 
                      key={type} 
                      type={type} 
                      addSection={addSection} 
                      isUsed={sections.some(section => section.type === type)}
                    />
                  ))}
                </div>
              </div>
              <div className="w-1/2">
                <h3 className="text-lg mb-2 text-[var(--accent-color)]">Template Sections</h3>
                <div 
                  className="min-h-[400px] p-2 luxury-panel"
                  ref={templateDrop}
                >
                  {sections.map((section, index) => (
                    <DraggableSection
                      key={section.id}
                      id={section.id}
                      type={section.type}
                      index={index}
                      moveSectionItem={moveSectionItem}
                      removeSection={removeSection}
                      sectionsLength={sections.length}
                    />
                  ))}
                  {sections.length === 0 && (
                    <p className="text-center text-gray-500">Drag sections here</p>
                  )}
                </div>
              </div>
            </div>
            <button onClick={handleNextStep} className="luxury-button mt-4">Next</button>
          </DndProvider>
        );
      case 2:
        return (
          <div>
            <h3 className="text-lg mb-2 text-[var(--accent-color)]">Section Details</h3>
            {sections.map((section, index) => (
              <div key={section.id} className="mb-4 p-4 luxury-panel">
                <h4 className="text-md mb-2 text-[var(--accent-color)]">Section {index + 1}</h4>
                <select
                  value={section.type}
                  onChange={(e) => {
                    const newSections = [...sections];
                    newSections[index].type = e.target.value;
                    setSections(newSections);
                  }}
                  className="w-full p-2 mb-2 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
                >
                  <option value="">Select section type</option>
                  {allSectionTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {['html', 'css', 'js'].map(field => (
                  <div key={field} className="mb-2">
                    <h5 className="font-semibold capitalize">{field}:</h5>
                    <ReactMarkdown>{section[field]}</ReactMarkdown>
                    <textarea
                      value={section[field]}
                      onChange={(e) => {
                        const newSections = [...sections];
                        newSections[index][field] = e.target.value;
                        setSections(newSections);
                      }}
                      className="w-full p-2 mb-2 h-24 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
                    />
                  </div>
                ))}
                <button
                  onClick={() => removeSection(section.id)}
                  className="mt-2 p-2 bg-red-500 text-white rounded flex items-center"
                >
                  <Trash2 size={16} className="mr-2" /> Delete Section
                </button>
              </div>
            ))}
            <button onClick={handleNextStep} className="luxury-button">Next</button>
          </div>
        );
      case 3:
        return (
          <div>
          <h3 className="text-lg mb-2 text-[var(--accent-color)]">Global Styles and Scripts</h3>
          <textarea
            value={globalCss}
            onChange={(e) => setGlobalCss(e.target.value)}
            placeholder="Global CSS"
            className="w-full p-2 mb-4 h-48 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
          />
          <textarea
            value={globalJs}
            onChange={(e) => setGlobalJs(e.target.value)}
            placeholder="Global JavaScript"
            className="w-full p-2 mb-4 h-48 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
          />
          <button onClick={handleSubmit} className="luxury-button">
            {mode === 'add' ? 'Create Template' : 'Update Template'}
          </button>
        </div>
      );
    default:
      return null;
  }
  };

  const [, availableDrop] = useDrop(() => ({
    accept: 'section',
    drop: (item: { type: string; id: string }) => {
      removeSection(item.id);
    },
  }), [removeSection]);

  const [, templateDrop] = useDrop(() => ({
    accept: ['availableSection', 'section'],
    drop: (item: { type: string; id?: string }, monitor) => {
      if (!monitor.didDrop()) {
        if (item.id) {
          // It's already in the template, do nothing
        } else {
          addSection(item.type);
        }
      }
    },
  }), [addSection]);

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="luxury-panel w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-2xl font-bold mb-6 text-[var(--accent-color)]">
              {mode === 'add' ? 'Add New Template' : 'Edit Template'}
            </Dialog.Title>
            
            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            {renderStep()}

            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-[var(--secondary-color)]"
            >
              <X size={24} className="text-[var(--accent-color)]" />
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>

      <ParseTemplateModal
        isOpen={isParseModalOpen}
        onClose={() => setIsParseModalOpen(false)}
        onParse={handleParseTemplate}
      />
    </>
  );
}