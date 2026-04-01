import { useBillStore } from '@/store/useBillStore'
import { PersonForm } from './PersonForm'
import { PersonTag } from './PersonTag'

export function PeoplePanel() {
  const people = useBillStore((s) => s.people)

  return (
    <div className="flex-1 flex flex-col gap-4">
      <h2 className="text-lg font-semibold">People</h2>
      <PersonForm />
      {people.length === 0 ? (
        <p className="text-sm text-muted-foreground">No people added yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {people.map((p) => (
            <PersonTag key={p.id} id={p.id} name={p.name} />
          ))}
        </div>
      )}
    </div>
  )
}
