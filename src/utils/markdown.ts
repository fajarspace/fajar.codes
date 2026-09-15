import GithubSlugger from 'github-slugger'

export interface Heading {
  id: string
  text: string
  level: 2 | 3
}

/**
 * Extracts h2/h3 headings from markdown for the table of contents.
 * Ids use github-slugger — the same algorithm rehype-slug applies while rendering —
 * so anchors and the table of contents always agree (duplicates included).
 */
export function extractHeadings(markdown: string): Heading[] {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '')
  const headings: Heading[] = []
  const slugger = new GithubSlugger()

  for (const line of withoutCode.split('\n')) {
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!match) continue
    const level = match[1]?.length === 2 ? 2 : 3
    const text = stripInlineMarkdown(match[2] ?? '')
    headings.push({ id: slugger.slug(text), text, level })
  }
  return headings
}

export function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .trim()
}

/** Plain-text approximation of markdown, used for search and meta descriptions. */
export function markdownToText(markdown: string, max?: number): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#+\s+/gm, '')
    .replace(/>\s?/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return typeof max === 'number' && text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}
