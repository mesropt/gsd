import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBillStore } from '@/store/useBillStore'

export function PersonForm() {
  const [name, setName] = useState('')
  const addPerson = useBillStore((s) => s.addPerson)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    addPerson(trimmed)
    setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter a name..."
        aria-label="Person name"
      />
      <Button type="submit" disabled={!name.trim()}>Add</Button>
    </form>
  )
}
