import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Array<{
    type: string;
    selectedTemplate?: string;
    content?: {
      html: string;
      css: string;
      js: string;
    };
  }>;
  globalCss: string;
  globalJs: string;
}

export default function LivePreviewModal({ isOpen, onClose, template, globalCss, globalJs }: LivePreviewModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-[1500px] bg-[var(--secondary-color)] rounded-lg shadow-xl">
          <div className="flex justify-between items-center p-4 border-b border-[var(--accent-color)]">
            <Dialog.Title className="text-lg font-bold text-[var(--accent-color)]">Live Preview</Dialog.Title>
            <button onClick={onClose} className="text-[var(--text-color)] hover:text-[var(--accent-color)]">
              <X size={24} />
            </button>
          </div>
          <div className="p-4">
            <iframe 
              className="w-full h-[800px] border-2 border-[var(--accent-color)]"
              srcDoc={generatePreviewHTML(template, globalCss, globalJs)}
              title="Template Preview"
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

function generatePreviewHTML(template, globalCss: string, globalJs: string) {
  const sections = template
    .filter(section => section.content)
    .map(section => `
      <style>${section.content?.css || ''}</style>
      ${section.content?.html || ''}
      <script>${section.content?.js || ''}</script>
    `)
    .join('\n');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Template Preview</title>
      <style>${globalCss}</style>
    </head>
    <body class="home">
      ${sections}
      <script>${globalJs}</script>
    </body>
    </html>
  `;
}