import { useEffect, useRef, useState } from 'react'
import { env, isDisqusConfigured } from '@/lib/env'
import { useTheme } from '@/hooks/useTheme'

interface DisqusPage {
  url: string
  identifier: string
  title: string
}

interface DisqusConfigScope {
  page: DisqusPage
  language?: string
}

type DisqusConfig = (this: DisqusConfigScope) => void

declare global {
  interface Window {
    DISQUS?: { reset: (options: { reload: boolean; config: DisqusConfig }) => void }
    disqus_config?: DisqusConfig
  }
}

const SCRIPT_ID = 'disqus-embed'

function buildConfig(page: DisqusPage): DisqusConfig {
  return function config(this: DisqusConfigScope) {
    this.page.url = page.url
    this.page.identifier = page.identifier
    this.page.title = page.title
  }
}

interface CommentsProps {
  /** Stable key for the thread — keep it stable even if the slug changes. */
  identifier: string
  title: string
  /** Path on this site, e.g. "/my-note". */
  path: string
}

/**
 * Disqus thread. The embed script is third-party and heavy, so it only loads once the section
 * is close to the viewport, and is re-rendered (not re-injected) when the note or the theme changes.
 */
export function Comments({ identifier, title, path }: CommentsProps) {
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const url = `${env.siteUrl}${path}`

  // Load only when the reader gets near the bottom of the article.
  useEffect(() => {
    if (!isDisqusConfigured || inView) return
    const element = containerRef.current
    if (!element) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '400px 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [inView])

  useEffect(() => {
    if (!isDisqusConfigured || !inView) return
    const page = { url, identifier, title }

    if (document.getElementById(SCRIPT_ID)) {
      // Script is already on the page (another note, or a theme change): re-render the thread.
      window.DISQUS?.reset({ reload: true, config: buildConfig(page) })
      return
    }

    window.disqus_config = buildConfig(page)
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = `https://${env.disqusShortname}.disqus.com/embed.js`
    script.async = true
    script.setAttribute('data-timestamp', String(Date.now()))
    document.body.appendChild(script)
    // The script stays for the session; the thread itself is reset on every note.
  }, [inView, url, identifier, title, theme])

  if (!isDisqusConfigured) return null

  return (
    <section ref={containerRef} aria-labelledby="comments-heading" className="border-t border-line pt-6">
      <h2 id="comments-heading" className="label-caps">
        Comments
      </h2>
      <div id="disqus_thread" className="mt-6 min-h-24" />
      <noscript>
        <p className="mt-4 text-sm text-fg-muted">
          Comments need JavaScript.{' '}
          <a href="https://disqus.com/?ref_noscript" className="link-underline">
            Read them on Disqus
          </a>
          .
        </p>
      </noscript>
    </section>
  )
}
