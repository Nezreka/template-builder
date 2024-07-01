'use client'

import React from 'react'
import { X } from 'lucide-react'

interface TemplateSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  sectionType: string
  onSelectTemplate: (template: string) => void
}

const templates: Record<string, string[]> = {
  'Hero': ['Modern Hero', 'Classic Hero', 'Video Background Hero'],
  'About Team': ['Grid Layout', 'Carousel', 'Individual Profiles'],
  'Featured Listings': ['Card Grid', 'Slider', 'Map View'],
  'Featured Neighborhoods': ['Image Gallery', 'List View', 'Interactive Map'],
  'Our Stats': ['Infographic', 'Counter', 'Chart View'],
  'Latest Blogs': ['Blog Grid', 'List with Thumbnails', 'Featured Article'],
  'Buy a home CTA': ['Full Width Banner', 'Floating Card', 'Split Screen'],
  'Sell a home CTA': ['Image Background', 'Testimonial Highlight', 'Step Process'],
  'Home worth CTA': ['Calculator Widget', 'Form with Image', 'Pop-up Modal'],
  'Contact information / form': ['Simple Form', 'Two Column Layout', 'Map Integration']
}

export default function TemplateSelectorModal({ isOpen, onClose, sectionType, onSelectTemplate }: TemplateSelectorModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="luxury-panel bg-[var(--bg-color)] p-8 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--accent-color)]">{sectionType} Templates</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[var(--secondary-color)]">
            <X size={24} className="text-[var(--accent-color)]" />
          </button>
        </div>
        <div className="space-y-3">
          {templates[sectionType]?.map((template, index) => (
            <button
              key={index}
              onClick={() => {
                onSelectTemplate(template)
                onClose()
              }}
              className="luxury-panel w-full text-left p-4 rounded transition-all hover:scale-105"
            >
              {template}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}