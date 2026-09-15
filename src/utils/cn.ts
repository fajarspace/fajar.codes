type ClassValue = string | number | null | undefined | false | Record<string, boolean> | ClassValue[]

/** Minimal className joiner (supports strings, arrays and `{ class: condition }` objects). */
export function cn(...values: ClassValue[]): string {
  const out: string[] = []
  for (const value of values) {
    if (!value) continue
    if (typeof value === 'string' || typeof value === 'number') {
      out.push(String(value))
    } else if (Array.isArray(value)) {
      const nested = cn(...value)
      if (nested) out.push(nested)
    } else {
      for (const [key, on] of Object.entries(value)) if (on) out.push(key)
    }
  }
  return out.join(' ')
}
