import { Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBillStore } from '@/store/useBillStore'
import { fromCents } from '@/lib/calculations'
import type { Item } from '@/types'
import { AssignmentSelector } from './AssignmentSelector'

export function ItemRow({ item }: { item: Item }) {
  const removeItem = useBillStore((s) => s.removeItem)

  return (
    <div className="flex items-center justify-between rounded-md border px-4 py-2">
      <div className="flex gap-2 items-center">
        <span className="text-sm">{item.label}</span>
        <span className="text-sm text-muted-foreground">{fromCents(item.price)}</span>
        {item.assignedTo.length === 0 && (
          <AlertCircle className="size-4 text-destructive" aria-label="Item not assigned" />
        )}
        <AssignmentSelector item={item} />
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => removeItem(item.id)}
        aria-label={`Remove ${item.label}`}
      >
        <Trash2 />
      </Button>
    </div>
  )
}
