import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBillStore } from '@/store/useBillStore'

interface PersonTagProps {
  id: string
  name: string
}

export function PersonTag({ id, name }: PersonTagProps) {
  const removePerson = useBillStore((s) => s.removePerson)

  return (
    <div className="flex items-center gap-2 rounded-md border px-4 py-2">
      <span className="text-sm">{name}</span>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => removePerson(id)}
        aria-label={`Remove ${name}`}
      >
        <X />
      </Button>
    </div>
  )
}
