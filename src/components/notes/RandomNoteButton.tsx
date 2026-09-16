import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Shuffle } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { getRandomNote } from '@/services'
import { cn } from '@/utils/cn'

interface RandomNoteButtonProps {
  className?: string
  withIcon?: boolean
  label?: string
}

export function RandomNoteButton({ className, withIcon = false, label = 'Random note' }: RandomNoteButtonProps) {
  const navigate = useNavigate()
  const { slug } = useParams()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)

  const go = async () => {
    setBusy(true)
    try {
      const note = await getRandomNote(slug)
      if (note) navigate(`/${note.slug}`)
      else toast({ title: 'No notes to pick from yet.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <button type="button" onClick={go} disabled={busy} className={cn('inline-flex items-center gap-1.5', className)}>
      {withIcon ? <Shuffle className="size-3.5" /> : null}
      {label}
    </button>
  )
}
