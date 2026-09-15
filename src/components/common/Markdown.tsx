import { isValidElement, useMemo, useRef, useState, type ComponentPropsWithoutRef } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import { Check, Copy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface MarkdownProps {
  content: string
  className?: string
}

function CodeBlock({ children, className, ...rest }: ComponentPropsWithoutRef<'pre'>) {
  const ref = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  const language = useMemo(() => {
    const child = Array.isArray(children) ? children[0] : children
    if (isValidElement<{ className?: string }>(child)) {
      const match = /language-([\w-]+)/.exec(child.props.className ?? '')
      return match?.[1] ?? null
    }
    return null
  }, [children])

  const copy = async () => {
    const text = ref.current?.textContent ?? ''
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="group relative">
      <div className="pointer-events-none absolute right-2 top-2 z-10 flex items-center gap-2">
        {language ? <span className="label-caps hidden sm:inline">{language}</span> : null}
        <button
          type="button"
          onClick={copy}
          className="pointer-events-auto inline-flex h-7 items-center gap-1 border border-line bg-bg px-2 text-2xs font-medium text-fg-muted transition-colors hover:border-fg hover:text-fg"
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre ref={ref} className={cn(className)} {...rest}>
        {children}
      </pre>
    </div>
  )
}

const components: Components = {
  // Notes only ever have one h1 (the title), so demote stray h1s to h2.
  h1: ({ children, node: _node, ...rest }) => <h2 {...rest}>{children}</h2>,
  pre: ({ node: _node, ...rest }) => <CodeBlock {...rest} />,
  a: ({ href, children, node: _node, ...rest }) => {
    if (href && href.startsWith('/')) {
      return (
        <Link to={href} {...rest}>
          {children}
        </Link>
      )
    }
    const external = href ? /^https?:\/\//.test(href) : false
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer noopener' : undefined} {...rest}>
        {children}
      </a>
    )
  },
  img: ({ src, alt, node: _node, ...rest }) => (
    <figure>
      <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} loading="lazy" decoding="async" {...rest} />
      {alt ? <figcaption>{alt}</figcaption> : null}
    </figure>
  ),
  table: ({ children, node: _node, ...rest }) => (
    <div className="overflow-x-auto">
      <table {...rest}>{children}</table>
    </div>
  ),
}

const remarkPlugins = [remarkGfm]
const rehypePlugins = [rehypeSlug, rehypeHighlight]

/** Renders markdown with stable heading ids (rehype-slug), code copy buttons and router-aware links. */
export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn('prose', className)}>
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
