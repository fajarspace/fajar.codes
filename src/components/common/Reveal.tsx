import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'p' | 'span'
}

/** Subtle fade-up when the element enters the viewport. Respects prefers-reduced-motion. */
export function Reveal({ children, delay = 0, className, as = 'div' }: RevealProps) {
  const reduced = useReducedMotion()
  const Tag = motion[as]
  if (reduced) {
    const Plain = as
    return <Plain className={className}>{children}</Plain>
  }
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  )
}

interface RevealTextProps {
  text: string
  className?: string
  /** Delay between words (seconds). */
  stagger?: number
  as?: 'h1' | 'h2' | 'p'
}

interface Segment {
  words: string[]
  highlighted: boolean
}

/** "a ==b c== d" → [{a}, {b c, highlighted}, {d}] */
function parseSegments(line: string): Segment[] {
  return line
    .split('==')
    .map((chunk, i) => ({ words: chunk.split(' ').filter(Boolean), highlighted: i % 2 === 1 }))
    .filter((segment) => segment.words.length > 0)
}

/**
 * Word-by-word rise-in for headlines. Words wrap naturally at every viewport width;
 * ` / ` markers force a line break on larger screens, `==like this==` wraps words in a <mark>.
 */
export function RevealLines({ text, className, stagger = 0.035, as = 'p' }: RevealTextProps) {
  const reduced = useReducedMotion()
  const Tag = as
  const lines = text.split(' / ')
  let wordIndex = 0

  const renderWord = (word: string, key: string) => {
    const delay = wordIndex++ * stagger
    return (
      <span key={key}>
        <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            initial={reduced ? false : { y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.span>
        </span>{' '}
      </span>
    )
  }

  return (
    <Tag className={className}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="sm:block">
          {parseSegments(line).map((segment, segmentIndex) => {
            const words = segment.words.map((word, i) => renderWord(word, `${lineIndex}-${segmentIndex}-${i}`))
            return segment.highlighted ? <mark key={`${lineIndex}-${segmentIndex}`}>{words}</mark> : words
          })}
        </span>
      ))}
    </Tag>
  )
}
