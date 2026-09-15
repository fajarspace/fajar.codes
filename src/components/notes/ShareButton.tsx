import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/cn'

interface ShareButtonProps {
  title: string
  text?: string
  className?: string
}

/** Web Share on supporting devices, clipboard fallback everywhere else. */
export function ShareButton({ title, text, className }: ShareButtonProps) {
  const { toast } = useToast()
  const [done, setDone] = useState(false)

  const share = async () => {
    const url = window.location.href
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title, text, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setDone(true)
      toast({ title: 'Link copied', description: url, tone: 'success' })
      window.setTimeout(() => setDone(false), 1600)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      toast({ title: 'Could not share', description: 'Copy the URL from the address bar instead.', tone: 'error' })
    }
  }

  return (
    <button type="button" onClick={share} className={cn('inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg', className)}>
      {done ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
      {done ? 'Copied' : 'Share'}
    </button>
  )
}
