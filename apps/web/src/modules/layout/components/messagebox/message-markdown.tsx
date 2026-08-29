'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { memo } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { CodeBlock, InlineCode } from './code-block';

interface MarkdownMessageProps {
  content: string;
  isAI: boolean;
}

const MarkdownMessage = memo(function MarkdownMessage({ content, isAI }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="mt-7 mb-3.5 border-b border-border/40 pb-2 text-xl font-bold tracking-tight text-foreground md:text-2xl first:mt-0 break-words [overflow-wrap:anywhere]">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-6 mb-3 text-lg font-bold tracking-tight text-foreground md:text-xl first:mt-0 break-words [overflow-wrap:anywhere]">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-5 mb-2 text-base font-semibold tracking-tight text-foreground md:text-lg first:mt-0 break-words [overflow-wrap:anywhere]">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="mt-4 mb-2 text-sm font-semibold tracking-tight text-foreground/90 first:mt-0 break-words [overflow-wrap:anywhere]">
            {children}
          </h4>
        ),
        p: ({ children }) => (
          <p className="my-3 text-[15px] leading-7 font-normal text-foreground/90 break-words [overflow-wrap:anywhere] first:mt-0 last:mb-0">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="my-3.5 ml-5 list-disc space-y-2 text-[15px] marker:text-muted-foreground/70">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="my-3.5 ml-5 list-decimal space-y-2 text-[15px] marker:text-muted-foreground/70 font-medium">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="pl-1 text-[15px] leading-7 text-foreground/90 break-words [overflow-wrap:anywhere]">
            {children}
          </li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-4 rounded-r-xl border-l-4 border-primary/60 bg-muted/30 px-4 py-3.5 text-[14px] italic text-foreground/80 break-words [overflow-wrap:anywhere]">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-6 border-t border-border/50" />,
        a: ({ href, children }) => (
          <Link
            href={href || ''}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'font-medium underline underline-offset-4 transition-all hover:opacity-80 break-all',
              isAI ? 'text-primary decoration-primary/40' : 'text-white underline-white',
            )}
          >
            {children}
          </Link>
        ),
        table: ({ children }) => (
          <div className="my-5 w-full max-w-full overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/40 shadow-sm">
            <div className="w-full max-w-full overflow-x-auto message-scrollbar scroll-smooth">
              <table className="w-full min-w-120 border-collapse text-sm">{children}</table>
            </div>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="border-b border-zinc-800/80 bg-[#16161a] text-xs font-semibold uppercase tracking-wider text-zinc-300">
            {children}
          </thead>
        ),
        th: ({ children }) => (
          <th className="border-b border-zinc-800/80 px-4 py-3 text-left font-semibold text-zinc-200">
            {children}
          </th>
        ),
        tr: ({ children }) => (
          <tr className="border-b border-zinc-800/40 transition-colors hover:bg-zinc-900/40 last:border-b-0">
            {children}
          </tr>
        ),
        td: ({ children }) => (
          <td className="px-4 py-3.5 text-sm text-zinc-300 align-top break-words [overflow-wrap:anywhere]">
            {children}
          </td>
        ),
        code({ className, children, ...rest }: React.HTMLAttributes<HTMLElement>) {
          const match = /language-(\w+)/.exec(className || '');
          const rawCode = String(children).replace(/\n$/, '');
          const isMultiline = rawCode.includes('\n');

          if (match || isMultiline) {
            return <CodeBlock language={match ? match[1] : 'text'} value={rawCode} />;
          }

          return <InlineCode isAI={isAI}>{children}</InlineCode>;
        },
        pre: ({ children }) => <>{children}</>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

export default MarkdownMessage;
