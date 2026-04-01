import { useMemo } from 'react'
import { useBillStore } from '@/store/useBillStore'
import { calculateDetailedBreakdowns, fromCents } from '@/lib/calculations'

export function SummaryPanel() {
  const people = useBillStore((s) => s.people)
  const items  = useBillStore((s) => s.items)
  const tip    = useBillStore((s) => s.tip)
  const tax    = useBillStore((s) => s.tax)

  const breakdowns = useMemo(
    () => calculateDetailedBreakdowns({ people, items, tip, tax }),
    [people, items, tip, tax]
  )

  if (people.length === 0) {
    return (
      <div className="rounded-md border p-4 mt-6">
        <h2 className="text-lg font-semibold mb-4">Summary</h2>
        <p className="text-sm text-muted-foreground">No people added yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border p-4 mt-6">
      <h2 className="text-lg font-semibold mb-4">Summary</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground border-b">
            <th className="pb-2">Name</th>
            <th className="pb-2 text-right">Subtotal</th>
            <th className="pb-2 text-right">Tip</th>
            <th className="pb-2 text-right">Tax</th>
            <th className="pb-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {people.map((p, idx) => (
            <tr key={p.id} className="border-b last:border-0">
              <td className="py-2">{p.name}</td>
              <td className="py-2 text-right">{fromCents(breakdowns[idx].subtotal)}</td>
              <td className="py-2 text-right">{fromCents(breakdowns[idx].tipShare)}</td>
              <td className="py-2 text-right">{fromCents(breakdowns[idx].taxShare)}</td>
              <td className="py-2 text-right font-semibold">{fromCents(breakdowns[idx].total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
