// app/components/ParseTemplateModal.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Trash2 } from 'lucide-react';
import { parse, HTMLElement } from 'node-html-parser';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { parseCSSAndMatchSections } from '../helpers/cssParser';

interface ParseTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParse: (sections: ParsedSection[], name: string, css: string, js: string) => void;
}

interface ParsedSection {
    id: string;
    html: string;
    css: string;
    type?: string; // Make type optional
  }

const sectionTypes = [
  'Hero', 'About Team', 'Featured Listings', 'Featured Neighborhoods',
  'Our Stats', 'Latest Blogs', 'Buy a home CTA', 'Sell a home CTA',
  'Home worth CTA', 'Contact information / form', 'Combined CTA',
  'Social Feeds', 'Action Bar', 'Lifestyles', 'Latest Listings'
];



export default function ParseTemplateModal({ isOpen, onClose, onParse }: ParseTemplateModalProps) {
  const [templateName, setTemplateName] = useState('');
  const [htmlInput, setHtmlInput] = useState('');
  const [cssInput, setCssInput] = useState('');
  const [jsInput, setJsInput] = useState('');
  const [parsedSections, setParsedSections] = useState<ParsedSection[]>([]);
  const [stage, setStage] = useState<'input' | 'html' | 'css'>('input');

  useEffect(() => {
    console.log('Component mounted or updated');
    console.log('Current stage:', stage);
    console.log('Parsed sections:', parsedSections);
  }, [stage, parsedSections]);

  const parseHTML = () => {
    console.log('parseHTML function called');
    console.log('HTML input:', htmlInput);

    const root = parse(htmlInput);
    console.log('Parsed root:', root);

    const container = root;
    console.log('Container element:', container);
    
    const newSections: ParsedSection[] = [];
    container.childNodes.forEach((node: any, index: number) => {
      console.log(`Processing node ${index}:`, node);
      if (node.nodeType === 1) { // Element node
        newSections.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          html: node.outerHTML,
          css: '',
          type: ''
        });
      }
    });

    console.log('New sections:', newSections);
    setParsedSections(newSections);
    setStage('html');
    console.log('Stage set to:', 'html');
  };

  const parseCSS = () => {
    console.log('parseCSS function called');
    try {
      console.log('HTML input:', htmlInput);
      console.log('CSS input:', cssInput);
      
      if (!htmlInput || !cssInput) {
        console.warn('HTML or CSS input is empty or undefined');
        return;
      }
  
      console.log('Calling parseCSSAndMatchSections');
      const parsedSections = parseCSSAndMatchSections(htmlInput, cssInput);
      console.log('Parsed sections:', parsedSections);
      
      if (parsedSections.length === 0) {
        console.warn('No sections parsed');
        return;
      }
  
      setParsedSections(parsedSections);
      setStage('css');
      console.log('Stage set to:', 'css');
    } catch (error) {
      console.error('Error in parseCSS:', error);
    }
  };

  const handleSectionHtmlChange = (id: string, newHtml: string) => {
    console.log('handleSectionHtmlChange called for section:', id);
    console.log('New HTML:', newHtml);
    setParsedSections(prevSections =>
      prevSections.map(section =>
        section.id === id ? { ...section, html: newHtml } : section
      )
    );
  };

  const handleSectionTypeChange = (id: string, newType: string) => {
    console.log('handleSectionTypeChange called for section:', id);
    console.log('New type:', newType);
    setParsedSections(prevSections => {
      return prevSections.map(section =>
        section.id === id ? { ...section, type: newType } : section
      );
    });
  };

  const getAvailableSectionTypes = (currentSectionId: string) => {
    const usedTypes = new Set(parsedSections.filter(s => s.id !== currentSectionId && s.type !== '').map(s => s.type));
    return sectionTypes.filter(type => !usedTypes.has(type));
  };

  const handleRemoveSection = (id: string) => {
    console.log('handleRemoveSection called for section:', id);
    setParsedSections(prevSections => prevSections.filter(section => section.id !== id));
  };

  const handleConfirm = () => {
    console.log('handleConfirm called');
    console.log('Parsed sections:', parsedSections);
    console.log('Template name:', templateName);
    
    // Combine CSS from all sections
    const combinedCss = parsedSections.map(section => section.css).join('\n\n');
    
    console.log('Combined CSS:', combinedCss);
    console.log('JS input:', jsInput);
    onParse(parsedSections, templateName, combinedCss, jsInput);
    onClose();
  };

  const renderStageContent = () => {
    console.log('Rendering stage:', stage);
    try {
      switch (stage) {
        case 'input':
          return (
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
              <textarea
                value={cssInput}
                onChange={(e) => setCssInput(e.target.value)}
                placeholder="Paste your CSS here"
                className="w-full p-2 mb-4 h-48 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
              />
              <textarea
                value={jsInput}
                onChange={(e) => setJsInput(e.target.value)}
                placeholder="Paste your JS here"
                className="w-full p-2 mb-4 h-48 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
              />
              <button 
                onClick={() => {
                  console.log('Parse HTML button clicked');
                  parseHTML();
                }} 
                className="luxury-button"
              >
                Parse HTML
              </button>
            </>
          );
        case 'html':
          return (
            <>
              <h3 className="text-lg mb-2 text-[var(--accent-color)]">Parsed HTML Sections</h3>
              <div className="space-y-4 mb-4">
                {parsedSections.map((section, index) => (
                  <div key={section.id} className="p-4 luxury-panel">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-md text-[var(--accent-color)]">Section {index + 1}</h4>
                      <div className="flex items-center">
                        <select
                          value={section.type}
                          onChange={(e) => handleSectionTypeChange(section.id, e.target.value)}
                          className="mr-2 p-2 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
                        >
                          <option value="">Select section type</option>
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
                  </div>
                ))}
              </div>
              <button onClick={parseCSS} className="luxury-button">Parse CSS</button>
            </>
          );
          case 'css':
            return (
              <>
                <h3 className="text-lg mb-2 text-[var(--accent-color)]">Parsed Sections with CSS</h3>
                <div className="space-y-4 mb-4">
                  {parsedSections.map((section, index) => (
                    <div key={section.id} className="p-4 luxury-panel">
                      <h4 className="text-md mb-2 text-[var(--accent-color)]">Section {index + 1} - {section.type || 'Unspecified Type'}</h4>
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
                        {`\`\`\`css\n${section.css}\n\`\`\``}
                      </ReactMarkdown>
                    </div>
                  ))}
                </div>
                <button onClick={handleConfirm} className="luxury-button">Confirm and Close</button>
              </>
            );
          default:
            return null;
        }
      } catch (error) {
        console.error('Error in renderStageContent:', error);
        return <div>An error occurred while rendering the content. Please check the console for details.</div>;
      }
    };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="luxury-panel w-full max-w-6xl p-6 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-2xl font-bold mb-6 text-[var(--accent-color)]">
            Parse Template (Stage: {stage})
          </Dialog.Title>
          
          {renderStageContent()}

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