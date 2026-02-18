import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renders text with inline LaTeX ($...$) and display LaTeX ($$...$$).
 * Also renders newlines as <br>.
 * Usage: <LatexRenderer text="Solve $x^2 + 1 = 0$" />
 */
const LatexRenderer = ({ text, className = '' }) => {
  const html = useMemo(() => {
    if (!text) return '';
    try {
      // Process display math ($$...$$) first, then inline math ($...$)
      let result = text;

      // Replace display math $$...$$ 
      result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
        try {
          return katex.renderToString(math.trim(), {
            displayMode: true,
            throwOnError: false,
            trust: true,
          });
        } catch {
          return `<span class="text-red-500">[LaTeX error: ${math}]</span>`;
        }
      });

      // Replace inline math $...$  (but not already-processed katex spans)
      result = result.replace(/(?<!\$)\$(?!\$)((?:[^$\\]|\\.)+?)\$/g, (_, math) => {
        try {
          return katex.renderToString(math.trim(), {
            displayMode: false,
            throwOnError: false,
            trust: true,
          });
        } catch {
          return `<span class="text-red-500">[LaTeX error: ${math}]</span>`;
        }
      });

      // Convert newlines to <br>
      result = result.replace(/\n/g, '<br/>');

      return result;
    } catch {
      return text;
    }
  }, [text]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default LatexRenderer;
