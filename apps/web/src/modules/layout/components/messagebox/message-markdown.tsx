import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { memo } from 'react';
import { cn } from '../../../../lib/utils';
import Link from 'next/link';

interface MarkdownMessageProps {
  content: string;
  isAI: boolean;
}

const MarkdownMessage = memo(function MarkdownMessage({ content, isAI }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // ... (Aapke baaki markdown components same rahenge)
        h1: ({ children }) => (
          <h1 className="mb-3 mt-6 text-2xl font-bold tracking-tight first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-3 mt-5 text-xl font-semibold tracking-tight first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 mt-4 text-lg font-semibold first:mt-0">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="my-3 wrap-break-word leading-7 text-[15px] first:mt-0 last:mb-0">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="my-3 ml-5 list-disc space-y-2 marker:text-muted-foreground">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="my-3 ml-5 list-decimal space-y-2 marker:text-muted-foreground">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="pl-1 leading-7 wrap-wrap-break-words">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="my-4 rounded-r-xl border-l-4 border-primary/40 bg-muted/50 px-4 py-3 italic">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-5 border-border" />,
        a: ({ href, children }) => (
          <Link
            href={href || ''}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'break-all font-medium underline underline-offset-4 transition-opacity hover:opacity-80',
              isAI ? 'text-primary' : 'text-white',
            )}
          >
            {children}
          </Link>
        ),
        table: ({ children }) => (
          <div className="my-4 overflow-hidden rounded-md border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-130 border-collapse text-sm">{children}</table>
            </div>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-muted/60">{children}</thead>,
        th: ({ children }) => (
          <th className="border-b border-border px-4 py-3 text-left font-semibold">{children}</th>
        ),
        td: ({ children }) => (
          <td className="border-t border-border px-4 py-3 align-top wrap-break-words">
            {children}
          </td>
        ),
        code({ className, children, ...rest }: React.HTMLAttributes<HTMLElement>) {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;

          if (isInline) {
            return (
              <code
                className={cn(
                  'rounded-md px-1.5 py-1 font-mono text-[13px] wrap-break-words',
                  isAI ? 'bg-muted text-foreground' : 'bg-white/10 text-white',
                )}
                {...rest}
              >
                {children}
              </code>
            );
          }

          return (
            <code
              className={cn(
                'block overflow-x-auto whitespace-pre rounded-md border p-4 font-mono text-[13px] leading-6',
                isAI
                  ? 'border-border bg-zinc-950 text-zinc-100'
                  : 'border-white/10 bg-black/20 text-white',
              )}
              {...rest}
            >
              {children}
            </code>
          );
        },
        pre: ({ children }) => <div className="my-4 max-w-full overflow-x-auto">{children}</div>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

export default MarkdownMessage;
