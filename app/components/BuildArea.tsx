'use client'

import { useDrop, useDrag } from 'react-dnd'
import { useRef, useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import TemplateSelectorModal from './TemplateSelectorModal'

interface BuildAreaProps {
  template: string[]
  addToTemplate: (item: string) => void
  reorderTemplate: (dragIndex: number, hoverIndex: number) => void
  updateTemplateItem: (index: number, newTemplate: string) => void
}

interface DragItem {
  index: number
  id: string
  type: string
}

function TemplateItem({ item, index, reorderTemplate, templateLength, updateTemplateItem }: { 
  item: string, 
  index: number, 
  reorderTemplate: (dragIndex: number, hoverIndex: number) => void,
  templateLength: number,
  updateTemplateItem: (index: number, newTemplate: string) => void
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

  const [{ isDragging }, drag] = useDrag({
    type: 'templateItem',
    item: () => {
      return { id: item, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0.4 : 1
  drag(drop(ref))

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
        style={{ opacity }} 
        className="luxury-panel p-4 transition-all group relative cursor-pointer" 
        data-handler-id={handlerId}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center">
          <span className="mr-3 text-2xl cursor-move text-[var(--accent-color)]">☰</span>
          <div>
            <h3 className="text-lg font-semibold">{item}</h3>
            <p className="text-sm text-gray-400">Click to select template</p>
          </div>
        </div>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); moveItem('up'); }}
            className="p-1 hover:bg-[var(--secondary-color)] rounded"
            disabled={index === 0}
          >
            <ChevronUp size={20} className="text-[var(--accent-color)]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); moveItem('down'); }}
            className="p-1 hover:bg-[var(--secondary-color)] rounded"
            disabled={index === templateLength - 1}
          >
            <ChevronDown size={20} className="text-[var(--accent-color)]" />
          </button>
        </div>
      </div>
      <TemplateSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sectionType={item}
        onSelectTemplate={(template) => updateTemplateItem(index, `${item} - ${template}`)}
      />
    </>
  )
}

export default function BuildArea({ template, addToTemplate, reorderTemplate, updateTemplateItem }: BuildAreaProps) {
  const [, drop] = useDrop(() => ({
    accept: 'option',
    drop: (item: { name: string }) => addToTemplate(item.name),
  }))

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
          />
        ))}
        {template.length === 0 && (
          <p className="text-center text-gray-500 mt-8">Drag items here to build your template</p>
        )}
      </div>
    </div>
  )
}