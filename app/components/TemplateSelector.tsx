import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface Template {
  id: string;
  name: string;
}

interface TemplateSelectorProps {
  onSelect: (template: Template) => void;
  onClose: () => void;
  isLoading?: boolean; 
}

export default function TemplateSelector({
  onSelect,
  onClose,
  isLoading = false, 
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchTemplates();
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates");
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`w-full max-w-4xl p-6 transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <h2 className="text-2xl font-bold mb-6 text-[var(--accent-color)]">
        Select a Template
      </h2>
  
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-color)]" />
        </div>
      ) : (
        <>
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 bg-[var(--secondary-color)] border border-[var(--accent-color)] rounded text-[var(--text-color)]"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--accent-color)]"
              size={20}
            />
          </div>
  
          <div className="grid grid-cols-3 gap-4 h-[400px] overflow-y-auto">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => onSelect(template)}
                className="bg-[var(--secondary-color)] p-4 rounded cursor-pointer hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] transition-colors duration-200 flex items-center justify-center"
              >
                <h3 className="text-lg font-semibold text-center truncate">
                  {template.name}
                </h3>
              </div>
            ))}
          </div>
  
          {filteredTemplates.length === 0 && (
            <p className="text-center text-gray-400 mt-6">No templates found</p>
          )}
        </>
      )}
    </div>
  );
}