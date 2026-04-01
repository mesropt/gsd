import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useBillStore } from '@/store/useBillStore'
import type { Item } from '@/types'

interface AssignmentSelectorProps {
  item: Item
}

export function AssignmentSelector({ item }: AssignmentSelectorProps) {
  const people = useBillStore((s) => s.people)
  const assignItem = useBillStore((s) => s.assignItem)
  // Read assignedTo from the store so it stays reactive to external updates
  const assignedTo = useBillStore((s) => s.items.find((i) => i.id === item.id)?.assignedTo ?? item.assignedTo)

  const isAllSelected =
    people.length > 0 && people.every((p) => assignedTo.includes(p.id))

  function getLabel(): string {
    if (assignedTo.length === 0) {
      return 'Assign'
    }
    if (isAllSelected) {
      return 'Everyone'
    }
    if (assignedTo.length === 1) {
      const person = people.find((p) => p.id === assignedTo[0])
      return person ? person.name : 'Assign'
    }
    if (assignedTo.length === 2) {
      const name1 = people.find((p) => p.id === assignedTo[0])?.name ?? ''
      const name2 = people.find((p) => p.id === assignedTo[1])?.name ?? ''
      return `${name1}, ${name2}`
    }
    return `${assignedTo.length} people`
  }

  function handleTogglePerson(personId: string, checked: boolean) {
    const next = checked
      ? [...assignedTo, personId]
      : assignedTo.filter((id) => id !== personId)
    assignItem(item.id, next)
  }

  function handleEveryoneToggle() {
    if (isAllSelected) {
      assignItem(item.id, [])
    } else {
      assignItem(item.id, people.map((p) => p.id))
    }
  }

  const label = getLabel()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-haspopup="listbox"
        >
          {label} <ChevronDown className="ml-1 size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-2">
        {people.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 px-2">Add people first</p>
        ) : (
          <>
            <div role="listbox">
              {people.map((person) => (
                <div key={person.id} className="flex items-center gap-2 py-1 px-2">
                  <Checkbox
                    id={person.id}
                    checked={assignedTo.includes(person.id)}
                    onCheckedChange={(checked) =>
                      handleTogglePerson(person.id, !!checked)
                    }
                  />
                  <label htmlFor={person.id} className="text-sm cursor-pointer">
                    {person.name}
                  </label>
                </div>
              ))}
            </div>
            <div className="border-t my-1" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={handleEveryoneToggle}
              aria-label={isAllSelected ? 'Deselect everyone' : 'Select everyone'}
            >
              Everyone
            </Button>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
