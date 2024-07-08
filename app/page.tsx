'use client'

import { useState, useCallback } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Sidebar from './components/Sidebar'
import BuildArea from './components/BuildArea'
import TemplateModal from './components/TemplateModal'

const allOptions = [
  'Hero', 'About Team', 'Featured Listings', 'Featured Neighborhoods',
  'Our Stats', 'Latest Blogs', 'Buy a home CTA', 'Sell a home CTA',
  'Home worth CTA', 'Contact information / form', 'Combined CTA',
  'Social Feeds', 'Action Bar', 'Lifestyles', 'Latest Listings'
];

interface SectionData {
  type: string
  selectedTemplate?: string
  content?: {
    html: string
    css: string
    js: string
  }
}

export default function Home() {
  const [template, setTemplate] = useState<SectionData[]>([])
  const [availableOptions, setAvailableOptions] = useState<string[]>(allOptions)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')

  const addToTemplate = useCallback((item: string) => {
    setTemplate(prevTemplate => {
      if (!prevTemplate.some(section => section.type === item)) {
        return [...prevTemplate, { type: item }]
      }
      return prevTemplate
    })
    setAvailableOptions(prevOptions => prevOptions.filter(option => option !== item))
  }, [])

  const removeFromTemplate = useCallback((item: string) => {
    setTemplate(prevTemplate => prevTemplate.filter(section => section.type !== item))
    setAvailableOptions(prevOptions => {
      if (!prevOptions.includes(item)) {
        return [...prevOptions, item]
      }
      return prevOptions
    })
  }, [])

  const reorderTemplate = useCallback((dragIndex: number, hoverIndex: number) => {
    setTemplate(prevTemplate => {
      const updatedTemplate = [...prevTemplate]
      const [reorderedItem] = updatedTemplate.splice(dragIndex, 1)
      updatedTemplate.splice(hoverIndex, 0, reorderedItem)
      return updatedTemplate
    })
  }, [])

  const updateTemplateItem = useCallback((index: number, templateName: string, templateContent: { html: string, css: string, js: string }) => {
    setTemplate(prevTemplate => {
      const updatedTemplate = [...prevTemplate]
      updatedTemplate[index] = {
        ...updatedTemplate[index],
        selectedTemplate: templateName,
        content: templateContent
      }
      return updatedTemplate
    })
  }, [])

  const openAddModal = useCallback(() => {
    setModalMode('add')
    setIsModalOpen(true)
  }, [])

  const openEditModal = useCallback(() => {
    setModalMode('edit')
    setIsModalOpen(true)
  }, [])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen bg-[var(--bg-color)] text-[var(--text-color)] p-8">
        <div className="mb-4 flex">
          <button 
            onClick={openAddModal}
            className="luxury-button mr-2"
          >
            Add New Template
          </button>
          <button 
            onClick={openEditModal}
            className="luxury-button"
          >
            Edit Template
          </button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <Sidebar 
            availableOptions={availableOptions}
            addToTemplate={addToTemplate}
          />
          <BuildArea 
            template={template} 
            addToTemplate={addToTemplate} 
            removeFromTemplate={removeFromTemplate}
            reorderTemplate={reorderTemplate}
            updateTemplateItem={updateTemplateItem}
          />
        </div>
        <TemplateModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mode={modalMode}
        />
      </div>
    </DndProvider>
  )
}