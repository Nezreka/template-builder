'use client'

import { useDrop, useDrag } from 'react-dnd'
import { useRef, useState } from 'react'
import { ChevronUp, ChevronDown, X, Crown } from 'lucide-react'
import TemplateSelectorModal from './TemplateSelectorModal'

interface BuildAreaProps {
  template: SectionData[]
  addToTemplate: (item: string) => void
  removeFromTemplate: (item: string) => void
  reorderTemplate: (dragIndex: number, hoverIndex: number) => void
  updateTemplateItem: (index: number, templateName: string, templateContent: { html: string, css: string, js: string }) => void
}

interface DragItem {
  index: number
  id: string
  type: string
}

interface SectionData {
  type: string
  selectedTemplate?: string
  content?: {
    html: string
    css: string
    js: string
  }
}

function TemplateItem({ item, index, reorderTemplate, templateLength, updateTemplateItem, removeFromTemplate }: { 
  item: SectionData, 
  index: number, 
  reorderTemplate: (dragIndex: number, hoverIndex: number) => void,
  templateLength: number,
  updateTemplateItem: (index: number, templateName: string, templateContent: { html: string, css: string, js: string }) => void,
  removeFromTemplate: (item: string) => void
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [{ handlerId }, drop] = useDrop({
    accept: 'templateItem',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) {
        return
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      reorderTemplate(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'templateItem',
    item: () => {
      return { id: item.type, index, type: 'templateItem' }
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult()
      if (!dropResult) {
        removeFromTemplate(item.id)
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [item, index, removeFromTemplate])

  drag(drop(ref))

  const handleSelectTemplate = (templateName: string, templateContent: { html: string, css: string, js: string }) => {
    updateTemplateItem(index, templateName, templateContent)
    setIsModalOpen(false)
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const moveItem = (direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex >= 0 && newIndex < templateLength) {
      reorderTemplate(index, newIndex)
    }
  }

  return (
    <>
      <div 
        ref={ref} 
        style={{ opacity: isDragging ? 0.4 : 1 }} 
        className="luxury-panel p-6 transition-all group relative cursor-pointer hover:shadow-lg" 
        data-handler-id={handlerId}
        onClick={openModal}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2 text-[var(--accent-color)]">{item.type}</h3>
            {item.selectedTemplate ? (
              <div className="flex items-center">
                <p className="text-lg text-[var(--text-color)]">
                  Selected: <span className="font-semibold">{item.selectedTemplate}</span>
                </p>
                <Crown size={20} className="ml-2 text-[var(--accent-color)]" />
              </div>
            ) : (
              <p className="text-lg text-[var(--text-color)] italic">No template selected</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => { e.stopPropagation(); moveItem('up'); }}
              className="p-2 hover:bg-[var(--secondary-color)] rounded transition-colors"
              disabled={index === 0}
            >
              <ChevronUp size={24} className="text-[var(--accent-color)]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); moveItem('down'); }}
              className="p-2 hover:bg-[var(--secondary-color)] rounded transition-colors"
              disabled={index === templateLength - 1}
            >
              <ChevronDown size={24} className="text-[var(--accent-color)]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); removeFromTemplate(item.type); }}
              className="p-2 hover:bg-red-500 hover:text-white rounded transition-colors"
            >
              <X size={24} className="text-[var(--accent-color)]" />
            </button>
          </div>
        </div>
      </div>
      <TemplateSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sectionType={item.type}
        onSelectTemplate={handleSelectTemplate}
      />
    </>
  )
}

export default function BuildArea({ template, addToTemplate, removeFromTemplate, reorderTemplate, updateTemplateItem }: BuildAreaProps) {
  const [, drop] = useDrop(() => ({
    accept: ['option', 'templateItem'],
    drop: (item: { name: string, type: string }, monitor) => {
      if (item.type === 'option') {
        addToTemplate(item.name)
      }
      return { name: 'BuildArea' }
    },
  }), [addToTemplate])

  return (
    <div ref={drop} className="luxury-panel flex-1 p-8 overflow-hidden flex flex-col">
      <h2 className="text-4xl font-bold mb-8 text-center text-[var(--accent-color)]">Template Builder</h2>
      <div className="luxury-panel bg-[var(--secondary-color)] p-6 flex-1 overflow-y-auto space-y-6">
        {template.map((item, index) => (
          <TemplateItem 
            key={item.type + index} 
            item={item}
            index={index} 
            reorderTemplate={reorderTemplate} 
            templateLength={template.length}
            updateTemplateItem={updateTemplateItem}
            removeFromTemplate={removeFromTemplate}
          />
        ))}
        {template.length === 0 && (
          <p className="text-center text-xl text-gray-500 mt-8">Drag items here to build your template</p>
        )}
      </div>
    </div>
  )
}