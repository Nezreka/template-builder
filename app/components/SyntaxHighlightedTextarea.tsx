import React, { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';

interface SyntaxHighlightedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

const SyntaxHighlightedTextarea: React.FC<SyntaxHighlightedTextareaProps> = ({ value, onChange, language }) => {
  const [highlightedCode, setHighlightedCode] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    updateHighlightedCode(value);
  }, [value, language]);

  const updateHighlightedCode = (text: string) => {
    if (typeof text !== 'string') {
      console.error('Invalid input: text is not a string', text);
      text = String(text); // Convert to string if it's not already
    }

    if (text[text.length - 1] === "\n") {
      text += " ";
    }

    try {
      const highlighted = Prism.highlight(
        text,
        Prism.languages[language] || Prism.languages.plain,
        language
      );
      setHighlightedCode(highlighted);
    } catch (error) {
      console.error('Error highlighting code:', error);
      setHighlightedCode(text); // Fallback to plain text if highlighting fails
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    updateHighlightedCode(newValue);
  };

  const syncScroll = () => {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newValue = value.substring(0, start) + "\t" + value.substring(end);
      onChange(newValue);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 1;
      }, 0);
    }
  };

  return (
    <div className="syntax-highlight-wrapper" style={{ position: 'relative', height: '200px', marginBottom: '1rem' }}>
      <textarea
        ref={textareaRef}
        value={value || ''} // Ensure value is always a string
        onChange={handleChange}
        onScroll={syncScroll}
        onKeyDown={handleTab}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          resize: 'none',
          color: 'transparent',
          background: 'transparent',
          caretColor: 'white',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          padding: '10px',
          border: '1px solid var(--accent-color)',
          borderRadius: '4px',
          zIndex: 1,
        }}
      />
      <pre
        ref={preRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          margin: 0,
          padding: '10px',
          overflow: 'auto',
          pointerEvents: 'none',
          background: 'var(--secondary-color)',
          color: 'var(--text-color)',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          border: '1px solid var(--accent-color)',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }}
      >
        <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      </pre>
    </div>
  );
};

export default SyntaxHighlightedTextarea;