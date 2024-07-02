'use client'

import { useDrag } from 'react-dnd'
import { useRef } from 'react'

function DraggableOption({ name, addToTemplate }: { name: string, addToTemplate: (item: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'option',
    item: { name, type: 'option' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult()
      if (item && dropResult) {
        addToTemplate(item.name)
      }
    },
  }), [name, addToTemplate])

  drag(ref)

  return (
    <div
      ref={ref}
      className={`luxury-panel p-3 m-3 cursor-move transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {name}
    </div>
  )
}

export default function Sidebar({ availableOptions, addToTemplate }: { availableOptions: string[], addToTemplate: (item: string) => void }) {
  return (
    <div className="luxury-panel w-80 p-6 mr-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-[var(--accent-color)]">Options</h2>
      <div className="space-y-4">
        {availableOptions.map((option) => (
          <DraggableOption 
            key={option} 
            name={option} 
            addToTemplate={addToTemplate}
          />
        ))}
      </div>
    </div>
  )
}