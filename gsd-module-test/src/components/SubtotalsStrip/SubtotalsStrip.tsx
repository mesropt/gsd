import { useMemo } from 'react'
import { useBillStore } from '@/store/useBillStore'
import { distributeRemainder, fromCents } from '@/lib/calculations'

export function SubtotalsStrip() {
  const people = useBillStore((s) => s.people)
  const items  = useBillStore((s) => s.items)

  const subtotals = useMemo(() =>
    people.map((p) => {
      let total = 0
      for (const item of items) {
        const idx = item.assignedTo.indexOf(p.id)
        if (idx === -1) continue
        const shares = distributeRemainder(item.price, item.assignedTo.length)
        total += shares[idx]
      }
      return { name: p.name, total }
    }),
    [people, items]
  )

  if (people.length === 0) return null

  return (
    <div className="rounded-md border px-4 py-2 mb-6 flex flex-wrap gap-4 text-sm">
      {subtotals.map((s) => (
        <span key={s.name}>
          <span className="font-medium">{s.name}:</span>{' '}
          <span>{fromCents(s.total)}</span>
        </span>
      ))}
    </div>
  )
}
