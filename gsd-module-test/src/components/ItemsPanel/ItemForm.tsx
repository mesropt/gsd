import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBillStore } from '@/store/useBillStore'
import { toCents } from '@/lib/calculations'

export function ItemForm() {
  const [label, setLabel] = useState('')
  const [price, setPrice] = useState('')
  const addItem = useBillStore((s) => s.addItem)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedLabel = label.trim()
    const cents = toCents(price)
    if (!trimmedLabel || isNaN(cents) || cents <= 0) return
    addItem(trimmedLabel, cents)
    setLabel('')
    setPrice('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Item name"
        aria-label="Item name"
      />
      <Input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="$0.00"
        aria-label="Item price"
      />
      <Button type="submit" disabled={!label.trim() || !price.trim()}>Add</Button>
    </form>
  )
}
