import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { site } from '@/constants/site'
import type { Json } from '@/types/database'

export interface SeoOptions {
  title?: string
  description?: string
  image?: string | null
  type?: 'website' | 'article'
  /** Overrides the canonical path (defaults to the current location). */
  canonicalPath?: string
  noIndex?: boolean
  publishedTime?: string | null
  modifiedTime?: string | null
  jsonLd?: Record<string, Json> | Record<string, Json>[]
}

function setMeta(attr: 'name' | 'property', key: string, content: string | null) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!content) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string | null) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!href) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(data: SeoOptions['jsonLd']) {
  const id = 'seo-jsonld'
  let el = document.getElementById(id)
  if (!data) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.setAttribute('type', 'application/ld+json')
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${site.url}${path.startsWith('/') ? path : `/${path}`}`
}

/** Manages document title, meta description, Open Graph/Twitter tags, canonical URL and JSON-LD. */
export function useSeo(options: SeoOptions = {}) {
  const location = useLocation()
  const {
    title,
    description = site.description,
    image = site.ogImage,
    type = 'website',
    canonicalPath,
    noIndex = false,
    publishedTime = null,
    modifiedTime = null,
    jsonLd,
  } = options

  const fullTitle = title ? `${title} — ${site.name}` : `${site.name} — builds useful things for the web`
  const canonical = absoluteUrl(canonicalPath ?? location.pathname)
  const imageUrl = image ? absoluteUrl(image) : null
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : null

  useEffect(() => {
    document.title = fullTitle
    setMeta('name', 'description', description)
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : null)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:url', canonical)
    setMeta('property', 'og:site_name', site.wordmark)
    setMeta('property', 'og:image', imageUrl)
    setMeta('property', 'og:locale', 'en_US')
    setMeta('property', 'article:published_time', type === 'article' ? publishedTime : null)
    setMeta('property', 'article:modified_time', type === 'article' ? modifiedTime : null)
    setMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', imageUrl)
    setLink('canonical', canonical)
    setJsonLd(jsonLdString ? (JSON.parse(jsonLdString) as SeoOptions['jsonLd']) : undefined)
  }, [fullTitle, description, type, canonical, imageUrl, noIndex, publishedTime, modifiedTime, jsonLdString])
}
