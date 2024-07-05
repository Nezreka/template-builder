// app/components/ParseTemplateModal.tsx
'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Trash2 } from 'lucide-react';
import { parse, HTMLElement } from 'node-html-parser';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ParseTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParse: (sections: ParsedSection[], name: string) => void;
}

interface ParsedSection {
    id: string;
    html: string;
    css: string;
    editableCss: string;
    js: string;  // Add this line
    type: string;
  }

const allSectionTypes = [
  'Hero', 'About Team', 'Featured Listings', 'Featured Neighborhoods',
  'Our Stats', 'Latest Blogs', 'Buy a home CTA', 'Sell a home CTA',
  'Home worth CTA', 'Contact information / form', 'Combined CTA',
  'Social Feeds', 'Action Bar', 'Lifestyles', 'Latest Listings'
];

export default function ParseTemplateModal({ isOpen, onClose, onParse }: ParseTemplateModalProps) {
  const [templateName, setTemplateName] = useState('');
  const [htmlInput, setHtmlInput] = useState('');
  const [parsedSections, setParsedSections] = useState<ParsedSection[]>([]);
  const [stage, setStage] = useState<'input' | 'sections'>('input');

  const usedSectionTypes = useMemo(() => {
    return new Set(parsedSections.map(section => section.type).filter(Boolean));
  }, [parsedSections]);

  const availableSectionTypes = useMemo(() => {
    return allSectionTypes.filter(type => !usedSectionTypes.has(type));
  }, [usedSectionTypes]);

  const parseHTML = () => {
    const root = parse(htmlInput);
    const newSections: ParsedSection[] = [];
    
    root.childNodes.forEach((node: any) => {
      if (node.nodeType === 1) { // Element node
        newSections.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          html: node.outerHTML,
          css: '',
          editableCss: '',
          js: '',  // Add this line
          type: ''
        });
      }
    });
  
    setParsedSections(newSections);
    setStage('sections');
  };

  const getAvailableSectionTypes = (currentSectionId: string) => {
    const currentSection = parsedSections.find(section => section.id === currentSectionId);
    return currentSection && currentSection.type
      ? [currentSection.type, ...availableSectionTypes]
      : availableSectionTypes;
  };

  const handleSectionTypeChange = (id: string, newType: string) => {
    setParsedSections(prevSections =>
      prevSections.map(section =>
        section.id === id ? { ...section, type: newType } : section
      )
    );
  };

  const handleSectionCssChange = (id: string, newCss: string) => {
    setParsedSections(prevSections =>
      prevSections.map(section =>
        section.id === id ? { ...section, css: newCss, editableCss: newCss } : section
      )
    );
  };

  const handleRemoveSection = (id: string) => {
    setParsedSections(prevSections => prevSections.filter(section => section.id !== id));
  };

  const handleConfirm = () => {
    onParse(parsedSections, templateName);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="luxury-panel w-full max-w-6xl p-6 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-2xl font-bold mb-6 text-[var(--accent-color)]">
            Parse Template (Stage: {stage})
          </Dialog.Title>
          
          {stage === 'input' ? (
            <>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template Name"
                className="w-full p-2 mb-4 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
              />
              <textarea
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                placeholder="Paste your HTML here"
                className="w-full p-2 mb-4 h-48 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
              />
              <button onClick={parseHTML} className="luxury-button">Parse HTML</button>
            </>
          ) : (
            <>
              <h3 className="text-lg mb-2 text-[var(--accent-color)]">Parsed Sections</h3>
              <div className="space-y-4 mb-4">
                {parsedSections.map((section, index) => (
                  <div key={section.id} className="p-4 luxury-panel">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-md text-[var(--accent-color)]">Section {index + 1}</h4>
                      <div className="flex items-center">
                        <select
                          value={section.type || ''}
                          onChange={(e) => handleSectionTypeChange(section.id, e.target.value)}
                          className="mr-2 p-2 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
                        >
                          <option value="" disabled>Select section type</option>
                          {getAvailableSectionTypes(section.id).map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleRemoveSection(section.id)}
                          className="p-1 rounded-full hover:bg-[var(--secondary-color)]"
                        >
                          <Trash2 size={20} className="text-[var(--accent-color)]" />
                        </button>
                      </div>
                    </div>
                    <ReactMarkdown
                      components={{
                        code({node, inline, className, children, ...props}) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline && match ? (
                            <SyntaxHighlighter
                              {...props}
                              children={String(children).replace(/\n$/, '')}
                              style={tomorrow}
                              language={match[1]}
                              PreTag="div"
                            />
                          ) : (
                            <code {...props} className={className}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    >
                      {`\`\`\`html\n${section.html}\n\`\`\``}
                    </ReactMarkdown>
                    <textarea
                      value={section.editableCss}
                      onChange={(e) => handleSectionCssChange(section.id, e.target.value)}
                      placeholder="Enter CSS for this section"
                      className="w-full p-2 mt-2 h-24 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
                    />
                  </div>
                ))}
              </div>
              <button onClick={handleConfirm} className="luxury-button">Confirm and Close</button>
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