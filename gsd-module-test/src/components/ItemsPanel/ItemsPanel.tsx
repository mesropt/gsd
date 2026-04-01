import { useBillStore } from '@/store/useBillStore'
import { ItemForm } from './ItemForm'
import { ItemRow } from './ItemRow'

export function ItemsPanel() {
  const items = useBillStore((s) => s.items)

  return (
    <div className="flex-1 flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Items</h2>
      <ItemForm />
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items added yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
