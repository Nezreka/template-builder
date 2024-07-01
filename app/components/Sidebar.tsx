'use client'

import { useDrag } from 'react-dnd'
import { useRef } from 'react'

const options = [
  'Hero', 'About Team', 'Featured Listings', 'Featured Neighborhoods',
  'Our Stats', 'Latest Blogs', 'Buy a home CTA', 'Sell a home CTA',
  'Home worth CTA', 'Contact information / form', 'Combined CTA'  // Added 'Combined CTA'
];

function DraggableOption({ name }: { name: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'option',
    item: { name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

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

export default function Sidebar() {
  return (
    <div className="luxury-panel w-80 p-6 mr-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-[var(--accent-color)]">Options</h2>
      <div className="space-y-4">
        {options.map((option) => (
          <DraggableOption key={option} name={option} />
        ))}
      </div>
    </div>
  )
}