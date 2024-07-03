import { parse, HTMLElement, Node, NodeType } from 'node-html-parser';

interface ParsedSection {
  id: string;
  html: string;
  css: string;
  type?: string;
}

interface CSSRule {
  selector: string;
  style: string;
  media?: string;
}

function parseCSS(css: string): CSSRule[] {
    const rules: CSSRule[] = [];
    let currentMedia: string | undefined;
    let currentSelector = '';
    let currentStyle = '';
    let inSelector = true;
    let inComment = false;
    let bracketCount = 0;
    let mediaContent = '';
  
    for (let i = 0; i < css.length; i++) {
      const char = css[i];
      const nextChar = css[i + 1] || '';
  
      if (inComment) {
        if (char === '*' && nextChar === '/') {
          inComment = false;
          i++;
        }
        continue;
      }
  
      if (char === '/' && nextChar === '*') {
        inComment = true;
        i++;
        continue;
      }
  
      if (css.substr(i, 7) === '@import') {
        const importEnd = css.indexOf(';', i);
        rules.push({ selector: css.substring(i, importEnd + 1).trim(), style: '' });
        i = importEnd;
        continue;
      }
  
      if (css.substr(i, 6) === '@media') {
        const mediaEnd = css.indexOf('{', i);
        currentMedia = css.substring(i, mediaEnd).trim();
        i = mediaEnd;
        bracketCount++;
        mediaContent = '';
        continue;
      }
  
      if (currentMedia) {
        mediaContent += char;
        if (char === '{') bracketCount++;
        if (char === '}') {
          bracketCount--;
          if (bracketCount === 1) {
            rules.push({ selector: mediaContent.trim(), style: '', media: currentMedia });
            currentMedia = undefined;
            mediaContent = '';
            bracketCount = 0;
          }
        }
      } else if (inSelector) {
        if (char === '{') {
          inSelector = false;
          currentSelector = currentSelector.trim();
          bracketCount++;
        } else {
          currentSelector += char;
        }
      } else {
        if (char === '{') {
          bracketCount++;
        } else if (char === '}') {
          bracketCount--;
          if (bracketCount === 0) {
            rules.push({ selector: currentSelector, style: currentStyle.trim() });
            currentSelector = '';
            currentStyle = '';
            inSelector = true;
          }
        } else {
          currentStyle += char;
        }
      }
    }
  
    console.log('Parsed CSS rules:', rules);
    return rules;
  }

  function extractSelectors(node: HTMLElement): Set<string> {
    const selectors = new Set<string>();
    
    function traverse(el: HTMLElement, parentSelectors: string[] = []) {
      let currentSelectors = [];
      if (el.id) currentSelectors.push(`#${el.id}`);
      
      const classAttr = el.getAttribute('class');
      if (classAttr) {
        const classNames = classAttr.split(/\s+/).filter(Boolean);
        classNames.forEach((className: string) => currentSelectors.push(`.${className}`));
        if (classNames.length > 1) {
          currentSelectors.push(`.${classNames.join('.')}`);
        }
      }
  
      if (el.tagName) {
        currentSelectors.push(el.tagName.toLowerCase());
      }
  
      const fullSelectors = [
        ...currentSelectors,
        ...parentSelectors.map(parent => `${parent} ${currentSelectors.join('')}`),
        ...parentSelectors.map(parent => `${parent}>${currentSelectors.join('')}`)
      ];
  
      fullSelectors.forEach(selector => selectors.add(selector));
  
      el.childNodes.forEach(child => {
        if (child.nodeType === NodeType.ELEMENT_NODE) {
          traverse(child as HTMLElement, [...parentSelectors, ...fullSelectors]);
        }
      });
    }
    
    traverse(node);
    return selectors;
  }
  
  function selectorMatches(selector: string, elementSelectors: Set<string>): boolean {
    // Remove 'body.home' prefix if present
    const cleanSelector = selector.replace(/^body\.home\s+/, '');
    const parts = cleanSelector.split(/\s+/);
  
    // Check if all parts of the selector match
    return parts.every((part, index) => {
      const simplePart = part.replace(/:[a-zA-Z-]+/g, '').replace(/\[.*?\]/g, '');
      if (index === parts.length - 1) {
        // Last part should match exactly
        return Array.from(elementSelectors).some(el => el === simplePart || el.endsWith(` ${simplePart}`));
      } else {
        // Other parts should be included in the path
        return Array.from(elementSelectors).some(el => el.includes(simplePart));
      }
    });
  }

  function extractMediaQuerySelectors(rule: string): string[] {
    const selectorRegex = /([^{},]+)(?={)/g;  // Match multiple comma-separated selectors
    const selectors: string[] = [];
    let match;
  
    while ((match = selectorRegex.exec(rule)) !== null) {
      const extractedSelectors = match[1].split(',');
  
      for (const selector of extractedSelectors) {
        const cleanSelector = selector.trim().replace(/^body\.home\s+/, '');
        selectors.push(cleanSelector);
      }
    }
    
    return selectors;
  }
  
  export function parseCSSAndMatchSections(html: string, css: string): ParsedSection[] {
    console.log('parseCSSAndMatchSections called');
    try {
      const root = parse(html);
      const sections = root.querySelectorAll('section, div[id]');
      console.log('Number of sections found:', sections.length);
  
      const cssRules = parseCSS(css);
      console.log('Number of CSS rules parsed:', cssRules.length);
  
      const result = sections.map((section, index) => {
        try {
          const sectionId = `section-${index + 1}-${Date.now().toString(36) + Math.random().toString(36).substr(2, 5)}`;
          console.log(`Processing section ${sectionId}`);
          const elementSelectors = extractSelectors(section);
  
          const relevantRules = cssRules.filter(rule => {
            if (rule.selector.startsWith('@') || rule.selector === ':root' || rule.selector.includes('*')) {
              return true; // Always include global styles
            }
            if (rule.media) {
              const mediaSelectors = extractMediaQuerySelectors(rule.selector);
              return mediaSelectors.some(selector => selectorMatches(selector, elementSelectors));
            }
            return selectorMatches(rule.selector, elementSelectors);
          });
  
          const sectionCss = relevantRules.map(rule => {
            if (rule.media) {
              return `${rule.media} {\n${rule.selector}\n}`;
            }
            return `${rule.selector} { ${rule.style} }`;
          }).join('\n\n');
  
          console.log(`CSS rules matched for section ${index + 1}:`, relevantRules.length);
  
          return {
            id: sectionId,
            html: section.outerHTML,
            css: sectionCss,
            type: section.tagName.toLowerCase()
          };
        } catch (error) {
          console.error(`Error processing section ${index}:`, error);
          return null;
        }
      }).filter(Boolean);
  
      console.log('Number of sections returned:', result.length);
      return result;
    } catch (error) {
      console.error('Error in parseCSSAndMatchSections:', error);
      return [];
    }
  }