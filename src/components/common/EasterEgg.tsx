import { useState } from 'react'
import { useKeySequence } from '@/hooks/useKeySequence'
import { useTheme } from '@/hooks/useTheme'
import { useToast } from '@/hooks/useToast'

/**
 * Small surprises for people who type at the page:
 *  - "fajar"  → the page blinks accent yellow
 *  - "hello"  → says hi back
 *  - "dark" / "light" → switches theme
 *  - "coffee" → an opinion about coffee
 */
export function EasterEgg() {
  const { toast } = useToast()
  const { setTheme } = useTheme()
  const [flash, setFlash] = useState(0)

  useKeySequence({
    fajar: () => {
      setFlash((n) => n + 1)
      toast({ title: 'You found the switch.', description: 'Nothing changed, but it felt good, didn’t it?' })
    },
    hello: () => toast({ title: 'Hello back.', description: 'Try typing “fajar”.' }),
    dark: () => setTheme('dark'),
    light: () => setTheme('light'),
    coffee: () => toast({ title: 'Kopi tubruk, no sugar.', description: 'This is the only correct answer.' }),
  })

  return flash > 0 ? <div key={flash} className="accent-flash" aria-hidden /> : null
}
