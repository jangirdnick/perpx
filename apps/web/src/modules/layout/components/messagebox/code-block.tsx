'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon, Tick02Icon, CodeIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

interface CodeBlockProps {
  language: string;
  value: string;
}

// Custom sleek Dark Theme for VS Code / Perplexity inspiration aesthetic
const customDarkTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: '#e4e4e7',
    background: 'none',
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '13.5px',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.65',
  },
  'pre[class*="language-"]': {
    color: '#e4e4e7',
    background: 'transparent',
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '13.5px',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.65',
    padding: '1.25rem 1rem',
    margin: '0',
    overflowX: 'auto',
    maxWidth: '100%',
  },
  comment: { color: '#71717a', fontStyle: 'italic' },
  prolog: { color: '#71717a' },
  doctype: { color: '#71717a' },
  cdata: { color: '#71717a' },
  punctuation: { color: '#a1a1aa' },
  property: { color: '#93c5fd' },
  tag: { color: '#f472b6' },
  boolean: { color: '#f97316' },
  number: { color: '#fb923c' },
  constant: { color: '#fb923c' },
  symbol: { color: '#fb923c' },
  deleted: { color: '#f87171' },
  selector: { color: '#4ade80' },
  'attr-name': { color: '#fbbf24' },
  string: { color: '#86efac' },
  char: { color: '#86efac' },
  builtin: { color: '#38bdf8' },
  inserted: { color: '#4ade80' },
  operator: { color: '#38bdf8' },
  entity: { color: '#93c5fd', cursor: 'help' },
  url: { color: '#93c5fd' },
  'language-css': { color: '#93c5fd' },
  style: { color: '#93c5fd' },
  variable: { color: '#fca5a5' },
  atrule: { color: '#c084fc' },
  'attr-value': { color: '#86efac' },
  function: { color: '#60a5fa' },
  'class-name': { color: '#fde047' },
  keyword: { color: '#c084fc', fontWeight: '500' },
  regex: { color: '#f43f5e' },
  important: { color: '#f43f5e', fontWeight: 'bold' },
  bold: { fontWeight: 'bold' },
  italic: { fontStyle: 'italic' },
};

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLanguage = language ? language.toLowerCase() : 'text';

  return (
    <div className="group/code my-4 w-full min-w-full max-w-full overflow-hidden rounded-xl border border-zinc-800 bg-[#09090b] transition-all duration-200 hover:border-zinc-700/80">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-[#141417] px-4 py-2 text-xs">
        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-zinc-300">
          <HugeiconsIcon icon={CodeIcon} size={14} className="text-zinc-400" />
          <span className="capitalize">{displayLanguage}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11px] transition-all duration-150 cursor-pointer',
              copied
                ? 'bg-emerald-500/15 text-emerald-400 font-medium'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
            )}
            title="Copy code"
          >
            <HugeiconsIcon
              icon={copied ? Tick02Icon : Copy01Icon}
              size={13}
              className={copied ? 'text-emerald-400' : 'text-zinc-400'}
            />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative w-full min-w-full max-w-full overflow-x-auto message-scrollbar text-[13.5px] leading-relaxed font-mono">
        <SyntaxHighlighter
          language={displayLanguage}
          style={customDarkTheme}
          customStyle={{
            margin: 0,
            padding: '1.25rem 1rem',
            background: 'transparent',
            fontSize: '13.5px',
            lineHeight: '1.65',
            overflowX: 'auto',
            maxWidth: '100%',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'inherit',
            },
          }}
        >
          {value.trimEnd()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export function InlineCode({ children, isAI }: { children: React.ReactNode; isAI: boolean }) {
  return (
    <code
      className={cn(
        'mx-0.5 rounded-md px-1.5 py-0.5 font-mono text-[13px] tracking-tight font-normal transition-colors break-words [overflow-wrap:anywhere]',
        isAI
          ? 'border border-zinc-800/90 bg-zinc-800/80 text-orange-400/95 shadow-2xs'
          : 'bg-white/15 text-white',
      )}
    >
      {children}
    </code>
  );
}
