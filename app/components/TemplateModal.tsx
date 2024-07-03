// app/components/TemplateModal.tsx
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { X, Trash2 } from 'lucide-react';
import ParseTemplateModal from './ParseTemplateModal';

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

const DraggableSection = ({ id, type, index, moveSectionItem, removeSection }) => {
  const ref = useRef(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'section',
    item: { id, index, type: 'section' },
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

  return (
    <div ref={ref} className={`p-2 mb-2 luxury-panel cursor-move ${isDragging ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-center">
        <span>{type}</span>
        <button
          onClick={() => removeSection(id)}
          className="p-1 rounded-full hover:bg-[var(--secondary-color)]"
        >
          <Trash2 size={16} className="text-[var(--accent-color)]" />
        </button>
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
      className={`p-2 mb-2 luxury-panel cursor-move ${isDragging ? 'opacity-50' : ''}`}
    >
      {type}
    </div>
  );
};

export default function TemplateModal({ isOpen, onClose, mode, templateId }: TemplateModalProps) {
  const [step, setStep] = useState(0);
  const [templateName, setTemplateName] = useState('');
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [globalCss, setGlobalCss] = useState('');
  const [globalJs, setGlobalJs] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isParseModalOpen, setIsParseModalOpen] = useState(false);

  const addSection = useCallback((type: string) => {
    const newSection = {
      id: Date.now().toString(),
      type,
      html: '',
      css: '',
      js: '',
    };
    setSections(prevSections => [...prevSections, newSection]);
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

  const handleParseTemplate = (parsedSections: SectionItem[], name: string) => {
    setTemplateName(name);
    setSections(parsedSections);
    setStep(2); // Move to section details step
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
        // Check if template name already exists
        const response = await fetch(`/api/templates/check-name?name=${encodeURIComponent(templateName)}`);
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
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await validateStep()) {
      try {
        const response = await fetch('/api/templates', {
          method: 'POST',
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

        if (!response.ok) {
          throw new Error('Failed to create template');
        }

        const data = await response.json();
        console.log('Template created:', data);
        onClose();
      } catch (error) {
        console.error('Error creating template:', error);
        setError('Failed to create template. Please try again.');
      }
    }
  };

  

  const renderStep = () => {
    switch (step) {
      case 0:
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
      case 1:
        return (
          <DndProvider backend={HTML5Backend}>
            <div className="flex">
              <div className="w-1/2 pr-2">
                <h3 className="text-lg mb-2 text-[var(--accent-color)]">Available Sections</h3>
                {allSectionTypes.map((type) => (
                  <AvailableSection 
                    key={type} 
                    type={type} 
                    addSection={addSection} 
                    isUsed={sections.some(section => section.type === type)}
                  />
                ))}
              </div>
              <div className="w-1/2 pl-2">
                <h3 className="text-lg mb-2 text-[var(--accent-color)]">Template Sections</h3>
                <div 
                  className="min-h-[200px] p-2 luxury-panel"
                  ref={drop}
                >
                  {sections.map((section, index) => (
                    <DraggableSection
                      key={section.id}
                      id={section.id}
                      type={section.type}
                      index={index}
                      moveSectionItem={moveSectionItem}
                      removeSection={removeSection}
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
                <textarea
                  value={section.html}
                  onChange={(e) => {
                    const newSections = [...sections];
                    newSections[index].html = e.target.value;
                    setSections(newSections);
                  }}
                  className="w-full p-2 mb-2 h-24 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
                />
                <textarea
                  value={section.css}
                  onChange={(e) => {
                    const newSections = [...sections];
                    newSections[index].css = e.target.value;
                    setSections(newSections);
                  }}
                  className="w-full p-2 mb-2 h-24 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
                />
                <textarea
                  value={section.js}
                  onChange={(e) => {
                    const newSections = [...sections];
                    newSections[index].js = e.target.value;
                    setSections(newSections);
                  }}
                  className="w-full p-2 mb-2 h-24 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
                />
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
            <button onClick={handleSubmit} className="luxury-button">Create Template</button>
          </div>
        );
    }
  };

  const [, drop] = useDrop(() => ({
    accept: ['availableSection', 'section'],
    drop: (item: { type: string; id?: string }, monitor) => {
      if (!monitor.didDrop()) {
        if (item.type === 'section') {
          removeSection(item.id);
        } else {
          addSection(item.type);
        }
      }
    },
  }), [addSection, removeSection]);

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