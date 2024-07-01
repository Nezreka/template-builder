'use client'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import BuildArea from './components/BuildArea'
import TemplateModal from './components/TemplateModal'

export default function Home() {
  const [template, setTemplate] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>()

  const addToTemplate = (item: string) => {
    setTemplate(prevTemplate => [...prevTemplate, item])
  }

  const reorderTemplate = (dragIndex: number, hoverIndex: number) => {
    setTemplate(prevTemplate => {
      const updatedTemplate = [...prevTemplate]
      const [reorderedItem] = updatedTemplate.splice(dragIndex, 1)
      updatedTemplate.splice(hoverIndex, 0, reorderedItem)
      return updatedTemplate
    })
  }

  const updateTemplateItem = (index: number, newTemplate: string) => {
    setTemplate(prevTemplate => {
      const updatedTemplate = [...prevTemplate]
      updatedTemplate[index] = newTemplate
      return updatedTemplate
    })
  }

  const openAddModal = () => {
    setModalMode('add')
    setSelectedTemplateId(undefined)
    setIsModalOpen(true)
  }

  const openEditModal = (templateId: string) => {
    setModalMode('edit')
    setSelectedTemplateId(templateId)
    setIsModalOpen(true)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-screen bg-[var(--bg-color)] text-[var(--text-color)] p-8">
        <div className="mb-4">
          <button 
            onClick={openAddModal}
            className="luxury-button"
          >
            Add New Template
          </button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <BuildArea 
            template={template} 
            addToTemplate={addToTemplate} 
            reorderTemplate={reorderTemplate}
            updateTemplateItem={updateTemplateItem}
          />
        </div>
        <TemplateModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mode={modalMode}
          templateId={selectedTemplateId}
        />
      </div>
    </DndProvider>
  )
}