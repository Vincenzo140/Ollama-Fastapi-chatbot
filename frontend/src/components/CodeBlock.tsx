import { useState, ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  className?: string;
  children?: ReactNode;
}

/** Renders a <pre><code> block with a copy-to-clipboard button. */
export function CodeBlock({ className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = typeof children === 'string' ? children : (children as any)?.props?.children ?? '';
    await navigator.clipboard.writeText(String(text));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative group my-2">
      <button
        onClick={copy}
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700/80 hover:bg-gray-600 rounded p-1.5"
        aria-label="Copiar código"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
      <pre className={`${className ?? ''} overflow-x-auto rounded-lg bg-gray-950/80 p-4 text-sm`}>
        {children}
      </pre>
    </div>
  );
}
