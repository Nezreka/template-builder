'use client'

import { useDrop, useDrag } from 'react-dnd'
import { useRef, useState } from 'react'
import { ChevronUp, ChevronDown, X } from 'lucide-react'
import TemplateSelectorModal from './TemplateSelectorModal'

interface BuildAreaProps {
  template: string[]
  addToTemplate: (item: string) => void
  removeFromTemplate: (item: string) => void
  reorderTemplate: (dragIndex: number, hoverIndex: number) => void
  updateTemplateItem: (index: number, newTemplate: string) => void
}

interface DragItem {
  index: number
  id: string
  type: string
}

function TemplateItem({ item, index, reorderTemplate, templateLength, updateTemplateItem, removeFromTemplate }: { 
  item: string, 
  index: number, 
  reorderTemplate: (dragIndex: number, hoverIndex: number) => void,
  templateLength: number,
  updateTemplateItem: (index: number, newTemplate: string) => void,
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
      return { id: item, index, type: 'templateItem' }
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

  const opacity = isDragging ? 0.4 : 1
  drag(drop(ref))

  const moveItem = (direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex >= 0 && newIndex < templateLength) {
      reorderTemplate(index, newIndex)
    }
  }

  const handleSelectTemplate = (newTemplate: string) => {
    updateTemplateItem(index, newTemplate)
    setIsModalOpen(false)
  }

  return (
    <>
      <div 
        ref={ref} 
        style={{ opacity }} 
        className="luxury-panel p-4 transition-all group relative cursor-move" 
        data-handler-id={handlerId}
        onClick={() => setIsModalOpen(true)}  // Add this line
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-3 text-2xl text-[var(--accent-color)]">☰</span>
            <div>
              <h3 className="text-lg font-semibold">{item}</h3>
              <p className="text-sm text-gray-400">Click to select template</p>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={(e) => { e.stopPropagation(); moveItem('up'); }}
              className="p-1 hover:bg-[var(--secondary-color)] rounded mr-1"
              disabled={index === 0}
            >
              <ChevronUp size={20} className="text-[var(--accent-color)]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); moveItem('down'); }}
              className="p-1 hover:bg-[var(--secondary-color)] rounded mr-1"
              disabled={index === templateLength - 1}
            >
              <ChevronDown size={20} className="text-[var(--accent-color)]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); removeFromTemplate(item); }}
              className="p-1 hover:bg-[var(--secondary-color)] rounded"
            >
              <X size={20} className="text-[var(--accent-color)]" />
            </button>
          </div>
        </div>
      </div>
      <TemplateSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sectionType={item}
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
      <h2 className="text-3xl font-bold mb-6 text-center text-[var(--accent-color)]">Template Builder</h2>
      <div className="luxury-panel bg-[var(--secondary-color)] p-6 flex-1 overflow-y-auto space-y-4">
        {template.map((item, index) => (
          <TemplateItem 
            key={item + index} 
            item={item} 
            index={index} 
            reorderTemplate={reorderTemplate} 
            templateLength={template.length}
            updateTemplateItem={updateTemplateItem}
            removeFromTemplate={removeFromTemplate}
          />
        ))}
        {template.length === 0 && (
          <p className="text-center text-gray-500 mt-8">Drag items here to build your template</p>
        )}
      </div>
    </div>
  )
}